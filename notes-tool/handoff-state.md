# Note Factory — Backend Handoff State

Last updated: 2026-05-25
Status: Backend complete, deployed to notefactory.app (Vercel)

---

## What's built

A Next.js App Router app that takes a Substack post URL and generates 3 Substack Notes using Claude. Auth via Supabase magic link. Payments via Stripe Payment Link. No passwords, no OAuth.

**Live URLs**
- Production: https://notefactory.app
- Also accessible at: https://notes-tool.vercel.app

---

## Stack

- **Framework:** Next.js App Router (TypeScript)
- **Hosting:** Vercel Hobby plan
- **Database + Auth:** Supabase (`@supabase/supabase-js` + `@supabase/ssr`)
- **Payments:** Stripe Payment Links + Stripe SDK v17.7.0
- **LLM:** Anthropic Claude Sonnet 4.6

---

## Repo structure (non-node_modules)

```
app/
  api/
    generate/route.ts          ← main generation endpoint
    billing-portal/route.ts    ← POST → redirects to Stripe portal
    webhooks/stripe/route.ts   ← Stripe event handler
  auth/callback/route.ts       ← exchanges magic link code for session
  account/page.tsx             ← server component, session-gated
  upgrade/page.tsx             ← server component, session-gated
  login/page.tsx               ← client component, magic link form
  components/
    GenerateForm.tsx           ← main client UI + anonymous paywall logic
    PaywallCard.tsx            ← magic link form shown after free gen used
    LogoutButton.tsx           ← client component, calls supabase.auth.signOut()
  layout.tsx                   ← shows Sign in / Account link in top-right
  page.tsx                     ← homepage, mounts GenerateForm
lib/
  supabase/
    server.ts                  ← createSupabaseServerClient(), createSupabaseServiceClient()
    client.ts                  ← createSupabaseBrowserClient()
  generate.ts                  ← Claude API call
  scrape.ts                    ← Substack post scraper
  match-images.ts              ← matches images to notes
middleware.ts                  ← Supabase session refresh (required by @supabase/ssr)
```

---

## Database schema (Supabase / Postgres)

### `public.users`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | internal user ID, used as Stripe `client_reference_id` |
| email | text UNIQUE | |
| auth_user_id | uuid FK → auth.users | null until magic link used |
| stripe_customer_id | text | null for one-time payment guests (see known issues) |
| subscription_status | enum | `free`, `active`, `past_due`, `canceled`, `unpaid` |
| current_period_start | timestamptz | null for one-time purchases |
| current_period_end | timestamptz | null for one-time purchases |
| free_gens_used | int | defaults 0 |
| created_at | timestamptz | |

### `public.generations`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → users.id | |
| url | text | the Substack URL that was generated |
| created_at | timestamptz | |

### RLS
Both tables have RLS enabled. Users can only read their own rows via `auth.uid() = auth_user_id`.
Service role client bypasses RLS — use it for all server-side writes.

### Trigger
`handle_new_auth_user` fires on `auth.users` insert — upserts `public.users` by email and sets `auth_user_id`.

---

## API reference

### POST /api/generate

**Anonymous (no session)**

Request:
```json
{ "url": "https://...", "email": "user@example.com" }
```

Responses:
- `200` — notes generated successfully
  ```json
  {
    "notes": [
      {
        "shape": "Hook + curiosity gap",
        "text": "...",
        "char_count": 280,
        "source": "...",
        "notes": null,
        "image_url": "https://..." // or null
      }
    ],
    "post": { "title": "Post title", "url": "https://..." }
  }
  ```
- `400` — missing/invalid URL, or `{ "error": "Email is required.", "needsEmail": true }` if no email
- `402` — free gen already used: `{ "error": "Free generation used.", "email": "user@example.com" }` → show paywall
- `422` — couldn't extract post text (private post, not Substack, etc.)
- `403` — origin not allowed
- `500` — pipeline error

**Authed (session cookie present)**

Same request body — email is ignored, session is used instead.

Responses:
- `200` — same notes shape + usage counter:
  ```json
  {
    "notes": [...],
    "post": { ... },
    "usage": { "used": 3, "limit": 25, "resetsAt": "2026-06-25T..." }
  }
  ```
- `402` — subscription not active
- `429` — 25 gen limit reached: `{ "error": "Generation limit reached.", "resetsAt": "..." }`

---

### POST /api/billing-portal

Session-gated. Redirects (303) to Stripe billing portal.
Only works when user has `current_period_end` set (subscription product). Currently hidden in UI for one-time purchase users.

---

### POST /api/webhooks/stripe

Stripe signature-verified. Handles:
- `checkout.session.completed` → sets `subscription_status = active`, saves `stripe_customer_id`, sets period dates
- `customer.subscription.updated` → syncs status + period dates
- `customer.subscription.deleted` → sets `subscription_status = canceled`

