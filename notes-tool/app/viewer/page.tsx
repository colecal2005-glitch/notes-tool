import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import Link from "next/link";

type RunMeta = {
  slug: string;
  sourceUrl: string | null;
  model: string;
  totalCost: number;
  noteCount: number;
  imageCount: number;
  matchedCount: number;
};

function getOutputs(): RunMeta[] {
  const dir = join(process.cwd(), "outputs/baseline");
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }

  return files.map((filename) => {
    const slug = filename.replace(".json", "");
    const data = JSON.parse(readFileSync(join(dir, filename), "utf-8"));
    const totalCost =
      typeof data.cost_usd === "object" ? data.cost_usd.total : data.cost_usd;
    const notes: { image_url: string | null }[] = data.notes ?? [];
    return {
      slug,
      sourceUrl: data.source_url ?? null,
      model: data.model ?? "unknown",
      totalCost: totalCost ?? 0,
      noteCount: notes.length,
      imageCount: data.image_count ?? 0,
      matchedCount: notes.filter((n) => n.image_url !== null).length,
    };
  });
}

export default function ViewerIndex() {
  const outputs = getOutputs();

  return (
    <main className="min-h-screen bg-[#09090B] text-white px-6 py-14">
      <div className="max-w-[680px] mx-auto">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6719] mb-2">
            Internal tool
          </p>
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Generated Notes
          </h1>
          <p className="text-white/35 text-sm mt-2">
            {outputs.length} run{outputs.length !== 1 ? "s" : ""} in outputs/baseline/
          </p>
        </div>

        {outputs.length === 0 ? (
          <p className="text-white/30 text-sm">
            No output files found. Run the generator first.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {outputs.map((run) => (
              <Link
                key={run.slug}
                href={`/viewer/${run.slug}`}
                className="block bg-[#14141A] border border-white/10 hover:border-[#FF6719]/40 rounded-xl p-5 transition-all group"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.4)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-white/90 group-hover:text-white truncate transition-colors">
                      {run.slug}
                    </p>
                    {run.sourceUrl && (
                      <p className="text-xs text-white/30 truncate mt-1">
                        {run.sourceUrl}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-white/35 mt-0.5">
                    <span>{run.noteCount} notes</span>
                    {run.imageCount > 0 && (
                      <span>{run.matchedCount}/{run.imageCount} imgs</span>
                    )}
                    <span className="text-white/50">${run.totalCost.toFixed(4)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
