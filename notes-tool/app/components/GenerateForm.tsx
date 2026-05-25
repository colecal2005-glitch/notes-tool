"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "notes_used";

type Note = {
  shape: string;
  text: string;
  char_count: number;
  source: string;
  notes: string | null;
  image_url: string | null;
};

type Result = {
  notes: Note[];
  post: { title: string; url: string };
};

function PaywallCard() {
  const stripeUrl = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "#";

  return (
    <div className="max-w-md mx-auto text-center">
      <div
        className="bg-[#14141A] border border-white/10 rounded-xl p-10"
        style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
      >
        <p className="text-white font-semibold text-lg mb-2">
          You&apos;ve used your free generation
        </p>
        <p className="text-white/45 text-sm mb-8">
          Get 25 generations for $10
        </p>
        <a
          href={stripeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 text-sm font-semibold rounded-lg text-white transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #FF6719 0%, #e04f0a 100%)",
            boxShadow: "0 0 28px rgba(255,103,25,0.45), 0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          Unlock unlimited &rarr;
        </a>
      </div>
    </div>
  );
}

export default function GenerateForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [hasUsed, setHasUsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setHasUsed(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      localStorage.setItem(STORAGE_KEY, "true");
      setHasUsed(true);
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
      // clipboard API unavailable (non-HTTPS / old browser)
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setUrl("");
    // hasUsed stays true — next view will show paywall
  }

  // Paywall: user has consumed their free generation and is not viewing results
  if (hasUsed && !result) {
    return <PaywallCard />;
  }

  return (
    <div className="w-full">
      {/* URL input form — hidden while results are showing */}
      {!result && (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-4">
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
        </form>
      )}

      {/* Status / hint */}
      {loading && (
        <p className="text-xs text-white/30 text-center mt-1">
          Scraping post and generating Notes — takes about 20 seconds
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400/80 text-sm text-center mt-3 max-w-md mx-auto">{error}</p>
      )}

      {/* Results */}
      {result && (
        <div className="mt-10 max-w-md mx-auto">
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
            <PaywallCard />
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
