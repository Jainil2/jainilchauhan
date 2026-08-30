import type { Track } from "./types";

/**
 * Guided routes through the catalogue.
 *
 * A track is an ordering, nothing more — the labs own all their own content, so
 * a track can never drift from what it points at. `scripts/generate-content.mjs`
 * fails the build if a step names a lab that does not exist.
 *
 * Ordering rule: a lab should not appear before something it bridges from.
 * Otherwise the "you already know this" card at the top of it is a lie for
 * anyone following the track in order.
 */
export const tracks: Track[] = [
  {
    slug: "foundations",
    title: "Data structures, end to end",
    blurb:
      "The structures everything else is built out of, in the order that each one explains the next.",
    outcome:
      "You can pick the right structure for a problem and say what it costs, rather than reaching for a hash map every time.",
    steps: [
      "array",
      "dynamic-array",
      "linked-list",
      "stack",
      "queue",
      "hash-table",
      "binary-tree",
      "binary-search-tree",
      "heap-priority-queue",
      "trie",
      "lru-cache",
    ],
  },
];
