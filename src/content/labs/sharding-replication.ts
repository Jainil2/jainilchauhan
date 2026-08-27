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
};
