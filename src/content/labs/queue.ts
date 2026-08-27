import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "queue",
  title: "Queue",
  category: "Data Structures",
  difficulty: "Beginner",
  readingTimeMin: 3,
  blurb: "First-in, first-out ordering for fair processing.",
  caption:
    "Enqueue work at the back and dequeue from the front. Queue order preserves arrival order for BFS, jobs, and streams.",
  skillTags: ["DSA", "Backend"],
  concept:
    "A queue is a FIFO structure. Producers enqueue at the back; consumers dequeue from the front. This makes queues a natural fit for fair scheduling and breadth-first processing.\n\nQueues can be backed by linked lists, ring buffers, or broker logs. Production queues add persistence, acknowledgements, retries, visibility timeouts, dead-letter queues, and backpressure.",
  complexity: [
    { operation: "Enqueue", time: "O(1)", space: "O(1)" },
    { operation: "Dequeue/peek", time: "O(1)", space: "O(1)" },
  ],
  realWorld: [
    "BFS, worker queues, event loops, message brokers, print queues, and request buffers.",
  ],
  pitfalls: [
    "Unbounded queues hide overload as growing latency.",
    "Array-backed queues must avoid O(n) front shifts; use head/tail indexes.",
    "Distributed queues need idempotent consumers because retries happen.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// O(1) FIFO with head/tail indexes — no O(n) shift() on every dequeue.
export class Queue<T> {
  private items: (T | undefined)[] = [];
  private head = 0;

  enqueue(v: T) { this.items.push(v); }

  dequeue(): T | undefined {
    if (this.head >= this.items.length) return undefined;
    const v = this.items[this.head];
    this.items[this.head++] = undefined; // release reference
    if (this.head > 32 && this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head); // compact rarely
      this.head = 0;
    }
    return v;
  }
}`,
  },
  usedBy: [
    {
      company: "Amazon",
      product: "AWS SQS",
      usage:
        "Standard queues buffer work between producers and consumers with visibility timeouts and dead-letter queues for poison messages.",
      href: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-basic-architecture.html",
    },
    {
      company: "Shopify",
      product: "Sidekiq background jobs",
      usage:
        "Checkout side-effects (emails, webhooks, inventory sync) are enqueued so the request path stays fast and retries are automatic.",
    },
    {
      company: "Google",
      product: "Chrome task queues",
      usage:
        "The event loop drains macrotask and microtask queues in arrival order, which is why a long task delays every queued callback.",
      href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model",
    },
  ],
  references: [
    {
      label: "AWS — SQS basic architecture",
      href: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-basic-architecture.html",
    },
    {
      label: "MDN — JavaScript execution model (task queues)",
      href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model",
    },
  ],
};
