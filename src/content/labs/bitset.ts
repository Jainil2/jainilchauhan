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
  challenge: {
    prompt:
      "Pack boolean flags into 32-bit integers and support set, clear, test and popcount. Quantization does the same thing to model weights: many small values packed into one machine word so memory and bandwidth drop together.",
    entry: "bitset",
    starter: `/**
 * @param {number} size - number of bits.
 * @param {Array<[string, number]>} ops - ['set', i] | ['clear', i] | ['test', i] | ['count'].
 * @returns {Array<boolean|number>} one result per 'test' (boolean) and 'count' (number).
 */
function bitset(size, ops) {
  const words = new Uint32Array(Math.ceil(size / 32));
  // Bit i lives in word (i >>> 5), at position (i & 31) inside that word.
}
`,
    tests: [
      {
        name: "set then test",
        body: `assertEquals(solution(64, [['set', 5], ['test', 5]]), [true]);`,
      },
      {
        name: "unset bits read false",
        body: `assertEquals(solution(64, [['test', 7]]), [false]);`,
      },
      {
        name: "clear turns a bit off",
        body: `assertEquals(solution(64, [['set', 3], ['clear', 3], ['test', 3]]), [false]);`,
      },
      {
        name: "setting twice is idempotent",
        body: `assertEquals(solution(64, [['set', 9], ['set', 9], ['count']]), [1]);`,
      },
      {
        name: "counts bits across word boundaries",
        body: `assertEquals(solution(96, [['set', 0], ['set', 31], ['set', 32], ['set', 95], ['count']]), [4]);`,
      },
      {
        name: "bit 31 does not leak into the next word",
        body: `assertEquals(solution(64, [['set', 31], ['test', 32]]), [false]);`,
      },
      {
        name: "handles a large set",
        body: `var ops = [];
for (var i = 0; i < 10000; i += 3) ops.push(['set', i]);
ops.push(['count']);
var out = solution(10000, ops);
assertEquals(out[0], Math.ceil(10000 / 3));`,
      },
    ],
    hints: [
      "The word index is i >>> 5 (divide by 32) and the position inside it is i & 31 (remainder by 32).",
      "Set with words[w] |= 1 << b, clear with words[w] &= ~(1 << b), test with (words[w] >>> b) & 1.",
      "For the count, loop the set bits of each word: n &= n - 1 clears the lowest set bit each time.",
    ],
    reference: `function bitset(size, ops) {
  const words = new Uint32Array(Math.ceil(size / 32));
  const out = [];
  for (const [op, i] of ops) {
    const w = i >>> 5; // which 32-bit word
    const b = i & 31; // which bit inside it
    if (op === 'set') words[w] |= 1 << b;
    else if (op === 'clear') words[w] &= ~(1 << b);
    else if (op === 'test') out.push(((words[w] >>> b) & 1) === 1);
    else if (op === 'count') {
      let total = 0;
      for (let k = 0; k < words.length; k++) {
        let n = words[k];
        // Brian Kernighan: each step clears the lowest set bit, so this loops
        // once per set bit rather than once per bit.
        while (n) {
          n &= n - 1;
          total++;
        }
      }
      out.push(total);
    }
  }
  return out;
}
`,
  },
};
