import type { LabMeta } from "../types";
import { labSummaries } from "../labs.gen";

export type { LabMeta } from "../types";
export type { LabCategory, Difficulty, Challenge, Bridge } from "../types";
export { LAB_CATEGORIES } from "../types";
export { labSummaries } from "../labs.gen";
export type { LabSummary } from "../labs.gen";

/**
 * Full lab content, one lazily-loaded module per slug.
 *
 * Non-eager on purpose. Every lab's prose together is ~340KB, and pages that
 * merely *list* labs (the index, ⌘K palette, terminal) need only the fields in
 * `labSummaries`. Only a lab detail page pays for the full text, and only for
 * the one lab being read.
 */
const loaders = import.meta.glob<{ lab: LabMeta }>(["./*.ts", "!./index.ts"]);

const bySlug = new Map<string, () => Promise<{ lab: LabMeta }>>();
for (const [path, load] of Object.entries(loaders)) {
  bySlug.set(path.slice("./".length, -".ts".length), load);
}

export function hasLab(slug: string): boolean {
  return bySlug.has(slug);
}

export async function loadLab(slug: string): Promise<LabMeta | undefined> {
  const load = bySlug.get(slug);
  if (!load) return undefined;
  return (await load()).lab;
}

export function getSummary(slug: string) {
  return labSummaries.find((l) => l.slug === slug);
}
