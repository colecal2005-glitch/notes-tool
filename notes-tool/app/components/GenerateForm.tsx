"use client";

import { useState, useEffect } from "react";
import { PaywallCard } from "./PaywallCard";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const STORAGE_KEY = "notes_used";
const STORAGE_EMAIL_KEY = "notes_email";

type Note = {
  shape: string;
  text: string;
  char_count: number;
  source: string;
  notes: string | null;
  image_url: string | null;
};

type Usage = {
  used: number;
  limit: number;
  resetsAt: string;
};

type Result = {
  notes: Note[];
  post: { title: string; url: string };
  usage?: Usage;
};

export default function GenerateForm() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallEmail, setPaywallEmail] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_EMAIL_KEY);
    if (saved) setEmail(saved);

    // Only show the localStorage paywall for unauthenticated users.
    // Paid users with an active session bypass it entirely.
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      const supabase = createSupabaseBrowserClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) setShowPaywall(true);
        // If user is authed, leave showPaywall=false — the API enforces limits server-side
      });
    }
  }, []);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), email: email.trim() || undefined }),
      });
      const data = await res.json();

      if (res.status === 402) {
        // Free gen exhausted — show paywall
        if (data.email) localStorage.setItem(STORAGE_EMAIL_KEY, data.email);
        setPaywallEmail(data.email ?? email);
        localStorage.setItem(STORAGE_KEY, "true");
        setShowPaywall(true);
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      localStorage.setItem(STORAGE_KEY, "true");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyNote(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard API unavailable
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setUrl("");
  }

  if (showPaywall && !result) {
    return <PaywallCard prefillEmail={paywallEmail || email} />;
  }

  return (
    <div className="w-full">
      {!result && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md mx-auto mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourname.substack.com/p/your-post"
              disabled={loading}
              required
              className="flex-1 px-4 py-3 text-sm bg-white/8 border border-white/15 rounded-lg placeholder-white/25 text-white focus:outline-none focus:border-[#FF6719]/50 focus:ring-1 focus:ring-[#FF6719]/30 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-6 py-3 text-sm font-semibold rounded-lg text-white whitespace-nowrap transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #FF6719 0%, #e04f0a 100%)",
                boxShadow: loading ? "none" : "0 0 28px rgba(255,103,25,0.45), 0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                  Generating…
                </span>
              ) : (
                "Generate Notes"
              )}
            </button>
          </div>

          {/* Email input — only shown for anonymous users (no localStorage email yet) */}
          {!localStorage.getItem(STORAGE_EMAIL_KEY) && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com — to save your free generation"
              disabled={loading}
              className="w-full px-4 py-3 text-sm bg-white/8 border border-white/15 rounded-lg placeholder-white/25 text-white focus:outline-none focus:border-[#FF6719]/50 focus:ring-1 focus:ring-[#FF6719]/30 transition-all disabled:opacity-50"
            />
          )}
        </form>
      )}

      {loading && (
        <p className="text-xs text-white/30 text-center mt-1">
          Scraping post and generating Notes — takes about 20 seconds
        </p>
      )}

      {error && (
        <p className="text-red-400/80 text-sm text-center mt-3 max-w-md mx-auto">{error}</p>
      )}

      {result && (
        <div className="mt-10 max-w-md mx-auto">
          {result.usage && (
            <p className="text-xs text-white/30 text-center mb-6">
              {result.usage.used} / {result.usage.limit} generations used this cycle
            </p>
          )}

          {result.post.title && (
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6719]/60 text-center mb-2">
              Generated for
            </p>
          )}
          {result.post.title && (
            <p className="text-sm text-white/50 text-center mb-8 truncate px-4">
              {result.post.title}
            </p>
          )}

          <div className="flex flex-col gap-3">
            {result.notes.map((note, idx) => (
              <div
                key={idx}
                className="bg-[#14141A] border border-white/10 hover:border-[#FF6719]/35 rounded-xl p-6 transition-all"
                style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
              >
                {note.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={note.image_url}
                    alt=""
                    className="w-full rounded-lg mb-4 object-cover max-h-52"
                  />
                )}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6719]">
                    {note.shape}
                  </p>
                  <button
                    onClick={() => copyNote(note.text, idx)}
                    className="text-xs text-white/30 hover:text-white/70 transition-colors shrink-0 font-medium"
                  >
                    {copied === idx ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">
                  {note.text}
                </p>
                <p className="text-xs text-white/20 mt-4">{note.char_count} chars</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <PaywallCard prefillEmail={email} />
          </div>

          <div className="text-center mt-6">
            <button
              onClick={reset}
              className="text-xs text-white/25 hover:text-white/55 transition-colors"
            >
              Generate for another post &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
