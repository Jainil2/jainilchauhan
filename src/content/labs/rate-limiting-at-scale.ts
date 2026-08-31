import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "rate-limiting-at-scale",
  title: "Rate Limiting at Scale",
  category: "System Design",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "The token bucket is easy. Making one bucket out of forty machines is the hard part.",
  caption:
    "Four edge nodes, each running the same 100 req/s token bucket you already built. The demo opens on the naive deployment — every node keeps a full-size local bucket — and the customer sails through at 400 req/s while every node reports it is enforcing the limit.",
  skillTags: ["System Design", "Rate Limiting", "Distributed Systems", "Caching"],
  bridgesFrom: [
    {
      slug: "rate-limiter",
      sameness:
        "It IS the token bucket from the rate limiter lab, unchanged: capacity, refill rate, take one token or reject. The algorithm you wrote is the algorithm running in production at Stripe and Cloudflare — nobody replaces it at scale.",
      delta:
        "The bucket now lives on N machines instead of one, and a bucket is mutable shared state. Replicate it and you have multiplied the limit by N; centralise it and every request pays a network round trip to a store that is now on the critical path of your entire fleet. The algorithm was never the problem — where the counter lives is.",
    },
    {
      slug: "consistent-hashing",
      sameness:
        "The fix for a shared counter is the ring you already built: hash the rate-limit key, and let the hash decide which node owns that key's bucket. One owner per key means one bucket per key, which is the property the whole scheme needs.",
      delta:
        "A rate-limit key is far hotter than a cache key — one abusive customer is one key, and that key's owner takes the entire flood alone. Cache hotspots cost you a slow node; rate-limit hotspots cost you the node that was supposed to stop the flood.",
    },
  ],
  concept:
    "A single-process rate limiter is fifteen lines. The moment you run more than one process, the counter becomes shared mutable state and every distributed-systems problem you know arrives at once.\n\nThe naive deployment gives each node its own full-size bucket. A limit of 100 req/s across 4 nodes is really 400 req/s for anyone whose traffic spreads across all four — which, behind a load balancer, is everyone. The fix that costs nothing is to divide: each node enforces limit/N. That is correct in aggregate but wrong in detail, because traffic is never distributed evenly; a customer whose requests land 70/30 across two nodes gets throttled at 30% utilisation while the fleet is nowhere near the limit.\n\nCentralising fixes the accuracy and buys a new problem. A Redis INCR with an expiry is the standard implementation, and at 1M req/s it is 1M Redis operations per second plus a round trip — typically 0.5–2 ms — on every single request, including the 99.9% that will be allowed. If that Redis is unreachable, you must decide in advance whether to fail open (let everything through, and lose the protection exactly when you might need it) or fail closed (reject everything, and turn a cache outage into a total outage). Almost everyone fails open, and almost everyone regrets it once.\n\nThe deployment that actually scales is a hybrid: each node keeps a local token bucket sized to its recent share of traffic, and asynchronously reconciles with a central store every few hundred milliseconds. Cloudflare and Stripe both describe variants of this. It is approximate — a burst can overshoot for one reconciliation window — and that is fine, because the point of a rate limiter is protecting a resource, not counting exactly.\n\nOne more thing decides whether any of this works: what the key is. Rate limiting by IP throttles a whole office behind one NAT gateway while a botnet with 10,000 addresses is untouched. Real systems key on the authenticated principal — API key, account, tenant — and treat IP as a last resort for unauthenticated traffic only.",
  complexity: [
    { operation: "Local bucket check", time: "O(1)", space: "O(keys per node)" },
    { operation: "Central check (Redis)", time: "O(1) + 1 RTT", space: "O(keys)" },
    { operation: "Hybrid reconcile", time: "O(keys) per window", space: "O(keys per node)" },
    { operation: "Owner lookup on the ring", time: "O(log vnodes)", space: "O(vnodes)" },
  ],
  codeSnippet: {
    language: "py",
    code: `# Atomic token bucket in Redis. The Lua script matters: read-modify-write
# from the client is a race, and the race is exactly the over-admission you
# are trying to prevent.
BUCKET = """
local tokens_key = KEYS[1]
local ts_key     = KEYS[2]
local rate       = tonumber(ARGV[1])   -- tokens per second
local capacity   = tonumber(ARGV[2])
local now        = tonumber(ARGV[3])

local tokens = tonumber(redis.call("get", tokens_key)) or capacity
local last   = tonumber(redis.call("get", ts_key)) or now

-- Refill by elapsed time, never above capacity.
tokens = math.min(capacity, tokens + (now - last) * rate)

local allowed = tokens >= 1
if allowed then tokens = tokens - 1 end

-- TTL = time to refill from empty, so idle keys evict themselves.
local ttl = math.ceil(capacity / rate) * 2
redis.call("setex", tokens_key, ttl, tokens)
redis.call("setex", ts_key,     ttl, now)
return allowed and 1 or 0
"""

def allow(key, rate, capacity):
    try:
        return redis.eval(BUCKET, 2, f"{key}:t", f"{key}:ts",
                          rate, capacity, time.time()) == 1
    except RedisError:
        # Fail open: a limiter outage must not become a site outage. Decide
        # this deliberately -- it is the difference between degraded and down.
        return True`,
  },
  realWorld: [
    "Stripe runs several limiters in series — a request-rate limiter, a concurrency limiter, and a fleet-usage load shedder — because they fail differently.",
    "Cloudflare's rate limiting counts in a sliding window approximated from two fixed windows, which needs one counter instead of a list of timestamps per key.",
    "GitHub returns the limit, remaining count and reset timestamp on every API response, so clients can pace themselves instead of discovering the limit by getting 429s.",
  ],
  pitfalls: [
    "Giving each node the full limit. A '100 req/s' limit silently becomes 100 × node-count, and every node's dashboard says it is enforcing correctly.",
    "Read-modify-write against the counter store from the application. Two nodes read 99, both write 100, both admit — use an atomic script or an INCR.",
    "Keying on IP address. One NATed office shares one key while a distributed abuser has thousands, so the limiter punishes exactly the wrong traffic.",
    "No 429 response contract. Without Retry-After and remaining-quota headers, well-behaved clients retry immediately and turn throttling into a retry storm.",
  ],
  usedBy: [
    {
      company: "Stripe",
      product: "API rate limiters",
      usage:
        "Layers a request-rate limiter, a concurrency limiter and a load shedder that reserves capacity for critical traffic, all backed by Redis.",
      href: "https://stripe.com/blog/rate-limiters",
    },
    {
      company: "Cloudflare",
      product: "Rate Limiting",
      usage:
        "Approximates a sliding window from two fixed-window counters so each key costs one number rather than a list of request timestamps.",
      href: "https://blog.cloudflare.com/counting-things-a-lot-of-different-things/",
    },
    {
      company: "GitHub",
      product: "REST API",
      usage:
        "Publishes per-principal quotas with x-ratelimit-remaining and reset headers so clients pace themselves before being throttled.",
      href: "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
    },
  ],
  references: [
    {
      label: "Stripe — Scaling your API with rate limiters",
      href: "https://stripe.com/blog/rate-limiters",
    },
    {
      label: "Cloudflare — How we built rate limiting capable of scaling to millions of domains",
      href: "https://blog.cloudflare.com/counting-things-a-lot-of-different-things/",
    },
  ],
  challenge: {
    prompt:
      "Implement a sharded token bucket. Every node runs the same bucket you already wrote, but the fleet-wide capacity and refill rate are divided by the node count so N nodes together enforce one limit rather than N of them. Each request arrives at a specific node with a key and a timestamp in seconds; return an array of booleans, one per request, saying whether it was admitted. A bucket starts full at its share, refills at share-rate per second of elapsed time, and never exceeds its share.",
    entry: "admit",
    starter: `/**
 * @param {Array<{key: string, node: number, t: number}>} requests - in time order.
 * @param {number} capacity - fleet-wide burst capacity, in tokens.
 * @param {number} refillPerSec - fleet-wide refill rate, in tokens per second.
 * @param {number} nodes - how many nodes share the limit.
 * @returns {boolean[]} admitted flag per request, in the same order.
 */
function admit(requests, capacity, refillPerSec, nodes) {
  // One bucket per (node, key). Each holds capacity/nodes tokens and refills
  // at refillPerSec/nodes -- divide the budget, do not copy it.
}
`,
    tests: [
      {
        name: "a single node behaves exactly like the plain token bucket",
        body: `var r = [];
for (var i = 0; i < 5; i++) r.push({ key: "a", node: 0, t: 0 });
assertEquals(solution(r, 3, 1, 1), [true, true, true, false, false]);`,
      },
      {
        name: "the budget is divided, not copied",
        body: `// Fleet capacity 4 across 2 nodes = 2 tokens per node. All traffic lands on
// node 0, so only 2 requests get through.
var r = [];
for (var i = 0; i < 4; i++) r.push({ key: "a", node: 0, t: 0 });
assertEquals(solution(r, 4, 1, 2), [true, true, false, false]);`,
      },
      {
        name: "the whole fleet together still admits the full burst",
        body: `var r = [
  { key: "a", node: 0, t: 0 },
  { key: "a", node: 1, t: 0 },
  { key: "a", node: 0, t: 0 },
  { key: "a", node: 1, t: 0 },
];
assertEquals(solution(r, 4, 1, 2), [true, true, true, true]);`,
      },
      {
        name: "tokens refill with elapsed time",
        body: `// Share = 1 token, refilling at 1/sec.
var r = [
  { key: "a", node: 0, t: 0 },
  { key: "a", node: 0, t: 0 },
  { key: "a", node: 0, t: 1 },
];
assertEquals(solution(r, 1, 1, 1), [true, false, true]);`,
      },
      {
        name: "refill never exceeds the share",
        body: `// Idle for an hour, then a burst: capacity still caps it at 2.
var r = [
  { key: "a", node: 0, t: 0 },
  { key: "a", node: 0, t: 3600 },
  { key: "a", node: 0, t: 3600 },
  { key: "a", node: 0, t: 3600 },
];
assertEquals(solution(r, 2, 1, 1), [true, true, true, false]);`,
      },
      {
        name: "keys are independent",
        body: `var r = [
  { key: "a", node: 0, t: 0 },
  { key: "b", node: 0, t: 0 },
  { key: "a", node: 0, t: 0 },
];
assertEquals(solution(r, 1, 1, 1), [true, true, false]);`,
      },
      {
        name: "nodes are independent, which is how skew starves a customer",
        body: `// Fleet capacity 2 over 2 nodes. Node 0 is exhausted while node 1 is idle,
// and nothing moves the spare token across.
var r = [
  { key: "a", node: 0, t: 0 },
  { key: "a", node: 0, t: 0 },
  { key: "a", node: 1, t: 0 },
];
assertEquals(solution(r, 2, 2, 2), [true, false, true]);`,
      },
      {
        name: "no requests",
        body: `assertEquals(solution([], 10, 10, 4), []);`,
      },
      {
        name: "a share below one token admits nothing",
        body: `// Capacity 1 across 4 nodes = 0.25 tokens each: never enough for a request.
var r = [{ key: "a", node: 0, t: 0 }, { key: "a", node: 1, t: 0 }];
assertEquals(solution(r, 1, 1, 4), [false, false]);`,
      },
      {
        name: "handles a realistic request volume",
        body: `// One customer, 50k requests spread evenly over 8 nodes, all at t = 0.
var r = [];
for (var i = 0; i < 50000; i++) r.push({ key: "acct-1", node: i % 8, t: 0 });
var out = solution(r, 800, 800, 8);
var allowed = 0;
for (var j = 0; j < out.length; j++) if (out[j]) allowed++;
// 100 tokens per node x 8 nodes = exactly the fleet burst capacity, once.
assertEquals(allowed, 800);`,
      },
    ],
    hints: [
      "Compute the per-node share once: capacity / nodes for the ceiling, refillPerSec / nodes for the rate.",
      "Key your state map on node and key together — two different nodes holding the same customer's key are two different buckets, and that is the whole point.",
      "Refill before you spend: tokens = min(share, tokens + (t - last) * shareRate), then take one only if at least one is there.",
    ],
    reference: `function admit(requests, capacity, refillPerSec, nodes) {
  // Divide the fleet budget. Copying it to every node is the bug this whole
  // lab is about: N nodes each enforcing the full limit enforce N times it.
  const share = capacity / nodes;
  const shareRate = refillPerSec / nodes;

  const buckets = new Map();
  const out = [];

  for (const req of requests) {
    // The bucket identity is (node, key). A customer spread across nodes has
    // one bucket per node, which is why uneven routing throttles early.
    const id = req.node + "\\u0000" + req.key;
    let b = buckets.get(id);
    if (!b) {
      b = { tokens: share, last: req.t };
      buckets.set(id, b);
    }

    // Refill for elapsed time, capped at the share.
    b.tokens = Math.min(share, b.tokens + (req.t - b.last) * shareRate);
    b.last = req.t;

    if (b.tokens >= 1) {
      b.tokens -= 1;
      out.push(true);
    } else {
      out.push(false);
    }
  }

  return out;
}
`,
  },
};
