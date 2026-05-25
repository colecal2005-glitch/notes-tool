# Handoff State

---

## Last phase completed

**Phase:** Free trial + paywall
**Date:** 2026-05-25

---

## What got built / changed

### Files modified
- `notes-tool/app/components/GenerateForm.tsx` — added localStorage-based free trial gate + PaywallCard component

### What was built
- `hasUsed` state read from `localStorage` key `notes_used` on mount
- After successful generation: sets `localStorage.setItem('notes_used', 'true')`
- If `hasUsed && !result`: renders `PaywallCard` instead of the form
- `PaywallCard` also renders inline below results on first use (upsell while reading notes)
- Clicking "Generate for another post →" after use shows paywall
- Return visitors hit paywall immediately on page load
- Paywall copy: "You've used your free generation" / "Get 25 generations for $10"
- Button reads `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` env var (placeholder set in `.env.local`)

### Deployed
- Pushed to `github.com/colecal2005-glitch/notes-tool` → auto-deployed to `notes-tool.vercel.app`

---

## Verified working (production)

- [x] Paywall logic committed and deployed
- [ ] Stripe Payment Link not yet wired — Stripe ID verification in progress

---

## Current product flow (as-built)

```
First visit:
  User pastes URL → POST /api/generate → notes displayed → PaywallCard shown below results
  localStorage flag set: notes_used = true

Return visit / second attempt:
  PaywallCard shown immediately → "Unlock unlimited →" button → Stripe Payment Link
```

Notes returned: exactly 3
Model: `claude-sonnet-4-6`
Cost per run: ~$0.04-0.06

---

## Env vars

| Var | Where | Notes |
|-----|-------|-------|
| `ANTHROPIC_API_KEY` | `notes-tool/.env.local` + Vercel dashboard | Set and working |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | `notes-tool/.env.local` (blank placeholder) + Vercel dashboard (not yet set) | Add once Stripe ID verified |

---

## Live URLs

- Production: `notes-tool.vercel.app`
- Git remote: `github.com/colecal2005-glitch/notes-tool`

---

## Next session priorities (in order)

### 1. Wire Stripe Payment Link ← START HERE (15 min)
- Stripe ID verification is in progress — complete it first
- In Stripe dashboard: Products → create a one-time $10 product for 25 generations → Payment Links → create link
- Copy the URL (`https://buy.stripe.com/...`)
- Add to Vercel: Settings → Environment Variables → `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` = the URL
- Trigger a redeploy (push any small change or click "Redeploy" in Vercel dashboard)
- Test: visit `notes-tool.vercel.app` in a fresh browser (or incognito), generate once, confirm paywall button works

### 2. Track paid users / enforce 25-generation limit
- Right now there is no enforcement of the 25-generation limit — the paywall is purely honor-based (localStorage)
- Options (in order of complexity):
  a. **Simple:** issue a coupon code on payment, user enters code to unlock 25 more (no backend needed)
  b. **Medium:** Stripe webhook → write to Vercel KV → check on each `/api/generate` call
  c. **Full:** Supabase auth + credits column (only after validating willingness to pay)
- Recommended: start with (a) to validate demand, upgrade later

### 3. Basic rate limiting (do before any public sharing)
- `/api/generate` is fully open — no auth, no limits
- Simplest: Vercel KV to count requests per IP, cap at ~5/day
- Alternative: middleware referer check so only the UI can call the endpoint

### 4. Custom domain (optional)
- Domain not yet purchased
- Easiest path: buy directly in Vercel dashboard (Settings → Domains) — auto-configures DNS
- Suggested names to explore: notesbyai, substacknotes, notesgen, etc.

---

## Known quirks / gotchas

- **Generation takes 25-40s.** Scrape (3-5s) + generate (15-20s) + image match (8-12s). Normal. UI shows spinner.
- **localStorage paywall is bypassable** — user can clear browser storage. Acceptable for MVP.
- **Hobby plan works.** Despite `maxDuration = 60` in the route, Hobby plan has been sufficient.
- **Image matching is best-effort.** Images that can't be fetched (403, too large >3MB, too small <2KB) are silently skipped.
- **No `.env.local` in repo** (gitignored). Local dev requires `notes-tool/.env.local` with `ANTHROPIC_API_KEY=...`.
- **`@/*` path alias** maps to `notes-tool/` root.

---

## File structure (relevant parts)

```
notes-tool/
  app/
    api/generate/route.ts       ← POST endpoint (maxDuration = 60)
    components/GenerateForm.tsx ← form + results + paywall logic (PaywallCard lives here)
    viewer/                     ← internal tool (read-only, don't touch)
    page.tsx                    ← homepage
    layout.tsx                  ← fonts, metadata
  lib/
    scrape.ts
    generate.ts
    match-images.ts
  prompts/
    substack-notes-v0.md
    anti-patterns.md
  data/
    corpus.json
  .env.local                    ← ANTHROPIC_API_KEY + NEXT_PUBLIC_STRIPE_PAYMENT_LINK (blank)
  next.config.ts
  package.json
```
