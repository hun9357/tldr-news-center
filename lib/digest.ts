import fs from "fs";
import path from "path";

export type Report = {
  tldr: string;
  what?: string;
  points?: string[];
  why?: string[];
  context?: string;
  action?: string;
};
export type Intel = {
  impact?: string;
  confidence?: string;
  owner?: string;
  status?: string;
  affectedSurface?: string;
};
export type Signal = {
  kind: "primary" | "market" | "watchlist";
  title: string;
  body: string;
  severity?: string;
  velocity?: string;
  action?: string;
};
export type Market = { index: string; value: string; change: string };
export type DayStats = {
  companies?: number;
  security?: number;
  deals?: number;
  policy?: number;
};
export type Item = {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  originalDate?: string;
  intel?: Intel;
  related?: string[];
  report: Report;
};
export type Edition = {
  slug: string;
  name: string;
  source: string;
  icon: string;
  color: string;
  bg: string;
  items: Item[];
};
export type IndexMeta = {
  date: string;
  weekday: string;
  headline: string;
  subtitle: string;
  keyword: string;
  bigStoryId: string;
  editions: string[];
  lastUpdated?: string;
  syncedAt?: string;
  subscribers?: number;
  market?: Market;
  stats?: DayStats;
  signals?: Signal[];
};
export type Digest = Omit<IndexMeta, "editions"> & { editions: Edition[] };

const DATA_DIR = path.join(process.cwd(), "data");

export function getAllDates(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(DATA_DIR, d.name, "index.json")))
    .map((d) => d.name)
    .sort((a, b) => b.localeCompare(a));
}

export function getDigest(date: string): Digest | null {
  const dir = path.join(DATA_DIR, date);
  const indexFile = path.join(dir, "index.json");
  if (!fs.existsSync(indexFile)) return null;
  const meta = JSON.parse(fs.readFileSync(indexFile, "utf-8")) as IndexMeta;
  const editions: Edition[] = meta.editions
    .map((slug) => {
      const f = path.join(dir, slug + ".json");
      if (!fs.existsSync(f)) return null;
      const e = JSON.parse(fs.readFileSync(f, "utf-8")) as Edition;
      return { ...e, slug };
    })
    .filter((e): e is Edition => e !== null);
  return { ...meta, editions };
}

export function countArticles(d: Digest): number {
  return d.editions.reduce((n, e) => n + e.items.length, 0);
}

export function findArticle(
  d: Digest,
  id: string
): { item: Item; edition: Edition } | null {
  for (const edition of d.editions) {
    const item = edition.items.find((it) => it.id === id);
    if (item) return { item, edition };
  }
  return null;
}

export function getAllArticleParams(): { date: string; id: string }[] {
  const out: { date: string; id: string }[] = [];
  for (const date of getAllDates()) {
    const d = getDigest(date);
    if (!d) continue;
    for (const e of d.editions) for (const it of e.items) out.push({ date, id: it.id });
  }
  return out;
}

export function allItems(d: Digest): { edition: Edition; item: Item }[] {
  return d.editions.flatMap((edition) => edition.items.map((item) => ({ edition, item })));
}

export function readingQueue(d: Digest, n = 5): { edition: Edition; item: Item }[] {
  const big = findArticle(d, d.bigStoryId);
  const rest = allItems(d).filter(({ item }) => item.id !== d.bigStoryId);
  return [...(big ? [big] : []), ...rest].slice(0, n);
}

export function sideHeadlines(d: Digest, n = 4): { edition: Edition; item: Item }[] {
  return allItems(d)
    .filter(({ item }) => item.id !== d.bigStoryId)
    .slice(0, n);
}

export function topEditionNames(d: Digest, n = 3): string[] {
  return d.editions.slice(0, n).map((e) => e.name);
}

export function headlineTitles(d: Digest, n = 3): string[] {
  const big = findArticle(d, d.bigStoryId);
  const titles = [
    ...(big ? [big.item.title] : []),
    ...sideHeadlines(d, n).map(({ item }) => item.title),
  ];
  return Array.from(new Set(titles)).slice(0, n);
}

export function countReports(d: Digest): number {
  return allItems(d).filter(({ item }) => Boolean(item.report?.what)).length;
}

export function countInsights(d: Digest): number {
  return allItems(d).filter(({ item }) => (item.report?.why?.length ?? 0) > 0).length;
}
