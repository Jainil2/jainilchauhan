import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "circuit-breaker",
  title: "Circuit Breaker",
  category: "Distributed Systems",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Fail fast when a dependency is unhealthy instead of piling on retries.",
  caption:
    "Increase downstream failure rate and call the service. After repeated failures, the breaker opens, blocks requests, and probes with half-open recovery.",
  skillTags: ["Distributed Systems", "Resilience", "Backend"],
  bridgesFrom: [
    {
      slug: "rate-limiter",
      sameness:
        "It IS admission control in front of a call: count events in a recent window, compare against a threshold, and reject before doing any work. The failure counter is the same sliding window you implemented, and the open state is the same immediate rejection.",
      delta:
        "The threshold is derived from the callee's observed health rather than fixed by policy, so the limiter tightens itself — and it must then decide when to loosen again, which is what half-open is for. That adds a failure a rate limiter cannot have: a breaker that never probes starves a dependency that recovered, so the system stays down after the outage ended.",
    },
  ],
  concept:
    "A circuit breaker protects callers from repeatedly waiting on a failing dependency. In the closed state, requests pass through. After enough failures, the breaker opens and fails fast. After a cooldown, it enters half-open and allows a small number of probe requests. A successful probe closes the circuit; another failure opens it again.\n\nThis pattern turns slow cascading failure into bounded degradation. It is usually paired with timeouts, bulkheads, fallback responses, retry budgets, and observability.",
  complexity: [
    { operation: "Record result", time: "O(1)", space: "O(1) or rolling window" },
    { operation: "Allow/deny call", time: "O(1)", space: "O(1)" },
  ],
  realWorld: [
    "Hystrix popularized the pattern; Resilience4j, Envoy, Linkerd, and Istio implement variants.",
    "Payment, search, recommendation, and email services often use fallbacks behind breakers.",
  ],
  pitfalls: [
    "A breaker without timeouts still lets calls hang.",
    "Aggressive retry plus open breakers can produce traffic bursts during recovery.",
    "Fallbacks must be intentionally degraded, not silently wrong.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// closed -> (failures exceed threshold) -> open -> (after cooldown) -> half-open
class CircuitBreaker {
  private state: "closed" | "open" | "half-open" = "closed";
  private failures = 0;
  private openedAt = 0;
  constructor(private threshold = 5, private cooldownMs = 10_000) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.openedAt < this.cooldownMs) throw new Error("circuit open"); // fail fast
      this.state = "half-open"; // let one probe through
    }
    try {
      const out = await fn();
      this.failures = 0;
      this.state = "closed";
      return out;
    } catch (err) {
      if (++this.failures >= this.threshold || this.state === "half-open") {
        this.state = "open";
        this.openedAt = Date.now();
      }
      throw err;
    }
  }
}`,
  },
  usedBy: [
    {
      company: "Netflix",
      product: "Hystrix / resilience tooling",
      usage:
        "Netflix popularised circuit breakers with Hystrix so one failing dependency degrades instead of collapsing the API.",
      href: "https://netflixtechblog.com/introducing-hystrix-for-resilience-engineering-13531c1ab362",
    },
    {
      company: "Google / CNCF",
      product: "Envoy outlier detection",
      usage:
        "Envoy ejects hosts that exceed error thresholds and re-admits them gradually — a breaker per upstream host.",
      href: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/outlier",
    },
    {
      company: "Amazon",
      product: "Retry, backoff and brownout guidance",
      usage:
        "The Builders' Library documents fail-fast and load-shedding patterns to prevent retry storms during partial failure.",
      href: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
    },
    {
      company: "Shopify",
      product: "Semian resiliency library",
      usage:
        "Shopify open-sourced circuit breakers plus bulkheads for MySQL/Redis/HTTP calls in the storefront path.",
      href: "https://github.com/Shopify/semian",
    },
  ],
  references: [
    {
      label: "Martin Fowler — CircuitBreaker",
      href: "https://martinfowler.com/bliki/CircuitBreaker.html",
    },
    {
      label: "AWS Builders' Library — Timeouts, retries and backoff with jitter",
      href: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
    },
    {
      label: "Envoy — outlier detection",
      href: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/outlier",
    },
  ],
  challenge: {
    prompt:
      "Run the circuit breaker state machine and report its state after each call. Closed lets traffic through, open fails fast without touching the dependency, half-open lets a single probe decide. Failing fast is the whole point: retrying a dead dependency turns its outage into yours.",
    entry: "runBreaker",
    starter: `/**
 * @param {Array<['call'|'tick', boolean|number]>} events
 *   ['call', succeeded] attempts a call; ['tick', ms] advances time.
 * @param {number} threshold - consecutive failures that trip the breaker.
 * @param {number} cooldown - ms open before it moves to half-open.
 * @returns {string[]} state after each event: 'closed', 'open' or 'half-open'.
 *   A call while open is rejected and changes nothing. A successful half-open
 *   probe closes the breaker; a failed one opens it again.
 */
function runBreaker(events, threshold, cooldown) {
  // Consecutive failures, not total. One success resets the count.
}
`,
    tests: [
      {
        name: "successes keep it closed",
        body: `assertEquals(solution([['call', true], ['call', true]], 2, 1000), ['closed', 'closed']);`,
      },
      {
        name: "consecutive failures trip it",
        body: `assertEquals(solution([['call', false], ['call', false]], 2, 1000), ['closed', 'open']);`,
      },
      {
        name: "a success resets the streak",
        body: `assertEquals(solution([['call', false], ['call', true], ['call', false]], 2, 1000), ['closed', 'closed', 'closed']);`,
      },
      {
        name: "cooldown moves it to half-open",
        body: `assertEquals(solution([['call', false], ['tick', 1000]], 1, 1000), ['open', 'half-open']);`,
      },
      {
        name: "a good probe closes it",
        body: `assertEquals(solution([['call', false], ['tick', 1000], ['call', true]], 1, 1000), ['open', 'half-open', 'closed']);`,
      },
      {
        name: "a bad probe reopens it",
        body: `assertEquals(solution([['call', false], ['tick', 1000], ['call', false]], 1, 1000), ['open', 'half-open', 'open']);`,
      },
      {
        name: "calls while open change nothing",
        body: `assertEquals(solution([['call', false], ['call', true]], 1, 1000), ['open', 'open']);`,
      },
      {
        name: "a partial cooldown is not enough",
        body: `assertEquals(solution([['call', false], ['tick', 500]], 1, 1000), ['open', 'open']);`,
      },
    ],
    hints: [
      "Track the state, the consecutive failure count, and how long the breaker has been open.",
      "While open, a call is rejected outright — do not let it touch the failure count.",
      "In half-open a single call decides: success closes and resets, failure reopens and restarts the cooldown.",
    ],
    reference: `function runBreaker(events, threshold, cooldown) {
  let state = 'closed';
  let failures = 0;
  let openFor = 0;
  const out = [];

  for (const [kind, arg] of events) {
    if (kind === 'tick') {
      if (state === 'open') {
        openFor += arg;
        if (openFor >= cooldown) state = 'half-open';
      }
    } else if (state === 'open') {
      // Rejected without touching the dependency -- that is 'fail fast'.
    } else if (state === 'half-open') {
      if (arg) {
        state = 'closed';
        failures = 0;
      } else {
        state = 'open';
        openFor = 0;
      }
    } else {
      // Consecutive, not cumulative: one success clears the streak.
      if (arg) failures = 0;
      else if (++failures >= threshold) {
        state = 'open';
        openFor = 0;
      }
    }
    out.push(state);
  }
  return out;
}
`,
  },
};
