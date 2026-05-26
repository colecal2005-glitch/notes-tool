"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function PaywallCard({ prefillEmail = "" }: { prefillEmail?: string }) {
  const [email, setEmail] = useState(prefillEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=/upgrade`
        : "/auth/callback?next=/upgrade";

    const supabase = createSupabaseBrowserClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (otpError) {
      setError(otpError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="max-w-md">
      {sent ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-8 shadow-sm text-center">
          <p className="text-base font-semibold text-neutral-900 mb-1">Check your email</p>
          <p className="text-sm text-neutral-600">
            We sent a magic link to{" "}
            <span className="text-neutral-900 font-medium">{email}</span>.
            Click it to continue to checkout.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
            Free generation used
          </p>
          <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">
            Upgrade to keep generating
          </h3>
          <p className="text-sm text-neutral-600 mb-8">
            One-time payment. 25 generations. No subscription.
          </p>

          <div className="bg-neutral-50 border border-neutral-200 rounded-md p-5 mb-6">
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-3xl font-semibold text-neutral-900">$10</span>
              <span className="text-sm text-neutral-500">one-time</span>
            </div>
            <p className="text-xs text-neutral-500 mb-4">25 generations</p>
            <ul className="space-y-2">
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
          </div>

          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-base font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                  Sending…
                </span>
              ) : (
                "Continue to checkout"
              )}
            </button>
          </form>

          {error && (
            <p className="text-xs text-red-600 mt-3">{error}</p>
          )}

          <p className="text-xs text-neutral-500 mt-5 text-center">
            Already paid?{" "}
            <Link href="/login" className="text-neutral-900 underline underline-offset-2">
              Log in
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
