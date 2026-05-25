import Anthropic from "@anthropic-ai/sdk";
import type { ScrapedImage } from "./scrape";
import type { GeneratedNote } from "./generate";

export type NoteWithImage = GeneratedNote & {
  image_url: string | null;
};

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function detectMediaType(buf: Uint8Array): ImageMediaType {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return "image/webp";
  return "image/jpeg";
}

async function fetchImageAsBase64(
  url: string
): Promise<{ data: string; mediaType: ImageMediaType } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    // Skip tracking pixels and icons (under 2 KB), and images over 3 MB
    if (buf.length < 2048 || buf.length > 3_000_000) return null;
    const mediaType = detectMediaType(buf);
    const data = Buffer.from(buf).toString("base64");
    return { data, mediaType };
  } catch {
    return null;
  }
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

export async function matchImages(
  notes: GeneratedNote[],
  images: ScrapedImage[],
  modelId: string = "claude-sonnet-4-6"
): Promise<NoteWithImage[]> {
  if (images.length === 0) {
    return notes.map((n) => ({ ...n, image_url: null }));
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic({ apiKey });

  // Fetch and encode images in parallel
  const fetched = await Promise.all(
    images.map(async (img) => ({
      img,
      encoded: await fetchImageAsBase64(img.url),
    }))
  );

  const contentParts: Anthropic.MessageParam["content"] = [];

  contentParts.push({
    type: "text",
    text:
      `Notes to match:\n\n${JSON.stringify(
        notes.map((n, i) => ({ note_index: i, shape: n.shape, text: n.text })),
        null,
        2
      )}\n\nImages from the post (match each Note to the most relevant one):`,
  });

  for (const { img, encoded } of fetched) {
    const labelParts = [`[Image position ${img.position}]`];
    if (img.alt) labelParts.push(`alt: "${img.alt}"`);
    if (img.caption) labelParts.push(`caption: "${img.caption}"`);
    contentParts.push({ type: "text", text: labelParts.join(" — ") });

    if (encoded) {
      contentParts.push({
        type: "image",
        source: { type: "base64", media_type: encoded.mediaType, data: encoded.data },
      });
    } else {
      contentParts.push({
        type: "text",
        text: `(image unavailable — context: ${img.surrounding_text})`,
      });
    }
  }

  contentParts.push({ type: "text", text: "Return the JSON array now. No other text." });

  const response = await client.messages.create({
    model: modelId,
    max_tokens: 512,
    system: MATCHING_SYSTEM,
    messages: [{ role: "user", content: contentParts }],
  });

  const rawText = response.content[0].type === "text" ? response.content[0].text : "";
  let matches: Array<{ note_index: number; image_position: number | null }> = [];

  try {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("no JSON array");
    matches = JSON.parse(jsonMatch[0]);
  } catch {
    return notes.map((n) => ({ ...n, image_url: null }));
  }

  const imageByPosition = new Map(images.map((img) => [img.position, img]));

  return notes.map((note, i) => {
    const matchEntry = matches.find((m) => m.note_index === i);
    const imagePosition = matchEntry?.image_position ?? null;
    if (imagePosition === null) return { ...note, image_url: null };
    const matched = imageByPosition.get(imagePosition);
    return { ...note, image_url: matched?.url ?? null };
  });
}
