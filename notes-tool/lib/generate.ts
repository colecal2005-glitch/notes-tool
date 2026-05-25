import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export type GeneratedNote = {
  shape: string;
  text: string;
  char_count: number;
  source: string;
  notes: string | null;
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

const MODEL = "claude-sonnet-4-6";

function sampleFewShot(corpus: CorpusNote[], count: number): CorpusNote[] {
  if (corpus.length === 0) return [];
  const starred = corpus.filter((n) => n.starred);
  const pool = starred.length >= 3 ? [...starred, ...corpus.filter((n) => !n.starred)] : [...corpus];
  return pool.sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
}

function formatFewShotBlock(examples: CorpusNote[]): string {
  return examples
    .map((n) => `[${n.format.toUpperCase()}]\n${n.text}`)
    .join("\n\n---\n\n");
}

function buildSystemMessage(): string {
  const cwd = process.cwd();
  const promptPath = join(cwd, "prompts/substack-notes-v0.md");
  const antiPatternsPath = join(cwd, "prompts/anti-patterns.md");
  const corpusPath = join(cwd, "data/corpus.json");

  const basePrompt = readFileSync(promptPath, "utf-8");
  const antiPatterns = existsSync(antiPatternsPath)
    ? readFileSync(antiPatternsPath, "utf-8")
    : "";

  let corpus: CorpusNote[] = [];
  if (existsSync(corpusPath)) {
    corpus = JSON.parse(readFileSync(corpusPath, "utf-8"));
  }

  const fewShotExamples = sampleFewShot(corpus, 8);

  const parts = [basePrompt];
  if (antiPatterns) parts.push(antiPatterns);
  if (fewShotExamples.length > 0) {
    parts.push(`## Few-shot examples from the corpus\n\n${formatFewShotBlock(fewShotExamples)}`);
  }

  return parts.join("\n\n---\n\n");
}

export async function generateNotes(postText: string): Promise<GeneratedNote[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });
  const systemMessage = buildSystemMessage();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemMessage,
    messages: [{ role: "user", content: postText }],
  });

  const rawText = response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = rawText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Model returned an unexpected response format");
  }

  return JSON.parse(jsonMatch[0]) as GeneratedNote[];
}
