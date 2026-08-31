import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "sharding-replication",
  title: "Sharding & Replication",
  category: "Distributed Systems",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "Route keys to shards and compare quorum vs asynchronous replication.",
  caption:
    "Type a key to route it to a shard. Switch between quorum and async replication to see the consistency/latency tradeoff on writes.",
  skillTags: ["Distributed Systems", "Databases", "System Design"],
  bridgesFrom: [
    {
      slug: "consistent-hashing",
      sameness:
        "Routing a key to a shard IS the ring. Hash the key, find its owner, send the request there — placement, rebalancing cost and hot-key risk all behave exactly as they did.",
      delta:
        "Each shard now has N copies, so 'who owns this key' becomes 'how many copies must answer before the write is done'. That quorum choice, not the placement, is where latency and durability actually live: R + W > N buys you reads that see your own writes and pays for it on every request, while acknowledging on the primary and replicating asynchronously is fast and leaves a window in which a failover loses writes the client was already told succeeded.",
    },
  ],
  concept:
    "Sharding partitions data across machines, usually by hashing or ranges, so storage and write load scale horizontally. Replication copies each shard to multiple nodes for availability and read scale. Together, they form the backbone of large databases and search systems.\n\nWrites can wait for a quorum of replicas, which improves consistency but adds latency, or acknowledge on the primary and replicate asynchronously, which is faster but may lose recent writes during failover. Rebalancing, hot keys, secondary indexes, and cross-shard transactions are the hard parts.",
  complexity: [
    { operation: "Hash route key", time: "O(1)", space: "O(shards)" },
    { operation: "Quorum write", time: "O(replica RTT)", space: "O(replicas)" },
    { operation: "Scatter-gather query", time: "O(shards)", space: "O(shards)" },
  ],
  realWorld: [
    "DynamoDB partitions, Cassandra token ranges, MongoDB sharding, Elasticsearch shards, and Vitess keyspaces.",
  ],
  pitfalls: [
    "Hot keys overload one shard even if average load is low.",
    "Cross-shard joins and transactions are expensive.",
    "Resharding needs careful dual-write, backfill, and cutover plans.",
  ],
  codeSnippet: {
    language: "sql",
    code: `-- Shard key choice decides whether you scale or build a hotspot.
-- Bad: monotonically increasing key -> every write lands on the newest shard.
-- Better: hash a high-cardinality, query-aligned key.

CREATE TABLE events (
  tenant_id  bigint      NOT NULL,
  event_id   bigint      NOT NULL,
  created_at timestamptz NOT NULL,
  payload    jsonb       NOT NULL,
  PRIMARY KEY (tenant_id, event_id)
) PARTITION BY HASH (tenant_id);

-- Cross-shard queries lose single-shard transactions and need scatter-gather:
SELECT tenant_id, count(*) FROM events
WHERE created_at > now() - interval '1 day'
GROUP BY tenant_id;  -- fans out to every shard, then merges`,
  },
  usedBy: [
    {
      company: "YouTube / PlanetScale",
      product: "Vitess",
      usage:
        "Vitess was built to shard YouTube's MySQL fleet transparently, and now backs PlanetScale and Slack's MySQL.",
      href: "https://vitess.io/docs/",
    },
    {
      company: "Instagram / Meta",
      product: "Logical shards in Postgres",
      usage:
        "Thousands of logical shards are mapped onto fewer physical machines so rebalancing does not require re-sharding data.",
      href: "https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c",
    },
    {
      company: "MongoDB",
      product: "Sharded clusters",
      usage:
        "Shard key selection, chunk balancing and scatter-gather query costs are documented as first-class design concerns.",
      href: "https://www.mongodb.com/docs/manual/sharding/",
    },
    {
      company: "Discord",
      product: "Cassandra → ScyllaDB message store",
      usage:
        "Messages are partitioned by channel and bucketed by time to keep partitions bounded and reads local.",
      href: "https://discord.com/blog/how-discord-stores-trillions-of-messages",
    },
  ],
  references: [
    {
      label: "Vitess — sharding concepts",
      href: "https://vitess.io/docs/user-guides/configuration-basic/",
    },
    {
      label: "MongoDB — sharded cluster and shard key selection",
      href: "https://www.mongodb.com/docs/manual/core/sharding-shard-key/",
    },
    {
      label: "Discord — how Discord stores trillions of messages",
      href: "https://discord.com/blog/how-discord-stores-trillions-of-messages",
    },
  ],
  challenge: {
    prompt:
      "Resolve a quorum read. Enough replicas must answer, and among those that do the newest version wins. Quorum works because reads and writes overlap by at least one replica when R plus W exceeds N.",
    entry: "quorumRead",
    starter: `/**
 * @param {Array<{value: any, version: number}|null>} replicas - null means the
 *   replica did not answer.
 * @param {number} r - responses required.
 * @returns {any|null} the value with the highest version, or null when fewer
 *   than r replicas answered. Ties go to the earliest replica.
 */
function quorumRead(replicas, r) {
  // Count the answers first. Without a quorum you must not return anything,
  // even if the replicas that did answer agree.
}
`,
    tests: [
      {
        name: "returns the newest version",
        body: `assertEquals(solution([{ value: 'old', version: 1 }, { value: 'new', version: 2 }], 2), 'new');`,
      },
      {
        name: "refuses without a quorum",
        body: `assertEquals(solution([{ value: 'a', version: 1 }, null, null], 2), null);`,
      },
      {
        name: "an exact quorum is enough",
        body: `assertEquals(solution([{ value: 'a', version: 1 }, null], 1), 'a');`,
      },
      {
        name: "ignores replicas that did not answer",
        body: `assertEquals(solution([null, { value: 'b', version: 5 }], 1), 'b');`,
      },
      {
        name: "ties go to the earliest replica",
        body: `assertEquals(solution([{ value: 'x', version: 3 }, { value: 'y', version: 3 }], 2), 'x');`,
      },
      {
        name: "no replicas answered",
        body: `assertEquals(solution([null, null], 1), null);`,
      },
      {
        name: "a quorum of zero always succeeds",
        body: `assertEquals(solution([{ value: 'a', version: 1 }], 0), 'a');`,
      },
    ],
    hints: [
      "Filter out the nulls before doing anything else, and compare that count against r.",
      "Then scan the responders keeping the highest version seen.",
      "Use a strict greater-than when comparing versions so the earliest replica wins a tie.",
    ],
    reference: `function quorumRead(replicas, r) {
  const answered = replicas.filter((x) => x !== null);
  // Below quorum you must not answer at all: the missing replicas could hold
  // a newer write.
  if (answered.length < r) return null;

  let best = null;
  for (const reply of answered) {
    // Strict >: the first replica at a given version keeps the tie.
    if (best === null || reply.version > best.version) best = reply;
  }
  return best === null ? null : best.value;
}
`,
  },
};
