import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSite, prettyPhone } from "../build.mjs";

const slugs = readdirSync(new URL("../sites/", import.meta.url)).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));

test("every site builds, with the referral disclosure, the form and FAQ data", () => {
  const out = mkdtempSync(join(tmpdir(), "leadsites-"));
  for (const slug of slugs) {
    const dir = buildSite(slug, out);
    const html = readFileSync(join(dir, "index.html"), "utf8");
    assert.match(html, /free referral service/);
    assert.match(html, /action="\/api\/book"/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.doesNotMatch(html, /licensed|insured/i, "never claim licenses or insurance we cannot prove");
    for (const p of ["thanks", "oops", "privacy"]) assert.ok(readFileSync(join(dir, p, "index.html"), "utf8").includes("<!doctype html>"));
  }
});

test("prettyPhone", () => {
  assert.equal(prettyPhone("+14785550123"), "(478) 555-0123");
});
