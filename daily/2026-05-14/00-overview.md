# Day Plan — Market Research & Prompt Engineering Foundation

**Date:** Day 1 of Phase 2
**Owners:** Founder T (technical) + Founder S (sales/marketing)
**Time budget:** ~5 hours each

---

## The day in one sentence

S goes wide on the audience (where they live, what they complain about, what Notes they reward); T goes deep on the system (a corpus store, a first prompt, and the loop to iterate on it).

---

## Why today matters

We're at the start of Phase 2. The brief is explicit: **"code is commodity, prompt quality is the moat."** By end of Phase 2 our prompt needs to pass a blind test against human-written Notes. Today is where that work starts.

Two halves to get right:
1. **Raw material** — real Notes that real writers reward. *S's job.*
2. **Iteration loop** — a fast way to test prompt changes against real posts. *T's job.*

If either half is weak, the prompt will be weak.

---

## How the work splits

| | Founder S | Founder T |
|---|---|---|
| **Role** | Ethnographer + curator | Engineer + prompt drafter |
| **Mindset** | "What do real writers actually do and complain about?" | "How fast can I iterate on a prompt?" |
| **Don't do** | Write the prompt yourself | Build product features (auth, payments, UI) |

S's work feeds directly into T's prompt. T cannot ship a v0.1 worth reviewing without S's corpus. Plan the handoff accordingly.

---

## Today's deliverables (one shared folder)

| # | File | Owner | Why it matters |
|---|------|-------|----------------|
| 1 | `audience-map.md` | S | Tells us where to launch in Phase 4 |
| 2 | `pain-points.md` | S | Real writer language → prompt framing + landing page copy |
| 3 | `notes-corpus.md` | S | The raw material the AI will learn to imitate |
| 4 | `taxonomy-v0.md` | S (T weighs in) | Defines the format categories the prompt must produce |
| 5 | `corpus.json` | T (from S's file) | Structured version of #3, used by the prompt at runtime |
| 6 | `prompts/substack-notes-v0.md` | T | The actual prompt — voice rules, taxonomy, anti-patterns |
| 7 | `outputs/baseline/` | T | 3 baseline generations on real posts to critique tomorrow |
| 8 | `prompt-v0-review.md` | T (with S) | What worked, what didn't, top 3 changes for tomorrow |

---

## Sync points (do not skip)

**Morning kickoff — 15 min.** Both review this plan. Confirm shared folder, file names, who's where.

**Mid-day handoff — 30 min (~hour 3).** S sends T: audience map (rough), pain points (rough), first ~20 Notes. T can start the prompt with this while S keeps collecting.

**End-of-day review — 30 min.**
1. S presents audience map + top 5 pain points (10 min)
2. T runs prompt v0.1 live on a post S picks (10 min)
3. Both: where is this generic vs. good? What's the biggest gap? (10 min)

End with the top 3 prompt changes for tomorrow agreed.

---

## Working rules

1. **Verbatim is sacred.** S doesn't paraphrase writer language. T doesn't paraphrase corpus Notes.
2. **Speed over polish.** Workbench day, not launch day.
3. **Engagement beats taste.** Pick Notes the market rewards, not Notes we personally like.
4. **One shared folder, predictable filenames.** No "final_v2_actually_final.md."
5. **No product features today.** No auth, no Supabase, no Stripe, no landing polish.

---

## What we are NOT doing today

- Landing page copy (Phase 1, already in motion)
- Supabase, Stripe, or auth (Phase 3)
- UI design (Phase 3)
- Domain name
- Blind tests with beta users (end of Phase 2)
- Making the prompt perfect (it's v0.1 — perfection is two weeks out)

---

## What success looks like tonight

We can say:
- We know the 5 places our customers actually hang out.
- We have 40-50 real Notes that show us what good looks like.
- We have a prompt that generates 10 Notes from a real post in under 15 seconds.
- We know what's wrong with the prompt and what to try tomorrow.

If any of those four are missing, today didn't land.

---

## Risks to watch

- **S gets lost in scrolling.** Hard cap on corpus collection at hour 4; move to taxonomy.
- **T over-engineers the harness.** Node script, not UI.
- **T starts the prompt before S delivers the corpus.** Use hour 3 for infrastructure if corpus is late.
- **Either founder works in isolation all day.** The hour-3 handoff is non-negotiable.
