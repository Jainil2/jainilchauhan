import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "connection-pooling",
  title: "Connection Pooling",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "A bounded queue with N permits, where making N bigger usually makes things slower.",
  caption:
    "Requests arriving twice as fast as a pool of 20 can serve them. The demo opens saturated, which is what a pool looks like in an incident: the connections are 100% busy, the checkout queue is growing, and the latency users see is almost entirely time spent waiting for a connection rather than time spent in the database.",
  skillTags: ["System Design", "Databases", "Concurrency", "Performance"],
  bridgesFrom: [
    {
      slug: "backpressure",
      sameness:
        "A connection pool IS the bounded buffer with a rejection policy from that lab. N permits instead of N slots, a FIFO wait queue in front of them, and a checkout timeout as the drop rule. Producers block when it is full — which is backpressure, applied to a database instead of a stream.",
      delta:
        "The bound is not chosen for memory, it is chosen by what the database can actually do in parallel, and that number is far smaller than intuition suggests — often a few dozen for a machine serving thousands of requests per second. Raising the bound to relieve the queue is the move that makes throughput worse, because contention inside the database grows faster than the parallelism you bought.",
    },
    {
      slug: "rate-limiter",
      sameness:
        "It is the same admission decision as your limiter, taken on a different quantity. A rate limiter caps arrivals per second; a pool caps requests in flight. Both hand out a permit or refuse, both protect a resource that degrades badly past a threshold, and both must decide what happens to the caller who is refused.",
      delta:
        "The permit here is returned rather than refilled, so the effective rate is set by how long work takes rather than by a clock. That closes a feedback loop the rate limiter does not have: when the database slows down, permits come back more slowly, the pool tightens on its own, and queue time — not query time — becomes the latency your users experience.",
    },
  ],
  concept:
    "Opening a database connection is expensive in a way that is easy to miss: a TCP handshake, TLS, authentication, and on Postgres the fork of an entire backend process holding several megabytes. That is 20–100 ms per connection, which is why every serious client keeps a pool of live connections and hands them out.\n\nThe interesting part is the size. The intuition 'more connections, more throughput' is wrong past a small number, and the classic HikariCP guidance shows why: the database can only really execute as many queries in parallel as it has cores and independent I/O paths, so a pool much bigger than that just moves the queue from your application into the database, where it costs more. Their starting formula is roughly `cores * 2 + effective spindles` — for a modern 8-core server with SSDs that is around 16–20 connections, and it usually outperforms a pool of 200. Postgres makes it starker still: each connection is a process, so 500 connections is 500 processes and several gigabytes of memory doing nothing but context switching.\n\nWhat you feel in production is that the pool converts a database slowdown into an application outage. Queries that took 5 ms start taking 50 ms, connections are held ten times as long, the pool empties, and every request now waits for a connection before it even starts. Latency graphs show application latency exploding while the database looks merely slow — because most of the added time is queue time, not query time. A checkout timeout is what keeps that from becoming an unbounded queue: it fails fast so callers can shed load rather than pile up.\n\nThe modern complication is that there may be far more application instances than the database can accept. A hundred serverless functions with a pool of 10 each is a thousand connections to a database configured for 200, and the failure is a connection storm at exactly the moment of a traffic spike. The fix is an external pooler — PgBouncer, RDS Proxy, Supavisor — in transaction mode, which multiplexes many client connections onto few server ones by handing a server connection out only for the duration of a transaction. That comes with real constraints: session state, `SET` statements, advisory locks and some prepared-statement patterns break, because the server connection you get next time is not the one you had.\n\nThe number to instrument is not connection count — it is time spent waiting for a connection. If it is nonzero at p99 during normal traffic, the pool is a bottleneck; if it is zero and the database is still slow, a bigger pool will not help you.",
  complexity: [
    { operation: "Checkout (connection free)", time: "O(1)", space: "O(pool size)" },
    {
      operation: "Checkout (pool exhausted)",
      time: "queue wait, up to the timeout",
      space: "O(waiters)",
    },
    { operation: "Open a new connection", time: "~20–100 ms", space: "~5–10 MB on Postgres" },
    { operation: "Throughput ceiling", time: "pool size / mean hold time", space: "—" },
  ],
  codeSnippet: {
    language: "ts",
    code: `// Pool sizing is not a guess: it is a throughput budget.
//   sustainable req/s = poolSize / meanHoldSeconds
// 20 connections holding 10ms each = 2,000 req/s. If you need 4,000, the
// answer is a faster query, not 40 connections.

const pool = new Pool({
  max: 20, // ~= cores * 2 on the DATABASE, not on the app server
  min: 5, // keep some warm; opening costs 20-100ms
  connectionTimeoutMillis: 2_000, // fail fast instead of queueing forever
  idleTimeoutMillis: 30_000,
  maxLifetimeSeconds: 1_800, // recycle so a failover cannot strand connections
});

async function query(sql: string, params: unknown[]) {
  const startedWaiting = performance.now();
  const client = await pool.connect(); // <- this is where an incident hides
  const waited = performance.now() - startedWaiting;

  // The metric that matters. Query time you already have; queue time is what
  // turns a slow database into a down application, and nothing reports it
  // unless you do.
  metrics.histogram("db.pool.wait_ms", waited);

  try {
    return await client.query(sql, params);
  } finally {
    client.release(); // in a finally, always: a leaked connection is permanent
  }
}`,
  },
  realWorld: [
    "HikariCP's pool-sizing guide shows a 10,000-user benchmark where dropping the pool from 2,048 to 96 connections cut response time from ~100 ms to ~3 ms.",
    "PgBouncer in transaction mode lets thousands of client connections share a few dozen Postgres backends, at the cost of session-scoped features.",
    "AWS RDS Proxy exists mainly because Lambda's instance-per-request model produces connection storms that a normal client-side pool cannot bound.",
  ],
  pitfalls: [
    "Raising the pool size to fix pool exhaustion. It moves the queue into the database, where contention makes every query slower and throughput drops.",
    "Releasing the connection outside a finally block. One thrown exception on a hot path leaks a connection, and the pool degrades permanently until a restart.",
    "Holding a connection across an external call. Checking out a connection, calling a payment API for 800 ms, then writing means one request holds a connection for the whole round trip.",
    "Transaction-mode pooling with session state. SET, LISTEN, advisory locks and some prepared statements silently target whichever backend you happen to get.",
  ],
  usedBy: [
    {
      company: "HikariCP",
      product: "JDBC pool",
      usage:
        "The de facto JVM pool; its 'About Pool Sizing' guide is the standard argument for small pools with measured wait times.",
      href: "https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing",
    },
    {
      company: "PgBouncer",
      product: "Transaction pooling",
      usage:
        "Multiplexes many client connections onto few Postgres backends by leasing a server connection per transaction.",
      href: "https://www.pgbouncer.org/features.html",
    },
    {
      company: "AWS",
      product: "RDS Proxy",
      usage:
        "Managed pooler that absorbs connection storms from serverless fleets and holds connections through database failovers.",
      href: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html",
    },
  ],
  references: [
    {
      label: "HikariCP — About Pool Sizing",
      href: "https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing",
    },
    {
      label: "PgBouncer — Features and pooling modes",
      href: "https://www.pgbouncer.org/features.html",
    },
  ],
  challenge: {
    prompt:
      "Simulate a connection pool. Requests arrive in time order, each with an arrival time and a hold duration in milliseconds. There are `poolSize` connections, all free at time 0. Each request takes the connection that frees up earliest, breaking ties by the lowest index, and starts at the later of its arrival and that connection's free time. If it would have to wait strictly longer than timeoutMs it is abandoned — it returns 'timeout' and does not occupy a connection at all. Otherwise it returns 'served' and holds the connection for its duration. Return the outcome per request, in order.",
    entry: "runPool",
    starter: `/**
 * @param {Array<{t: number, dur: number}>} requests - arrival time, hold time (ms).
 * @param {number} poolSize
 * @param {number} timeoutMs - the longest a caller will wait for a connection.
 * @returns {Array<"served"|"timeout">} outcome per request.
 */
function runPool(requests, poolSize, timeoutMs) {
  // Track when each connection frees up. A request waits for the earliest one
  // -- and gives up if that wait exceeds the checkout timeout.
}
`,
    tests: [
      {
        name: "an idle pool serves immediately",
        body: `assertEquals(solution([{ t: 0, dur: 10 }], 2, 100), ["served"]);`,
      },
      {
        name: "concurrent requests use separate connections",
        body: `var r = [{ t: 0, dur: 100 }, { t: 0, dur: 100 }];
assertEquals(solution(r, 2, 0), ["served", "served"]);`,
      },
      {
        name: "an undersized pool makes the second caller wait it out",
        body: `// One connection, both arrive at t=0, and the caller will not wait.
var r = [{ t: 0, dur: 100 }, { t: 0, dur: 100 }];
assertEquals(solution(r, 1, 0), ["served", "timeout"]);`,
      },
      {
        name: "a wait exactly equal to the timeout is still served",
        body: `var r = [{ t: 0, dur: 100 }, { t: 0, dur: 100 }];
assertEquals(solution(r, 1, 100), ["served", "served"]);`,
      },
      {
        name: "queue time accumulates down the line",
        body: `// Three 100ms holds through one connection: waits of 0, 100 and 200ms.
var r = [{ t: 0, dur: 100 }, { t: 0, dur: 100 }, { t: 0, dur: 100 }];
assertEquals(solution(r, 1, 150), ["served", "served", "timeout"]);`,
      },
      {
        name: "a request arriving after the rush waits for nobody",
        body: `var r = [{ t: 0, dur: 100 }, { t: 500, dur: 10 }];
assertEquals(solution(r, 1, 0), ["served", "served"]);`,
      },
      {
        name: "an abandoned checkout does not consume a connection",
        body: `// The timed-out caller never occupies the connection, so the request
// behind it is served exactly as if that caller had never arrived.
var r = [
  { t: 0, dur: 100 },
  { t: 0, dur: 1000 },
  { t: 100, dur: 10 },
];
assertEquals(solution(r, 1, 0), ["served", "timeout", "served"]);`,
      },
      {
        name: "a pool of zero serves nothing",
        body: `assertEquals(solution([{ t: 0, dur: 1 }], 0, 10000), ["timeout"]);`,
      },
      {
        name: "no requests",
        body: `assertEquals(solution([], 10, 100), []);`,
      },
      {
        name: "the earliest-free connection is chosen, not the first one",
        body: `// Connection 0 is busy until 500; connection 1 frees at 50, so the third
// request should take connection 1 and wait only 40ms.
var r = [
  { t: 0, dur: 500 },
  { t: 0, dur: 50 },
  { t: 10, dur: 10 },
];
assertEquals(solution(r, 2, 40), ["served", "served", "served"]);
assertEquals(solution(r, 2, 39), ["served", "served", "timeout"]);`,
      },
      {
        name: "an oversubscribed pool sheds load instead of queueing forever",
        body: `// Arrivals every 1ms, each holding 100ms: the pool of 50 can sustain half
// the offered load, so the rest must be shed rather than queued.
var r = [];
for (var i = 0; i < 20000; i++) r.push({ t: i, dur: 100 });
var out = solution(r, 50, 500);
var served = 0;
var timedOut = 0;
for (var j = 0; j < out.length; j++) {
  if (out[j] === "served") served++;
  else timedOut++;
}
assertEquals(served + timedOut, 20000);
assert(served > 5000, "the pool should still be doing useful work");
assert(timedOut > 5000, "an undersized pool must shed load, not queue forever");`,
      },
    ],
    hints: [
      "Model the pool as an array of 'free at' timestamps, all starting at 0. That is the entire state.",
      "The wait is max(freeAt, arrival) - arrival; compare it with the timeout before you mutate anything.",
      "On a timeout, leave the connection's free time untouched — the abandoned caller never got it, so the next request must not be charged for it.",
    ],
    reference: `function runPool(requests, poolSize, timeoutMs) {
  // One number per connection: when it becomes available again.
  const freeAt = new Array(poolSize).fill(0);
  const out = [];

  for (const req of requests) {
    if (poolSize === 0) {
      out.push("timeout");
      continue;
    }

    // Earliest-free connection, ties to the lowest index.
    let pick = 0;
    for (let i = 1; i < poolSize; i++) {
      if (freeAt[i] < freeAt[pick]) pick = i;
    }

    const start = Math.max(req.t, freeAt[pick]);
    const waited = start - req.t;

    // This is the number that matters in production: not query time, queue
    // time. Past the checkout timeout the caller gives up.
    if (waited > timeoutMs) {
      out.push("timeout");
      continue;
    }

    freeAt[pick] = start + req.dur;
    out.push("served");
  }

  return out;
}
`,
  },
};
