import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "lru-cache",
  title: "LRU Cache",
  category: "Data Structures",
  difficulty: "Beginner",
  readingTimeMin: 3,
  blurb: "Doubly-linked list + hash map = O(1) eviction.",
  caption:
    "Click any key to access it. Recent keys move to the head; the tail gets evicted when capacity is exceeded.",
  whereUsed: { label: "Session cache layer", href: "/#projects" },
  skillTags: ["DSA", "Redis", "System Design"],
  concept:
    "An LRU (Least-Recently-Used) cache evicts the entry that hasn't been touched for the longest time. The classic O(1) implementation pairs a hash map (key → list node) with a doubly-linked list (most-recent at head, least-recent at tail).\n\nGet: hash-lookup → unlink the node → push to head. Put: if key exists, update + push to head; if at capacity, evict the tail. Both are O(1) because every operation is a constant number of pointer rewires plus a hash op.\n\nLRU is the default eviction policy for most caches because it captures temporal locality cheaply. Variants like LRU-K, ARC, and 2Q add scan resistance for workloads where one-shot reads would otherwise pollute the cache.",
  complexity: [
    { operation: "Get", time: "O(1)", space: "O(capacity)" },
    { operation: "Put", time: "O(1)", space: "O(1) per entry" },
  ],
  codeSnippet: {
    language: "ts",
    code: `class LRU<K, V> {
  private map = new Map<K, V>();
  constructor(private capacity: number) {}
  get(k: K): V | undefined {
    if (!this.map.has(k)) return undefined;
    const v = this.map.get(k)!;
    this.map.delete(k); // re-insert to move to most-recent
    this.map.set(k, v);
    return v;
  }
  put(k: K, v: V) {
    if (this.map.has(k)) this.map.delete(k);
    else if (this.map.size >= this.capacity) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
    this.map.set(k, v);
  }
}`,
  },
  realWorld: [
    "Redis: maxmemory-policy allkeys-lru / volatile-lru.",
    "Linux page cache uses a 2-list LRU (active + inactive).",
    "Caffeine (JVM) uses Window-TinyLFU, an LRU evolution that beats LRU on most traces.",
    "Browser HTTP caches use LRU-style eviction inside the disk cache.",
  ],
  pitfalls: [
    "JS Map insertion order gives you LRU 'for free' — but only single-threaded; use a real lock for shared state.",
    "Pure LRU is fooled by sequential scans — one big read kicks out hot keys. Reach for ARC/SLRU/W-TinyLFU.",
    "Don't forget TTLs — LRU evicts by recency, not freshness; stale data lives until pushed out.",
  ],
  references: [
    { label: "LeetCode 146 — LRU Cache", href: "https://leetcode.com/problems/lru-cache/" },
  ],
  usedBy: [
    {
      company: "Redis",
      product: "maxmemory eviction policies",
      usage:
        "Redis approximates LRU with random sampling (and offers LFU) because exact recency ordering costs memory per key.",
      href: "https://redis.io/docs/latest/develop/reference/eviction/",
    },
    {
      company: "Cloudflare",
      product: "Edge cache tiers",
      usage:
        "Hot objects stay in memory/SSD at the PoP under recency-based eviction; cold objects fall through to origin.",
      href: "https://developers.cloudflare.com/cache/concepts/default-cache-behavior/",
    },
    {
      company: "Oracle / MySQL",
      product: "InnoDB buffer pool",
      usage:
        "A midpoint-insertion LRU list keeps hot pages resident and protects them from a full-table scan flushing the pool.",
      href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-buffer-pool.html",
    },
    {
      company: "Google",
      product: "Chrome HTTP disk cache",
      usage:
        "Cached responses are evicted in recency order once the disk cache hits its size budget.",
    },
  ],
};
