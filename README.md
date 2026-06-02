# TLDR Daily Digest

A self-updating news digest that turns the daily [TLDR](https://tldr.tech) newsletters into a clean, archived web reader. Every morning a scheduled job summarizes that day's newsletters into Korean, commits the result to this repo, and the live site rebuilds itself — no manual editing.

> **Tech stack:** Next.js 14 (App Router) · React 18 · TypeScript · Vercel · file-based content (JSON)

---

## Why I built it

I read several TLDR editions every day and wanted one place that (a) summarizes them in Korean, (b) keeps a browsable archive, and (c) maintains itself. The interesting part isn't the UI — it's the **content pipeline**: a scheduled agent produces structured data, version control is the storage layer, and a Git push is the deploy trigger. The result is a "database-less" site where the repository *is* the CMS.

## How it works

```
┌──────────────┐   summarize    ┌──────────────────┐   git push    ┌──────────────┐   auto-build   ┌──────────────┐
│ TLDR emails  │ ─────────────▶ │  scheduled job   │ ────────────▶ │   GitHub     │ ─────────────▶ │    Vercel    │
│  (8 editions)│   → Korean     │ writes data/<day>│               │  (this repo) │   on push      │  live site   │
└──────────────┘                └──────────────────┘               └──────────────┘                └──────────────┘
```

1. **Ingest & summarize** — a daily scheduled agent reads the morning's TLDR editions and writes a new `data/YYYY-MM-DD/` folder of JSON (one file per edition, each article with a structured analysis report).
2. **Store via Git** — the new day is committed and pushed. Git history doubles as the archive's audit trail.
3. **Deploy on push** — Vercel watches the repo and rebuilds automatically on every push, so a new digest appears without any manual deploy step.

The site is statically generated from the JSON at build time and gated behind HTTP Basic Auth so it stays private.

## Architecture & structure

```
app/
  page.tsx              # home — date archive (newest first)
  [date]/page.tsx       # one day's digest: big story + per-category summaries
  [date]/[id]/page.tsx  # single article — full analysis report
lib/digest.ts           # typed loader over the data/ folders
middleware.ts           # HTTP Basic Auth password gate (SITE_USER / SITE_PASS)
data/
  2026-06-02/
    index.json          # day meta + bigStoryId + ordered edition list
    ai.json infosec.json crypto.json tech.json it.json design.json marketing.json dev.json
```

**Data model.** Each edition file holds an array of articles. Every article carries a short `summary` plus a structured `report`:

```ts
type Report = {
  tldr: string;       // one-line takeaway
  what?: string;      // what happened
  points?: string[];  // key points
  why?: string[];     // why it matters
  context?: string;   // background
  action?: string;    // so what / next step
};
```

`lib/digest.ts` discovers days by scanning `data/` for folders containing an `index.json`, so **adding a day is purely additive** — drop in a folder, no code changes.

## Run locally

```bash
npm install
cp .env.example .env.local   # set your own SITE_USER / SITE_PASS
npm run dev                  # http://localhost:3000
```

## Project status

The reader and the data pipeline are working end to end. To make the loop fully hands-off, three one-time connections remain:

- [ ] **Vercel ↔ GitHub** — import this repo into Vercel once; afterwards every push auto-deploys.
- [ ] **Push credentials for the scheduled job** — the job currently *generates* the day's data but needs a cloned repo path (`REPO_PATH`) and Git auth (PAT/SSH) in its runtime to push automatically. Until then, new data is committed manually.
- [ ] **Always-on host** — the scheduler runs while the host app is open; on a powered-off machine the run is deferred to the next launch.
