# Founder T — Day Plan

**Your time today:** ~5 hours
**Your job in one sentence:** Build the workbench for prompt engineering and ship a prompt v0.1 that produces drafts good enough to critique tomorrow.

---

## Why your work matters

The bottleneck in prompt engineering is **iteration speed**. Every minute saved per iteration compounds across 50+ iterations over two weeks. A 10-second feedback loop beats a 5-minute one, every time.

S is collecting raw material. You're building the machine that turns raw material into a product. By end of Phase 2 we need a prompt that passes a blind test against human Notes. That's two weeks of iteration away — and iteration starts tomorrow, which means today is about getting the workbench solid.

---

## Today's mental model

You're shipping four things, in this order:

1. **The corpus pipeline** (S's table → structured JSON the prompt can use)
2. **The harness** (script: post in → 10 Notes out)
3. **The prompt itself** (voice rules, taxonomy, anti-patterns, few-shot examples)
4. **A baseline + review** (3 generations on real posts, written critique for tomorrow)

Each one feeds the next. The whole stack is the iteration loop — by tomorrow morning, changing the prompt and seeing new output should take under 2 minutes.

---

## Stack decisions (locked, don't relitigate)

- **Runtime:** Node + TypeScript, run with `tsx`. No build step.
- **LLM:** Claude Sonnet 4.6 (`claude-sonnet-4-6`). Keep an OpenAI swap path.
- **Storage:** flat JSON. No database today.
- **UI:** none. CLI output only.
- **Repo:** existing Next.js repo. Add `scripts/`, `data/`, `prompts/`, `outputs/` at root.

---

## Deliverables

### Deliverable 1 — `data/corpus.json`

**What it is:** S's 40-50 tagged Notes, as structured JSON.

**Why it's in today:** This is the input the prompt pulls from at runtime. A few-shot block of 6-10 examples gets sampled from this file every time you generate. Without it, the prompt is generating from instinct.

**How it fits into the system:** S delivers a markdown table → you parse it into JSON → the harness samples from it → the samples get injected into the prompt as few-shot examples → the model imitates them.

**Schema:**
```typescript
type CorpusNote = {
  id: string;
  text: string;
  author: string;
  niche: string;
  engagement: "high" | "medium" | "low";
  linked_to_post: boolean;
  format: string;
  starred: boolean;
};
```

**How to build it:**
- Write `scripts/parse-corpus.ts` — reads S's `notes-corpus.md`, finds the markdown table, parses rows into the schema above, writes `data/corpus.json`.
- Basic markdown table parser is fine: split on `|`, trim, skip the separator row. Don't reach for a library — it's 40 rows.
- Add a small **sampler utility** inside the harness: `sampleFewShot(corpus, { preferStarred, formatMix, count })`. This is high-leverage — it controls which examples the model sees per generation.

**Done when:** running the parser on S's file produces a valid JSON array of 40-50 Notes, and the sampler returns a sensible mix when called.

---

### Deliverable 2 — `scripts/generate-notes.ts`

**What it is:** A CLI script. You give it a post file, it gives you 10 generated Notes.

**Why it's in today:** This *is* the iteration loop. Edit prompt → run script → read output → repeat. Every prompt change you make for the next two weeks goes through this script.

**How it fits into the system:** The harness loads the prompt file (deliverable 3) + samples from the corpus (deliverable 1) + reads the user's post → assembles them into a Claude API call → parses JSON response → prints + saves output (deliverable 4).

**Features it needs:**
- Accept a post via `--file path/to/post.txt` or stdin
- Load `prompts/substack-notes-v0.md` as the base system message
- Sample 6-10 few-shot examples from `corpus.json` and append to the system message
- Call Claude with the assembled system message + post as user message
- Parse JSON response (the prompt forces JSON output)
- Print each Note to console with format label + char count
- **Log token usage and $ cost per generation** — we need this number by end of Phase 2 (target <$0.10/gen)
- Save raw JSON output to `outputs/baseline/post-N-v0.json`

**Done when:** `tsx scripts/generate-notes.ts --file data/source-posts/post-1.txt` runs end-to-end and prints 10 Notes plus a cost line.

---

### Deliverable 3 — `prompts/substack-notes-v0.md`

**What it is:** The actual prompt. A markdown file with role, voice rules, format taxonomy, output format, and anti-patterns. The harness loads it as the system message.

**Why it's in today:** This is the heart of the product. Every Note we generate for the next two months comes from a descendant of this file. Today is v0.1 — rough but real.

**How it fits into the system:** Loaded as static text → few-shot examples appended at runtime → sent as the system message to Claude → shapes every output. Edits to this file are how we iterate on quality.

**Required sections:**
1. **Role + task** — "You write Substack Notes for a writer to promote their newly published post. Produce 10 Notes covering varied formats."
2. **What Notes are** — short, opinionated, conversational, surfaced to non-subscribers, dominant growth lever (pull from the brief glossary)
3. **Voice rules** — conversational not corporate, opinionated not balanced, no hashtags, no emoji-as-decoration, no AI tells ("delve," "navigate the landscape," "it's worth noting")
4. **Format taxonomy** — paste in S's `taxonomy-v0.md`
5. **Output mix** — explicit count per format (e.g., 2 hook, 2 contrarian, 2 story, 1 question, 1 list, 1 one-liner, 1 restack-bait)
6. **Output format** — JSON array: `[{ format, text, char_count }, ...]`, no preamble
7. **Anti-patterns** — split into `prompts/anti-patterns.md` and referenced; covers hashtag/emoji openings, "🚀 Here's why," "game-changer," summarizing instead of provoking

**Note on Claude Skills:** You floated this. Quick take: for today, go with system prompt + few-shot (not a Skill). Skills shine in agentic/multi-tool contexts; we're calling the API directly and want fine control over sampling. But structure this file so it could *become* a `SKILL.md` cleanly later. 45 min max if you want to read the Skills docs and verify; otherwise skip.

**Done when:** the prompt is complete, references real starred examples from S's corpus, and forces JSON output.

---

### Deliverable 4 — `outputs/baseline/` + `prompt-v0-review.md`

**What it is:** Three generations from the harness (one per source post), plus a written review.

**Why it's in today:** Tomorrow is iteration day. You can't iterate without a baseline to compare against. The review doc is the agenda for tomorrow.

**How it fits into the system:** Outputs are saved as JSON for reproducibility. Review doc captures: cost per generation, quality breakdown (good/okay/bad), failure patterns, top 3 changes to try tomorrow. This becomes the input to tomorrow's first iteration.

**How to build it:**
- Have S nominate 3 real Substack posts from writers in our target range with distinct voices
- Save plaintext to `data/source-posts/post-1.txt` etc. (strip HTML, keep paragraphs)
- Run the harness on each, save output
- Read every Note. Tag each ✅ good / 🟡 okay / ❌ bad
- Write the review:
  - Cost: avg tokens/gen, avg $/gen, on track for <$0.10?
  - Quality: X/30 good, X/30 okay, X/30 bad
  - What worked (which patterns produced good Notes)
  - What didn't (common failure modes)
  - Top 3 changes for tomorrow
  - Questions for S

**Done when:** 3 JSON outputs saved + review doc with top 3 changes written.

---

## Hour-by-hour

| Hour | Focus | Output |
|------|-------|--------|
| 1 | Read S's early output, set up repo structure, smoke-test API call with placeholder corpus | Empty harness runs end-to-end |
| 2 | Build parser + sampler, get 3 source posts saved | Ready to receive S's corpus |
| 3 | S delivers corpus → run parser → start drafting prompt | `corpus.json` populated, prompt skeleton |
| 4 | Finish prompt v0.1 (focus: few-shot examples are the highest leverage section) | `substack-notes-v0.md` complete |
| 5 | Run baselines on 3 posts, write review | Outputs saved, review doc written |

---

## Working rules

1. **Iteration speed > polish.** Node script beats unfinished UI.
2. **Don't tune the prompt without examples in front of you.** If S's corpus is late, work on infrastructure.
3. **Track cost from the first generation.** Need <$0.10/gen by end of Phase 2.
4. **Resist building product features.** No auth, no DB, no Stripe today.
5. **JSON output beats prose output.** Always.
6. **Commit often.** Each hour, push. If something breaks at hour 4, roll back.

---

## Done looks like

- ✅ Harness runs end-to-end on a real post
- ✅ `corpus.json` populated from S's table
- ✅ `substack-notes-v0.md` committed with real few-shot examples
- ✅ 3 baseline generations saved
- ✅ Cost per generation logged
- ✅ Review doc has top 3 changes for tomorrow
- ✅ You can run a live generation in the end-of-day review

---

## Tomorrow's preview (so you can plan stopping points)

Tomorrow:
- Apply top 3 changes from today's review
- S expands corpus toward 100 Notes
- Run v0.2 → v0.5 across same 3 posts
- Sketch the blind test framework for next week

Anything you don't finish today, defer. Don't grind past hour 5 — sleep beats marginal tweaks.