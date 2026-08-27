import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "backpressure",
  title: "Backpressure",
  category: "Distributed Systems",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Keep producers from overwhelming consumers with buffers, drops, or throttling.",
  caption:
    "Adjust producer and consumer rates, then compare buffering, dropping, and throttling policies. Watch queue growth expose overload.",
  skillTags: ["Distributed Systems", "Streaming", "Backend"],
  concept:
    "Backpressure is the signal that a downstream component cannot keep up. Without it, queues grow until latency explodes or memory is exhausted. Systems respond by buffering, dropping low-value work, slowing producers, applying rate limits, or splitting load across more consumers.\n\nGood backpressure is explicit and measurable: queue depth, lag, max in-flight requests, bounded buffers, deadlines, and rejection rates. It changes overload from hidden collapse into a controlled product decision.",
  complexity: [
    { operation: "Enqueue/dequeue", time: "O(1)", space: "O(buffer)" },
    { operation: "Throttle decision", time: "O(1)", space: "O(1)" },
  ],
  realWorld: [
    "Kafka consumer lag, Node streams, TCP flow control, Reactive Streams, async worker queues, and API rate limits.",
  ],
  pitfalls: [
    "Unbounded queues trade visible errors for invisible latency.",
    "Dropping must be safe for the workload.",
    "Autoscaling from queue depth needs cooldowns to avoid oscillation.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Little's law: concurrency = arrival rate x latency.
// If you can't slow arrivals, you must bound concurrency and shed the rest.
class Bulkhead {
  private inflight = 0;
  constructor(private limit: number, private queueLimit: number) {}
  private queue: (() => void)[] = [];

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.inflight >= this.limit) {
      if (this.queue.length >= this.queueLimit) throw new Error("503: shed load"); // fail fast
      await new Promise<void>((r) => this.queue.push(r));
    }
    this.inflight++;
    try {
      return await task();
    } finally {
      this.inflight--;
      this.queue.shift()?.();
    }
  }
}
// Unbounded queues don't remove overload — they convert it into latency and timeouts.`,
  },
  usedBy: [
    {
      company: "Netflix",
      product: "Adaptive concurrency limits",
      usage:
        "Netflix open-sourced TCP-congestion-style adaptive limits that discover a service's safe concurrency at runtime.",
      href: "https://netflixtechblog.medium.com/performance-under-load-3e6fa9a60581",
    },
    {
      company: "Amazon",
      product: "Load shedding & timeout guidance",
      usage:
        "The Builders' Library documents shedding excess work early rather than letting queues absorb overload.",
      href: "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/",
    },
    {
      company: "IETF / all browsers",
      product: "HTTP/2 & gRPC flow control",
      usage:
        "Stream and connection windows are literal backpressure: a receiver advertises how many bytes it can absorb.",
      href: "https://datatracker.ietf.org/doc/html/rfc9113#name-flow-control",
    },
    {
      company: "Reactive Streams / Akka",
      product: "Demand-based stream protocol",
      usage:
        "Subscribers request(n) items, so a fast producer can never overwhelm a slow consumer.",
      href: "https://www.reactive-streams.org/",
    },
  ],
  references: [
    {
      label: "Netflix — performance under load (adaptive concurrency limits)",
      href: "https://netflixtechblog.medium.com/performance-under-load-3e6fa9a60581",
    },
    {
      label: "AWS Builders' Library — using load shedding to avoid overload",
      href: "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/",
    },
    {
      label: "RFC 9113 — HTTP/2 flow control",
      href: "https://datatracker.ietf.org/doc/html/rfc9113#name-flow-control",
    },
  ],
};
