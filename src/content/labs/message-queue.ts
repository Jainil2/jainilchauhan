import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "message-queue",
  title: "Distributed Message Queue",
  category: "Distributed Systems",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "Kafka-style Pub/Sub with partitions and consumer lag.",
  caption:
    "Publish events to a topic. Messages are partitioned and processed asynchronously by a consumer group. Watch out for consumer lag if you publish too fast!",
  skillTags: ["System Design", "Distributed Systems", "Kafka"],
  bridgesFrom: [
    {
      slug: "circular-buffer",
      sameness:
        "A partition IS a ring buffer. Producers append at a write index, consumers read at their own index, capacity is bounded by the retention window, and the gap between the two indexes — consumer lag — is the same fullness measure you were already tracking.",
      delta:
        "Reader and writer no longer share memory, and there are many readers each holding a private index, so a slow consumer cannot block the producer. It just drifts toward the wrap, and when the writer laps it the records are gone. Overflow stops being a full-buffer error and becomes silent data loss, visible only as lag climbing on a dashboard — which is why lag, not queue depth, is the metric people page on.",
    },
  ],
  concept:
    "A distributed log (Kafka, Pulsar, Kinesis) is a partitioned, append-only commit log per topic. Producers append to a partition; consumers track their own offset. This decouples producers from consumers — they don't need to be online at the same time, and consumers can replay history.\n\nPartitioning is the unit of parallelism: each partition is consumed by exactly one member of a consumer group. Within a partition, ordering is guaranteed; across partitions, it isn't. The partitioning key (often user_id) decides which partition a message lands in — pick it carefully because skewed keys mean hot partitions.\n\nConsumer lag (= producer offset − consumer offset) is the canonical health metric. Steady lag = matched throughput. Growing lag = consumers can't keep up; scale out, batch more, or shed load.",
  realWorld: [
    "Kafka — LinkedIn's original use case; now powers most event-driven backends.",
    "AWS Kinesis, GCP Pub/Sub, Azure Event Hubs — managed equivalents.",
    "Redis Streams, NATS JetStream — lighter-weight alternatives for smaller scales.",
    "Database CDC: Debezium streams Postgres/MySQL changes into Kafka.",
  ],
  pitfalls: [
    "Hot partitions from skewed keys — monitor per-partition byte rate.",
    "Auto-commit can lose messages if a consumer crashes mid-batch — prefer manual commit after side effects succeed.",
    "Re-partitioning is painful (Kafka doesn't move data) — over-partition early.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Consumer contract that survives redelivery: idempotency + explicit ack.
async function handle(msg: { id: string; body: unknown; attempt: number }) {
  const claimed = await store.claimOnce(msg.id); // dedupe key, e.g. UNIQUE(message_id)
  if (!claimed) return ack(msg);                 // already processed -> at-least-once is fine
  try {
    await doWork(msg.body);
    await ack(msg);
  } catch (err) {
    await store.releaseClaim(msg.id);
    if (msg.attempt >= 5) return deadLetter(msg, err); // stop poisoning the queue
    await nack(msg, { backoffMs: 2 ** msg.attempt * 250 });
  }
}`,
  },
  usedBy: [
    {
      company: "Amazon",
      product: "AWS SQS / SNS",
      usage:
        "Standard queues are at-least-once with visibility timeouts and dead-letter queues; FIFO queues add ordering and dedupe ids.",
      href: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-basic-architecture.html",
    },
    {
      company: "LinkedIn",
      product: "Apache Kafka",
      usage:
        "Kafka was built at LinkedIn as a partitioned commit log: consumers track offsets, so replay and fan-out are cheap.",
      href: "https://kafka.apache.org/documentation/#design",
    },
    {
      company: "Stripe",
      product: "Webhook delivery",
      usage:
        "Events are queued and retried with exponential backoff, and consumers are told to key on the event id because delivery is at-least-once.",
      href: "https://docs.stripe.com/webhooks",
    },
    {
      company: "Uber",
      product: "Cadence / Temporal workflows",
      usage:
        "Task queues plus durable timers turn multi-step business flows into retryable, replayable state machines.",
      href: "https://www.uber.com/blog/cadence-multi-tenant-workflow-sys/",
    },
  ],
  references: [
    {
      label: "Kafka — design (log, offsets, delivery semantics)",
      href: "https://kafka.apache.org/documentation/#design",
    },
    {
      label: "Stripe — webhook retries and idempotency",
      href: "https://docs.stripe.com/webhooks",
    },
  ],
  challenge: {
    prompt:
      "Assign messages to partitions and report the consumer lag left on each. Hashing by key is what guarantees ordering per key; round-robin spreads load but gives that up. Lag is the gap between what was written and what has been acknowledged.",
    entry: "partitionLag",
    starter: `/**
 * @param {number} partitions
 * @param {Array<{key: string|null}>} messages - a null key means round-robin.
 * @param {number[]} committed - messages acknowledged per partition.
 * @param {(s: string) => number} hash
 * @returns {number[]} remaining lag per partition, never below zero.
 *   Round-robin starts at partition 0 and advances only on null-keyed messages.
 */
function partitionLag(partitions, messages, committed, hash) {
  // A keyed message goes to hash(key) % partitions, which is what keeps all
  // messages for one key in order.
}
`,
    tests: [
      {
        name: "keyed messages land by hash",
        body: `var h = function (s) { return s.length; };
assertEquals(solution(2, [{ key: 'ab' }], [0, 0], h), [1, 0]);`,
      },
      {
        name: "the same key always lands together",
        body: `var h = function (s) { return s.length; };
assertEquals(solution(2, [{ key: 'a' }, { key: 'a' }], [0, 0], h), [0, 2]);`,
      },
      {
        name: "null keys round-robin",
        body: `var h = function () { return 0; };
assertEquals(solution(2, [{ key: null }, { key: null }], [0, 0], h), [1, 1]);`,
      },
      {
        name: "commits reduce lag",
        body: `var h = function () { return 0; };
assertEquals(solution(1, [{ key: 'a' }, { key: 'a' }], [1], h), [1]);`,
      },
      {
        name: "lag never goes negative",
        body: `var h = function () { return 0; };
assertEquals(solution(1, [], [5], h), [0]);`,
      },
      {
        name: "no messages leaves no lag",
        body: `var h = function () { return 0; };
assertEquals(solution(2, [], [0, 0], h), [0, 0]);`,
      },
      {
        name: "mixed keyed and round-robin",
        body: `var h = function () { return 1; };
assertEquals(solution(2, [{ key: 'x' }, { key: null }, { key: null }], [0, 0], h), [1, 2]);`,
      },
    ],
    hints: [
      "Count how many messages each partition receives before worrying about commits.",
      "Keep a separate cursor for round-robin so keyed messages do not advance it.",
      "Lag is the count minus what was committed, clamped at zero.",
    ],
    reference: `function partitionLag(partitions, messages, committed, hash) {
  const counts = new Array(partitions).fill(0);
  let cursor = 0;
  for (const message of messages) {
    if (message.key === null) {
      counts[cursor % partitions]++;
      cursor++; // only null keys advance the cursor
    } else {
      // Hashing the key is what keeps one key's messages in one partition,
      // and therefore in order.
      counts[hash(message.key) % partitions]++;
    }
  }
  return counts.map((c, i) => Math.max(0, c - (committed[i] || 0)));
}
`,
  },
};
