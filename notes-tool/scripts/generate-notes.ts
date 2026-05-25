import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { scrapePost, type ScrapedImage } from "./lib/scrape";
import { matchImagesToNotes } from "./lib/match-images";

const MODELS: Record<string, { id: string; inputCostPerM: number; outputCostPerM: number }> = {
  sonnet: { id: "claude-sonnet-4-6", inputCostPerM: 3.0,  outputCostPerM: 15.0 },
  opus:   { id: "claude-opus-4-7",   inputCostPerM: 15.0, outputCostPerM: 75.0 },
};

type CorpusNote = {
  id: string;
  text: string;
  author: string;
  niche: string;
  engagement: "high" | "medium" | "low";
  linked_to_post: boolean;
  format: string;
  starred: boolean;
};

type GeneratedNote = {
  format?: string;
  shape?: string;
  text: string;
  char_count: number;
  source?: string;
  notes?: string | null;
};

function sampleFewShot(
  corpus: CorpusNote[],
  { preferStarred, count }: { preferStarred: boolean; count: number }
): CorpusNote[] {
  if (corpus.length === 0) return [];
  const starred = corpus.filter((n) => n.starred);
  const rest = corpus.filter((n) => !n.starred);
  const pool =
    preferStarred && starred.length >= 3 ? [...starred, ...rest] : [...corpus];
  return pool.sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
}

function formatFewShotBlock(examples: CorpusNote[]): string {
  return examples
    .map((n) => `[${n.format.toUpperCase()}]\n${n.text}`)
    .join("\n\n---\n\n");
}

// --- CLI args ---
const args = process.argv.slice(2);
const fileArgIdx = args.indexOf("--file");
const urlArgIdx = args.indexOf("--url");
const fileArg = fileArgIdx !== -1 ? args[fileArgIdx + 1] : null;
const urlArg = urlArgIdx !== -1 ? args[urlArgIdx + 1] : null;
const noCorpus = args.includes("--no-corpus");
const modelArgIdx = args.indexOf("--model");
const modelKey = modelArgIdx !== -1 ? args[modelArgIdx + 1] : "sonnet";
const model = MODELS[modelKey];

if (fileArg && urlArg) {
  console.error("Error: --url and --file are mutually exclusive. Provide one or the other.");
  process.exit(1);
}

if (!fileArg && !urlArg) {
  console.error(
    "Usage:\n" +
    "  npx tsx scripts/generate-notes.ts --url <substack-url> [--model sonnet|opus] [--no-corpus]\n" +
    "  npx tsx scripts/generate-notes.ts --file data/source-posts/post.txt [--model sonnet|opus] [--no-corpus]"
  );
  process.exit(1);
}

if (!model) {
  console.error(`Unknown model "${modelKey}". Valid options: ${Object.keys(MODELS).join(", ")}`);
  process.exit(1);
}

const promptPath = join(process.cwd(), "prompts/substack-notes-v0.md");
const corpusPath = join(process.cwd(), "data/corpus.json");
const antiPatternsPath = join(process.cwd(), "prompts/anti-patterns.md");

const basePrompt = readFileSync(promptPath, "utf-8");
const antiPatterns = existsSync(antiPatternsPath)
  ? readFileSync(antiPatternsPath, "utf-8")
  : "";

let corpus: CorpusNote[] = [];
if (!noCorpus && existsSync(corpusPath)) {
  corpus = JSON.parse(readFileSync(corpusPath, "utf-8"));
}

const fewShotExamples = sampleFewShot(corpus, { preferStarred: true, count: 8 });

const systemParts = [basePrompt];
if (antiPatterns) systemParts.push(antiPatterns);
if (fewShotExamples.length > 0) {
  systemParts.push(
    `## Few-shot examples from the corpus\n\n${formatFewShotBlock(fewShotExamples)}`
  );
}
const systemMessage = systemParts.join("\n\n---\n\n");

