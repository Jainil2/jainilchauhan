import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "cap-theorem",
  title: "CAP Theorem",
  category: "Distributed Systems",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Pick CP or AP — partition is non-negotiable.",
  caption:
    "Trigger a network partition between two halves of a 3-node cluster. Pick CP (refuse writes on the minority) or AP (accept writes, diverge). Then heal the partition and watch conflict resolution.",
  skillTags: ["Distributed Systems", "System Design"],
  concept:
    "CAP says: in the presence of a network Partition, a distributed system must choose between Consistency and Availability. You can't have all three.\n\nCP systems (etcd, Spanner, Mongo with majority writes) refuse writes on the minority side of a partition — guaranteeing that any successful read returns the most recent write. The cost: minority partitions become read-only or fully unavailable.\n\nAP systems (Cassandra, DynamoDB with eventual consistency, Riak) accept writes on both sides during a partition, then reconcile when the partition heals — using strategies like last-write-wins, vector clocks, or CRDTs. The cost: reads can return stale data, and conflict resolution can lose writes.\n\nCAP is about partitions specifically. The day-to-day trade-off is closer to PACELC: when there's a Partition, choose A or C; Else, choose Latency or Consistency.",
  realWorld: [
    "CP — etcd, ZooKeeper, Consul, Google Spanner, MongoDB (majority).",
    "AP — Cassandra, DynamoDB (default), Riak, CouchDB, Redis Cluster (with quirks).",
    "CRDTs — used in collaborative editing (Figma, Notion, Yjs) to give AP without losing writes.",
  ],
  pitfalls: [
    "'My DB is CA' is a confused statement — partitions are a fact of networking, not a choice.",
    "Eventual consistency works only if your application can tolerate stale reads — money rarely can.",
    "Last-write-wins silently loses concurrent updates — vector clocks or CRDTs surface conflicts.",
  ],
  references: [
    {
      label: "Eric Brewer — CAP Theorem (2000 keynote, 2012 retrospective)",
      href: "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/",
    },
  ],
  codeSnippet: {
    language: "sql",
    code: `-- CAP is a per-operation choice, not a per-database label.
-- Cassandra: pick your side of the tradeoff per query.

-- CP-leaning: refuse to answer unless a quorum agrees.
CONSISTENCY QUORUM;
SELECT balance FROM accounts WHERE id = 42;

-- AP-leaning: answer from whatever replica is reachable.
CONSISTENCY ONE;
SELECT last_seen FROM presence WHERE user_id = 42;

-- Read + write quorums overlap when R + W > RF, which is how
-- an AP-capable store gives you strong reads when you need them.`,
  },
  usedBy: [
    {
      company: "Amazon",
      product: "DynamoDB eventual vs strongly consistent reads",
      usage:
        "The API exposes the tradeoff directly: strongly consistent reads cost more and are unavailable during some partitions.",
      href: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html",
    },
    {
      company: "Google",
      product: "Spanner (CP with TrueTime)",
      usage:
        "Spanner chooses consistency and uses synchronised clocks to keep availability high in practice, not by escaping CAP.",
      href: "https://research.google/pubs/pub39966/",
    },
    {
      company: "CNCF",
      product: "etcd / Kubernetes control plane",
      usage:
        "etcd is CP: on a partition the minority side stops accepting writes rather than serving stale cluster state.",
      href: "https://etcd.io/docs/latest/learning/api_guarantees/",
    },
    {
      company: "Apache Cassandra",
      product: "Tunable consistency levels",
      usage:
        "ONE / QUORUM / ALL per statement is CAP as a runtime dial rather than a design-time decision.",
      href: "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html",
    },
  ],
  challenge: {
    prompt:
      "Decide what a replica does with each request during a network partition. CP refuses rather than risk disagreeing; AP answers from what it has and may be stale. The theorem is not a menu of three — during a partition you only get to pick one of two.",
    entry: "handle",
    starter: `/**
 * @param {Array<'read'|'write'>} requests
 * @param {boolean} partitioned - true when this replica cannot reach a quorum.
 * @param {'CP'|'AP'} mode
 * @returns {string[]} one of 'ok', 'stale' or 'error' per request.
 *   Not partitioned: everything is 'ok'.
 *   CP while partitioned: everything is 'error'.
 *   AP while partitioned: reads are 'stale', writes are 'ok' (reconciled later).
 */
function handle(requests, partitioned, mode) {
  // Availability and consistency only conflict once the partition exists.
}
`,
    tests: [
      {
        name: "no partition means business as usual",
        body: `assertEquals(solution(['read', 'write'], false, 'CP'), ['ok', 'ok']);
assertEquals(solution(['read', 'write'], false, 'AP'), ['ok', 'ok']);`,
      },
      {
        name: "CP refuses everything under partition",
        body: `assertEquals(solution(['read', 'write'], true, 'CP'), ['error', 'error']);`,
      },
      {
        name: "AP serves possibly stale reads",
        body: `assertEquals(solution(['read'], true, 'AP'), ['stale']);`,
      },
      {
        name: "AP accepts writes to reconcile later",
        body: `assertEquals(solution(['write'], true, 'AP'), ['ok']);`,
      },
      {
        name: "no requests",
        body: `assertEquals(solution([], true, 'CP'), []);`,
      },
      {
        name: "order is preserved",
        body: `assertEquals(solution(['write', 'read', 'write'], true, 'AP'), ['ok', 'stale', 'ok']);`,
      },
    ],
    hints: [
      "Handle the not-partitioned case first and return early — there is no tradeoff to make.",
      "CP gives up availability, so every request fails regardless of kind.",
      "AP gives up consistency, so only reads are suspect; writes are accepted and merged afterwards.",
    ],
    reference: `function handle(requests, partitioned, mode) {
  // Without a partition there is nothing to trade away.
  if (!partitioned) return requests.map(() => 'ok');
  if (mode === 'CP') return requests.map(() => 'error');
  // AP: stay up, admit the read may be behind.
  return requests.map((r) => (r === 'read' ? 'stale' : 'ok'));
}
`,
  },
};
