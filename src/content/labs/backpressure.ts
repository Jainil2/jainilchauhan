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
  challenge: {
    prompt:
      "Simulate a bounded queue under a producer that outruns its consumer, and report what got through and what was dropped. An unbounded queue does not remove the problem — it converts dropped messages into unbounded latency and eventually an out-of-memory crash.",
    entry: "simulate",
    starter: `/**
 * @param {number} capacity - queue depth. Zero drops everything.
 * @param {number[]} produced - items produced per tick.
 * @param {number} consumeRate - items consumed per tick, drained BEFORE the
 *   tick's production is enqueued.
 * @returns {{delivered: number, dropped: number, queued: number}}
 */
function simulate(capacity, produced, consumeRate) {
  // Each tick: drain first, then enqueue what fits. Anything that does not fit
  // is dropped, and dropping is a decision, not a failure.
}
`,
    tests: [
      {
        name: "a fast consumer never drops",
        body: `// Draining happens before each tick's production, so the last batch is still
// queued when the run ends. Nothing is ever dropped and depth never exceeds 1.
assertEquals(solution(10, [1, 1, 1], 5), { delivered: 2, dropped: 0, queued: 1 });`,
      },
      {
        name: "a full queue drops the excess",
        body: `assertEquals(solution(2, [5], 0), { delivered: 0, dropped: 3, queued: 2 });`,
      },
      {
        name: "zero capacity drops everything",
        body: `assertEquals(solution(0, [3], 1), { delivered: 0, dropped: 3, queued: 0 });`,
      },
      {
        name: "draining makes room",
        body: `assertEquals(solution(2, [2, 2], 2), { delivered: 2, dropped: 0, queued: 2 });`,
      },
      {
        name: "nothing produced",
        body: `assertEquals(solution(5, [], 1), { delivered: 0, dropped: 0, queued: 0 });`,
      },
      {
        name: "everything conserved",
        body: `var r = solution(3, [4, 4, 4], 1);
assertEquals(r.delivered + r.dropped + r.queued, 12);`,
      },
      {
        name: "sustained overload drops steadily",
        body: `var p = [];
for (var i = 0; i < 100; i++) p.push(10);
var r = solution(5, p, 2);
assert(r.dropped > 700, 'expected heavy drops, got ' + r.dropped);`,
      },
    ],
    hints: [
      "Track the queue depth as a single number; you do not need the items themselves.",
      "Drain first: consume the smaller of consumeRate and the current depth, adding that to delivered.",
      "Then enqueue the smaller of what was produced and the remaining room, dropping the rest.",
    ],
    reference: `function simulate(capacity, produced, consumeRate) {
  let queued = 0;
  let delivered = 0;
  let dropped = 0;

  for (const batch of produced) {
    // Drain before enqueueing, so this tick's consumption makes room.
    const drained = Math.min(consumeRate, queued);
    queued -= drained;
    delivered += drained;

    const room = capacity - queued;
    const accepted = Math.min(batch, room);
    queued += accepted;
    // Shedding load is the deliberate choice: the alternative is unbounded
    // memory and unbounded latency.
    dropped += batch - accepted;
  }
  return { delivered, dropped, queued };
}
`,
  },
};
