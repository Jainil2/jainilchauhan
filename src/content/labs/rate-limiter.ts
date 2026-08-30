import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "rate-limiter",
  title: "Rate Limiter Showdown",
  category: "Distributed Systems",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "Token Bucket vs Leaky Bucket vs Fixed Window vs Sliding Log.",
  caption:
    "Fire single requests or 20-request bursts. Watch how each rate-limiter strategy responds — the same traffic, four different verdicts. Pick the one that matches your tolerance for bursts vs smoothness.",
  skillTags: ["System Design", "Distributed Systems"],
  bridgesFrom: [
    {
      slug: "queue",
      sameness:
        "The leaky bucket IS the FIFO queue you built: enqueue on arrival, dequeue from the front, reject when it is full. The token bucket is the same structure read from the other side — capacity that refills instead of drains.",
      delta:
        "The dequeue is driven by a clock rather than by a consumer asking for work, so queue depth is no longer bookkeeping — it is latency the caller is paying, and a full queue is a 429 someone receives rather than an exception you catch. Sizing the bucket is deciding how much burst you convert into delay before you convert it into refusal. Across a cluster the structure has to be shared, so the counter moves into Redis and every decision buys a network round trip.",
    },
  ],
  concept:
    "Rate limiting protects a service from being overwhelmed. The four common strategies trade bursts vs smoothness vs memory:\n\n• Token Bucket — tokens refill at a steady rate up to a cap; each request consumes one. Allows bursts up to the cap. Used by Stripe, AWS, GCP.\n• Leaky Bucket — requests enter a FIFO queue that drains at a fixed rate. Smooths output; excess overflows. Common in network shapers.\n• Fixed Window — count requests per N-second window; reset on tick. Simple but allows 2× burst at the window boundary.\n• Sliding Log/Window — track request timestamps and only count those in the last N seconds. Most accurate, costs memory per request.\n\nDistributed rate limiting (across a cluster) usually centralizes counters in Redis (INCR + EXPIRE) or uses a probabilistic approximation per node.",
  complexity: [
    { operation: "Token Bucket allow?", time: "O(1)", space: "O(1) per key" },
    { operation: "Sliding Log allow?", time: "O(log N)", space: "O(N) per key" },
  ],
  codeSnippet: {
    language: "ts",
    code: `class TokenBucket {
  private tokens: number;
  private last = Date.now();
  constructor(private capacity: number, private refillPerSec: number) {
    this.tokens = capacity;
  }
  allow(): boolean {
    const now = Date.now();
    const dt = (now - this.last) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + dt * this.refillPerSec);
    this.last = now;
    if (this.tokens >= 1) { this.tokens -= 1; return true; }
    return false; // 429
  }
}`,
  },
  realWorld: [
    "Stripe API: token-bucket per API key, 100 req/s with burst.",
    "AWS API Gateway: token-bucket with regional quotas.",
    "Cloudflare: sliding-window per zone + token-bucket per IP.",
    "Linux tc (traffic control): leaky-bucket-style token bucket filter (TBF).",
  ],
  pitfalls: [
    "Fixed window allows up to 2× the limit at the window boundary — switch to sliding for strict caps.",
    "Distributed rate limiting on Redis without Lua scripts can race — use atomic INCRBY + TTL.",
    "Per-IP limits can be defeated by NAT/CGNAT — combine with per-account where possible.",
  ],
  usedBy: [
    {
      company: "Stripe",
      product: "API rate limiting",
      usage:
        "Stripe runs multiple limiter types (request-rate, concurrency, fleet-usage load shedders) built on token buckets in Redis.",
      href: "https://stripe.com/blog/rate-limiters",
    },
    {
      company: "GitHub",
      product: "REST & GraphQL API quotas",
      usage:
        "Primary and secondary limits are exposed via x-ratelimit headers so clients can back off before being blocked.",
      href: "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
    },
    {
      company: "Cloudflare",
      product: "Rate limiting rules at the edge",
      usage:
        "Counters are evaluated per-colo at the edge so abusive traffic is dropped before it reaches the origin.",
      href: "https://developers.cloudflare.com/waf/rate-limiting-rules/",
    },
    {
      company: "Google",
      product: "Cloud APIs quota & Envoy token buckets",
      usage:
        "Service meshes enforce per-client token buckets so one noisy tenant cannot exhaust shared capacity.",
      href: "https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/local_rate_limit_filter",
    },
  ],
  references: [
    {
      label: "Stripe — scaling your API with rate limiters",
      href: "https://stripe.com/blog/rate-limiters",
    },
    {
      label: "GitHub — REST API rate limits",
      href: "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
    },
    {
      label: "RFC 6585 — 429 Too Many Requests",
      href: "https://datatracker.ietf.org/doc/html/rfc6585#section-4",
    },
  ],
  challenge: {
    prompt:
      "Implement a token bucket. Given a bucket size, a refill rate in tokens per second, and a list of request timestamps in milliseconds, return which requests are allowed. The same maths caps spend on a per-tenant LLM budget — swap tokens-per-second for dollars-per-minute and nothing else changes.",
    entry: "allow",
    starter: `/**
 * @param {number} capacity - bucket size, and the starting number of tokens.
 * @param {number} refillPerSec - tokens added per second, fractional between requests.
 * @param {number[]} timesMs - request timestamps in ms, ascending. Each costs 1 token.
 * @returns {boolean[]} one verdict per request, in order.
 */
function allow(capacity, refillPerSec, timesMs) {
  // The bucket starts full. Between two requests it gains
  // elapsedSeconds * refillPerSec tokens, but never goes above capacity.
}
`,
    tests: [
      {
        name: "a full bucket absorbs a burst up to capacity",
        body: `assertEquals(solution(3, 1, [0, 0, 0]), [true, true, true]);`,
      },
      {
        name: "rejects once the bucket is empty",
        body: `assertEquals(solution(3, 1, [0, 0, 0, 0]), [true, true, true, false]);`,
      },
      {
        name: "refills over time",
        body: `assertEquals(solution(1, 1, [0, 500, 1000]), [true, false, true]);`,
      },
      {
        name: "fractional refill accumulates across gaps",
        body: `// Two 250ms gaps at 2/sec are half a token each; together they buy one.
assertEquals(solution(2, 2, [0, 0, 250, 500]), [true, true, false, true]);`,
      },
      {
        name: "never refills above capacity",
        body: `// Idle for 10s at 10/sec would be 100 tokens; the bucket still holds 2.
assertEquals(solution(2, 10, [0, 0, 10000, 10000, 10000]), [true, true, true, true, false]);`,
      },
      {
        name: "handles no requests",
        body: `assertEquals(solution(5, 1, []), []);`,
      },
      {
        name: "a zero-capacity bucket allows nothing",
        body: `assertEquals(solution(0, 5, [0, 1000]), [false, false]);`,
      },
    ],
    hints: [
      "Track two things between requests: how many tokens are left, and when you last looked.",
      "Tokens gained = (now - lastChecked) / 1000 * refillPerSec. Cap the result at `capacity`.",
      "Only subtract a token when the request is allowed — a rejected request costs nothing.",
    ],
    reference: `function allow(capacity, refillPerSec, timesMs) {
  let tokens = capacity;
  let last = timesMs.length ? timesMs[0] : 0;

  return timesMs.map((now) => {
    // Refill for the time that passed, then clamp — a bucket left alone for an
    // hour is still just full, which is what stops long idles becoming bursts.
    tokens = Math.min(capacity, tokens + ((now - last) / 1000) * refillPerSec);
    last = now;
    if (tokens >= 1) {
      tokens -= 1;
      return true;
    }
    return false;
  });
}
`,
  },
};
