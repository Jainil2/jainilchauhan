import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "knowledge-v1";
/** Pre-Phase-1 key: "interacted with the demo". Read once, then left alone. */
const LEGACY_PROGRESS_KEY = "lab-progress-v1";

/** Which set a slug belongs to. Deliberately flat so a future row is an upsert. */
export type KnowledgeField = "solved" | "known" | "attempted" | "revealed";

const FIELDS: KnowledgeField[] = ["solved", "known", "attempted", "revealed"];

export type Knowledge = Record<KnowledgeField, Set<string>>;

function emptyKnowledge(): Knowledge {
  return { solved: new Set(), known: new Set(), attempted: new Set(), revealed: new Set() };
}

function toStringSet(value: unknown): Set<string> {
  if (!Array.isArray(value)) return new Set();
  return new Set(value.filter((x): x is string => typeof x === "string"));
}

function load(): Knowledge {
  if (typeof window === "undefined") return emptyKnowledge();
  const next = emptyKnowledge();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        for (const field of FIELDS) {
          next[field] = toStringSet((parsed as Record<string, unknown>)[field]);
        }
      }
      return next;
    }
  } catch {
    return emptyKnowledge();
  }

  // First run on a browser that has pre-Phase-1 progress. That key recorded
  // demo interaction, which is `attempted` — not `solved`. Seeding it into
  // `solved` would claim people had proven things they never did, and the
  // bridge map would then unlock AI labs on the strength of a stray click.
  try {
    const legacy = window.localStorage.getItem(LEGACY_PROGRESS_KEY);
    if (legacy) next.attempted = toStringSet(JSON.parse(legacy));
  } catch {
    // ignore
  }
  return next;
}

function persist(k: Knowledge) {
  if (typeof window === "undefined") return;
  try {
    const flat: Record<string, string[]> = {};
    for (const field of FIELDS) flat[field] = [...k[field]];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flat));
  } catch {
    // ignore
  }
}

/**
 * What the visitor has proven, and what they say they already know.
 *
 * `known ∪ solved` is the placement — there is no quiz. Phase 4's bridge map
 * reads exactly that union to decide which AI labs are reachable.
 *
 * Pure localStorage, hydration-safe in the same shape as `useLabProgress`:
 * server renders the empty state, the effect loads, `hydrated` gates anything
 * that would otherwise differ between server and client HTML.
 */
export function useKnowledge() {
  const [knowledge, setKnowledge] = useState<Knowledge>(emptyKnowledge);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setKnowledge(load());
    setHydrated(true);
  }, []);

  const add = useCallback((field: KnowledgeField, slug: string) => {
    setKnowledge((prev) => {
      if (prev[field].has(slug)) return prev;
      const next: Knowledge = { ...prev, [field]: new Set(prev[field]).add(slug) };
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((field: KnowledgeField, slug: string) => {
    setKnowledge((prev) => {
      if (!prev[field].has(slug)) return prev;
      const updated = new Set(prev[field]);
      updated.delete(slug);
      const next: Knowledge = { ...prev, [field]: updated };
      persist(next);
      return next;
    });
  }, []);

  const toggleKnown = useCallback(
    (slug: string) => {
      if (knowledge.known.has(slug)) remove("known", slug);
      else add("known", slug);
    },
    [knowledge.known, add, remove],
  );

  const reset = useCallback(() => {
    const next = emptyKnowledge();
    setKnowledge(next);
    persist(next);
  }, []);

  /** Placement: proven by tests, or self-declared. Both count. */
  const isPlaced = useCallback(
    (slug: string) => knowledge.solved.has(slug) || knowledge.known.has(slug),
    [knowledge.solved, knowledge.known],
  );

  /**
   * Count of what you have, never a fraction of a catalogue. Rendering
   * "12 / 93" on a landing page manufactures exactly the FOMO this product
   * exists to remove.
   */
  const placedCount = hydrated ? new Set([...knowledge.solved, ...knowledge.known]).size : 0;

  return { knowledge, hydrated, add, remove, toggleKnown, reset, isPlaced, placedCount };
}
