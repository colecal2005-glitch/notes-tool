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
    <main className="min-h-screen bg-[#09090B] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1
          className="text-3xl font-bold text-center mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Sign in
        </h1>
        <p className="text-white/40 text-sm text-center mb-8">
          We&apos;ll email you a magic link — no password needed.
        </p>

        {sent ? (
          <div
            className="bg-[#14141A] border border-white/10 rounded-xl p-8 text-center"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
          >
            <p className="text-white font-semibold mb-2">Check your email</p>
            <p className="text-white/45 text-sm">
              Sent a magic link to <span className="text-white/70">{email}</span>.
            </p>
          </div>
        ) : (
          <div
            className="bg-[#14141A] border border-white/10 rounded-xl p-8"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 text-sm bg-white/8 border border-white/15 rounded-lg placeholder-white/25 text-white focus:outline-none focus:border-[#FF6719]/50 focus:ring-1 focus:ring-[#FF6719]/30 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="px-8 py-3 text-sm font-semibold rounded-lg text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #FF6719 0%, #e04f0a 100%)",
                  boxShadow: loading ? "none" : "0 0 28px rgba(255,103,25,0.45), 0 1px 3px rgba(0,0,0,0.5)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                    Sending…
                  </span>
                ) : (
                  "Send magic link →"
                )}
              </button>
            </form>

            {error && (
              <p className="text-red-400/80 text-xs mt-3 text-center">{error}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
