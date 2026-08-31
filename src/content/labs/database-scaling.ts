import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "database-scaling",
  title: "Database Scaling",
  category: "System Design",
  difficulty: "Advanced",
  readingTimeMin: 7,
  blurb: "Sharding buys you write throughput and charges you every query that lacks the key.",
  caption:
    "A workload of six real queries against an eight-shard cluster. It opens on the state most schemas are in: two of the six queries have no shard key, so they scatter to all eight shards, and one tenant owns enough rows to make shard 3 the bottleneck on its own.",
  skillTags: ["System Design", "Databases", "Sharding", "Scalability"],
  bridgesFrom: [
    {
      slug: "sharding-replication",
      sameness:
        "It IS the shard router from that lab: hash the shard key, mod the shard count, send the query there. Vitess, Citus and every hand-rolled sharding layer are that function plus connection management.",
      delta:
        "Real queries do not all carry the shard key. The moment one does not, the router cannot pick a shard and must ask all of them, so a query that cost one shard's work now costs the whole cluster's — and adding shards makes that query slower, not faster. Sharding does not scale a workload; it scales the part of the workload that is keyed.",
    },
    {
      slug: "consistent-hashing",
      sameness:
        "Resharding is the ring problem exactly as you built it. Modulo placement moves nearly every row when the shard count changes; hashing onto a ring with virtual nodes moves roughly K/N of them. Vitess's keyspace ranges are the same idea expressed as ranges instead of points.",
      delta:
        "Moving a cache key costs a miss. Moving a database row costs a copy, a consistency window and a cutover, all while writes keep arriving — which is why online resharding is a months-long project and cache rebalancing is a config change.",
    },
  ],
  concept:
    "Vertical scaling works for far longer than the internet suggests: a single Postgres instance on modern hardware handles tens of thousands of transactions per second and multi-terabyte tables. The staircase is read replicas, then caching, then partitioning inside one database, and only then sharding across machines. Each step is roughly an order of magnitude cheaper than the next in operational cost, so skipping to shards early is the most expensive mistake in this lab.\n\nWhen you do shard, the whole design collapses into one decision: the shard key. It determines which queries stay single-shard and which scatter, and it is nearly impossible to change later. Notion sharded by workspace, Figma by file, Slack by team — all natural tenancy boundaries, so almost every query carries the key implicitly. Sharding orders by order id when your access pattern is 'all orders for a customer' gives a cluster where every read is a scatter-gather.\n\nA scatter-gather is not just N times the work. Its latency is the slowest of N shards, so with a p99 of 50 ms per shard and 16 shards, roughly one query in six sees a 50 ms shard; the p99 of the whole query approaches the p99.9 of a single one. Adding shards makes unkeyed queries worse. This is why sharded systems either forbid unkeyed queries at the ORM level or route them to a separate search index built for it.\n\nCross-shard writes lose transactions. Two rows in one shard get ACID for free; two rows in different shards need two-phase commit (slow, and a coordinator that can wedge) or a saga (eventually consistent, with compensating actions you have to write). Most teams choose the shard key precisely so that the transactions that matter stay inside one shard.\n\nThe last problem is skew. Hash sharding spreads rows evenly, but 'evenly by row' is not 'evenly by traffic': one enterprise tenant can be 40% of the workload while occupying one shard. Fixes are all unpleasant — split the hot tenant across sub-shards, give it a dedicated cluster, or add a caching layer just for it — which is why the honest answer to 'when should I shard' remains 'later than you think, and with a key you have tested against real queries'.",
  complexity: [
    {
      operation: "Single-shard query",
      time: "O(1) shard, one round trip",
      space: "O(rows/shards)",
    },
    { operation: "Scatter-gather", time: "O(shards) work, max-of-N latency", space: "O(result)" },
    { operation: "Modulo resharding", time: "O(rows) moved", space: "O(rows)" },
    { operation: "Range/ring resharding", time: "~O(rows / shards) moved", space: "O(rows)" },
  ],
  codeSnippet: {
    language: "sql",
    code: `-- Single-shard: the tenant key is in the WHERE clause, so the router
-- sends this to exactly one machine.
SELECT id, total FROM orders
WHERE workspace_id = 'ws_42' AND created_at > now() - interval '30 days'
ORDER BY created_at DESC LIMIT 50;

-- Scatter-gather: no shard key. The router must ask all 8 shards, merge the
-- results in memory, and wait for the slowest one. Latency is max(shards),
-- not avg(shards) -- and it gets worse every time you add a shard.
SELECT id, total FROM orders
WHERE status = 'refunded'
ORDER BY created_at DESC LIMIT 50;

-- The usual fix is not a better query plan. It is a second system:
-- stream orders into a search index and answer unkeyed queries there.

-- Cross-shard write: these two rows may live on different machines, so this
-- is no longer one transaction. It becomes 2PC or a saga with a compensating
-- credit, and the failure modes are yours to handle.
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE workspace_id = 'ws_42';
  UPDATE accounts SET balance = balance + 100 WHERE workspace_id = 'ws_99';
COMMIT;`,
  },
  realWorld: [
    "Notion sharded Postgres by workspace id into 32 databases of 15 logical shards each, because nearly every query in the product is scoped to a workspace.",
    "Figma delayed sharding for years by scaling vertically and splitting tables onto their own instances first, then sharded by file and user with a routing layer in the client library.",
    "Vitess, built at YouTube and now running PlanetScale, keeps keyspace ranges rather than modulo placement so a shard can be split online without touching the other shards.",
  ],
  pitfalls: [
    "Sharding before exhausting replicas, caching and partitioning. Every one of those is reversible in an afternoon; a shard key is not.",
    "Choosing a shard key that the hot queries do not carry. The cluster is then a scatter-gather machine, and every shard you add makes those queries slower.",
    "Modulo placement. Going from 8 shards to 16 moves roughly half of every table, online, while writes continue — range or ring placement moves a fraction of that.",
    "Assuming even row distribution means even load. One large tenant on one shard produces a hotspot that no amount of extra shards will relieve.",
  ],
  usedBy: [
    {
      company: "Notion",
      product: "Sharded Postgres",
      usage:
        "Partitioned by workspace id across 32 physical databases holding 480 logical shards, chosen so that in-product queries stay single-shard.",
      href: "https://www.notion.com/blog/sharding-postgres-at-notion",
    },
    {
      company: "Figma",
      product: "Horizontally sharded Postgres",
      usage:
        "Vertical partitioning first, then horizontal sharding with a DBProxy query engine that rejects or rewrites queries lacking a shard key.",
      href: "https://www.figma.com/blog/how-figmas-databases-team-lived-to-tell-the-scale/",
    },
    {
      company: "PlanetScale",
      product: "Vitess",
      usage:
        "Keyspace ranges plus a VTGate router, so shards split online and the application keeps talking to what looks like one MySQL.",
      href: "https://vitess.io/docs/concepts/shard/",
    },
  ],
  references: [
    {
      label: "Notion — Herding elephants: lessons learned from sharding Postgres",
      href: "https://www.notion.com/blog/sharding-postgres-at-notion",
    },
    {
      label: "Figma — How Figma's databases team lived to tell the scale",
      href: "https://www.figma.com/blog/how-figmas-databases-team-lived-to-tell-the-scale/",
    },
  ],
  challenge: {
    prompt:
      "Build the shard router's planner. Each query either carries shard keys or does not. A query with keys touches the shards those keys hash to — use key % numShards — deduplicated and sorted ascending. A query whose keys are null carries no shard key at all, so it must scatter to every shard. A query with an empty key list touches nothing. Return one shard list per query, in order.",
    entry: "planQueries",
    starter: `/**
 * @param {Array<{keys: number[]|null}>} queries - keys are non-negative integers.
 * @param {number} numShards
 * @returns {number[][]} shards touched by each query, ascending and deduplicated.
 */
function planQueries(queries, numShards) {
  // keys -> the shards they hash to. null -> every shard, because the router
  // has no way to narrow it down.
}
`,
    tests: [
      {
        name: "a single key routes to one shard",
        body: `assertEquals(solution([{ keys: [42] }], 8), [[2]]);`,
      },
      {
        name: "keys landing on the same shard are deduplicated",
        body: `// 2, 10 and 18 all hash to shard 2 with 8 shards.
assertEquals(solution([{ keys: [2, 10, 18] }], 8), [[2]]);`,
      },
      {
        name: "a multi-key query returns its shards sorted",
        body: `assertEquals(solution([{ keys: [7, 1, 4] }], 8), [[1, 4, 7]]);`,
      },
      {
        name: "a query with no shard key scatters to everything",
        body: `assertEquals(solution([{ keys: null }], 4), [[0, 1, 2, 3]]);`,
      },
      {
        name: "an empty key list touches no shard at all",
        body: `assertEquals(solution([{ keys: [] }], 4), [[]]);`,
      },
      {
        name: "each query is planned independently",
        body: `var q = [{ keys: [1] }, { keys: null }, { keys: [2, 3] }];
assertEquals(solution(q, 4), [[1], [0, 1, 2, 3], [2, 3]]);`,
      },
      {
        name: "a single shard absorbs everything",
        body: `assertEquals(solution([{ keys: [9999] }, { keys: null }], 1), [[0], [0]]);`,
      },
      {
        name: "no queries",
        body: `assertEquals(solution([], 8), []);`,
      },
      {
        name: "doubling the shard count moves keys, which is why resharding hurts",
        body: `var q = [{ keys: [10] }];
assertEquals(solution(q, 8), [[2]]);
assertEquals(solution(q, 16), [[10]]);`,
      },
      {
        name: "a wide unkeyed workload fans out across a large cluster",
        body: `var q = [];
for (var i = 0; i < 2000; i++) q.push({ keys: null });
var plan = solution(q, 64);
assertEquals(plan.length, 2000);
assertEquals(plan[0].length, 64);
assertEquals(plan[1999][63], 63);`,
      },
      {
        name: "a keyed query over many keys still returns a sorted unique list",
        body: `var keys = [];
for (var i = 0; i < 100000; i++) keys.push(i * 3);
var out = solution([{ keys: keys }], 16)[0];
// 3 and 16 are coprime, so every shard is hit exactly once in the output.
assertEquals(out.length, 16);
assertEquals(out[0], 0);
assertEquals(out[15], 15);`,
      },
    ],
    hints: [
      "Handle the null case first — it does not depend on the keys at all, it depends only on numShards.",
      "A Set collects the distinct shards; sort numerically afterwards, because the default sort is lexicographic and would put 10 before 2.",
      "Do the modulo once per key rather than building the full list and deduplicating at the end — the key list can be far larger than the shard count.",
    ],
    reference: `function planQueries(queries, numShards) {
  // Precompute the scatter list once: an unkeyed query always touches all of
  // them, and rebuilding it per query is the easy way to make this quadratic.
  const allShards = [];
  for (let i = 0; i < numShards; i++) allShards.push(i);

  return queries.map((q) => {
    // No shard key means the router cannot narrow anything down. This is the
    // query that gets slower every time you add a shard.
    if (q.keys === null) return allShards.slice();

    const shards = new Set();
    for (const key of q.keys) shards.add(key % numShards);

    // Numeric sort: the default comparator is lexicographic.
    return Array.from(shards).sort((a, b) => a - b);
  });
}
`,
  },
};
