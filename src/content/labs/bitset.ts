import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "bitset",
  title: "Bitset",
  category: "Data Structures",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Pack boolean flags into bits for memory-efficient sets.",
  caption:
    "Toggle individual bits and watch the byte value change. Bitsets compress booleans and enable fast set operations with bitwise logic.",
  skillTags: ["DSA", "Systems"],
  concept:
    "A bitset stores boolean values as individual bits instead of full bytes or objects. This reduces memory by up to 8x or more and enables word-level operations: AND for intersection, OR for union, XOR for differences, and bit shifts for compact state transitions.\n\nBitsets are ideal when the universe of possible values is bounded and can be mapped to integer positions.",
  complexity: [
    { operation: "Set/clear/test bit", time: "O(1)", space: "O(n / wordSize)" },
    { operation: "Union/intersection", time: "O(n / wordSize)", space: "O(n / wordSize)" },
  ],
  realWorld: [
    "Permissions flags, bitmap indexes, Bloom filters, graph reachability, schedulers, and feature flags.",
  ],
  pitfalls: [
    "Requires a stable mapping from item to bit position.",
    "Sparse large universes may waste memory.",
    "Bit arithmetic is compact but can reduce readability if not wrapped well.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// One bit per id: 1M feature flags in 125 KB.
export class Bitset {
  private words: Uint32Array;
  constructor(bits: number) { this.words = new Uint32Array(Math.ceil(bits / 32)); }
  set(i: number) { this.words[i >>> 5] |= 1 << (i & 31); }
  has(i: number) { return (this.words[i >>> 5] & (1 << (i & 31))) !== 0; }
  // Intersect two cohorts with word-at-a-time AND.
  and(other: Bitset) {
    const out = new Bitset(this.words.length * 32);
    for (let w = 0; w < this.words.length; w++) out.words[w] = this.words[w] & other.words[w];
    return out;
  }
  popcount() {
    let n = 0;
    for (let w of this.words) { w = w - ((w >>> 1) & 0x55555555); w = (w & 0x33333333) + ((w >>> 2) & 0x33333333); n += (((w + (w >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24; }
    return n;
  }
}`,
  },
  usedBy: [
    {
      company: "Elastic",
      product: "Elasticsearch / Lucene filters",
      usage:
        "Filter clauses are cached as bitsets per segment so combining filters is a word-wise AND rather than a re-scan.",
      href: "https://www.elastic.co/blog/frame-of-reference-and-roaring-bitmaps",
    },
    {
      company: "Druid / Apache",
      product: "Roaring bitmap indexes",
      usage:
        "Compressed bitmaps store which rows match each dimension value, making high-cardinality filtering cheap.",
      href: "https://roaringbitmap.org/",
    },
    {
      company: "Redis",
      product: "Bitmaps (SETBIT) for DAU tracking",
      usage:
        "One bit per user id per day gives daily-active-user counts and retention set operations in a few hundred KB.",
      href: "https://redis.io/docs/latest/develop/data-types/bitmaps/",
    },
  ],
  references: [
    { label: "Roaring Bitmaps — compressed bitset format", href: "https://roaringbitmap.org/" },
    {
      label: "Redis docs — Bitmaps",
      href: "https://redis.io/docs/latest/develop/data-types/bitmaps/",
    },
  ],
};
