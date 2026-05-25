# Handoff State

---

## Last phase completed

**Phase:** Pipeline refactor + core web app UI
**Date:** 2026-05-25

---

## What got built

### Files created
- `notes-tool/lib/scrape.ts` — web-safe scraper (no disk writes, used by API route)
- `notes-tool/lib/generate.ts` — pure note generation; loads `prompts/substack-notes-v0.md` + `data/corpus.json` at runtime
- `notes-tool/lib/match-images.ts` — web-safe image matcher; fetches images by URL, base64-encodes, calls Claude vision
- `notes-tool/app/api/generate/route.ts` — POST `/api/generate`; scrape → generate → match images → return JSON
- `notes-tool/app/components/GenerateForm.tsx` — client component; URL input, loading state, note cards with copy buttons + images

### Files modified
- `notes-tool/app/page.tsx` — replaced email waitlist form with the real `<GenerateForm />` component
- `notes-tool/next.config.ts` — added `outputFileTracingIncludes` to bundle `prompts/` and `data/corpus.json` into the Vercel serverless function

### Files NOT touched (still working exactly as before)
- `notes-tool/scripts/generate-notes.ts` — CLI entry point
- `notes-tool/scripts/lib/scrape.ts` — CLI scraper with disk cache
- `notes-tool/scripts/lib/match-images.ts` — CLI image matcher (reads local files)
- `notes-tool/app/viewer/` — internal viewer pages

---

## Verified working (local)

- [x] `npm run dev` starts without errors
- [x] `localhost:3000` renders the product homepage
- [x] Pasting a public Substack URL → generates 3 notes with matched images in ~25-40s
- [x] Copy button works on each note
- [x] `/viewer` still works (internal tool, untouched)
- [x] CLI (`npx tsx scripts/generate-notes.ts --url <url>`) still works

---

## Current product flow (as-built)

```
User pastes URL → POST /api/generate
  → scrapePost(url)         [lib/scrape.ts]    ~3-5s
  → generateNotes(text)     [lib/generate.ts]  ~15-20s
  → matchImages(notes, images) [lib/match-images.ts] ~8-12s
  → { notes, post } returned to browser
```

Notes returned: exactly 3 (prompt hardcoded to `"Produce exactly 3 Notes"`)
Model: `claude-sonnet-4-6`
Cost per run: ~$0.04-0.06 (generation + image matching)

---

## Env vars

| Var | Where | Notes |
|-----|-------|-------|
| `ANTHROPIC_API_KEY` | `notes-tool/.env.local` (local) | Must also be set in Vercel dashboard before deploying |

---

## Deferred / out of scope (do in next session)

- **Vercel deployment** — repo is not yet deployed. This is the first thing to do next session.
- **Auth (Supabase)** — no login, no user accounts. Anyone can hit `/api/generate` without a key.
- **Quota / free trial** — no limit on generations. Needs: 1 free generation → paywall.
- **Stripe** — no payments wired up yet.
- **Rate limiting** — the `/api/generate` endpoint is fully open. Before deploying publicly, add basic rate limiting (e.g., 5 req/IP/day via Vercel KV or middleware).
- **Email capture** — the waitlist form was replaced with the generator. If you want to capture emails separately, add a small form below the results.
- **`maxDuration = 60`** — set in the route, but Vercel Hobby plan caps at 10s. **Vercel Pro plan required** for the full pipeline to run on Vercel without timing out.

---

## Known quirks / gotchas

- **Generation takes 25-40s.** Scrape (3-5s) + generate (15-20s) + image match (8-12s). This is normal. The UI shows a spinner with a "takes about 20 seconds" hint.
- **Image matching is best-effort.** Images that can't be fetched (403, too large >3MB, too small <2KB) are silently skipped. Notes still render without an image.
- **Substack CDN URLs work fine** in `<img>` tags — no need to proxy or configure `next/image` remote patterns.
- **Prompt generates exactly 3 notes**, not 10. The headline on the homepage was updated to say "3 great Notes" to match. The metadata title in `layout.tsx` still says "10 great Notes" — update it.
- **Corpus + prompt are loaded at request time** from disk (`process.cwd()/prompts/` and `process.cwd()/data/`). On Vercel this works because `outputFileTracingIncludes` is set in `next.config.ts`.
- **The `@/*` path alias** maps to `notes-tool/` root. All `lib/` imports in the API route use `@/lib/...`.
- **No `.env.local` in repo** (gitignored). Local dev requires manually creating `notes-tool/.env.local` with `ANTHROPIC_API_KEY=...`.

---

## Next session priorities (in order)

### 1. Deploy to Vercel (1-2 hours)
- Connect the GitHub repo to a Vercel project (root directory: `notes-tool/`)
- Add `ANTHROPIC_API_KEY` to Vercel environment variables
- **Upgrade to Vercel Pro** (required for `maxDuration = 60`)
- Set a custom domain if you have one
- Smoke test: paste a URL on the live site, confirm notes generate

### 2. Basic rate limiting (30 min)
- Before sharing the URL publicly, add per-IP rate limiting to `/api/generate`
- Simplest option: Vercel KV (key-value store) to count requests per IP
- Or: add a simple token/secret header check so only your UI can call the endpoint

### 3. Free trial + paywall (2-3 hours)
- 1 free generation per visitor (track via cookie or localStorage)
- After first use: show a paywall card instead of results
- Paywall card: "You've used your free generation. $19/mo for unlimited." + Stripe Payment Link button
- No database needed yet — just a localStorage flag for the free trial gate

### 4. Stripe Payment Link (1 hour)
- Create a $19/mo recurring product in Stripe dashboard
- Create a Payment Link
- Add the URL to an env var (`NEXT_PUBLIC_STRIPE_PAYMENT_LINK`)
- Wire the paywall card button to it

### 5. Auth (Supabase) — only after validating willingness to pay
- Only build this after someone actually tries to pay
- Magic-link auth is the right approach for this audience
- Supabase free tier is fine for MVP

---

## File structure (relevant parts)

```
notes-tool/
  app/
    api/generate/route.ts     ← POST endpoint
    components/GenerateForm.tsx ← interactive form + results
    viewer/                   ← internal tool (read-only, don't touch)
    page.tsx                  ← homepage
    layout.tsx                ← fonts, metadata (update title here)
  lib/
    scrape.ts                 ← web-safe scraper
    generate.ts               ← note generation
    match-images.ts           ← image matching
  scripts/
    generate-notes.ts         ← CLI (unchanged)
    lib/scrape.ts             ← CLI scraper with disk cache (unchanged)
    lib/match-images.ts       ← CLI image matcher (unchanged)
  prompts/
    substack-notes-v0.md      ← system prompt (edit to tune output)
    anti-patterns.md          ← injected into system prompt
  data/
    corpus.json               ← few-shot examples (sampled at runtime)
  .env.local                  ← ANTHROPIC_API_KEY (not in git)
  next.config.ts
  package.json
```
