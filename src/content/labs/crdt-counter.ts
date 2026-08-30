import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "crdt-counter",
  title: "CRDT G-Counter",
  category: "Distributed Systems",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Conflict-free replicated data that converges without coordination.",
  caption:
    "Increment two replicas independently, then merge. The counter converges by taking the max value seen for each replica slot.",
  skillTags: ["Distributed Systems", "Databases"],
  bridgesFrom: [
    {
      slug: "vector-clocks",
      sameness:
        "A G-Counter IS a vector clock. One slot per replica, a replica only ever increments its own slot, and merging two replicas takes the element-wise maximum — the same vector and the same merge you already implemented.",
      delta:
        "The vector is read as a value rather than as an ordering: sum the slots and you have the count. Because max is idempotent, commutative and associative, duplicated, reordered and delayed messages all land on the same answer, so concurrency stops being a conflict to resolve and becomes the normal case — there is no resolution rule because there is nothing to resolve. The price is that the structure only goes one way; decrementing needs a second vector, and deletion is harder still.",
    },
  ],
  concept:
    "A CRDT is a data type designed so replicas can update independently and later merge into the same value. The G-Counter is the simplest example: each replica owns one slot in a vector and only increments its own slot. Merge takes the element-wise maximum. The visible count is the sum of the vector.\n\nBecause merge is associative, commutative, and idempotent, replicas converge even if messages arrive out of order, duplicate, or after partitions. More advanced CRDTs model sets, maps, registers, text editing, and presence.",
  complexity: [
    { operation: "Increment", time: "O(1)", space: "O(replicas)" },
    { operation: "Merge", time: "O(replicas)", space: "O(replicas)" },
    { operation: "Read", time: "O(replicas)", space: "O(1)" },
  ],
  realWorld: [
    "Riak, Redis Enterprise active-active, collaborative editors, counters, likes, reactions, and offline-first apps.",
  ],
  pitfalls: [
    "Metadata grows with replica count unless compacted.",
    "Not every invariant can be preserved without coordination.",
    "Deletes require more complex CRDTs such as OR-Sets or tombstones.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// PN-Counter: two grow-only maps, merge with per-node max -> commutative,
// associative, idempotent. Replicas converge regardless of message order.
type GCounter = Record<string, number>;
interface PNCounter { inc: GCounter; dec: GCounter }

const increment = (c: PNCounter, node: string, by = 1): PNCounter =>
  ({ ...c, inc: { ...c.inc, [node]: (c.inc[node] ?? 0) + by } });

const mergeG = (a: GCounter, b: GCounter): GCounter => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
};

const merge = (a: PNCounter, b: PNCounter): PNCounter =>
  ({ inc: mergeG(a.inc, b.inc), dec: mergeG(a.dec, b.dec) });

const value = (c: PNCounter) =>
  Object.values(c.inc).reduce((s, n) => s + n, 0) - Object.values(c.dec).reduce((s, n) => s + n, 0);`,
  },
  usedBy: [
    {
      company: "Figma",
      product: "Multiplayer document state",
      usage:
        "Figma's realtime engine uses CRDT-inspired merge rules so concurrent edits converge without a locking server.",
      href: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
    },
    {
      company: "Apple",
      product: "Notes sync across devices",
      usage:
        "Apple has described using CRDTs so edits made offline on different devices merge without conflict dialogs.",
      href: "https://archive.org/details/crdts-in-production-apple-notes",
    },
    {
      company: "Redis",
      product: "Active-Active geo-replication (CRDBs)",
      usage:
        "Redis Enterprise databases replicate multi-master using CRDT semantics for counters, sets and maps.",
      href: "https://redis.io/docs/latest/operate/rs/databases/active-active/",
    },
    {
      company: "Automerge / Yjs ecosystem",
      product: "Local-first collaborative apps",
      usage:
        "Open-source CRDT libraries power offline-first editors where every peer can write and later sync.",
      href: "https://automerge.org/",
    },
  ],
  references: [
    {
      label:
        "Shapiro et al. — A comprehensive study of Convergent and Commutative Replicated Data Types",
      href: "https://inria.hal.science/inria-00555588/document",
    },
    {
      label: "Redis — Active-Active geo-replication (CRDBs)",
      href: "https://redis.io/docs/latest/operate/rs/databases/active-active/",
    },
    {
      label: "Automerge — CRDT library documentation",
      href: "https://automerge.org/docs/hello/",
    },
  ],
  challenge: {
    prompt:
      "Merge PN-counter replicas that have been updating independently. Each replica owns its own increment and decrement tallies; merging takes the maximum per replica, never a sum. That is what makes the merge idempotent, so replaying the same state twice is harmless.",
    entry: "mergeCounters",
    starter: `/**
 * A replica state is { inc: {replicaId: count}, dec: {replicaId: count} }.
 *
 * @param {Array<{inc: object, dec: object}>} replicas
 * @returns {number} the merged counter value: total increments minus decrements.
 */
function mergeCounters(replicas) {
  // Per replica id take the MAXIMUM seen, not the sum. Summing double-counts
  // whenever two replicas have already heard about the same update.
}
`,
    tests: [
      {
        name: "a single replica",
        body: `assertEquals(solution([{ inc: { a: 3 }, dec: {} }]), 3);`,
      },
      {
        name: "merges disjoint replicas",
        body: `assertEquals(solution([{ inc: { a: 3 }, dec: {} }, { inc: { b: 2 }, dec: {} }]), 5);`,
      },
      {
        name: "overlapping knowledge is not double counted",
        body: `assertEquals(solution([{ inc: { a: 3 }, dec: {} }, { inc: { a: 3 }, dec: {} }]), 3);`,
      },
      {
        name: "takes the larger of two views",
        body: `assertEquals(solution([{ inc: { a: 3 }, dec: {} }, { inc: { a: 5 }, dec: {} }]), 5);`,
      },
      {
        name: "decrements subtract",
        body: `assertEquals(solution([{ inc: { a: 5 }, dec: { a: 2 } }]), 3);`,
      },
      {
        name: "merging is idempotent",
        body: `var r = { inc: { a: 4 }, dec: { b: 1 } };
assertEquals(solution([r, r, r]), solution([r]));`,
      },
      {
        name: "merging is order independent",
        body: `var x = { inc: { a: 2 }, dec: {} };
var y = { inc: { b: 7 }, dec: { a: 1 } };
assertEquals(solution([x, y]), solution([y, x]));`,
      },
      {
        name: "no replicas",
        body: `assertEquals(solution([]), 0);`,
      },
    ],
    hints: [
      "Build two merged maps, one for increments and one for decrements.",
      "For every replica id keep the maximum value seen across all replicas.",
      "The answer is the sum of the merged increments minus the sum of the merged decrements.",
    ],
    reference: `function mergeCounters(replicas) {
  const mergeMax = (key) => {
    const merged = {};
    for (const replica of replicas) {
      for (const [id, count] of Object.entries(replica[key] || {})) {
        // Max, never sum: two replicas may already know the same update.
        if (merged[id] === undefined || count > merged[id]) merged[id] = count;
      }
    }
    return Object.values(merged).reduce((a, b) => a + b, 0);
  };
  return mergeMax('inc') - mergeMax('dec');
}
`,
  },
};
