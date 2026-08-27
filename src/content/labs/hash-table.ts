import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "hash-table",
  title: "Hash Table",
  category: "Data Structures",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "Map keys to buckets for average O(1) lookup.",
  caption:
    "Insert keys and watch them route to buckets. Collisions form chains, showing why load factor and hash quality matter.",
  skillTags: ["DSA", "Backend"],
  concept:
    "A hash table stores key-value pairs by hashing each key to a bucket. A good hash function spreads keys evenly, giving O(1) average insert, lookup, and delete. Collisions are handled with chaining, open addressing, or hybrid schemes.\n\nHash tables power maps, sets, caches, indexes, joins, memoization, and deduplication. Performance depends on load factor, collision strategy, resizing policy, and hash quality.",
  complexity: [
    { operation: "Insert/lookup/delete", time: "O(1) average, O(n) worst", space: "O(n)" },
    { operation: "Resize", time: "O(n)", space: "O(n)" },
  ],
  realWorld: [
    "JavaScript Map/Object, Python dict, Redis dictionaries, compiler symbol tables, and hash joins.",
  ],
  pitfalls: [
    "Adversarial keys can force collisions unless hashing is hardened.",
    "Resizing can create latency spikes.",
    "Iteration order should not be relied on unless the implementation guarantees it.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Separate chaining with load-factor driven resize.
export class HashMap<V> {
  private buckets: [string, V][][] = Array.from({ length: 8 }, () => []);
  private count = 0;

  private idx(key: string, m = this.buckets.length) {
    let h = 2166136261; // FNV-1a
    for (let i = 0; i < key.length; i++) {
      h = (h ^ key.charCodeAt(i)) * 16777619;
    }
    return (h >>> 0) % m;
  }

  set(key: string, value: V) {
    const b = this.buckets[this.idx(key)];
    const hit = b.find((e) => e[0] === key);
    if (hit) { hit[1] = value; return; }
    b.push([key, value]);
    if (++this.count / this.buckets.length > 0.75) this.resize();
  }

  private resize() {
    const next: [string, V][][] = Array.from({ length: this.buckets.length * 2 }, () => []);
    for (const b of this.buckets) for (const e of b) next[this.idx(e[0], next.length)].push(e);
    this.buckets = next;
  }
}`,
  },
  usedBy: [
    {
      company: "Redis",
      product: "Keyspace / HSET",
      usage:
        "The main keyspace is a hash table that rehashes incrementally into a second table so a resize never stalls the single-threaded event loop.",
      href: "https://redis.io/docs/latest/develop/data-types/hashes/",
    },
    {
      company: "Cloudflare",
      product: "Edge routing tables",
      usage:
        "Hash maps resolve host/zone lookups per request; hash-collision (HashDoS) hardening uses randomised seeds.",
      href: "https://blog.cloudflare.com/why-i-started-contributing-to-swiss-tables/",
    },
    {
      company: "Google",
      product: "Abseil Swiss Tables",
      usage:
        "SIMD-scanned open-addressed control bytes make flat_hash_map lookups faster than node-based maps across Google's C++ code.",
      href: "https://abseil.io/about/design/swisstables",
    },
  ],
  references: [
    {
      label: "Abseil — Swiss Tables design notes",
      href: "https://abseil.io/about/design/swisstables",
    },
    {
      label: "Redis docs — Hashes",
      href: "https://redis.io/docs/latest/develop/data-types/hashes/",
    },
  ],
};
