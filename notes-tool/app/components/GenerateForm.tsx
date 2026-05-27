"use client";

import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
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
  const [isAuthed, setIsAuthed] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setEmailSaved(true);
    }

    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsAuthed(true);
      } else if (localStorage.getItem(STORAGE_KEY) === "true") {
        setShowPaywall(true);
      }
    });
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

  if (showPaywall && !result) {
    return <PaywallCard prefillEmail={paywallEmail || email} />;
  }

  return (
    <div className="w-full">
      {/* Form — always visible */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="post-url" className="text-sm font-medium text-neutral-900">
            Substack post URL
          </label>
          <input
            id="post-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourname.substack.com/p/your-post"
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:opacity-50"
          />
        </div>
        {!isAuthed && !emailSaved && (
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
              disabled={loading}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:opacity-50"
            />
            <p className="text-xs text-neutral-500">We&apos;ll use this to save your free generation.</p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
              Generating…
            </span>
          ) : (
            "Generate Notes"
          )}
        </button>
      </form>

      {/* Loading hint */}
      {loading && (
        <div className="mt-3 max-w-xl bg-neutral-50 border border-neutral-200 rounded-md p-4">
          <p className="text-sm text-neutral-600">
            Scraping post and generating Notes — takes about 20 seconds
          </p>
        </div>
      )}

      {/* Error banner */}
      {error && !loading && (
        <div className="mt-3 max-w-xl bg-red-50 border border-red-200 rounded-md p-4 flex items-start justify-between gap-3">
          <p className="text-sm text-red-900">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors shrink-0 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-12 max-w-xl">
          {result.usage && (
            <p className="text-xs text-neutral-500 mb-6">
              {result.usage.used} / {result.usage.limit} generations used this cycle
            </p>
          )}

          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 mb-2">
            Your Notes
          </h2>
          {result.post.title && (
            <p className="text-sm text-neutral-500 mb-8 truncate">
              From: {result.post.title}
            </p>
          )}

          <div className="flex flex-col gap-4">
            {result.notes.map((note, idx) => (
              <div
                key={idx}
                className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg p-6 transition-colors"
              >
                {note.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={note.image_url}
                    alt=""
                    className="w-24 h-16 object-cover rounded-md mb-4"
                  />
                )}
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                  {note.shape}
                </p>
                <p className="text-base text-neutral-900 leading-relaxed whitespace-pre-wrap mb-4">
                  {note.text}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">{note.char_count} chars</span>
                  <button
                    onClick={() => copyNote(note.text, idx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-md transition-colors"
                  >
                    <Copy size={12} />
                    {copied === idx ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade prompt — only for unauthenticated users */}
          {!isAuthed && (
            <div className="mt-10">
              <PaywallCard prefillEmail={email} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
