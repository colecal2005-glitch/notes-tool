"use client";

import { useState } from "react";

export type Note = {
  shape?: string;
  format?: string;
  text: string;
  char_count: number;
  source?: string;
  notes?: string | null;
  image_url: string | null;
  image_local_path: string | null;
};

export function NoteCard({ note, index }: { note: Note; index: number }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(note.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const label = note.shape ?? note.format ?? `Note ${index + 1}`;

  return (
    <div
      className="bg-[#14141A] border border-white/10 rounded-xl overflow-hidden"
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.35)" }}
    >
      {/* Image */}
      {note.image_url && (
        <div className="w-full bg-[#0E0E11] border-b border-white/8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={note.image_url}
            alt=""
            className="w-full object-cover max-h-72"
          />
        </div>
      )}

      {/* Body */}
      <div className="p-6">
        {/* Label + copy */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6719]">
            {label}
          </p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-all"
            style={
              copied
                ? {
                    borderColor: "rgba(34,197,94,0.4)",
                    color: "rgb(134,239,172)",
                    background: "rgba(34,197,94,0.08)",
                  }
                : {
                    borderColor: "rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.4)",
                    background: "transparent",
                  }
            }
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>

        {/* Text */}
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line mb-5">
          {note.text}
        </p>

        {/* Footer */}
        <div className="border-t border-white/8 pt-4 flex items-start justify-between gap-4">
          {note.source && (
            <p className="text-xs text-white/30 leading-relaxed flex-1 italic">
              {note.source}
            </p>
          )}
          <p className="text-xs text-white/20 shrink-0">{note.char_count} chars</p>
        </div>
      </div>
    </div>
  );
}
