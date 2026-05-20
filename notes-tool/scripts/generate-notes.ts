import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

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
};

function sampleFewShot(
  corpus: CorpusNote[],
  { preferStarred, count }: { preferStarred: boolean; count: number }
): CorpusNote[] {
  if (corpus.length === 0) return [];
  const starred = corpus.filter((n) => n.starred);
  const rest = corpus.filter((n) => !n.starred);
  // Bias toward starred: fill first from starred, then rest, then shuffle
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
const fileArg = args.indexOf("--file");
const postPath = fileArg !== -1 ? args[fileArg + 1] : null;
const noCorpus = args.includes("--no-corpus");
const modelArg = args.indexOf("--model");
const modelKey = modelArg !== -1 ? args[modelArg + 1] : "sonnet";
const model = MODELS[modelKey];

if (!postPath) {
  console.error(
    "Usage: npx tsx scripts/generate-notes.ts --file data/source-posts/post-1.txt [--model sonnet|opus] [--no-corpus]"
  );
  process.exit(1);
}

if (!model) {
  console.error(`Unknown model "${modelKey}". Valid options: ${Object.keys(MODELS).join(", ")}`);
  process.exit(1);
}

const postContent = readFileSync(postPath, "utf-8");
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

  console.log(`\nGenerating Notes for: ${postPath}`);
  console.log(
    `Model: ${model.id} | Corpus: ${corpus.length} notes | Few-shot: ${fewShotExamples.length} examples\n`
  );

  const start = Date.now();

  const response = await client.messages.create({
    model: model.id,
    max_tokens: 4096,
    system: systemMessage,
    messages: [{ role: "user", content: postContent }],
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const rawText =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Parse JSON array from response
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

  // --- Print results ---
  notes.forEach((note) => {
    console.log(`--- [${note.shape ?? note.format}] (${note.char_count} chars) ---`);
    console.log(note.text);
    console.log();
  });

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cost =
    (inputTokens / 1_000_000) * model.inputCostPerM +
    (outputTokens / 1_000_000) * model.outputCostPerM;

  console.log(
    `📊 Tokens: ${inputTokens} in / ${outputTokens} out | Cost: $${cost.toFixed(4)} | Time: ${elapsed}s`
  );

  // --- Save output ---
  const postName =
    postPath!.split(/[\\/]/).pop()?.replace(".txt", "") ?? "post";
  const outputDir = join(process.cwd(), "outputs/baseline");
  mkdirSync(outputDir, { recursive: true });
  const outputFile = join(outputDir, `${postName}-v0.json`);

  writeFileSync(
    outputFile,
    JSON.stringify(
      {
        post: postPath,
        model: model.id,
        tokens: { input: inputTokens, output: outputTokens },
        cost_usd: parseFloat(cost.toFixed(4)),
        elapsed_s: parseFloat(elapsed),
        few_shot_count: fewShotExamples.length,
        notes,
      },
      null,
      2
    )
  );

  console.log(`\n💾 Saved to ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
