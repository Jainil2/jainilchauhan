import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "queues-vs-streams",
  title: "Queues vs Streams",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "Delete on ack, or keep the log and move a cursor. Everything else follows from that.",
  caption:
    "The same eight messages delivered through a queue and through a partitioned log, side by side. It opens with six consumers on four partitions — the mistake teams make when they scale a stream by adding workers — and two of the six sit idle holding no partitions at all while the queue's six workers all have work.",
  skillTags: ["System Design", "Messaging", "Streaming", "Distributed Systems"],
  bridgesFrom: [
    {
      slug: "message-queue",
      sameness:
        "The stream side of this lab IS that lab: a partitioned append-only log, a key hashed to a partition, per-partition ordering, and consumers tracking offsets. Nothing about the mechanism changes here.",
      delta:
        "The comparison is against the other model — a queue that deletes a message once it is acknowledged. That single difference reverses every property. A queue can hand messages to a thousand workers because it does not have to preserve order; a log caps your parallelism at the partition count forever, because order is the thing it is protecting. And only one of the two can be replayed, which decides whether a bad deploy is a rewind or a data-loss incident.",
    },
    {
      slug: "backpressure",
      sameness:
        "Consumer lag is the buffer fill level from the backpressure lab. Producers write faster than consumers read, the gap grows, and you are watching exactly the queue-depth signal you already built a policy around.",
      delta:
        "The buffer is now on disk and measured in days of retention, so the system does not block or drop when it fills — it just gets further behind, quietly, for hours. That converts an immediate, obvious failure into a slow one you only notice from a lag chart, and the deadline is not memory exhaustion but the retention window, after which the unread data is deleted rather than delayed.",
    },
  ],
  concept:
    "Two models get called 'the queue' and they behave nothing alike. A work queue — SQS, RabbitMQ, Redis lists, Sidekiq — holds messages until a consumer acknowledges one, then deletes it. A log — Kafka, Kinesis, Pulsar, Redis Streams — appends messages to partitions that are retained for a fixed window, and each consumer group tracks its own offset.\n\nDelete-on-ack buys you competing consumers. Any number of workers can pull from one queue and each message goes to exactly one of them, so you scale by adding workers and nothing else changes. The price is ordering: once two workers are processing concurrently, message order is gone, and the delivery guarantee is at-least-once with a visibility timeout — a worker that is slow rather than dead gets its message redelivered while still working on it. That is why queue consumers must be idempotent.\n\nThe log buys you ordering, replay and fan-out. Order is guaranteed within a partition, so if you key by user id, that user's events are processed in sequence. Retention means a new service can be pointed at the beginning of the topic and rebuild its state from three days of history, and a bug fixed at noon can reprocess the morning. Multiple consumer groups each read the whole topic independently, so adding a consumer costs the producer nothing.\n\nThe cost is the one people meet first: parallelism is capped by the partition count. Each partition is consumed by at most one consumer in a group, so 4 partitions and 12 consumers means 8 idle processes. Adding partitions later is possible but it re-hashes keys to different partitions, breaking the per-key ordering you chose the log for in the first place, so the partition count is a sizing decision you make early and live with.\n\nThe practical rule is: ask whether you need order or replay. Email sending, thumbnail generation and webhook delivery need neither — use a queue and scale it thoughtlessly. Change data capture, event sourcing, analytics pipelines and anything where per-entity sequence matters need both — use a log and size the partitions for your peak throughput. Plenty of systems run both, and the mistake is usually forcing one model to do the other's job.",
  complexity: [
    { operation: "Queue consume", time: "O(1), any number of workers", space: "O(unacked)" },
    { operation: "Log consume", time: "O(1), ≤ 1 consumer per partition", space: "O(retention)" },
    {
      operation: "Max useful consumers",
      time: "unbounded (queue) vs partitions (log)",
      space: "—",
    },
    { operation: "Replay", time: "impossible (queue) vs O(retained) (log)", space: "O(retention)" },
  ],
  codeSnippet: {
    language: "py",
    code: `# ---- queue: delete on ack, competing consumers, no ordering ----
while True:
    msgs = sqs.receive_message(QueueUrl=q, MaxNumberOfMessages=10,
                               VisibilityTimeout=30)["Messages"]
    for m in msgs:
        handle(m)                        # must be idempotent: the visibility
                                         # timeout redelivers slow work too
        sqs.delete_message(QueueUrl=q, ReceiptHandle=m["ReceiptHandle"])
# Scale by launching more of this process. Nothing else changes.

# ---- log: offsets, per-partition order, capped parallelism ----
consumer = KafkaConsumer("orders", group_id="billing",
                         enable_auto_commit=False)   # commit after work, not before
for msg in consumer:
    handle(msg)                          # msg.partition == hash(key) % partitions
    consumer.commit()                    # the offset IS the consumer's state

# Parallelism ceiling, in one line:
#   useful_consumers = min(len(group), num_partitions)
# 4 partitions and 12 consumers is 8 processes holding nothing at all.`,
  },
  realWorld: [
    "Kafka assigns each partition to at most one consumer in a group, which is why the partition count is the throughput ceiling for a single group.",
    "SQS gives at-least-once delivery with a visibility timeout, so consumers must be idempotent and long work must extend its own lease.",
    "Event-sourced systems rely on log retention to rebuild a projection from scratch, which is a capability a delete-on-ack queue simply does not have.",
  ],
  pitfalls: [
    "Adding consumers to a lagging Kafka group with too few partitions. The new processes join, get nothing assigned, and lag does not move.",
    "Repartitioning a live topic to add parallelism. Keys re-hash to new partitions, so the per-key ordering the design depended on breaks at the boundary.",
    "Committing the offset before the work finishes. A crash between commit and completion drops the message silently — the one delivery model nobody wants.",
    "Treating retention as backup. A consumer that is down longer than the retention window does not catch up; the data it never read has been deleted.",
  ],
  usedBy: [
    {
      company: "Apache Kafka",
      product: "Partitioned log",
      usage:
        "Per-partition ordering with consumer-group offsets and time-based retention; the reference design for the log model.",
      href: "https://kafka.apache.org/documentation/#design",
    },
    {
      company: "AWS",
      product: "SQS",
      usage:
        "Delete-on-ack work queue with visibility timeouts and unlimited competing consumers; the reference design for the queue model.",
      href: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html",
    },
    {
      company: "LinkedIn",
      product: "Kafka as the central log",
      usage:
        "Jay Kreps' essay on the log is the argument that a replayable ordered log, not a queue, is the integration primitive for a company's data.",
      href: "https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying",
    },
  ],
  references: [
    { label: "Apache Kafka — Design", href: "https://kafka.apache.org/documentation/#design" },
    {
      label: "The Log: What every software engineer should know about real-time data",
      href: "https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying",
    },
  ],
  challenge: {
    prompt:
      "Implement Kafka's range partition assignment. Partitions 0..partitions-1 are handed out to consumers 0..consumers-1 in contiguous blocks: every consumer gets floor(partitions / consumers) of them, and the first (partitions % consumers) consumers get one extra. Return an array with one entry per consumer, each an ascending list of the partition ids it owns. A consumer with nothing assigned gets an empty list — that is the ceiling this lab is about. With zero consumers, return an empty array.",
    entry: "assignPartitions",
    starter: `/**
 * @param {number} partitions - how many partitions the topic has.
 * @param {number} consumers - how many consumers are in the group.
 * @returns {number[][]} partition ids owned by each consumer, in consumer order.
 */
function assignPartitions(partitions, consumers) {
  // Contiguous blocks. floor(p/c) each, and the first (p % c) consumers take
  // one extra partition.
}
`,
    tests: [
      {
        name: "an even split",
        body: `assertEquals(solution(4, 2), [[0, 1], [2, 3]]);`,
      },
      {
        name: "the remainder goes to the earliest consumers",
        body: `assertEquals(solution(5, 2), [[0, 1, 2], [3, 4]]);`,
      },
      {
        name: "one consumer owns the whole topic",
        body: `assertEquals(solution(3, 1), [[0, 1, 2]]);`,
      },
      {
        name: "one partition each",
        body: `assertEquals(solution(3, 3), [[0], [1], [2]]);`,
      },
      {
        name: "extra consumers get nothing at all",
        body: `// The ceiling: partitions cap useful parallelism, so consumers 3 and 4 are
// running processes that will never receive a message.
assertEquals(solution(3, 5), [[0], [1], [2], [], []]);`,
      },
      {
        name: "a topic with no partitions leaves everyone idle",
        body: `assertEquals(solution(0, 3), [[], [], []]);`,
      },
      {
        name: "no consumers means no assignment",
        body: `assertEquals(solution(8, 0), []);`,
      },
      {
        name: "adding consumers past the partition count buys nothing",
        body: `var four = solution(4, 4);
var eight = solution(4, 8);
assertEquals(eight.slice(0, 4), four);
assertEquals(eight.slice(4), [[], [], [], []]);`,
      },
      {
        name: "every partition is assigned exactly once",
        body: `var out = solution(1000, 7);
var seen = [];
for (var i = 0; i < out.length; i++) {
  for (var j = 0; j < out[i].length; j++) seen.push(out[i][j]);
}
assertEquals(seen.length, 1000);
seen.sort(function (a, b) { return a - b; });
for (var k = 0; k < 1000; k++) assertEquals(seen[k], k);`,
      },
      {
        name: "blocks stay contiguous, which is what makes rebalances cheap",
        body: `var out = solution(1000, 7);
for (var i = 0; i < out.length; i++) {
  for (var j = 1; j < out[i].length; j++) {
    assert(out[i][j] === out[i][j - 1] + 1, "consumer " + i + " has a gap");
  }
}`,
      },
      {
        name: "handles a large topic",
        body: `var out = solution(100000, 64);
assertEquals(out.length, 64);
// 100000 = 64 * 1562 + 32, so 32 consumers get 1563 and the rest get 1562.
assertEquals(out[0].length, 1563);
assertEquals(out[31].length, 1563);
assertEquals(out[32].length, 1562);
assertEquals(out[63][1561], 99999);`,
      },
    ],
    hints: [
      "Compute base = Math.floor(partitions / consumers) and extra = partitions % consumers before you start assigning.",
      "Walk a cursor through the partition ids: consumer i takes base partitions, plus one more while i is below extra.",
      "Guard the zero-consumer case up front — dividing by it produces Infinity and NaN rather than an error, so the bug surfaces far from its cause.",
    ],
    reference: `function assignPartitions(partitions, consumers) {
  // Dividing by zero here yields Infinity, not an exception, so the guard has
  // to be explicit.
  if (consumers <= 0) return [];

  const base = Math.floor(partitions / consumers);
  const extra = partitions % consumers;

  const out = [];
  let cursor = 0;

  for (let i = 0; i < consumers; i++) {
    // The first \`extra\` consumers take one more, which is why assignment is
    // never perfectly even and rarely needs to be.
    const take = base + (i < extra ? 1 : 0);
    const owned = [];
    for (let n = 0; n < take; n++) owned.push(cursor++);
    // A consumer past the partition count gets [] -- a process that will
    // never receive a single message.
    out.push(owned);
  }

  return out;
}
`,
  },
};
