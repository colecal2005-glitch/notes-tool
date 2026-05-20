import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

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

const args = process.argv.slice(2);
const fileArg = args.indexOf("--file");
const inputPath =
  fileArg !== -1
    ? args[fileArg + 1]
    : join(process.cwd(), "../daily/2026-05-14/outputs/notes-corpus.csv");

const outputPath = join(process.cwd(), "data/corpus.json");

// Full CSV parser — handles quoted fields that span multiple lines,
// \r\n / \r / \n line endings, escaped quotes (""), and UTF-8 BOM.
function parseCsvContent(content: string): string[][] {
  const cleaned = content.replace(/^﻿/, ""); // strip BOM if present
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < cleaned.length) {
    const ch = cleaned[i];

    if (inQuotes) {
      if (ch === '"' && cleaned[i + 1] === '"') {
        field += '"'; // escaped quote inside quoted field
        i += 2;
      } else if (ch === '"') {
        inQuotes = false;
        i++;
      } else {
        field += ch; // newlines inside quoted fields are kept as-is
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ",") {
        record.push(field.trim());
        field = "";
        i++;
      } else if (ch === "\r" || ch === "\n") {
        // End of record — handle \r\n as one
        record.push(field.trim());
        field = "";
        if (record.some((f) => f.length > 0)) records.push(record);
        record = [];
        if (ch === "\r" && cleaned[i + 1] === "\n") i++;
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Last record (no trailing newline)
  record.push(field.trim());
  if (record.some((f) => f.length > 0)) records.push(record);

  return records;
}

const content = readFileSync(inputPath, "utf-8");
const records = parseCsvContent(content);

if (records.length < 2) {
  throw new Error(`No data found in ${inputPath} — is the file empty?`);
}

// First record is the header row
const headers = records[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"));

const col = (name: string): number => {
  const idx = headers.indexOf(name);
  if (idx === -1)
    throw new Error(`Column "${name}" not found. Headers: ${headers.join(", ")}`);
  return idx;
};
const optCol = (name: string): number => headers.indexOf(name);

const idIdx      = col("id");
const textIdx    = col("note_text");
const authorIdx  = optCol("author_pub");
const nicheIdx   = optCol("niche");
const engIdx     = optCol("engagement");
const linkedIdx  = optCol("linked_to_post");
const formatIdx  = col("format_guess");
const starredIdx = col("starred");

const notes: CorpusNote[] = records
  .slice(1)
  .map((cells) => {
    const get = (i: number) => (i === -1 ? "" : (cells[i] ?? "").trim());

    const engRaw = get(engIdx).toLowerCase();
    const engNorm: "high" | "medium" | "low" = ["high", "medium", "low"].includes(engRaw)
      ? (engRaw as "high" | "medium" | "low")
      : "low";

    return {
      id: get(idIdx),
      text: get(textIdx),
      author: get(authorIdx),
      niche: get(nicheIdx),
      engagement: engNorm,
      linked_to_post: get(linkedIdx).toLowerCase() === "yes",
      format: get(formatIdx),
      starred: get(starredIdx).toLowerCase() === "y",
    };
  })
  .filter((n) => n.text.length > 0 && n.id.length > 0);

// Print format summary
const formats = [...new Set(notes.map((n) => n.format))].sort();
console.log(`\nFormat categories found:`);
formats.forEach((f) => {
  const count = notes.filter((n) => n.format === f).length;
  console.log(`  ${f} (${count})`);
});

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(notes, null, 2));

console.log(
  `\n✅ Parsed ${notes.length} notes (${notes.filter((n) => n.starred).length} starred) → ${outputPath}`
);
