import { NextRequest, NextResponse } from "next/server";
import { scrapePost } from "@/lib/scrape";
import { generateNotes } from "@/lib/generate";
import { matchImages } from "@/lib/match-images";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

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
  let email: string | undefined;
  try {
    const body = await req.json();
    url = (body.url ?? "").trim();
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
    if (!url) throw new Error("missing url");
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Please enter a valid URL." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const service = createSupabaseServiceClient();

  // ── Authed path ───────────────────────────────────────────────────────────
  if (user) {
    const { data: dbUser } = await service
      .from("users")
      .select("id, subscription_status, free_gens_used, current_period_start, current_period_end")
      .eq("auth_user_id", user.id)
      .single();

    if (!dbUser || dbUser.subscription_status !== "active") {
      return NextResponse.json({ error: "Active subscription required." }, { status: 402 });
    }

    const periodStart = dbUser.current_period_start;
    const periodEnd = dbUser.current_period_end;

    // For one-time purchases period dates are null — count all generations.
    // For subscriptions, count only within the current billing period.
    let countQuery = service
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", dbUser.id);
    if (periodStart) countQuery = countQuery.gte("created_at", periodStart);
    if (periodEnd) countQuery = countQuery.lte("created_at", periodEnd);

    const { count } = await countQuery;
    const used = count ?? 0;
    if (used >= 25) {
      return NextResponse.json(
        { error: "Generation limit reached.", resetsAt: periodEnd ?? null },
        { status: 429 }
      );
    }

    const notes = await runPipeline(url);
    if ("error" in notes) return NextResponse.json(notes, { status: notes.status });

    await service.from("generations").insert({ user_id: dbUser.id, url });

    return NextResponse.json({
      ...notes.data,
      usage: { used: used + 1, limit: 25, resetsAt: periodEnd },
    });
  }

  // ── Anonymous path ────────────────────────────────────────────────────────
  if (!email) {
    return NextResponse.json({ error: "Email is required.", needsEmail: true }, { status: 400 });
  }

  const { data: anonUser, error: upsertError } = await service
    .from("users")
    .upsert({ email }, { onConflict: "email" })
    .select("id, free_gens_used")
    .single();

  if (upsertError || !anonUser) {
    console.error("[/api/generate] upsert error", upsertError);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }

  if (anonUser.free_gens_used >= 1) {
    return NextResponse.json({ error: "Free generation used.", email }, { status: 402 });
  }

  await service
    .from("users")
    .update({ free_gens_used: anonUser.free_gens_used + 1 })
    .eq("id", anonUser.id);

  const notes = await runPipeline(url);
  if ("error" in notes) return NextResponse.json(notes, { status: notes.status });

  await service.from("generations").insert({ user_id: anonUser.id, url });

  return NextResponse.json(notes.data);
}

async function runPipeline(url: string) {
  try {
    const post = await scrapePost(url);

    if (!post.text || post.text.length < 100) {
      return { error: "Couldn't extract post text. Is this a public Substack post?", status: 422 };
    }

    const notes = await generateNotes(post.text);
    const notesWithImages = await matchImages(notes, post.images);

    return { data: { notes: notesWithImages, post: { title: post.title, url } } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    console.error("[/api/generate]", message);
    return { error: message, status: 500 };
  }
}
