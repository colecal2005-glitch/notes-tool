import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { LogoutButton } from "../components/LogoutButton";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const service = createSupabaseServiceClient();

  const { data: dbUser } = await service
    .from("users")
    .select("id, subscription_status, current_period_start, current_period_end, free_gens_used")
    .eq("auth_user_id", user.id)
    .single();

  const isActive = dbUser?.subscription_status === "active";
  const periodEnd = dbUser?.current_period_end
    ? new Date(dbUser.current_period_end).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  let gensUsed = 0;
  if (isActive && dbUser) {
    let countQuery = service
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", dbUser.id);
    if (dbUser.current_period_start) countQuery = countQuery.gte("created_at", dbUser.current_period_start);
    if (dbUser.current_period_end) countQuery = countQuery.lte("created_at", dbUser.current_period_end);
    const { count } = await countQuery;
    gensUsed = count ?? 0;
  }

  return (
    <main className="min-h-screen bg-[#09090B] text-white px-6 py-16">
      <div className="max-w-sm mx-auto">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Account
        </h1>

        <div
          className="bg-[#14141A] border border-white/10 rounded-xl p-6 mb-4"
          style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
        >
          <p className="text-xs text-white/35 uppercase tracking-widest mb-1">Email</p>
          <p className="text-white text-sm">{user.email}</p>
        </div>

        <div
          className="bg-[#14141A] border border-white/10 rounded-xl p-6 mb-4"
          style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
        >
          <p className="text-xs text-white/35 uppercase tracking-widest mb-1">Plan</p>
          <p className="text-white text-sm capitalize">
            {dbUser?.subscription_status ?? "free"}
          </p>

          {isActive && (
            <div className="mt-4 pt-4 border-t border-white/8">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-white/35 uppercase tracking-widest">Generations</p>
                <p className="text-sm text-white">{gensUsed} / 25</p>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${Math.min((gensUsed / 25) * 100, 100)}%`,
                    background: "linear-gradient(90deg, #FF6719, #e04f0a)",
                  }}
                />
              </div>
              {periodEnd && (
                <p className="text-xs text-white/25 mt-2">Resets {periodEnd}</p>
              )}
            </div>
          )}
        </div>

        {isActive && dbUser?.current_period_end && (
          <form action="/api/billing-portal" method="POST" className="mb-4">
            <button
              type="submit"
              className="w-full px-6 py-3 text-sm font-semibold rounded-lg text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-all"
            >
              Manage subscription →
            </button>
          </form>
        )}

        {!isActive && (
          <a
            href="/upgrade"
            className="block w-full mb-4 px-6 py-3 text-sm font-semibold rounded-lg text-white text-center transition-all hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #FF6719 0%, #e04f0a 100%)",
              boxShadow: "0 0 28px rgba(255,103,25,0.35)",
            }}
          >
            Get 25 generations for $10 →
          </a>
        )}

        <LogoutButton />
      </div>
    </main>
  );
}
