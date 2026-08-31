import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "caching-layers",
  title: "Caching Layers",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "The same LRU, stacked four deep — and each layer has a different way of being wrong.",
  caption:
    "A fixed request trace running through an in-process L1, a shared L2 and the origin. It opens with a small L1 on a looping access pattern, which is the worst case LRU has: the hit rate on the top layer is zero, and every request pays the network hop to L2 anyway.",
  skillTags: ["System Design", "Caching", "Performance"],
  bridgesFrom: [
    {
      slug: "lru-cache",
      sameness:
        "Every box in the diagram is the LRU cache you built. The process-local cache, the Redis cluster, the CDN edge — same hash map, same recency list, same eviction rule. A four-layer cache hierarchy is four instances of one data structure.",
      delta:
        "Layers have wildly different latencies (100ns, 1ms, 40ms) and different lifetimes, so the number that matters stops being hit rate and becomes the weighted average of the misses. And a second copy of a value means a second thing to invalidate: a write now has to be undone in every layer that holds it, and the layer you forget is the one serving stale data.",
    },
  ],
  concept:
    "Every layer of a cache hierarchy is the same LRU. What changes between layers is latency, capacity and blast radius — and those three numbers decide everything about how the stack behaves.\n\nA typical stack is: in-process memory (~100 ns, tiny, per-instance), a shared cache like Redis or Memcached (~0.5–2 ms, large, fleet-wide), then the database (~10–50 ms). The point of the top layer is not capacity — it is that it removes the network hop entirely. The point of the shared layer is that a hundred instances share one copy, so one origin fetch serves the whole fleet. Adding layers only helps if each one is roughly an order of magnitude faster than the one below and gets a meaningful hit rate; a layer that hits 5% of the time is a layer that adds latency to 95% of requests.\n\nThe metric that misleads people is hit rate. What you actually pay is the weighted average: 95% at 1 ms plus 5% at 50 ms is 3.45 ms, so improving the hit rate from 95% to 97% almost halves the effective latency, while pushing 80% to 85% barely moves it. Optimise the misses, not the hits.\n\nThe two classic failures are stampede and staleness. A stampede — 'thundering herd', 'cache stampede' — happens when a hot key expires and every concurrent request misses at once; a key serving 5,000 req/s produces 5,000 simultaneous database queries the instant its TTL fires. Fixes are single-flight (one request fetches, the rest wait on the same promise), stale-while-revalidate (serve the expired value while one worker refreshes), and jittered TTLs so a batch of keys written together does not expire together.\n\nStaleness is the harder one, because it is a correctness bug rather than a load bug. Every extra layer is another copy that a write must reconcile. Invalidation on write is the usual scheme, but it is not atomic: a delete that fails leaves a layer serving old data indefinitely, and a delete that races a concurrent read can be undone by the reader's own write-back. Short TTLs are the boring, load-bearing safety net — they bound how long a missed invalidation can hurt you.",
  complexity: [
    { operation: "L1 lookup (in-process)", time: "O(1), ~100 ns", space: "O(L1 capacity)" },
    { operation: "L2 lookup (shared)", time: "O(1) + 1 RTT, ~1 ms", space: "O(L2 capacity)" },
    { operation: "Origin read", time: "~10–50 ms", space: "O(dataset)" },
    { operation: "Invalidate on write", time: "O(layers)", space: "O(1)" },
  ],
  codeSnippet: {
    language: "ts",
    code: `// Single-flight: the fix for a stampede is not a bigger cache, it is making
// N concurrent misses on one key perform exactly one origin read.
const inflight = new Map<string, Promise<Value>>();

async function get(key: string): Promise<Value> {
  const local = l1.get(key); // ~100ns, per-process
  if (local && !local.expired) return local.value;

  const shared = await l2.get(key); // ~1ms, fleet-wide
  if (shared && !shared.expired) {
    l1.set(key, shared, { ttl: 5_000 }); // short: L1 cannot be invalidated remotely
    return shared.value;
  }

  // Second and later callers await the first caller's promise instead of
  // issuing their own query. 5,000 concurrent misses -> 1 database read.
  let pending = inflight.get(key);
  if (!pending) {
    pending = db
      .read(key)
      .then((value) => {
        // Jitter the TTL so keys written in one batch do not expire in one batch.
        const ttl = 300_000 + (hash(key) % 60_000);
        l2.set(key, value, { ttl });
        l1.set(key, value, { ttl: 5_000 });
        return value;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }
  return pending;
}`,
  },
  realWorld: [
    "Facebook's memcache deployment uses leases to stop stampedes: the first misser gets a token to fill the key, and everyone else waits or serves stale.",
    "Netflix's EVCache keeps replicas in every availability zone so a read never crosses a zone boundary, trading storage for tail latency.",
    "Redis client-side caching (tracking mode) lets the server invalidate an application's local L1, which is otherwise unreachable from outside the process.",
  ],
  pitfalls: [
    "Reporting hit rate instead of effective latency. Going 95% → 97% can halve real latency while 80% → 85% does almost nothing, and the hit-rate chart looks identical.",
    "Uniform TTLs on keys populated together. They expire together, and the cache turns into a synchronised stampede generator once a day.",
    "Caching in-process without a way to invalidate it. A remote purge cannot reach an L1 living in fifty processes, so L1 entries need TTLs measured in seconds.",
    "Write-then-invalidate races. A reader that missed just before the write can repopulate the cache with the old value after the invalidation, and the stale entry lives until its TTL.",
  ],
  usedBy: [
    {
      company: "Meta",
      product: "memcache at Facebook",
      usage:
        "Leases and gutter pools handle stampedes and failed servers; the paper is still the reference description of a fleet-scale look-aside cache.",
      href: "https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170.pdf",
    },
    {
      company: "Netflix",
      product: "EVCache",
      usage:
        "Memcached-based tier replicated per availability zone, sitting between services and Cassandra, sized for tail latency rather than hit rate.",
      href: "https://netflixtechblog.com/caching-for-a-global-netflix-7bcc457012f1",
    },
    {
      company: "Redis",
      product: "Client-side caching",
      usage:
        "Server-assisted tracking invalidates application-local caches, which is the missing piece that makes an in-process L1 safe to keep for longer.",
      href: "https://redis.io/docs/latest/develop/reference/client-side-caching/",
    },
  ],
  references: [
    {
      label: "Scaling Memcache at Facebook (NSDI '13)",
      href: "https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170.pdf",
    },
    {
      label: "Redis — Client-side caching",
      href: "https://redis.io/docs/latest/develop/reference/client-side-caching/",
    },
  ],
  challenge: {
    prompt:
      "Count where a request trace is served from in a two-layer cache. L1 and L2 are both LRU caches. An L1 hit is served immediately. An L1 miss that hits L2 is served from L2 and the key is promoted into L1. A miss in both goes to the origin and the key is inserted into both. Every hit refreshes recency in the layer that served it. Return { l1, l2, origin } counts. A capacity of 0 means that layer stores nothing.",
    entry: "serve",
    starter: `/**
 * @param {string[]} keys - the request trace, in order.
 * @param {number} l1Size - capacity of the in-process cache.
 * @param {number} l2Size - capacity of the shared cache.
 * @returns {{l1: number, l2: number, origin: number}}
 */
function serve(keys, l1Size, l2Size) {
  // Two LRUs. Hits refresh recency; an L2 hit also promotes into L1; a full
  // miss inserts into both.
}
`,
    tests: [
      {
        name: "a cold key comes from the origin",
        body: `assertEquals(solution(["a"], 2, 2), { l1: 0, l2: 0, origin: 1 });`,
      },
      {
        name: "the second request hits L1",
        body: `assertEquals(solution(["a", "a"], 2, 2), { l1: 1, l2: 0, origin: 1 });`,
      },
      {
        name: "a key evicted from L1 is still served by L2",
        body: `// L1 holds one entry, so "b" pushes "a" out of L1 but not out of L2.
assertEquals(solution(["a", "b", "a"], 1, 2), { l1: 0, l2: 1, origin: 2 });`,
      },
      {
        name: "an L2 hit promotes the key into L1",
        body: `assertEquals(solution(["a", "b", "a", "a"], 1, 2), { l1: 1, l2: 1, origin: 2 });`,
      },
      {
        name: "eviction is by recency, not by insertion order",
        body: `// After "a" is re-read, "b" is the least recently used entry in L1, so
// inserting "c" must evict "b" -- not "a".
assertEquals(solution(["a", "b", "a", "c", "b"], 2, 2), { l1: 1, l2: 1, origin: 3 });`,
      },
      {
        name: "a disabled L1 sends everything to the shared layer",
        body: `assertEquals(solution(["a", "a"], 0, 2), { l1: 0, l2: 1, origin: 1 });`,
      },
      {
        name: "no cache at all means every request is an origin read",
        body: `assertEquals(solution(["a", "a", "a"], 0, 0), { l1: 0, l2: 0, origin: 3 });`,
      },
      {
        name: "an empty trace",
        body: `assertEquals(solution([], 4, 8), { l1: 0, l2: 0, origin: 0 });`,
      },
      {
        name: "one hot key is fetched exactly once",
        body: `var trace = [];
for (var i = 0; i < 1000; i++) trace.push("hot");
assertEquals(solution(trace, 1, 1), { l1: 999, l2: 0, origin: 1 });`,
      },
      {
        name: "a looping scan larger than L1 gets a zero percent L1 hit rate",
        body: `// The classic LRU worst case: by the time the loop comes back to a key,
// recency has already evicted it. 20k requests, 500 keys, L1 of 50.
var trace = [];
for (var i = 0; i < 20000; i++) trace.push("k" + (i % 500));
assertEquals(solution(trace, 50, 500), { l1: 0, l2: 19500, origin: 500 });`,
      },
    ],
    hints: [
      "A JavaScript Map already iterates in insertion order, so delete-then-set is a one-line 'touch' and the first key from keys() is the least recently used.",
      "Handle the three cases in order — L1 hit, then L2 hit with promotion, then origin — and make sure every path that serves a value also refreshes recency.",
      "Guard the inserts: with a capacity of 0 there is nothing to evict and nothing to store, so the tier must never hold a key.",
    ],
    reference: `function serve(keys, l1Size, l2Size) {
  // Insertion-ordered Maps give an LRU for free: oldest key first.
  const l1 = new Map();
  const l2 = new Map();

  function touch(cache, key) {
    cache.delete(key);
    cache.set(key, true);
  }

  function insert(cache, key, cap) {
    if (cap <= 0) return; // a disabled tier stores nothing
    cache.delete(key);
    cache.set(key, true);
    while (cache.size > cap) {
      // The first key in iteration order is the least recently used.
      cache.delete(cache.keys().next().value);
    }
  }

  const counts = { l1: 0, l2: 0, origin: 0 };

  for (const key of keys) {
    if (l1.has(key)) {
      counts.l1 += 1;
      touch(l1, key);
      continue;
    }
    if (l2.has(key)) {
      counts.l2 += 1;
      touch(l2, key);
      // Promotion: the next read of this key should not pay the network hop.
      insert(l1, key, l1Size);
      continue;
    }
    counts.origin += 1;
    insert(l2, key, l2Size);
    insert(l1, key, l1Size);
  }

  return counts;
}
`,
  },
};
