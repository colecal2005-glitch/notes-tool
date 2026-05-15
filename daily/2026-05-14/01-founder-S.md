# Founder S — Day Plan

**Your time today:** ~5 hours
**Your job in one sentence:** Be the ethnographer. Figure out where our customers live, what they complain about, and collect 40-50 real Notes that show us what good looks like.

---

## Why your work matters

T is writing a prompt today that tells the AI how to write Substack Notes. **That prompt is only as good as the examples it learns from.** T can collect Notes themselves, but T doesn't have your instinct for what a Substack writer would actually be jealous of. The Notes you pick today are literally the Notes the AI will imitate for the next two months.

Audience research matters because in Phase 4 we launch into communities and reach writers directly. If we don't know where they hang out, we have nowhere to launch.

**Simple version:** If you do your job well, T's prompt has a fighting chance. If you don't, T is guessing.

---

## Your four deliverables

You're producing four files in the shared folder. Names exactly as shown — T's scripts look for these.

### 1. `audience-map.md`

**What it is:** A ranked list of 5-7 places (subreddits, Notes feed, Indie Hackers, etc.) where target writers cluster.

**How it fits today:** Doesn't feed the prompt directly — it feeds the Phase 4 launch plan. But spotting where writers hang out also helps you find the best Notes and the best pain quotes, so this comes first.

**Time:** ~1 hour

---

### 2. `pain-points.md`

**What it is:** 20+ verbatim quotes from real writers complaining about Notes / promotion / growth, clustered into 5 themes.

**How it fits today:** The top theme becomes the *framing* of T's prompt ("you're helping a writer who struggles with X"). Real writer language also gets reused in landing page copy later.

**Time:** ~1 hour

---

### 3. `notes-corpus.md`

**What it is:** A table of 40-50 high-performing Substack Notes, tagged with author, niche, engagement level, format guess, and a star for the ones you'd be jealous to have written.

**How it fits today:** This is **the** input to T's prompt. T converts this table into JSON (`corpus.json`) and the prompt pulls 6-10 examples from it at runtime to teach the AI what good Notes look like. **Starred ones get weighted heavier.** Without this file, T is generating from instinct, not data.

**Time:** ~2 hours

---

### 4. `taxonomy-v0.md`

**What it is:** 6-8 format categories (hook, contrarian, story, question, list, one-liner, etc.) with definitions and examples pulled from the corpus.

**How it fits today:** T's prompt instructs the AI to produce a *mix* of formats per generation (e.g., 2 hooks, 2 contrarian, 1 question, etc.). Your taxonomy is the menu the AI picks from. No taxonomy = AI defaults to whatever format it feels like, and outputs feel samey.

**Time:** ~1 hour

---

## File format rules (read before you start)

Use plain markdown. That means:
- `#` big heading, `##` sub-heading
- `-` bullets
- `**bold**`, `*italic*`
- `> quote text` for direct quotes
- `[link text](url)` for links

**Rules that make T's life easier:**

- ✅ **Quote verbatim.** Copy-paste exact words. Don't paraphrase, don't fix typos.
- ✅ **Always include the source link** with quotes and Notes.
- ✅ **Use the table template** for the corpus (below).
- ✅ **Star great Notes with ⭐.** These get weighted heavier in the prompt.
- ❌ **No screenshots.** Text only. T can't feed images into the prompt.
- ❌ **No commentary inside the corpus table.** Keep opinions in a separate notes section.

---

## Hour-by-hour

### Hour 1 — `audience-map.md`

Open the file. Go through these surfaces and answer for each: *Is our target customer (100-10K subscribers) here? What do they talk about?*

- r/Substack (sort by Top, past month + past year)
- r/Newsletters, r/SubstackWriters (if active)
- Substack Notes feed — search "Substack growth," "Notes strategy," "subscribers"
- Indie Hackers — search "Substack," "newsletter"
- X/Twitter — search "Substack Notes"
- LinkedIn — creator/newsletter communities
- Discord/Slack — Foster, Write of Passage alumni, Newsletter Operator, etc.
- Substack pubs about Substack — On Substack, Substack Writer Unboxed, Bestseller, The Letter

