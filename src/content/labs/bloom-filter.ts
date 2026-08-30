import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "bloom-filter",
  title: "Bloom Filter",
  category: "Data Structures",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Probabilistic set membership in O(k) bits.",
  caption:
    "Type a word — three hash functions flip three bits. Membership checks return 'maybe' or 'definitely not'. Watch the false-positive rate climb as the bit array fills.",
  whereUsed: { label: "Cache stack at Tech Holding", href: "/#projects" },
  skillTags: ["DSA", "Redis"],
  bridgesFrom: [
    {
      slug: "hash-table",
      sameness:
        "It IS a hash table. Hash the key, go to that slot — the same addressing you already implemented, run k times with k different hash functions.",
      delta:
        "The slot holds one bit instead of the key, so nothing is ever stored and collisions are never resolved. That is the entire structure: constant memory per element regardless of key size, and an answer that is either definitely-not-present or probably-present. Being wrong stops being a bug and becomes a tuned parameter, and two operations disappear outright — you cannot enumerate the contents, and you cannot delete without breaking every other key that shares a bit.",
    },
    {
      slug: "bitset",
      sameness:
        "The storage IS a bitset. One flat array of bits, addressed by index, set with a mask — exactly the structure you already packed.",
      delta:
        "The indices come from hashes rather than from the caller, so the bits are no longer owned by any one element. Density becomes the thing to watch: as more keys are inserted the fraction of set bits rises, and the false positive rate rises with it, so a bloom filter has a capacity you must size up front even though it never physically runs out of room.",
    },
  ],
  concept:
    "A Bloom filter is a space-efficient probabilistic data structure that answers one question: 'have we seen this item before?' It can be wrong in one direction — it may say 'maybe yes' when the answer is no (false positive), but it will never say 'no' when the answer is yes.\n\nIt works by maintaining an array of m bits and k independent hash functions. Insert: hash the item k times, set those k bits. Lookup: hash again — if any of the k bits is 0, the item is definitely not in the set. If all k bits are 1, it might be in the set.\n\nThe false-positive rate grows as the bit array fills: roughly (1 − e^(−kn/m))^k. Tuning k and m for an expected n gives you a controllable error budget.",
  complexity: [
    { operation: "Insert", time: "O(k)", space: "O(m bits)" },
    { operation: "Lookup", time: "O(k)", space: "O(1)" },
    { operation: "Delete", time: "—", space: "(not supported; use Counting Bloom)" },
  ],
  codeSnippet: {
    language: "ts",
    code: `class BloomFilter {
  bits: Uint8Array;
  constructor(public m: number, public k: number) {
    this.bits = new Uint8Array(m);
  }
  private hash(seed: number, s: string) {
    let h = seed;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % this.m;
  }
  add(s: string) {
    for (let i = 0; i < this.k; i++) this.bits[this.hash(7 + i * 31, s)] = 1;
  }
  has(s: string): boolean {
    for (let i = 0; i < this.k; i++) {
      if (!this.bits[this.hash(7 + i * 31, s)]) return false;
    }
    return true; // maybe
  }
}`,
  },
  realWorld: [
    "Bigtable / Cassandra: per-SSTable Bloom filter avoids disk reads for keys that aren't there.",
    "Chrome: filters known-malicious URLs locally before hitting the Safe Browsing API.",
    "CDNs: skip a database round-trip on cache misses for keys that have never existed.",
    "Postgres: pg_bloom extension speeds up multi-column filters.",
  ],
  pitfalls: [
    "Standard Bloom filters can't delete — use a Counting Bloom Filter when removals matter.",
    "False-positive rate stacks across layers (filter → cache → DB) so size for the worst layer.",
    "Hash quality matters: weak hashes cause clustering and inflate the FP rate beyond the formula.",
  ],
  references: [
    {
      label: "Burton Bloom — Space/Time Trade-offs in Hash Coding (1970)",
      href: "https://dl.acm.org/doi/10.1145/362686.362692",
    },
    {
      label: "Cassandra docs — Bloom Filters",
      href: "https://cassandra.apache.org/doc/latest/cassandra/architecture/storage_engine.html",
    },
  ],
  usedBy: [
    {
      company: "Google",
      product: "Chrome Safe Browsing",
      usage:
        "The browser checks URLs against a local probabilistic filter of known-bad hosts and only calls the API on a possible hit.",
      href: "https://developers.google.com/safe-browsing/v4/update-api",
    },
    {
      company: "Apache Cassandra",
      product: "SSTable read path",
      usage:
        "Each SSTable carries a Bloom filter so a read can skip files that definitely do not contain the partition key.",
      href: "https://cassandra.apache.org/doc/latest/cassandra/managing/operating/bloomfilters.html",
    },
    {
      company: "Medium",
      product: '"Already read" article feed',
      usage:
        "Bloom filters cheaply exclude posts a reader has already seen before ranking recommendations.",
      href: "https://medium.com/the-story/what-are-bloom-filters-1ec2a50c68ff",
    },
    {
      company: "Bitcoin Core",
      product: "BIP-37 SPV wallet filters",
      usage:
        "Light clients ask peers for transactions matching a Bloom filter of their addresses instead of downloading every block in full.",
      href: "https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki",
    },
  ],
  challenge: {
    prompt:
      "Build a Bloom filter's two operations over a fixed bit array. Insert every item, then answer membership for each query: false means definitely absent, true means probably present. A RAG pipeline runs this before touching the vector store, to skip a network hop for documents it certainly does not have.",
    entry: "bloom",
    starter: `/**
 * @param {number} bits - size of the bit array.
 * @param {(s: string) => number[]} hashes - returns one index per hash function,
 *                                           already reduced into [0, bits).
 * @param {string[]} inserts - items to add.
 * @param {string[]} queries - items to test.
 * @returns {boolean[]} one answer per query, in order.
 */
function bloom(bits, hashes, inserts, queries) {
  // Insert: set every bit the hashes point at.
  // Query: true only if EVERY bit the hashes point at is already set.
}
`,
    tests: [
      {
        name: "reports an inserted item as present",
        body: `var h = function (s) { return [s.length % 8, (s.charCodeAt(0) || 0) % 8]; };
assertEquals(solution(8, h, ["ab"], ["ab"]), [true]);`,
      },
      {
        name: "reports a definitely-absent item as absent",
        body: `var h = function (s) { return [s.length % 16, (s.charCodeAt(0) || 0) % 16]; };
assertEquals(solution(16, h, ["ab"], ["zzzzzzz"]), [false]);`,
      },
      {
        name: "never produces a false negative",
        body: `var h = function (s) { return [s.length % 32, s.charCodeAt(0) % 32, (s.charCodeAt(1) || 0) % 32]; };
var items = ["alpha", "beta", "gamma", "delta", "epsilon"];
var out = solution(32, h, items, items);
assertEquals(out, [true, true, true, true, true]);`,
      },
      {
        name: "requires ALL bits set, not just one",
        body: `// "a" sets bit 1 only. "bb" needs bits 2 and 1 — bit 2 is still clear.
var h = function (s) { return s === "a" ? [1] : [2, 1]; };
assertEquals(solution(8, h, ["a"], ["bb"]), [false]);`,
      },
      {
        name: "an empty filter reports everything absent",
        body: `var h = function (s) { return [s.length % 8]; };
assertEquals(solution(8, h, [], ["a", "b"]), [false, false]);`,
      },
      {
        name: "accepts a false positive when bits collide",
        body: `// Distinct items, identical bits: the filter cannot tell them apart.
var h = function () { return [0, 1]; };
assertEquals(solution(8, h, ["x"], ["y"]), [true]);`,
      },
    ],
    hints: [
      "One pass to insert, one pass to query. The bit array can just be an array of booleans.",
      "For each insert, loop over `hashes(item)` and set every index it returns.",
      "For a query, `every()` is the operation you want — a single clear bit proves absence.",
    ],
    reference: `function bloom(bits, hashes, inserts, queries) {
  const array = new Array(bits).fill(false);

  for (const item of inserts) {
    for (const index of hashes(item)) array[index] = true;
  }

  // One clear bit is proof of absence. All bits set is only evidence of
  // presence — which is why a Bloom filter can say "maybe" but never "no" wrongly.
  return queries.map((q) => hashes(q).every((index) => array[index]));
}
`,
  },
};
