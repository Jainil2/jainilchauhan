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
  challenge: {
    prompt:
      "Build a chained hash table. Given a bucket count and a hash function, run a series of set and get operations and return what each get produced. Collisions share a bucket, so a get has to walk the chain — which is why load factor decides whether lookup stays near O(1).",
    entry: "hashTable",
    starter: `/**
 * @param {number} buckets - number of buckets.
 * @param {(key: string) => number} hash - already reduced into [0, buckets).
 * @param {Array<[string, string, any]>} ops - ['set', key, value] | ['get', key].
 * @returns {any[]} one entry per get: the stored value, or null if absent.
 */
function hashTable(buckets, hash, ops) {
  // Each bucket holds a chain of [key, value] pairs. A set for an existing key
  // must overwrite it rather than append a second copy.
}
`,
    tests: [
      {
        name: "set then get",
        body: `var h = function (k) { return k.length % 4; };
assertEquals(solution(4, h, [['set', 'a', 1], ['get', 'a']]), [1]);`,
      },
      {
        name: "missing key returns null",
        body: `var h = function (k) { return k.length % 4; };
assertEquals(solution(4, h, [['get', 'nope']]), [null]);`,
      },
      {
        name: "colliding keys stay distinct",
        body: `var h = function () { return 0; };
assertEquals(solution(4, h, [['set', 'a', 1], ['set', 'b', 2], ['get', 'a'], ['get', 'b']]), [1, 2]);`,
      },
      {
        name: "setting an existing key overwrites",
        body: `var h = function () { return 0; };
assertEquals(solution(4, h, [['set', 'a', 1], ['set', 'a', 9], ['get', 'a']]), [9]);`,
      },
      {
        name: "overwrite does not duplicate the entry",
        body: `var h = function () { return 0; };
assertEquals(solution(1, h, [['set', 'a', 1], ['set', 'a', 2], ['set', 'b', 3], ['get', 'a'], ['get', 'b']]), [2, 3]);`,
      },
      {
        name: "stores falsy values faithfully",
        body: `var h = function () { return 0; };
assertEquals(solution(2, h, [['set', 'a', 0], ['get', 'a']]), [0]);`,
      },
      {
        name: "single bucket still behaves correctly",
        body: `var h = function () { return 0; };
var ops = [];
for (var i = 0; i < 300; i++) ops.push(['set', 'k' + i, i]);
ops.push(['get', 'k299'], ['get', 'k0']);
assertEquals(solution(1, h, ops), [299, 0]);`,
      },
    ],
    hints: [
      "Make an array of empty arrays up front, one chain per bucket.",
      "For a set, scan the chain for the key first: if you find it, replace the value in place.",
      "A stored value can legitimately be 0 or false, so test whether the key was found, not whether the value is truthy.",
    ],
    reference: `function hashTable(buckets, hash, ops) {
  const table = Array.from({ length: buckets }, () => []);
  const out = [];
  for (const [op, key, value] of ops) {
    const chain = table[hash(key)];
    const at = chain.findIndex((pair) => pair[0] === key);
    if (op === 'set') {
      if (at >= 0) chain[at][1] = value;
      else chain.push([key, value]);
    } else {
      // Check the index, not the value: a stored 0 or false is still a hit.
      out.push(at >= 0 ? chain[at][1] : null);
    }
  }
  return out;
}
`,
  },
};
