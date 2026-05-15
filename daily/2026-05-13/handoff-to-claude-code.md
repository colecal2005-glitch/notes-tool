# Substack Notes Tool — Handoff to Claude Code

## How to use this document

Paste this entire file into Claude Code at the start of the session. It contains:
1. The full project context (what we're building and why)
2. Where I am right now (skill level, environment state)
3. What's already done
4. What we're doing next, in order
5. How I want to be taught

---

## About me

- **Background:** Non-technical co-founder. I have never built frontend before.
- **How I want to work:** Explain everything as we go. Slower is fine — I want to actually understand what's happening, not just copy-paste commands.
- **Pace:** One step at a time. After each step, wait for me to confirm it worked before moving on. If something errors, I'll paste exactly what I see and we'll fix it.
- **OS:** Windows
- **Editor:** VS Code

---

## The project (one-paragraph version)

We're building a web tool that takes a Substack post (URL or pasted text) and generates 8–10 high-quality Substack Notes to promote it. Target customer: Substack writers with 100–10K subscribers who want to grow. Price: $19/month flat. Goal: $100 MRR within 8 weeks (~6 paying customers). I'm the technical co-founder (Founder T); my partner (Founder S) handles sales/marketing.

**Full project brief:** See the file `substack-notes-tool-project-brief.md` in the project root for the complete plan including all four phases, decision gates, and risk analysis. Read that before doing anything else.

---

## Stack (locked — do not suggest alternatives)

- **Frontend + API:** Next.js on Vercel
- **Auth + DB:** Supabase
- **Payments:** Stripe (Payment Links for MVP)
- **LLM:** Claude API (default) or OpenAI — decided in Phase 2
- **Email:** Resend
- **Analytics:** Plausible or PostHog
- **Code hosting:** GitHub
- **Domain:** TBD

---

## Where we are: Phase 1, building the landing page

We are at the very start of **Phase 1** from the project brief. The goal of Phase 1 is to validate demand with a landing page before building any product. Exit criteria: 20+ email signups OR 1 pre-order from a real Substack writer.

**The landing page needs:**
- Hero: "Turn your Substack post into 10 great Notes in 30 seconds"
- Subhead: clear value prop in 1 line
- 1 example: real post → 3 sample Notes (manually created — these will be supplied)
- Email capture form (Resend or simple Supabase table)
- "Get early access — $19/mo" button (links to Stripe Payment Link or waitlist)
- Plausible/PostHog analytics installed
- Email confirmation flow via Resend

That's the entire scope for now. No product, no auth, no payments processing — just a single landing page that captures interest.

---

## Setup progress so far

### ✅ Done

1. **Node.js installed** (LTS version, v20+) — verified with `node --version` and `npm --version`
2. **Git installed** — verified with `git --version`
3. **Git configured** with my name and email via `git config --global user.name` and `git config --global user.email`
4. **GitHub account created** using the same email as Git config
5. **GitHub CLI (`gh`) installed**
6. **Authenticated to GitHub** via `gh auth login` (HTTPS, web browser flow)

### ⏭️ Next up (in order)

7. **Create the Next.js project** locally
   - Run `npx create-next-app@latest` with sensible defaults
   - Decide on project name (probably matches the eventual domain)
   - Confirm what flags to pick: TypeScript yes/no, Tailwind yes/no, App Router yes/no, etc. — explain trade-offs before I pick
   - Run `npm run dev` and confirm the default Next.js page loads in my browser at `localhost:3000`

8. **Push the project to GitHub**
   - Create a GitHub repo with `gh repo create`
   - Make my first commit and push it
   - This is also a good moment to teach me the basic Git workflow: stage → commit → push

9. **Deploy to Vercel**
   - Create Vercel account (free tier, sign in with GitHub)
   - Connect the GitHub repo
   - Get a live `*.vercel.app` URL working
   - Every future push to GitHub `main` branch will auto-deploy

10. **Pick a domain name**
    - Brainstorm short, memorable, .com names
    - Buy via Cloudflare or Namecheap
    - Connect to Vercel
    - This can happen in parallel with the next steps — don't block on it

11. **Build the actual landing page**
    - Replace the default Next.js boilerplate
    - Hero + subhead
    - Example section (post → 3 Notes)
    - Email capture form
    - CTA button
    - Mobile responsive
    - This is where I'll learn the most — explain JSX, components, props, styling as we go

12. **Set up Resend for email capture**
    - Sign up
    - Get API key
    - Add to Vercel as environment variable
    - Wire up the email form to send a confirmation email when someone signs up
    - Store the email somewhere (Supabase table, or just Resend's contact list for MVP)

13. **Set up Stripe Payment Link**
    - Create Stripe account
    - Create a $19/mo recurring product
    - Generate a Payment Link
    - Wire the "Get early access" button to that link

14. **Install Plausible or PostHog analytics**
    - Pick one (briefly compare them)
    - Add tracking script
    - Confirm pageviews are being recorded

15. **Final polish + verify everything works end-to-end**
    - Visit live site
    - Submit email → confirm email arrives
    - Click CTA → land on Stripe checkout
    - Check analytics shows the visit

After step 15, Phase 1 is technically built. Then it's on Founder S to drive traffic and we watch the signup numbers against the decision gate (20+ signups or 1 pre-order).

---

## How I want to be taught

- **Explain concepts before commands.** Tell me *why* I'm running a command, not just what to type. E.g., "we need to install React because Next.js is built on it" before `npm install react`.
- **One step at a time.** Don't dump 5 commands in a row. Run one, confirm it worked, move on.
- **Demystify jargon.** Words like "framework," "boilerplate," "environment variable," "deploy," "build" — when you use them, briefly define them the first time.
- **Show me what success looks like.** After each step, tell me what I should see if it worked. (E.g., "you should see a page that says 'Welcome to Next.js' at localhost:3000.")
- **When I hit errors,** I'll paste the exact message and we'll diagnose together.
- **Don't over-explain things I already know.** I now understand: what Node/npm/Git/GitHub/GitHub CLI are, how the local-laptop → GitHub → Vercel deploy flow works conceptually, and basic terminal usage in VS Code.

---

## Things to remember from the brief

These are the rules I want you to enforce even when I forget:

1. **No feature gets built unless 2+ users asked for it.** My instinct will be to add features. Push back.
2. **Cut scope, not quality.** When stuck, remove a feature — never compromise on Note quality (that comes in Phase 2).
3. **The MVP is: form → API call → results → copy button.** That's it. No scheduling, no auto-posting, no analytics dashboards, no team features, no templates library.
4. **Talk to users every week.** This is a non-negotiable from the brief.
5. **$0.10 / generation max API cost** — track this in Phase 2.

---

## First message to send Claude Code

> "Read this handoff doc and the project brief. I just finished setting up Node, Git, GitHub, and GitHub CLI. I'm ready for step 7: creating the Next.js project. Walk me through it one step at a time, explaining as you go."
