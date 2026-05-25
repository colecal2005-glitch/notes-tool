# Handoff State

---

## Last phase completed

**Phase:** Vercel deployment + layout fix
**Date:** 2026-05-25

---

## What got built / changed

### Files modified
- `notes-tool/app/layout.tsx` — updated metadata title/description from "10 great Notes" to "3 great Notes"

### Vercel deployment
- Project was already connected to Vercel (`notes-tool.vercel.app`) but Root Directory was not set
- Fixed: set Root Directory to `notes-tool` in Vercel → Settings → General
- Added `ANTHROPIC_API_KEY` to Vercel environment variables (Production)
- Redeployed — **live and working at `notes-tool.vercel.app`**
- Running on Hobby plan (no Pro needed — pipeline completes within Hobby timeout in practice)

---

## Verified working (production)

- [x] `notes-tool.vercel.app` loads correctly
- [x] Pasting a Substack URL generates 3 notes with images
- [x] Hobby plan is sufficient (no timeout issues observed)

---

## Current product flow (as-built)

```
User pastes URL → POST /api/generate
  → scrapePost(url)            [lib/scrape.ts]        ~3-5s
  → generateNotes(text)        [lib/generate.ts]       ~15-20s
  → matchImages(notes, images) [lib/match-images.ts]   ~8-12s
  → { notes, post } returned to browser
```

Notes returned: exactly 3 (prompt hardcoded to `"Produce exactly 3 Notes"`)
Model: `claude-sonnet-4-6`
Cost per run: ~$0.04-0.06 (generation + image matching)

---

## Env vars

| Var | Where | Notes |
|-----|-------|-------|
| `ANTHROPIC_API_KEY` | `notes-tool/.env.local` (local) + Vercel dashboard (Production) | Both set and working |

---

## Live URLs

- Production: `notes-tool.vercel.app`
- Git remote: `github.com/colecal2005-glitch/notes-tool`

---

## Next session priorities (in order)

### 1. Free trial + paywall (2-3 hours) ← START HERE
- 1 free generation per visitor tracked via `localStorage`
- After first use: show a paywall card instead of results
- Paywall card: "You've used your free generation. $19/mo for unlimited." + Stripe Payment Link button
- No database needed — just a `localStorage` flag (`notes_used: true`)
- Implementation: in `GenerateForm.tsx`, check localStorage before submitting; after successful generation, set the flag; on next visit, render paywall card instead of form

### 2. Stripe Payment Link (1 hour)
- Create a $19/mo recurring product in Stripe dashboard
- Create a Payment Link
- Add the URL to an env var: `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`
- Wire the paywall card button to that URL

### 3. Basic rate limiting (30 min) — do before any public sharing
- `/api/generate` is fully open — no auth, no limits
- Simplest option: Vercel KV (key-value store) to count requests per IP, cap at ~5/day
- Alternative: referer check middleware so only the UI can call the endpoint
- Do this before posting the URL anywhere public

### 4. Auth (Supabase) — only after validating willingness to pay
- Only build after someone actually tries to pay
- Magic-link auth is right for this audience
- Supabase free tier is fine for MVP

---

## Known quirks / gotchas

- **Generation takes 25-40s.** Scrape (3-5s) + generate (15-20s) + image match (8-12s). Normal. UI shows spinner.
- **Hobby plan works.** Despite `maxDuration = 60` in the route, Hobby plan has been sufficient in practice.
- **Image matching is best-effort.** Images that can't be fetched (403, too large >3MB, too small <2KB) are silently skipped.
- **Corpus + prompt loaded at request time** from disk. Works on Vercel because `outputFileTracingIncludes` is set in `next.config.ts`.
- **No `.env.local` in repo** (gitignored). Local dev requires `notes-tool/.env.local` with `ANTHROPIC_API_KEY=...`.
- **`@/*` path alias** maps to `notes-tool/` root. All `lib/` imports use `@/lib/...`.

---

## File structure (relevant parts)

```
notes-tool/
  app/
    api/generate/route.ts       ← POST endpoint (maxDuration = 60)
    components/GenerateForm.tsx ← interactive form + results — paywall logic goes here
    viewer/                     ← internal tool (read-only, don't touch)
    page.tsx                    ← homepage
    layout.tsx                  ← fonts, metadata
  lib/
    scrape.ts                   ← web-safe scraper
    generate.ts                 ← note generation
    match-images.ts             ← image matching
  scripts/
    generate-notes.ts           ← CLI (unchanged)
    scripts/lib/scrape.ts       ← CLI scraper with disk cache (unchanged)
    scripts/lib/match-images.ts ← CLI image matcher (unchanged)
  prompts/
    substack-notes-v0.md        ← system prompt (edit to tune output)
    anti-patterns.md            ← injected into system prompt
  data/
    corpus.json                 ← few-shot examples (sampled at runtime)
  .env.local                    ← ANTHROPIC_API_KEY (not in git)
  next.config.ts
  package.json
```
