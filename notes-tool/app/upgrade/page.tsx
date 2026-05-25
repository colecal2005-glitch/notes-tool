import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export default async function UpgradePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  // Build the Stripe Payment Link URL with required params
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
    <main className="min-h-screen bg-[#09090B] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Unlock Note Factory
        </h1>
        <p className="text-white/40 text-sm mb-10">One-time payment. No subscription.</p>

        <div
          className="bg-[#14141A] border border-white/10 rounded-xl p-8 mb-6"
          style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
        >
          <p
            className="text-5xl font-bold mb-1"
            style={{
              background: "linear-gradient(135deg, #fff, #FF9A6C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            $10
          </p>
          <p className="text-white/40 text-sm mb-6">25 generations</p>

          <ul className="text-left text-sm text-white/60 space-y-2 mb-8">
            <li>✓ 3 Substack Notes per generation</li>
            <li>✓ Smart image matching</li>
            <li>✓ Copy-ready in seconds</li>
          </ul>

          <a
            href={checkoutUrl}
            className="block w-full px-8 py-3.5 text-sm font-semibold rounded-lg text-white text-center transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #FF6719 0%, #e04f0a 100%)",
              boxShadow: "0 0 28px rgba(255,103,25,0.45), 0 1px 3px rgba(0,0,0,0.5)",
              pointerEvents: checkoutUrl === "#" ? "none" : "auto",
              opacity: checkoutUrl === "#" ? 0.5 : 1,
            }}
          >
            {checkoutUrl === "#" ? "Coming soon" : "Get 25 generations →"}
          </a>

          {checkoutUrl === "#" && (
            <p className="text-white/30 text-xs mt-3">Payment link not yet configured.</p>
          )}
        </div>

        <p className="text-white/25 text-xs">Signed in as {user.email}</p>
      </div>
    </main>
  );
}
