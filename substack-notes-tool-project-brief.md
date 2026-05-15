# Substack Post → Notes Tool — Project Brief

## What we're building

A web tool that takes a Substack post (URL or pasted text) and generates 8-10 high-quality Substack Notes to promote it. The user reviews the drafts, copies the ones they like, and posts manually on Substack.

**Why this exists:** Substack writers spend hours on essays, then either skip Notes (post dies) or write bad Notes (post dies). Notes is now Substack's primary discovery engine — good Notes = new subscribers. Most writers are bad at the format because it requires a completely different voice from their longform writing.

**Target customer:** Substack writers with 100–10,000 subscribers who post weekly-ish and want to grow. Power users of Notes who already understand it but hate the time cost of writing them.

**Price:** $19/month flat, unlimited generations (initially).

**Goal:** $100 MRR within 8 weeks of starting the build (~6 paying customers).

---

## Founder setup

- **Founder T:** technical, owns product/build/infra
- **Founder S:** sales/marketing, owns research, outreach, copy, distribution
- **Hours:** ~20-30/week each (heavy side project)

---

## Stack (locked, no debate)

- **Frontend + API:** Next.js on Vercel
- **Auth + DB:** Supabase
- **Payments:** Stripe (Payment Links for MVP, full checkout later if needed)
- **LLM:** Claude API (default) or OpenAI
- **Email:** Resend
- **Analytics:** Plausible or PostHog (free tier)
- **Domain:** TBD — ideally something memorable, .com if possible

Total infra cost at MVP scale: ~$20/month.

---

## What we are NOT building (MVP scope discipline)

- ❌ Auto-posting to Substack Notes
- ❌ Scheduling
- ❌ Notes performance analytics
- ❌ Direct Substack account integration
- ❌ Team / multi-user features
- ❌ Templates library
- ❌ Mobile app
- ❌ Complicated onboarding flow
- ❌ Heavy landing page (one page, one CTA)

The MVP is: form → API call → results displayed → copy button. That's the whole product.

---

# PHASE 1 — Landing Page & Validation (Weeks 1–2)

**Goal:** Confirm there is real demand before building anything beyond a landing page. Exit criteria: 20+ email signups OR 1 pre-order from a real Substack writer.

## Founder T tasks
- [ ] Buy domain
- [ ] Set up Vercel + Next.js project, push hello-world to production
- [ ] Build single-page landing site:
  - Hero: "Turn your Substack post into 10 great Notes in 30 seconds"
  - Subhead: clear value prop in 1 line
  - 1 example: real post → 3 sample Notes (manually created)
  - Email capture form (Resend or simple Supabase table)
  - "Get early access — $19/mo" button (links to Stripe Payment Link or waitlist)
- [ ] Set up Stripe account + Payment Link for $19/mo (test mode is fine for now)
- [ ] Set up Plausible/PostHog on the landing page
- [ ] Set up basic email capture → confirmation email via Resend

