import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "multi-tenancy",
  title: "Multi-Tenancy",
  category: "System Design",
  difficulty: "Advanced",
  readingTimeMin: 7,
  blurb: "Sharding by tenant works until one tenant is a thousand times bigger than the median.",
  caption:
    "Twenty tenants placed across four shards. The demo opens on hash placement — the same uniform, tenant-blind hashing that balances cache keys perfectly — and one shard sits at 240% of capacity because tenant sizes follow a power law and the hash does not know that.",
  skillTags: ["System Design", "Multi-Tenancy", "Sharding"],
  bridgesFrom: [
    {
      slug: "sharding-replication",
      sameness:
        "Tenant isolation IS sharding, with tenant_id as the shard key. Every query carries the key, the router maps it to a shard, and each shard owns a disjoint slice of the data — mechanically identical to what you already built.",
      delta:
        "The keys are no longer interchangeable. Cache keys are roughly the same size, so a uniform hash balances them; tenants follow a power law, where the largest is routinely three orders of magnitude bigger than the median, so the same uniform hash produces a shard that is on fire and thirty that are idle. And a routing bug stops being a wrong-node lookup: reading the wrong tenant's rows is a data breach with a disclosure obligation.",
    },
    {
      slug: "rate-limiter",
      sameness:
        "Noisy-neighbour control IS per-key rate limiting. One bucket per tenant, refilled at the rate that tenant paid for, and requests rejected when it empties — the same token bucket, keyed differently.",
      delta:
        "The resource being protected is shared and multi-dimensional. A tenant can be inside its request-per-second limit and still monopolise the database with one unindexed query, or fill the connection pool, or hold every worker thread. So the limits have to cover the scarce resource — connections, query time, storage — not just the request count, and a limiter on requests alone gives a false sense of isolation.",
    },
  ],
  concept:
    "Multi-tenancy is running many customers on shared infrastructure, and its central design decision is where you put the isolation boundary. The three common answers are silo — dedicated stack per tenant, maximum isolation, worst economics; pool — one shared stack with tenant_id on every row, best economics, weakest isolation; and bridge, which pools most tenants and silos the few that need it for size or compliance. Almost every successful SaaS ends up at bridge, and the ones that did not plan for it get there by emergency migration when their first enterprise customer arrives.\n\nIn a pooled model, correctness rests on a single invariant: every query filters by tenant. That is far too important to leave to application code, because one missing WHERE clause in one endpoint is a cross-tenant data leak. Postgres row-level security enforces it in the database — a policy on the table plus a session variable set at connection checkout — so a forgotten filter returns zero rows instead of someone else's. The same idea applies wherever the data lives: the boundary belongs in the layer that cannot be forgotten.\n\nThe second problem is the noisy neighbour. Tenant sizes are power-law distributed, so your largest customer may be a thousand times your median, and the resource they exhaust is rarely the one you limited. A tenant well inside its requests-per-second quota can still saturate the database with one unindexed report, exhaust the connection pool, or fill every worker thread with slow requests. Effective isolation therefore limits the scarce resources — connections, query time, storage, queue depth — and adds per-tenant concurrency caps so no single tenant can hold more than a fraction of any pool.\n\nPlacement is where the sharding lab stops transferring cleanly. Hashing tenant_id gives uniform distribution of tenants, which is not uniform distribution of load, and a hash-placed fleet reliably produces one hot shard. Real systems keep an explicit tenant-to-shard mapping in a directory table instead, so a tenant can be moved without rehashing anything, large tenants can be placed deliberately, and a whale can be given a shard of its own. The cost is a lookup on every request and a migration procedure — but the migration procedure is the point, because you will need it.\n\nEverything else follows from tenant identity being first-class. Metrics, logs and traces carry tenant_id so you can answer 'is it slow for everyone or for them'. Backups have to be restorable per tenant, because 'one customer deleted their data' is a far more common request than 'the cluster is gone'. And deletion has to be complete and provable across every store, including the caches and the analytics warehouse, because that is what a deletion request actually requires.",
  complexity: [
    { operation: "Routed query (pooled)", time: "O(1) directory lookup + query", space: "shared" },
    {
      operation: "Tenant migration",
      time: "O(tenant size)",
      space: "double-write during the move",
    },
    { operation: "Hash placement", time: "O(1)", space: "blast radius: one hot shard, always" },
    {
      operation: "Missing tenant filter",
      time: "O(1)",
      space: "blast radius: every tenant on the shard",
    },
  ],
  codeSnippet: {
    language: "sql",
    code: `-- Do not trust application code to remember the tenant filter. One missing
-- WHERE clause in one endpoint is a cross-tenant disclosure, and code review
-- catches it most of the time, which is not a security control.

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;   -- applies to the table owner too

CREATE POLICY tenant_isolation ON invoices
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Set once per connection checkout, from a trusted source (the verified
-- session), never from a request parameter.
SET LOCAL app.tenant_id = '3f1c…';

-- Now the forgotten filter returns nothing instead of someone else's data:
SELECT * FROM invoices WHERE status = 'unpaid';
-- -> only this tenant's unpaid invoices, enforced below the application.

-- Placement stays an explicit directory, not a hash. Tenant sizes follow a
-- power law, so a uniform hash guarantees one hot shard -- and a directory
-- lets you move a whale without rehashing anyone else.
CREATE TABLE tenant_shard (
  tenant_id uuid PRIMARY KEY,
  shard     text NOT NULL,
  tier      text NOT NULL   -- 'pool' | 'silo'
);`,
  },
  realWorld: [
    "Salesforce built its platform on a shared, metadata-driven multitenant architecture where tenant identity is part of every access path.",
    "Slack moved its datastores onto Vitess to shard by workspace, replacing a placement scheme that could not keep large workspaces from dominating a host.",
    "AWS's SaaS guidance names the silo / pool / bridge models explicitly and treats tenant isolation as an architectural control rather than an application concern.",
  ],
  pitfalls: [
    "Relying on application code to add the tenant filter. It works until one endpoint forgets, and the failure mode is a disclosure, not a bug report.",
    "Hashing tenant_id to place tenants. Uniform placement of wildly non-uniform tenants guarantees a hot shard and gives you no way to move one.",
    "Limiting requests per second and calling it isolation. The neighbour that hurts you saturates connections, query time or worker threads while staying inside its request quota.",
    "Building the pooled model with no migration path. The first customer who requires dedicated infrastructure arrives with a contract, and by then it is an emergency project.",
  ],
  usedBy: [
    {
      company: "Salesforce",
      product: "Multitenant platform architecture",
      usage:
        "A shared, metadata-driven runtime where every customer's data lives in common structures keyed by organisation, with isolation enforced by the platform.",
      href: "https://architect.salesforce.com/fundamentals/platform-multitenant-architecture",
    },
    {
      company: "Slack",
      product: "Vitess-backed datastores",
      usage:
        "Shards MySQL by workspace through Vitess so large workspaces can be placed and moved deliberately rather than landing wherever a hash puts them.",
      href: "https://slack.engineering/scaling-datastores-at-slack-with-vitess/",
    },
    {
      company: "PostgreSQL",
      product: "Row-level security",
      usage:
        "Enforces the tenant predicate in the database, so a query missing its filter returns no rows instead of another tenant's data.",
      href: "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
    },
  ],
  references: [
    {
      label: "AWS — SaaS tenant isolation strategies",
      href: "https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/tenant-isolation.html",
    },
    {
      label: "PostgreSQL — Row Security Policies",
      href: "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
    },
  ],
  challenge: {
    prompt:
      "Place tenants on shards without creating a hot one. Work largest-first — the whales have the fewest viable homes, so they choose before the small tenants fill the space — and put each tenant on the least-loaded shard that still has room, breaking ties toward the lower shard index. A tenant that fits nowhere does not get squeezed in: it comes back in the silo list, which is the honest answer for a customer bigger than a shard. Return the tenant ids on each shard, ascending, plus the siloed ones.",
    entry: "placeTenants",
    starter: `/**
 * @param {Array<{id: number, load: number}>} tenants
 * @param {number} shardCount
 * @param {number} shardCapacity
 * @returns {{shards: number[][], siloed: number[]}} shards has length
 *   shardCount; every id list is ascending. Throws when shardCount < 1.
 */
function placeTenants(tenants, shardCount, shardCapacity) {
  // Largest load first. Least-loaded shard with room wins; ties go to the
  // lower index. Anything that fits nowhere is siloed.
}
`,
    tests: [
      {
        name: "equal tenants spread across the shards",
        body: `var t = [1, 2, 3, 4].map(function (id) { return { id: id, load: 10 }; });
assertEquals(solution(t, 2, 100), { shards: [[1, 3], [2, 4]], siloed: [] });`,
      },
      {
        name: "the whale gets placed first and keeps its shard",
        body: `var t = [
  { id: 1, load: 90 },
  { id: 2, load: 10 },
  { id: 3, load: 10 },
];
assertEquals(solution(t, 2, 100), { shards: [[1], [2, 3]], siloed: [] });`,
      },
      {
        name: "a tenant bigger than a shard is siloed, not squeezed in",
        body: `var t = [{ id: 1, load: 150 }];
assertEquals(solution(t, 2, 100), { shards: [[], []], siloed: [1] });`,
      },
      {
        name: "a tenant that fits nowhere once the shards fill up is siloed",
        body: `var t = [
  { id: 1, load: 60 },
  { id: 2, load: 60 },
];
assertEquals(solution(t, 1, 100), { shards: [[1]], siloed: [2] });`,
      },
      {
        name: "an exact fit is allowed",
        body: `var t = [
  { id: 1, load: 60 },
  { id: 2, load: 40 },
];
assertEquals(solution(t, 1, 100), { shards: [[1, 2]], siloed: [] });`,
      },
      {
        name: "equal loads are ordered by id so placement is deterministic",
        body: `var t = [
  { id: 7, load: 10 },
  { id: 3, load: 10 },
];
assertEquals(solution(t, 2, 100), { shards: [[3], [7]], siloed: [] });`,
      },
      {
        name: "no tenants yet",
        body: `assertEquals(solution([], 3, 100), { shards: [[], [], []], siloed: [] });`,
      },
      {
        name: "a fleet with no shards is not a placement problem",
        body: `assertThrows(function () { solution([{ id: 1, load: 1 }], 0, 100); }, "shardCount 0 must throw");`,
      },
      {
        name: "no shard is ever left over capacity",
        body: `// The property that hash placement cannot promise.
var t = [];
for (var i = 1; i <= 400; i++) t.push({ id: i, load: i % 11 === 0 ? 120 : (i % 9) + 1 });
var out = solution(t, 12, 300);
var loadOf = {};
t.forEach(function (x) { loadOf[x.id] = x.load; });
out.shards.forEach(function (shard, idx) {
  var total = 0;
  shard.forEach(function (id) { total += loadOf[id]; });
  assert(total <= 300, "shard " + idx + " is over capacity at " + total);
});`,
      },
      {
        name: "handles a real tenant list",
        body: `var t = [];
for (var i = 1; i <= 5000; i++) t.push({ id: i, load: (i % 7) + 1 });
var out = solution(t, 50, 1000);
var placed = 0;
out.shards.forEach(function (s) { placed += s.length; });
assertEquals(out.shards.length, 50);
assertEquals(placed, 5000);
assertEquals(out.siloed, []);`,
      },
    ],
    hints: [
      "Sort a copy of the tenants by load descending, breaking ties by ascending id, so the result does not depend on the order the caller happened to store them in.",
      "Track a running load per shard. For each tenant, scan the shards for the smallest load where load + tenant.load <= capacity, keeping the first one on a tie.",
      "Placing smallest-first passes the simple tests and fails on whales: by the time the big tenant is considered, every shard has just enough small tenants to exclude it.",
    ],
    reference: `function placeTenants(tenants, shardCount, shardCapacity) {
  if (!(shardCount >= 1)) {
    throw new Error("shardCount must be at least 1");
  }

  // Largest first. A whale has the fewest viable homes, so it must choose
  // before small tenants fragment the space out from under it.
  const ordered = tenants.slice().sort((a, b) => b.load - a.load || a.id - b.id);

  const shards = [];
  const loads = [];
  for (let i = 0; i < shardCount; i++) {
    shards.push([]);
    loads.push(0);
  }
  const siloed = [];

  for (const tenant of ordered) {
    let best = -1;
    for (let i = 0; i < shardCount; i++) {
      if (loads[i] + tenant.load > shardCapacity) continue;
      // Least loaded wins; ties go to the lower index so the result is
      // reproducible rather than dependent on iteration order.
      if (best === -1 || loads[i] < loads[best]) best = i;
    }
    if (best === -1) {
      // Bigger than anything you can offer. Saying so is the honest answer:
      // this customer needs a shard of their own.
      siloed.push(tenant.id);
      continue;
    }
    shards[best].push(tenant.id);
    loads[best] += tenant.load;
  }

  const asc = (a, b) => a - b;
  return { shards: shards.map((s) => s.sort(asc)), siloed: siloed.sort(asc) };
}
`,
  },
};
