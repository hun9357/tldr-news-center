import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import test from "node:test";

const dataDir = new URL("../data/", import.meta.url);
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// `report.why` shipped as a bare string on 2026-07-22 and crashed the unguarded
// .map() in app/[date]/[id]/page.tsx, failing the whole production build.
test("no digest item ships a list field as a non-list", () => {
  const offenders = [];
  for (const date of readdirSync(dataDir)) {
    const dir = new URL(`${date}/`, dataDir);
    if (!statSync(dir).isDirectory()) continue;
    for (const file of readdirSync(dir)) {
      if (file === "index.json" || !file.endsWith(".json")) continue;
      const { items = [] } = JSON.parse(readFileSync(new URL(file, dir), "utf8"));
      for (const item of items) {
        const fields = { related: item.related, ...(item.report ?? {}) };
        for (const key of ["points", "why", "related"]) {
          const value = fields[key];
          if (value != null && !Array.isArray(value)) {
            offenders.push(`${date}/${file} ${item.id} .${key} is ${typeof value}`);
          }
        }
      }
    }
  }
  assert.deepEqual(offenders, []);
});

test("digest loader coerces stray list fields instead of trusting the JSON", () => {
  const digest = read("lib/digest.ts");
  assert.match(digest, /const asList =/);
  assert.match(digest, /points: asList\(r\.points\), why: asList\(r\.why\)/);
  assert.match(digest, /related: asList\(it\.related\)/);
});
