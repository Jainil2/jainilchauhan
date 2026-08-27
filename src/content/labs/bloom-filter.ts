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
};
