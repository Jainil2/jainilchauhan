#!/usr/bin/env node
// Reads src/content/labs/*.ts and emits:
//   - src/content/labs.gen.ts  (small summary index for pages that only list labs)
//   - public/sitemap.xml
//   - public/robots.txt
// Also validates content integrity and exits non-zero on failure, so a bad slug
// or a dangling bridge fails the build instead of shipping.
//
// Lab files are pure data with a single type-only import, so they can be
// evaluated directly after stripping the TS bits — no parser needed.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const labsDir = join(repoRoot, "src", "content", "labs");
// Both Workers build from this repo and both write public/sitemap.xml, so the
// URL must follow the build. Shipping a delta sitemap full of jainilchauhan.com
// URLs would be a silent, launch-day SEO bug, so warn loudly instead.
const isDeltaBuild = process.env.VITE_SITE === "delta";

// Neither product has a domain yet, so neither gets a real default. This used
// to fall back to https://jainilchauhan.com for the portfolio build, which is
// owned by a different person of the same name -- so every canonical tag, the
// sitemap and robots.txt named a site this project does not control. A
// placeholder that cannot resolve is the honest default: it is obvious in a
// diff, and it cannot hand a crawler someone else's domain.
const SITE =
  process.env.SITE_URL || (isDeltaBuild ? "https://delta.invalid" : "https://portfolio.invalid");

if (!process.env.SITE_URL) {
  console.warn(
    `[content] WARNING: no SITE_URL — sitemap.xml and robots.txt use the placeholder ${SITE}.\n` +
      "          Set SITE_URL=https://<domain> before deploying either Worker.",
  );
}

const SUMMARY_FIELDS = ["slug", "title", "category", "difficulty", "readingTimeMin", "blurb"];

function loadLab(file) {
  const src = readFileSync(join(labsDir, file), "utf8");
  const body = src
    .replace(/^import type .*$/gm, "")
    .replace(/export const lab: LabMeta =/, "return");
  try {
    return new Function(body)();
  } catch (err) {
    throw new Error(`${file}: failed to evaluate — ${err.message}`);
  }
}

/** Tracks are pure data with one type-only import, same as a lab file. */
function loadTracks() {
  const src = readFileSync(join(repoRoot, "src", "content", "tracks.ts"), "utf8");
  const body = src
    .replace(/^import type .*$/gm, "")
    .replace(/export const tracks: Track\[\] =/, "return");
  try {
    return new Function(body)();
  } catch (err) {
    throw new Error(`tracks.ts: failed to evaluate — ${err.message}`);
  }
}

