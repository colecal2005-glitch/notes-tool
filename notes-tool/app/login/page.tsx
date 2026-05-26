"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const redirectTo = `${window.location.origin}/auth/callback?next=/account`;

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
    <main className="flex-1 bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
            Log in to your account
          </h1>
          <p className="text-base text-neutral-600">
            We&apos;ll email you a magic link — no password needed.
          </p>
        </div>

        {sent ? (
          <div className="bg-white border border-neutral-200 rounded-lg p-8 shadow-sm text-center">
            <p className="text-base font-semibold text-neutral-900 mb-1">Check your email</p>
            <p className="text-sm text-neutral-600">
              Link sent to{" "}
              <span className="text-neutral-900 font-medium">{email}</span>.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-lg p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-neutral-900">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:opacity-50"
                />
              </div>
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
                  "Send magic link"
                )}
              </button>
            </form>

            {error && (
              <p className="text-xs text-red-600 mt-3">{error}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