## Founder S tasks
- [ ] Start a Substack TODAY (about the journey of building this, or any topic you'll stick with for 8 weeks). Post 3 essays in week 1.
- [ ] Post Notes daily — minimum 1, target 3. Get a feel for what works.
- [ ] Build a list of 50 Substack writers in the target range (100-10K subs) — name, Substack URL, topic, follower count, ideal customer y/n
- [ ] Lurk r/Substack, Substack Notes feed, Indie Hackers — capture exact complaints writers have about Notes / promotion / growth in a doc
- [ ] DM 20 Substack writers personally — NOT a pitch. Script:
  > "Hey [name], love [specific post]. Quick question — when you publish a new post, how do you handle Notes? Do you write them all yourself? I'm researching this and would love your take. Just 2-3 sentences if you have time."
- [ ] From responses, identify the 3-5 most common pain points. Use real quotes in landing page copy.
- [ ] Once landing page is live: post in r/Substack, share on Notes, share with the 20 DM contacts. Goal: 20 signups.

## Phase 1 decision gate

**End of week 2 check:**
- 20+ signups AND clear pain pattern → continue to Phase 2
- 5-20 signups → keep iterating copy and outreach for another week
- <5 signups despite real outreach effort → STOP. Either (a) writers don't see this as a real pain, (b) we can't reach them at scale, or (c) messaging is wrong. Diagnose before building.

## Phase 1 outputs to bring to Phase 2
- Validated landing page copy
- Signup list (20+ emails)
- Doc of exact writer quotes / complaints
- List of 5-10 writers willing to be beta testers
- Stripe + Vercel + domain all live

---

# PHASE 2 — Notes Research & Prompt Engineering (Weeks 3–4)

**Goal:** Build a prompt that produces Notes indistinguishable from real high-performing human Notes. This is the actual product — code is commodity, prompt quality is the moat.

## Founder S tasks (lead this phase)
- [ ] Collect 100 high-performing Notes from Substack. Criteria:
  - Lots of likes / restacks / replies
  - Across multiple niches (writing, finance, marketing, lifestyle, etc.)
  - Written by writers with 500+ subscribers (not viral randos)
- [ ] Categorize each Note by format. Suggested taxonomy:
  - **Hook + curiosity gap** — teases the post, leaves you wanting more
  - **Bold contrarian take** — argues against conventional wisdom
  - **Personal story / vulnerability** — pulled from the post
  - **One-liner / quotable** — extracted key insight
  - **Question to readers** — invites replies
  - **Mini-list** (3-5 items)
  - **Restack-bait** — broadly relatable, designed to be reshared by other writers
  - **Behind-the-scenes** — process/meta about writing
- [ ] For each of 5-10 source posts, manually write 8-10 Notes covering the formats above. This is your gold standard reference set.
- [ ] Document the "voice rules" of Notes:
  - Length (typical character count by format)
  - Tone (conversational, not corporate; opinionated, not balanced)
  - Hook patterns
  - What makes a Note flop (too long, too AI-sounding, too generic, no specific opinion)

## Founder T tasks
- [ ] Build a prompt-testing harness:
  - Simple UI where you paste a post + click generate
  - Outputs 10 Notes
  - Side-by-side compare with the "gold standard" Notes Founder S wrote
- [ ] Iterate on the prompt with Founder S. The prompt should include:
  - System message explaining what Notes are and the voice
  - 5-10 few-shot examples (post → Notes) using Founder S's gold standard set
  - Explicit format instructions per Note type
  - Anti-patterns to avoid (no hashtags, no emojis-as-decoration, no "🚀 Here's why...")
- [ ] Run blind tests: generate 10 Notes from a real post, mix with 10 human Notes, have 3-5 Substack writers (beta list) guess which is which. Iterate until <60% accuracy (i.e. they can't reliably tell).
- [ ] Decide on Claude vs GPT based on output quality + cost. Track API cost per generation — aim for under $0.10/generation to keep margin healthy.

## Phase 2 decision gate

**End of week 4:**
- Output passes the blind test with 3+ beta writers → ship Phase 3
- Output is "okay but not great" → another week on prompt before building
- Output is bad → reconsider whether this is solvable with prompting alone, or whether we need fine-tuning / different approach

## Phase 2 outputs
- Production-ready prompt
- 100-Note reference library
- Voice/format guide document
- API cost per generation locked in
- 3-5 beta writers ready to try v1

---

# PHASE 3 — Final Build (Weeks 5–6)

**Goal:** Working paid product. Real users can sign up, pay, generate Notes, and get value.

## Founder T tasks
- [ ] Auth flow (magic link via Supabase, no password)
- [ ] Single-page app:
  - Textarea for pasted post OR URL field (if URL, scrape the post content — use a basic fetcher, handle Substack's HTML)
  - "Generate Notes" button
  - Loading state (~10-15 sec is fine)
  - Results: 8-10 Notes shown as cards
  - "Copy" button per Note
  - "Regenerate" button (with cost protection — limit to 3x per post)
- [ ] Usage tracking in Supabase (per user, per month)
- [ ] Stripe integration:
  - $19/mo subscription via Stripe Checkout
  - Webhook to mark user as paid in Supabase
  - Gate generation past 1 free generation (let them try once free, then paywall)
- [ ] Basic account page (subscription status, cancel link to Stripe portal)
- [ ] Error handling (LLM fails, scrape fails, payment fails)
- [ ] Mobile-responsive (most writers are on desktop but check it works)

## Founder S tasks
- [ ] Onboard the 3-5 beta writers personally. Get them on a 20-min call:
  - Watch them use it
  - Note every friction point
  - Ask: "What would make you pay for this tomorrow?"
- [ ] Update landing page with real testimonials/quotes from beta users
- [ ] Build a 1-minute Loom demo for the landing page
- [ ] Continue posting on Substack Notes — now using the tool itself. This is the marketing flywheel: every Note you post is a live demo.
- [ ] Identify the top 2 friction points from beta users → tell Founder T → fix before launch

## Phase 3 decision gate

**End of week 6:**
- 1+ paying customer (could be a beta user converting) → on track, launch in Phase 4
- 0 paying customers but strong beta engagement → tighten pricing/positioning, launch anyway
- 0 paying customers AND beta users not using it weekly → serious problem, diagnose retention before launch

## Phase 3 outputs
- Live, paid product at the domain
- 1+ paying customer
- 2-3 testimonials on the landing page
- Loom demo
- Top friction points fixed

---

# PHASE 4 — Launch & Distribution (Weeks 7–8)

**Goal:** Get to $100 MRR. ~6 customers at $19/mo, or 4 at $29 if we raise price.

## Founder S tasks (lead this phase)
- [ ] **Substack Notes campaign (primary channel):**
  - Post 3-5 Notes per day, all generated by the tool, from a Substack account that's been growing for 6+ weeks
  - Every Note implicitly demos the product
  - In bio: "I use [tool name] to write these Notes. Try it free → [link]"
  - Reply to other writers' Notes about growth, promotion, Notes strategy — be useful, not spammy
- [ ] **Direct outreach (secondary channel):**
  - DM 10 writers/day from the target list
  - Personal, not template-y
  - Offer: "Want to try it free for a month? I built this for writers like you, would love your feedback."
  - Convert at ~5-10% = 1-2 customers per 20 DMs
- [ ] **Content piece:**
  - Founder S writes a Substack essay: "I analyzed 100 top-performing Substack Notes — here's the pattern" or similar
  - Genuinely useful, gives away most of the insight
  - Soft mention of the tool at the end
  - Cross-post on r/Substack, LinkedIn, X
- [ ] **Light Product Hunt / Indie Hackers post** (don't make this your hero strategy — it's secondary)
- [ ] **Partnership try:** DM 3-5 newsletter-about-newsletters writers, offer them free lifetime access in exchange for an honest review/mention

## Founder T tasks
- [ ] Build the ONE feature every beta user asked for. Just one.
- [ ] Monitor usage daily — who's using it, who isn't, why
- [ ] Email every paid user personally on day 3 and day 14 of their subscription. Just "How's it going? Anything I can help with?"
- [ ] Set up a Loom-recorded "how to use it" video, link in onboarding email
- [ ] Decide on price test: should we raise to $29 for new signups in week 8? Run the math.

## Phase 4 decision gate

**End of week 8:**
- **$100 MRR hit** → plan next 2 months for $500 MRR (different conversation, requires Phase 5 brief)
- **$50-99 MRR, trending up** → extend 2 weeks, you have signal
- **<$50 MRR despite real distribution effort** → diagnose:
  - Niche too narrow? (probably not — Substack is large)
  - Pricing wrong? (try $9/mo with annual option)
  - Product not actually solving the pain? (talk to non-converters)
  - Distribution channel wrong? (Notes not working, try direct DM more)

---

## Cross-phase principles

1. **Talk to users every week.** Every founder, every week, at least one real conversation with a writer (paying or not).
2. **No feature gets built unless 2+ users asked for it.** Founder T's instinct will be to add features. Resist.
3. **Cut scope, not quality.** When stuck, remove a feature, never compromise on the one thing that matters (the Note quality).
4. **Marketing co-founder = primary user.** Founder S should be the heaviest user of the product. If Founder S doesn't use it daily, no one will.
5. **Iterate the prompt forever.** Even at $100 MRR, the prompt is still the product. Set up a weekly review of Note quality.

---

## Key risks & mitigations

| Risk | Mitigation |
|---|---|
| Note quality not differentiated from ChatGPT | Phase 2 blind test discipline — don't ship until it passes |
| Substack changes Notes or blocks scrapers | Have a manual-paste fallback always available (URL is optional) |
| Writers churn after 1 month ("I got my Notes voice, don't need it") | Track this from customer #1. Solutions: usage-based pricing, archive feature (always re-promote old posts) |
| Founder S can't grow a Substack from scratch in 6 weeks | Start week 1. Worst case, find a writer with an existing audience to partner with |
| LLM costs eat margin | Track $/generation in Phase 2. Set hard limits per user per month if needed |
| We build a feature ChatGPT users will just prompt themselves | The wedge is (a) Notes-specific prompt quality + (b) speed + (c) format variations. None of this is impossible for a determined user with ChatGPT — but most writers don't want to engineer prompts. Lean into "we did the work so you don't have to." |

---

## Definitions / glossary (for the technical co-founder if needed)

- **Substack:** A platform where writers publish newsletters (emails) to subscribers. Free to start, takes 10% of paid subscription revenue.
- **Notes:** Substack's built-in social feed, launched 2023. Short posts (think Twitter/X), surfaced by an algorithm to non-subscribers. Now the dominant growth lever on Substack.
- **Restack:** When another writer reshares your Note. Major distribution multiplier — getting restacked by a bigger writer can bring 100+ new subscribers.
- **Subscriber:** Someone who signed up for a newsletter via email. "Free subscribers" get free posts, "paid subscribers" pay (usually $5-10/mo) for premium content.
- **Why subscribers matter as a target:** writers with 100-10K subs are in the "trying to grow" zone — high pain, willing to pay for tools. <100 they don't take it seriously yet, >10K they often have VAs doing this work for them.
