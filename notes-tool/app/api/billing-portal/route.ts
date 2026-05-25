import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createSupabaseServiceClient();
  const { data: dbUser } = await service
    .from("users")
    .select("stripe_customer_id")
    .eq("auth_user_id", user.id)
    .single();

  const returnUrl = `${req.headers.get("origin") ?? "https://notefactory.app"}/account`;

  let customerId = dbUser?.stripe_customer_id ?? null;

  // Fallback: search Stripe by email (covers guest customers not returned by list())
  if (!customerId && user.email) {
    const searchResult = await stripe.customers.search({
      query: `email:"${user.email}"`,
      limit: 1,
    });
    if (searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
      await service
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("auth_user_id", user.id);
    }
  }

  if (!customerId) {
    return NextResponse.json({ error: "No billing account found." }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