// --- Generate ---
async function main() {
  const client = new Anthropic();

  let postText: string;
  let scrapedImages: ScrapedImage[] = [];
  let scrapedDir: string | null = null;
  let postName: string;
  let sourceUrl: string | null = null;

  if (urlArg) {
    console.log(`\nScraping post from: ${urlArg}`);
    const scraped = await scrapePost(urlArg);
    postText = scraped.text;
    scrapedImages = scraped.images;
    scrapedDir = `data/scraped/${scraped.slug}`;
    postName = scraped.slug;
    sourceUrl = urlArg;
    console.log(`Scraped: "${scraped.title}" — ${scraped.images.length} image(s) found\n`);
  } else {
    postText = readFileSync(fileArg!, "utf-8");
    postName = fileArg!.split(/[\\/]/).pop()?.replace(".txt", "") ?? "post";
  }

  console.log(`Generating Notes for: ${postName}`);
  console.log(
    `Model: ${model.id} | Corpus: ${corpus.length} notes | Few-shot: ${fewShotExamples.length} examples\n`
  );

  const start = Date.now();

  const response = await client.messages.create({
    model: model.id,
    max_tokens: 4096,
    system: systemMessage,
    messages: [{ role: "user", content: postText }],
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const rawText =
    response.content[0].type === "text" ? response.content[0].text : "";

  let notes: GeneratedNote[] = [];
  try {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON array found in response. Raw output:\n", rawText);
      process.exit(1);
    }
    notes = JSON.parse(jsonMatch[0]);
  } catch {
    console.error("Failed to parse JSON response. Raw output:\n", rawText);
    process.exit(1);
  }

  notes.forEach((note) => {
    console.log(`--- [${note.shape ?? note.format}] (${note.char_count} chars) ---`);
    console.log(note.text);
    console.log();
  });

  const genInputTokens = response.usage.input_tokens;
  const genOutputTokens = response.usage.output_tokens;
  const genCost =
    (genInputTokens / 1_000_000) * model.inputCostPerM +
    (genOutputTokens / 1_000_000) * model.outputCostPerM;

  // Image matching
  let matchTokens = { input: 0, output: 0 };
  let matchCost = 0;
  let finalNotes: (GeneratedNote & { image_url: string | null; image_local_path: string | null })[];

  if (scrapedDir) {
    console.log(`Matching images to Notes...`);
    const matchResult = await matchImagesToNotes(
      notes,
      scrapedImages,
      scrapedDir,
      postName,
      model.id
    );
    finalNotes = matchResult.notes;
    matchTokens = matchResult.tokens;
    matchCost =
      (matchTokens.input / 1_000_000) * model.inputCostPerM +
      (matchTokens.output / 1_000_000) * model.outputCostPerM;
  } else {
    finalNotes = notes.map((n) => ({ ...n, image_url: null, image_local_path: null }));
  }

  const totalCost = genCost + matchCost;
  const matchedCount = finalNotes.filter((n) => n.image_url !== null).length;

  // Console summary
  console.log(`\nNotes generated: ${finalNotes.length}`);
  if (scrapedDir) {
    console.log(`Images scraped: ${scrapedImages.length}`);
    console.log(`Notes with matched images: ${matchedCount}`);
  } else {
    console.log(`Images: (text-only mode, no images)`);
  }
  console.log(
    `Cost: $${totalCost.toFixed(4)} (gen $${genCost.toFixed(4)} + match $${matchCost.toFixed(4)})`
  );
  console.log(`Time: ${elapsed}s`);

  // Save output
  const outputDir = join(process.cwd(), "outputs/baseline");
  mkdirSync(outputDir, { recursive: true });
  const outputFile = join(outputDir, `${postName}-v0.json`);

  writeFileSync(
    outputFile,
    JSON.stringify(
      {
        post: sourceUrl ?? fileArg,
        source_url: sourceUrl,
        model: model.id,
        tokens: {
          generation: { input: genInputTokens, output: genOutputTokens },
          matching: matchTokens,
        },
        cost_usd: {
          generation: parseFloat(genCost.toFixed(4)),
          matching: parseFloat(matchCost.toFixed(4)),
          total: parseFloat(totalCost.toFixed(4)),
        },
        elapsed_s: parseFloat(elapsed),
        few_shot_count: fewShotExamples.length,
        image_count: scrapedImages.length,
        notes: finalNotes,
      },
      null,
      2
    )
  );

  console.log(`\nSaved to ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
