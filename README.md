# TLDR Daily Digest

A private personal website that summarizes the TLDR newsletters in Korean so you can scan the day's tech news at a glance. Built with Next.js, deployed on Vercel, and protected by a password (HTTP Basic Auth).

- **Home (`/`)** — a date-based archive of every digest, newest first.
- **Date page (`/2026-06-02`)** — the day's big story plus per-category article summaries and deep-dive analysis.
- **Article page (`/2026-06-02/<id>`)** — the full analysis report for a single article.

Each day is one folder under `data/`, so adding a new day is just dropping in a new folder of JSON — no code changes required.

---

## Project structure

```
app/
  page.tsx              # home: date archive
  [date]/page.tsx       # one day's digest
  [date]/[id]/page.tsx  # single article report
lib/digest.ts           # loads & types the data folders
middleware.ts           # Basic Auth password gate
data/
  2026-06-02/
    index.json          # date meta + bigStoryId + edition list (file order)
    ai.json infosec.json crypto.json tech.json it.json design.json marketing.json dev.json
```

Each edition file holds an array of articles; every article carries a summary and a structured analysis `report` (`what`, `points`, `why`, `context`, `action`).

## Run locally

```bash
npm install
cp .env.example .env.local   # set your own SITE_USER / SITE_PASS
npm run dev                  # http://localhost:3000
```

## Adding a new day

1. Create `data/YYYY-MM-DD/` with an `index.json` and one JSON file per edition.
2. Commit and push — Vercel redeploys automatically.

A scheduled job can summarize the day's TLDR newsletters, write the new `data/YYYY-MM-DD/` folder, and commit/push automatically (requires git credentials in the job environment, e.g. a Personal Access Token).