For each, capture: rough size, vibe, whether the target is there, 1-2 example links, 1-sentence "what people talk about here." Rank top 5 at the end.

---

### Hour 2 — `pain-points.md`

Read across the surfaces from hour 1. Capture **20+ verbatim quotes** about:
- Writing Notes (hard, time-cost, cringe, don't know what works)
- Promoting posts (no one sees, Notes feels like shouting into void)
- Growing subscribers (algo opacity, restack envy, plateau frustration)
- Tools they've tried and hated

Format each one:

```markdown
> "I spend more time writing Notes than the actual post and they still flop."

— u/writername, r/Substack, [link](url)
**Category:** Notes are hard / time-cost
```

Then cluster into 5 themes at the top of the file, with quote counts per theme:

```markdown
## Top 5 Pain Points

1. **Notes feel cringe / off-voice** (8 quotes)
2. **Time cost is brutal** (6 quotes)
3. ...
```

---

### Hours 3-4 — `notes-corpus.md`

The most important block of your day.

**Selection criteria:**
- Visible engagement — lots of likes/restacks/replies (eyeball it)
- Author looks like target — ~500-10K subscribers
- Spread across niches: writing, finance, lifestyle, tech, health, culture, fiction, parenting
- Mix of formats — don't grab 40 of the same kind

**Use this table — copy it into the file and add rows:**

```markdown
| # | Note text | Author + pub | Niche | Engagement | Linked to post? | Format guess | ⭐ |
|---|-----------|--------------|-------|------------|-----------------|--------------|----|
| 1 | "I quit my job to write Substack full time. Three months in, here's what I got wrong..." | Jane Doe / Word Garden | Writing | High | Yes | Story + hook | ⭐ |
| 2 | "Hot take: nobody actually reads long essays on Substack. They scan." | John Smith / The Memo | Writing | Medium | No | Contrarian | |
```

**Column guide:**
- **Note text:** verbatim, including line breaks (use `<br>` inside the cell if needed)
- **Engagement:** High / Medium / Low — eyeball is fine
- **Linked to post?** Yes/No. **Notes that link to a post are gold for our use case.** Tag them.
- **Format guess:** rough — hook, contrarian, story, one-liner, question, list, restack-bait, behind-scenes
- **⭐:** star anything you read and thought "damn, I wish I wrote that"

**Targets:** 40-50 Notes, 8-10 starred. Stop at 50.

---

### Hour 5 — `taxonomy-v0.md`

Look at your 40-50 Notes. What patterns repeat? Draft 6-8 categories. For each:

```markdown
## Hook + Curiosity Gap

**Definition:** Teases the post's main idea, leaves you wanting to click. Setup without payoff.

**Typical length:** 100-250 characters

**Examples from corpus:**
- Note #1 (Jane Doe): "I quit my job to write Substack full time..."
- Note #7: "..."
- Note #12: "..."

**Works because:** Specific number, concrete setup, implied story.

**Flops when:** Vague tease ("I learned a lot"), no specificity, clickbait-y.
```

Then drop everything in the shared folder, ping T, show up for the end-of-day review.

---

## Rules to keep in your head

1. **Verbatim is sacred.** Copy-paste, never paraphrase.
2. **Engagement beats taste.** Pick what the market rewards.
3. **Notes that link to a post are highest-value.** That's our use case.
4. **Don't write the prompt yourself.** Raw material + taxonomy is the contribution.
5. **If hour 4 ends and you have 35 Notes, stop and write the taxonomy.** T needs taxonomy more than 10 extra Notes.

---

## Done looks like

- ✅ `audience-map.md` — 5-7 ranked surfaces
- ✅ `pain-points.md` — 20+ verbatim quotes, 5 themes
- ✅ `notes-corpus.md` — 40-50 tagged Notes, 8-10 starred
- ✅ `taxonomy-v0.md` — 6-8 categories
- ✅ All files in shared folder, T pinged
- ✅ You picked a Substack post for T to run the prompt on at end-of-day review