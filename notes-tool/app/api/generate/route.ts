import { NextRequest, NextResponse } from "next/server";
import { scrapePost } from "@/lib/scrape";
import { generateNotes } from "@/lib/generate";
import { matchImages } from "@/lib/match-images";

// Vercel Pro required for durations beyond 10s — scrape + generate + image match takes 25-45s
export const maxDuration = 60;

function isAllowedOrigin(origin: string): boolean {
  return (
    origin === "https://notefactory.app" ||
    origin === "https://www.notefactory.app" ||
    origin === "https://notes-tool.vercel.app" ||
    (origin.startsWith("https://notes-tool-") && origin.endsWith(".vercel.app")) ||
    origin === "http://localhost:3000"
  );
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let url: string;
  try {
    const body = await req.json();
    url = (body.url ?? "").trim();
    if (!url) throw new Error("missing url");
    new URL(url); // throws if invalid
  } catch {
    return NextResponse.json({ error: "Please enter a valid URL." }, { status: 400 });
  }

  try {
    const post = await scrapePost(url);

    if (!post.text || post.text.length < 100) {
      return NextResponse.json(
        { error: "Couldn't extract post text. Is this a public Substack post?" },
        { status: 422 }
      );
    }

    const notes = await generateNotes(post.text);
    const notesWithImages = await matchImages(notes, post.images);

    return NextResponse.json({
      notes: notesWithImages,
      post: { title: post.title, url },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    console.error("[/api/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
