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
  challenge: {
    prompt:
      "Build a FIFO queue out of two stacks, and report what each dequeue returns. You may only push and pop the two arrays — no shift, no splice, no indexing. This is how you get amortized O(1) dequeue without shifting every element.",
    entry: "runQueue",
    starter: `/**
 * @param {Array<[string, any]>} ops - operations like ['enqueue', 5] or ['dequeue'].
 * @returns {any[]} one entry per dequeue, in order. Use null when the queue is empty.
 */
function runQueue(ops) {
  const inbox = [];
  const outbox = [];
  // Enqueue pushes onto inbox. Dequeue pops from outbox -- and when outbox is
  // empty, everything in inbox is poured into it first, which reverses the order.
}
`,
    tests: [
      {
        name: "returns items first-in first-out",
        body: `assertEquals(solution([['enqueue', 1], ['enqueue', 2], ['dequeue'], ['dequeue']]), [1, 2]);`,
      },
      {
        name: "interleaves enqueues and dequeues",
        body: `assertEquals(solution([['enqueue', 1], ['dequeue'], ['enqueue', 2], ['enqueue', 3], ['dequeue']]), [1, 2]);`,
      },
      {
        name: "dequeuing an empty queue yields null",
        body: `assertEquals(solution([['dequeue']]), [null]);`,
      },
      {
        name: "drains, refills, and keeps order",
        body: `assertEquals(solution([['enqueue', 1], ['dequeue'], ['dequeue'], ['enqueue', 2], ['dequeue']]), [1, null, 2]);`,
      },
      {
        name: "no dequeues means no output",
        body: `assertEquals(solution([['enqueue', 1], ['enqueue', 2]]), []);`,
      },
      {
        name: "handles many operations efficiently",
        body: `var ops = [];
for (var i = 0; i < 20000; i++) ops.push(['enqueue', i]);
for (var j = 0; j < 20000; j++) ops.push(['dequeue']);
var out = solution(ops);
assertEquals(out.length, 20000);
assertEquals(out[0], 0);
assertEquals(out[19999], 19999);`,
      },
    ],
    hints: [
      "Enqueue is simple: push onto the inbox and move on.",
      "Only refill the outbox when it is empty. Refilling every time would destroy the amortized cost.",
      "Pouring inbox into outbox reverses the order, which is precisely what turns two LIFOs into one FIFO.",
    ],
    reference: `function runQueue(ops) {
  const inbox = [];
  const outbox = [];
  const out = [];
  for (const [op, value] of ops) {
    if (op === 'enqueue') {
      inbox.push(value);
      continue;
    }
    // Refill only when empty: each item moves between the stacks exactly once,
    // which is what makes dequeue amortized O(1).
    if (outbox.length === 0) {
      while (inbox.length) outbox.push(inbox.pop());
    }
    out.push(outbox.length ? outbox.pop() : null);
  }
  return out;
}
`,
  },
};
