import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export default async function UpgradePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  let checkoutUrl = "#";
  if (stripeLink) {
    const service = createSupabaseServiceClient();
    const { data: dbUser } = await service
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (dbUser) {
      const params = new URLSearchParams({
        client_reference_id: dbUser.id,
        prefilled_email: user.email ?? "",
      });
      checkoutUrl = `${stripeLink}?${params.toString()}`;
    }
  }

  return (
    <main className="flex-1 bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
            Almost there
          </h1>
          <p className="text-base text-neutral-600">
            One-time payment. 25 generations. No subscription.
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-8 shadow-sm">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-4xl font-semibold text-neutral-900">$10</span>
            <span className="text-sm text-neutral-500">one-time</span>
          </div>
          <p className="text-xs text-neutral-500 mb-6">25 generations</p>

          <ul className="space-y-2.5 mb-8">
            {[
              "3 Notes per generation",
              "Smart image matching",
              "Copy-ready in seconds",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                <Check size={14} className="text-neutral-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <a
            href={checkoutUrl}
            className={`block w-full px-6 py-3 bg-neutral-900 text-white text-base font-medium rounded-md text-center transition-colors ${
              checkoutUrl === "#"
                ? "opacity-50 pointer-events-none"
                : "hover:bg-neutral-800"
            }`}
          >
            {checkoutUrl === "#" ? "Coming soon" : "Continue to checkout"}
          </a>

          {checkoutUrl === "#" && (
            <p className="text-xs text-neutral-500 mt-3 text-center">
              Payment link not yet configured.
            </p>
          )}
        </div>

        <p className="text-xs text-neutral-500 mt-5 text-center">
          Signed in as {user.email}
        </p>
      </div>
    </main>
  );
}
