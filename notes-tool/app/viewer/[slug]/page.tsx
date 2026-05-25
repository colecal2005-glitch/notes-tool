import { readFileSync } from "fs";
import { join } from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NoteCard, type Note } from "./NoteCard";

type OutputData = {
  post: string;
  source_url: string | null;
  model: string;
  tokens: {
    generation?: { input: number; output: number };
    matching?: { input: number; output: number };
  };
  cost_usd: { generation: number; matching: number; total: number } | number;
  elapsed_s: number;
  few_shot_count: number;
  image_count: number;
  notes: Note[];
};

export default async function ViewerSlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let data: OutputData;
  try {
    const filePath = join(process.cwd(), "outputs/baseline", `${slug}.json`);
    data = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    notFound();
  }

  const totalCost =
    typeof data.cost_usd === "object" ? data.cost_usd.total : data.cost_usd;
  const genTokens = data.tokens.generation;
  const matchTokens = data.tokens.matching;
  const matchedCount = data.notes.filter((n) => n.image_url !== null).length;

  return (
    <main className="min-h-screen bg-[#09090B] text-white px-6 py-14">
      <div className="max-w-[680px] mx-auto">
        {/* Back */}
        <Link
          href="/viewer"
          className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 mb-8 transition-colors"
        >
          ← All runs
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p
            className="text-xl font-bold text-white mb-2 break-words"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {slug}
          </p>

          {data.source_url && (
            <a
              href={data.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#FF6719]/70 hover:text-[#FF6719] break-all block mb-5 transition-colors"
            >
              {data.source_url}
            </a>
          )}

          {/* Stats strip */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
            <Stat label="Model" value={data.model} />
            <Stat label="Cost" value={`$${totalCost.toFixed(4)}`} />
            <Stat label="Time" value={`${data.elapsed_s}s`} />
            <Stat label="Few-shot" value={String(data.few_shot_count)} />
            {data.image_count > 0 && (
              <Stat
                label="Images"
                value={`${matchedCount} matched / ${data.image_count} scraped`}
              />
            )}
            {genTokens && (
              <Stat
                label="Tokens"
                value={`${genTokens.input + genTokens.output + (matchTokens?.input ?? 0) + (matchTokens?.output ?? 0)} total`}
              />
            )}
          </div>
        </div>

        {/* Note cards */}
        <div className="flex flex-col gap-5">
          {data.notes.map((note, i) => (
            <NoteCard key={i} note={note} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-white/35">
      {label}:{" "}
      <span className="text-white/60">{value}</span>
    </span>
  );
}
