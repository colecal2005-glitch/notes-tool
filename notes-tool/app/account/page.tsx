import { redirect } from "next/navigation";
import Link from "next/link";
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
    <main className="flex-1 bg-white">
      <div className="max-w-sm mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-8">
          Account
        </h1>

        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
            Email
          </p>
          <p className="text-sm text-neutral-900">{user.email}</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
            Plan
          </p>
          <p className="text-sm text-neutral-900 capitalize">
            {dbUser?.subscription_status ?? "free"}
          </p>

          {isActive && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Generations
                </p>
                <p className="text-sm text-neutral-900">{gensUsed} / 25</p>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-neutral-900"
                  style={{ width: `${Math.min((gensUsed / 25) * 100, 100)}%` }}
                />
              </div>
              {periodEnd && (
                <p className="text-xs text-neutral-500 mt-2">Resets {periodEnd}</p>
              )}
            </div>
          )}
        </div>

        {isActive && dbUser?.current_period_end && (
          <form action="/api/billing-portal" method="POST" className="mb-4">
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-md transition-colors"
            >
              Manage subscription
            </button>
          </form>
        )}

        {!isActive && (
          <Link
            href="/upgrade"
            className="block w-full mb-4 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-base font-medium rounded-md text-center transition-colors"
          >
            Get 25 generations for $10
          </Link>
        )}

        <LogoutButton />
      </div>
    </main>
  );
}
