import Anthropic from "@anthropic-ai/sdk";
import { existsSync, mkdirSync, readdirSync, copyFileSync, readFileSync } from "fs";
import { join } from "path";
import type { ScrapedImage } from "./scrape";

type GeneratedNote = {
  format?: string;
  shape?: string;
  text: string;
  char_count: number;
  source?: string;
  notes?: string | null;
};

export type NoteWithImage = GeneratedNote & {
  image_url: string | null;
  image_local_path: string | null;
};

export type MatchResult = {
  notes: NoteWithImage[];
  tokens: { input: number; output: number };
};

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

// Detect actual image format from magic bytes — don't trust the file extension.
function detectMediaType(buf: Buffer): ImageMediaType {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return "image/webp";
  return "image/jpeg"; // fallback
}

function findLocalFile(position: number, scrapedDir: string): string | null {
  const imagesDir = join(process.cwd(), scrapedDir, "images");
  if (!existsSync(imagesDir)) return null;
  const files = readdirSync(imagesDir);
  const found = files.find((f) => f.startsWith(`img-${position}.`));
  return found ? join(imagesDir, found) : null;
}

const MATCHING_SYSTEM = `You are matching promotional Substack Notes to images from the source post.

You will receive:
- A list of Notes, each with a "note_index", "shape" (the literary move), and "text".
- The actual images from the post in order, each labeled with its position number.

Look at each image and decide which Note it best complements — the image whose visual content most strongly reinforces what the Note is saying. Multiple Notes can share an image. A Note can have no match if no image fits well.

Output a JSON array, one object per Note, in the same order as the input Notes:

[
  { "note_index": 0, "image_position": 2 },
  { "note_index": 1, "image_position": null },
  { "note_index": 2, "image_position": 0 }
]

Rules:
- "image_position" must be either an integer matching one of the input image positions, or null.
- Return exactly one object per input Note.
- Do not include any text outside the JSON array.
- Prefer null over a weak match. A Note with no image is better than a Note with a mismatched image.`;

export async function matchImagesToNotes(
  notes: GeneratedNote[],
  images: ScrapedImage[],
  scrapedDir: string,
  postName: string,
  modelId: string
): Promise<MatchResult> {
  if (images.length === 0) {
    return {
      notes: notes.map((n) => ({ ...n, image_url: null, image_local_path: null })),
      tokens: { input: 0, output: 0 },
    };
  }

  const client = new Anthropic();

  // Build multimodal message: notes text, then each image with its position label
  const contentParts: Anthropic.MessageParam["content"] = [];

  contentParts.push({
    type: "text",
    text:
      `Notes to match:\n\n${JSON.stringify(
        notes.map((n, i) => ({ note_index: i, shape: n.shape ?? n.format, text: n.text })),
        null,
        2
      )}\n\nImages from the post (match each Note to the most relevant one):`,
  });

  for (const img of images) {
    const labelParts = [`[Image position ${img.position}]`];
    if (img.alt)     labelParts.push(`alt: "${img.alt}"`);
    if (img.caption) labelParts.push(`caption: "${img.caption}"`);

    contentParts.push({ type: "text", text: labelParts.join(" — ") });

    const localPath = findLocalFile(img.position, scrapedDir);
    const buf = localPath ? readFileSync(localPath) : null;
    // Skip files under 2 KB — they're tracking pixels or icons, not content images.
    if (buf && buf.length >= 2048) {
      const mediaType = detectMediaType(buf);
      const data = buf.toString("base64");
      contentParts.push({ type: "image", source: { type: "base64", media_type: mediaType, data } });
    } else {
      // No local file — give Claude what context we have
      contentParts.push({
        type: "text",
        text: `(image unavailable — surrounding context: ${img.surrounding_text})`,
      });
    }
  }

  contentParts.push({
    type: "text",
    text: "Return the JSON array now. No other text.",
  });

  const response = await client.messages.create({
    model: modelId,
    max_tokens: 1024,
    system: MATCHING_SYSTEM,
    messages: [{ role: "user", content: contentParts }],
  });

  const rawText = response.content[0].type === "text" ? response.content[0].text : "";
  let matches: Array<{ note_index: number; image_position: number | null }> = [];

  try {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array in response");
    matches = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.warn(`[match] Failed to parse matching response: ${err}\nRaw:\n${rawText}`);
    return {
      notes: notes.map((n) => ({ ...n, image_url: null, image_local_path: null })),
      tokens: { input: response.usage.input_tokens, output: response.usage.output_tokens },
    };
  }

  const outputImagesDir = join(process.cwd(), "outputs/baseline", postName, "images");
  mkdirSync(outputImagesDir, { recursive: true });

  const imageByPosition = new Map(images.map((img) => [img.position, img]));

  const notesWithImages: NoteWithImage[] = notes.map((note, i) => {
    const matchEntry = matches.find((m) => m.note_index === i);
    const imagePosition = matchEntry?.image_position ?? null;

    if (imagePosition === null) {
      return { ...note, image_url: null, image_local_path: null };
    }

    const matchedImage = imageByPosition.get(imagePosition);
    if (!matchedImage) {
      return { ...note, image_url: null, image_local_path: null };
    }

    const localSrc = findLocalFile(imagePosition, scrapedDir);
    let outputLocalPath: string | null = null;

    if (localSrc) {
      const ext = localSrc.split(".").pop() ?? "jpg";
      const destFile = join(outputImagesDir, `img-${imagePosition}.${ext}`);
      try {
        copyFileSync(localSrc, destFile);
        outputLocalPath = `outputs/baseline/${postName}/images/img-${imagePosition}.${ext}`;
      } catch (err) {
        console.warn(`[match] Failed to copy ${localSrc} to output: ${err}`);
      }
    }

    return { ...note, image_url: matchedImage.url, image_local_path: outputLocalPath };
  });

  return {
    notes: notesWithImages,
    tokens: { input: response.usage.input_tokens, output: response.usage.output_tokens },
  };
}