function main() {
  const files = readdirSync(labsDir)
    .filter((f) => f.endsWith(".ts") && f !== "index.ts" && !f.endsWith(".test.ts"))
    .sort();

  const labs = [];
  const errors = [];

  for (const file of files) {
    const lab = loadLab(file);
    const expected = file.slice(0, -3);
    if (lab.slug !== expected) {
      errors.push(`${file}: slug "${lab.slug}" does not match filename`);
    }
    for (const field of ["title", "category", "difficulty", "blurb", "concept"]) {
      if (!lab[field]) errors.push(`${lab.slug}: missing ${field}`);
    }
    labs.push(lab);
  }

  const slugs = new Set(labs.map((l) => l.slug));
  if (slugs.size !== labs.length) errors.push("duplicate slugs present");

  // Every bridge must point at a lab that exists, or the bridge map renders a
  // dead "you already know X" claim about nothing.
  for (const lab of labs) {
    for (const b of lab.bridgesFrom ?? []) {
      if (!slugs.has(b.slug)) {
        errors.push(`${lab.slug}: bridgesFrom "${b.slug}" does not exist`);
      }
      if (b.slug === lab.slug) errors.push(`${lab.slug}: bridges to itself`);
      if (!b.sameness) errors.push(`${lab.slug}: bridge from "${b.slug}" has no sameness`);
      if (!b.delta) errors.push(`${lab.slug}: bridge from "${b.slug}" has no delta`);
    }
    // An AI lab without a bridge is just an AI lab, which is the thing every
    // other site already has. The category is only worth anything if every
    // entry says what it is a small delta from.
    if (lab.category === "AI Systems" && !lab.bridgesFrom?.length) {
      errors.push(`${lab.slug}: an AI Systems lab must declare bridgesFrom`);
    }
    for (const t of lab.challenge?.tests ?? []) {
      if (!t.name || !t.body) errors.push(`${lab.slug}: challenge test missing name/body`);
    }
    if (lab.challenge) {
      const c = lab.challenge;
      if (!c.tests?.length) errors.push(`${lab.slug}: challenge has no tests`);
      if (!c.prompt) errors.push(`${lab.slug}: challenge has no prompt`);
      if (!c.reference) errors.push(`${lab.slug}: challenge has no reference solution`);
      // Without `entry` the harness has no idea which function the tests mean,
      // so every submission would fail for a reason the visitor cannot see.
      if (!c.entry) errors.push(`${lab.slug}: challenge is missing "entry"`);
      else if (!c.starter?.includes(c.entry)) {
        errors.push(`${lab.slug}: starter does not define the entry function "${c.entry}"`);
      }
      // The reference has to satisfy the same contract, or "show me the answer"
      // hands over code that cannot pass.
      if (c.entry && c.reference && !c.reference.includes(c.entry)) {
        errors.push(`${lab.slug}: reference does not define the entry function "${c.entry}"`);
      }
    }
  }

  // Tracks are an ordering over the same catalogue, so the only thing that can
  // be wrong with one is a step naming a lab that does not exist.
  const tracks = loadTracks();
  const slugSet = new Set(labs.map((l) => l.slug));
  for (const track of tracks) {
    if (!track.slug || !track.title) errors.push(`track "${track.slug}": missing slug or title`);
    if (!track.steps?.length) errors.push(`track "${track.slug}": has no steps`);
    for (const step of track.steps ?? []) {
      if (!slugSet.has(step)) errors.push(`track "${track.slug}": step "${step}" does not exist`);
    }
    if (new Set(track.steps).size !== track.steps?.length) {
      errors.push(`track "${track.slug}": repeats a step`);
    }
  }

  // "Every lab is connected" is a promise about the graph, so it is checked
  // rather than asserted. A lab with no bridge in and no bridge out is a dead
  // end: nothing leads to it and it leads nowhere, so no path can reach it and
  // no reframe explains it. Roots are fine — they have edges out.
  const connected = new Set();
  for (const lab of labs) {
    for (const b of lab.bridgesFrom ?? []) {
      connected.add(lab.slug);
      connected.add(b.slug);
    }
  }
  // A lab an ordered track walks through is reachable by that route even with
  // no bridge of its own, so a track step counts as connectivity too.
  for (const track of tracks) for (const step of track.steps ?? []) connected.add(step);

  // A warning while the bridges are still being authored; set STRICT_GRAPH=1 to
  // make it fatal, which is how it should run once every lab has an edge.
  const orphans = labs.map((l) => l.slug).filter((s) => !connected.has(s));
  if (orphans.length) {
    const line =
      `${orphans.length} lab(s) are not connected to anything — no bridge in, ` +
      `no bridge out, no track step:\n          ${orphans.join(", ")}`;
    if (process.env.STRICT_GRAPH) errors.push(line);
    else console.warn(`[content] ${line}`);
  }

  if (errors.length) {
    console.error("[content] validation failed:");
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }

  const summaries = labs.map((lab) => Object.fromEntries(SUMMARY_FIELDS.map((f) => [f, lab[f]])));

  const gen =
    `// Generated by scripts/generate-content.mjs. Do not edit.\n` +
    `// Summary fields only — full lab content is lazily imported per slug from\n` +
    `// src/content/labs/<slug>.ts. Regenerate with \`npm run build\`.\n` +
    `import type { LabCategory, Difficulty } from "./types";\n\n` +
    `export interface LabSummary {\n` +
    `  slug: string;\n  title: string;\n  category: LabCategory;\n` +
    `  difficulty: Difficulty;\n  readingTimeMin: number;\n  blurb: string;\n}\n\n` +
    `export const labSummaries: LabSummary[] = ${JSON.stringify(summaries, null, 2)};\n\n` +
    // The reverse view ("this unlocks X") needs every lab's bridges at once,
    // and that data lives in the full lab files which are lazily loaded. Emit
    // the graph here so it stays derived from one source and cannot desync.
    // Only a handful of labs carry bridges, so this stays small.
    `/** Every declared bridge, flattened. Source of truth for both directions. */\n` +
    `export interface BridgeEdge {\n` +
    `  /** The lab that declares the bridge — the newer idea. */\n  to: string;\n` +
    `  /** The prerequisite it is a small delta from. */\n  from: string;\n` +
    `  sameness: string;\n  delta: string;\n}\n\n` +
    `export const bridgeEdges: BridgeEdge[] = ${JSON.stringify(
      labs.flatMap((lab) =>
        (lab.bridgesFrom ?? []).map((b) => ({
          to: lab.slug,
          from: b.slug,
          sameness: b.sameness,
          delta: b.delta,
        })),
      ),
      null,
      2,
    )};\n\n` +
    // Tracks are tiny (a title and a list of slugs), so they ship in the
    // summary index rather than being lazily loaded like lab prose.
    `/** Guided routes through the catalogue, ordered. */\n` +
    `export interface TrackSummary {\n` +
    `  slug: string;\n  title: string;\n  blurb: string;\n  outcome: string;\n` +
    `  steps: string[];\n}\n\n` +
    `export const trackSummaries: TrackSummary[] = ${JSON.stringify(tracks, null, 2)};\n`;

  writeFileSync(join(repoRoot, "src", "content", "labs.gen.ts"), gen, "utf8");

  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, priority: "1.0", freq: "monthly" },
    { loc: `${SITE}/lab`, priority: "0.8", freq: "weekly" },
    ...labs.map((l) => ({
      loc: `${SITE}/lab/${l.slug}`,
      priority: "0.6",
      freq: "monthly",
    })),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n` +
          `    <changefreq>${u.freq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
      )
      .join("\n") +
    `\n</urlset>\n`;

  writeFileSync(join(repoRoot, "public", "sitemap.xml"), xml, "utf8");

  // robots.txt follows the build for the same reason the sitemap does. It used
  // to be a checked-in file naming jainilchauhan.com, which both Workers then
  // shipped byte for byte — so the platform pointed crawlers at the portfolio's
  // sitemap and none of its own pages.
  writeFileSync(
    join(repoRoot, "public", "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
    "utf8",
  );

  const withChallenge = labs.filter((l) => l.challenge).length;
  const withBridge = labs.filter((l) => l.bridgesFrom?.length).length;
  console.log(
    `[content] ${labs.length} labs — ${withChallenge} with challenges, ` +
      `${withBridge} with bridges. Wrote labs.gen.ts + sitemap.xml + robots.txt ` +
      `(${urls.length} urls, host ${SITE}).`,
  );
}

main();
