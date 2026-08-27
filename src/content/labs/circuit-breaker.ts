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
};
