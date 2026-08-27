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
};
