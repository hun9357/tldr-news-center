import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("shared layout uses redesigned navigation shell", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /nav-shell/);
  assert.match(layout, /TLDR <b>Daily<\/b>/);
});

test("home route uses redesigned archive experience", () => {
  const home = read("app/page.tsx");
  assert.match(home, /archive-shell/);
  assert.match(home, /archive-card/);
  assert.match(home, /아카이브 인덱스/);
});

test("daily digest route uses briefing dashboard sections", () => {
  const daily = read("app/[date]/page.tsx");
  assert.match(daily, /digest-shell/);
  assert.match(daily, /reading-queue/);
  assert.match(daily, /edition-nav/);
  assert.match(daily, /story-feature/);
});

test("article report route uses redesigned reader layout", () => {
  const report = read("app/[date]/[id]/page.tsx");
  assert.match(report, /report-shell/);
  assert.match(report, /report-layout/);
  assert.match(report, /report-rail/);
  assert.match(report, /report-actions/);
});