Matches user by `client_reference_id` (= `public.users.id`) first, falls back to `customer_email`.

---

### GET /auth/callback

Exchanges Supabase magic link code for session. Redirects based on `?next=` param.
Allowlist: `/`, `/upgrade`, `/account` only. All other values redirect to `/`.

---

## Auth flow

1. Anonymous user generates → 402 → `PaywallCard` shown
2. PaywallCard: user enters email → `supabase.auth.signInWithOtp` → magic link email sent
3. User clicks link → `/auth/callback?next=/upgrade` → session created → redirect to `/upgrade`
4. `/upgrade` builds Stripe URL: `${NEXT_PUBLIC_STRIPE_PAYMENT_LINK}?client_reference_id=${dbUser.id}&prefilled_email=${user.email}`
5. User pays → Stripe fires `checkout.session.completed` → webhook flips user to `active`
6. Returning paid user: session cookie → authed path in `/api/generate`

**Sign in for returning users:** `/login` → same magic link flow → redirects to `/account`

---

## Environment variables

### Local (`.env.local`)
```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://wbmwlngzvdnitxbrrfoa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_...  (swap to sk_live_... when verified)
STRIPE_WEBHOOK_SECRET=whsec_... (different value for prod vs local)
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/test_...
```

### Vercel (production)
All of the above except `STRIPE_WEBHOOK_SECRET` — that gets its own `whsec_...` from the Stripe production webhook endpoint (Task 18, not yet done).

---

## Pages

| Route | Type | Auth required | What it does |
|-------|------|---------------|--------------|
| `/` | Server | No | Homepage with GenerateForm |
| `/login` | Client | No | Magic link sign-in for returning users |
| `/upgrade` | Server | Yes (redirects to /login) | Stripe checkout page |
| `/account` | Server | Yes (redirects to /login) | Usage, plan, sign out |
| `/auth/callback` | Route Handler | — | Magic link exchange |

---

## Client-side state (localStorage)

| Key | Value | Purpose |
|-----|-------|---------|
| `notes_used` | `"true"` | Tracks if anonymous gen was used. Triggers paywall check on load. |
| `notes_email` | email string | Prefills email in PaywallCard after anon gen. |

**Important:** Paid/authed users bypass the localStorage gate — on mount, `GenerateForm` calls `supabase.auth.getUser()` and skips the paywall if a session exists.

---

## Design tokens (Tailwind + inline styles)

```
Background:     #09090B (page), #0E0E11 (section), #14141A (cards)
Accent:         #FF6719 (primary orange)
Accent light:   #FF9A6C, #FFBA94
Border:         border-white/10 (cards), border-white/15 (inputs)
Text primary:   text-white
Text muted:     text-white/75, text-white/50, text-white/35, text-white/25
Font serif:     var(--font-serif) = Fraunces (headings)
Font sans:      var(--font-sans) = Inter (body)
Orange gradient: linear-gradient(135deg, #FF6719 0%, #e04f0a 100%)
Orange glow:    box-shadow: 0 0 28px rgba(255,103,25,0.45)
Card shadow:    box-shadow: 0 2px 20px rgba(0,0,0,0.4)
```

---

## Known issues / punted work

1. **`stripe_customer_id` is null for current test user.** The test purchase was made as a Stripe "guest" (`gcus_...` prefix). Guest customer IDs cannot be used with the Stripe Billing Portal or the standard `customers.list` API. This will resolve itself for real purchases once Stripe ID verification clears and you switch to live mode with a proper product — live mode typically creates full `cus_...` customers.

2. **"Manage subscription" button is hidden for one-time purchases.** The button in `/account` only renders when `current_period_end` is non-null. One-time payment products don't set this field. When you switch to a subscription model, it will appear automatically.

3. **Stripe webhook production endpoint not yet set up.** Task 18 in the task list — needs a webhook endpoint at `https://notefactory.app/api/webhooks/stripe` subscribing to the three events, with the signing secret added to Vercel as `STRIPE_WEBHOOK_SECRET`.

4. **Vercel Hobby plan `maxDuration = 60` requires Pro.** The generate route sets `export const maxDuration = 60` but Hobby plan caps at 10s. Scrape + generate + image match takes 25-45s, so long posts will time out on production until upgraded to Pro.

---

## What to do when Stripe verification clears

1. Create new Payment Link in Stripe **live mode** → update `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` in Vercel
2. Create webhook endpoint in live mode at `https://notefactory.app/api/webhooks/stripe`, subscribe to `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` → copy `whsec_...` to Vercel as `STRIPE_WEBHOOK_SECRET`
3. Swap `STRIPE_SECRET_KEY` to `sk_live_...` in Vercel
4. Redeploy
5. Smoke test with one real purchase, refund yourself
