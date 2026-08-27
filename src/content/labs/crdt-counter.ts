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
};
