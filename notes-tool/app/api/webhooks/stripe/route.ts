import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function stripeStatusToEnum(status: string): string {
  const map: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "unpaid",
    incomplete: "free",
    incomplete_expired: "free",
    trialing: "active",
    paused: "canceled",
  };
  return map[status] ?? "free";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad signature";
    console.error("[webhook] signature verification failed:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const service = createSupabaseServiceClient();

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const customerEmail = session.customer_details?.email;
      const rawCustomer = session.customer;
      const customerId = typeof rawCustomer === "string"
        ? rawCustomer
        : rawCustomer && typeof rawCustomer === "object" && "id" in rawCustomer
          ? (rawCustomer as Stripe.Customer).id
          : null;

      // Fetch subscription for period dates
      let periodStart: string | null = null;
      let periodEnd: string | null = null;
      if (session.subscription) {
        const subId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        periodStart = new Date(sub.current_period_start * 1000).toISOString();
        periodEnd = new Date(sub.current_period_end * 1000).toISOString();
      }

      const update = {
        stripe_customer_id: customerId,
        subscription_status: "active",
        current_period_start: periodStart,
        current_period_end: periodEnd,
      };

      if (userId) {
        const { error } = await service.from("users").update(update).eq("id", userId);
        if (error) console.error("[webhook] update by id failed:", error.message);
      } else if (customerEmail) {
        const { error } = await service.from("users").update(update).eq("email", customerEmail);
        if (error) console.warn("[webhook] update by email failed — user not found?", customerEmail);
      }
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const { error } = await service
        .from("users")
        .update({
          subscription_status: stripeStatusToEnum(sub.status),
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
        .eq("stripe_customer_id", customerId);
      if (error) console.error("[webhook] subscription.updated failed:", error.message);
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const { error } = await service
        .from("users")
        .update({ subscription_status: "canceled" })
        .eq("stripe_customer_id", customerId);
      if (error) console.error("[webhook] subscription.deleted failed:", error.message);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] handler error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
