# Handoff State

---

## Last phase completed

**Phase:** Origin check (basic API protection)
**Date:** 2026-05-25

---

## What got built / changed

### This session
- `notes-tool/app/components/GenerateForm.tsx` — free trial gate (localStorage `notes_used`) + `PaywallCard` component
- `notes-tool/app/api/generate/route.ts` — origin whitelist check (blocks direct API calls from outside the app)
- Paywall copy: "You've used your free generation" / "Get 25 generations for $10"
- `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` placeholder added to `.env.local`

### Deployed
- All pushed to `github.com/colecal2005-glitch/notes-tool` → live at `notes-tool.vercel.app`

---

## Verified working (production)

- [x] Paywall logic deployed
- [x] Origin check deployed — direct API calls return 403
- [ ] Stripe Payment Link not yet wired — ID verification in progress

---

## Current product flow (as-built)

```
First visit:
  User pastes URL → POST /api/generate (origin checked) → notes displayed
  → PaywallCard shown inline below results
  → localStorage flag set: notes_used = true

Return visit / second attempt:
  PaywallCard shown immediately → "Unlock unlimited →" button → Stripe Payment Link (not yet live)
```

Notes returned: exactly 3 | Model: claude-sonnet-4-6 | Cost: ~$0.04-0.06/run

---

## Env vars

| Var | Where | Notes |
|-----|-------|-------|
| `ANTHROPIC_API_KEY` | `.env.local` + Vercel dashboard | Set and working |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | `.env.local` (blank) + Vercel dashboard (not yet set) | Add once Stripe ID verified |

---

## Live URLs

- Production: `notes-tool.vercel.app`
- Git remote: `github.com/colecal2005-glitch/notes-tool`

---

## Next session priorities (in order)

### 1. Wire Stripe Payment Link ← START HERE (15 min)
- Complete Stripe ID verification (in progress)
- Stripe dashboard: Products → create one-time $10 product → Payment Links → create link
- Copy the URL (`https://buy.stripe.com/...`)
- Vercel dashboard: Settings → Environment Variables → add `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`
- Trigger redeploy (push any small change or click Redeploy in Vercel)
- Test in incognito: generate once, confirm paywall button routes to Stripe

### 2. Enforce 25-generation limit after payment
- Right now there's no server-side enforcement — paywall is localStorage only (bypassable)
- Recommended MVP path: Stripe webhook → Vercel KV → check on each `/api/generate` call
  - Stripe sends `checkout.session.completed` event to a new `/api/stripe-webhook` route
  - Route writes a record to Vercel KV keyed by email: `{ credits: 25 }`
  - `/api/generate` checks KV, decrements on success, returns 402 when exhausted
- Requires: Vercel KV add-on (free tier), Stripe webhook secret env var
- Only build this after someone actually tries to pay

### 3. Custom domain (optional)
- Site is live at `notes-tool.vercel.app` — shareable as-is
- When ready: buy domain in Vercel dashboard (Settings → Domains) — auto-configures DNS

---

## Known quirks / gotchas

- **Origin check** uses a hardcoded allowlist in `route.ts`. If the Vercel URL ever changes (e.g. custom domain added), add it to `ALLOWED_ORIGINS` in `app/api/generate/route.ts`.
- **Generation takes 25-40s.** Normal. UI shows spinner.
- **localStorage paywall is bypassable** (clear storage). Acceptable until server-side enforcement is built.
- **Hobby plan works.** `maxDuration = 60` set; no timeout issues observed.
- **No `.env.local` in repo** (gitignored). Local dev needs `notes-tool/.env.local` with `ANTHROPIC_API_KEY`.

---

## File structure (relevant parts)

```
notes-tool/
  app/
    api/generate/route.ts       ← POST endpoint — origin check + generation pipeline
    components/GenerateForm.tsx ← form + results + PaywallCard
    page.tsx
    layout.tsx
  lib/
    scrape.ts / generate.ts / match-images.ts
  prompts/
    substack-notes-v0.md / anti-patterns.md
  data/corpus.json
  .env.local                    ← ANTHROPIC_API_KEY + NEXT_PUBLIC_STRIPE_PAYMENT_LINK (blank)
```
