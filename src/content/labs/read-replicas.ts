import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "read-replicas",
  title: "Read Replicas",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "Cheap read capacity, paid for in a bug report that says 'I saved it and it disappeared'.",
  caption:
    "A user writes, then reads 200 ms later against a replica running 800 ms behind. The demo opens with every read routed to a replica — the configuration you get by pointing your ORM at the reader endpoint — and the read after the write returns the old row while nothing anywhere reports an error.",
  skillTags: ["System Design", "Databases", "Replication", "Consistency"],
  bridgesFrom: [
    {
      slug: "sharding-replication",
      sameness:
        "This IS the asynchronous replication half of that lab, deployed. The primary appends to its write-ahead log, replicas stream and apply it, and the read you serve is whatever the replica has applied so far. Same mechanism, same lag, same acknowledgement choice between async and quorum.",
      delta:
        "The replicas now serve production reads, so lag stops being a recovery-time metric and becomes a user-visible correctness property. A 200 ms lag that was invisible when replicas were standbys is now the difference between a user seeing their own comment and filing a bug that it vanished.",
    },
    {
      slug: "cap-theorem",
      sameness:
        "Routing a read to a replica is the AP choice from that lab, made per query rather than per system: you accept a possibly stale answer in exchange for availability and throughput. Routing it to the primary is the CP choice. It is the same dial, and you are now turning it request by request.",
      delta:
        "Because the choice is per read, the two settings coexist in one application, and the interesting engineering is the rule that picks between them — a sticky window after a write, a session token, or a per-endpoint annotation. Getting that rule wrong does not take the system down; it produces a rare, unreproducible staleness bug.",
    },
  ],
  concept:
    "Most applications read far more than they write — 10:1 and 100:1 ratios are ordinary — so the cheapest scaling move available is to keep one primary for writes and point reads at replicas. Postgres streaming replication, MySQL binlog replication and every managed reader endpoint do the same thing: ship the write-ahead log to followers and let them apply it.\n\nThe cost is replication lag. Under normal load it is single-digit milliseconds; under a large batch write, a long-running query blocking replay, or a network hiccup it becomes seconds or minutes. Lag is not constant and it is not the same on every replica, so it is not something you can design around by assuming a number.\n\nThe bug lag produces is read-after-write: a user posts a comment, the page reloads, the read hits a replica that has not applied it, and the comment is gone. Nothing errors. It reproduces for nobody, because by the time anyone investigates, the replica has caught up. There are three standard fixes. Sticky reads: route a user's reads to the primary for a window after they write — simple, and the one most teams ship. Session consistency: capture the primary's log position at write time (an LSN in Postgres, a GTID in MySQL) and require the replica to have applied at least that position, waiting or failing over to the primary if it has not — precise, and what Vitess and modern proxies implement. Or write-through caching: serve the user their own writes from a cache while the replica catches up.\n\nWhat you must not do is treat 'replica' as a global setting. Analytics, list pages and search can be seconds stale with no consequence; a balance check after a transfer cannot. The routing decision belongs at the query, chosen by whether the caller can tolerate the staleness.\n\nThe other trap is capacity planning. Replicas add read throughput but not write throughput — every replica applies every write — so a write-heavy workload gets nothing from ten replicas except ten copies of the same write load, and eventually replay itself becomes the bottleneck. When writes are the problem, the answer is partitioning, not replication.",
  complexity: [
    {
      operation: "Read from replica",
      time: "O(query), stale by lag",
      space: "O(dataset) per replica",
    },
    { operation: "Read from primary", time: "O(query), always fresh", space: "—" },
    { operation: "Write", time: "O(query) + fsync, applied by every replica", space: "O(log)" },
    {
      operation: "Session-consistent read (LSN wait)",
      time: "O(query) + wait for lag",
      space: "O(1) per session",
    },
  ],
  codeSnippet: {
    language: "py",
    code: `# Two routing strategies, from crude to correct.

# 1. Sticky window: after a user writes, send THEIR reads to the primary for
#    a while. Cheap, stateless enough, and covers the reload-after-post case.
STICKY_MS = 3000

def read_target(user_id, now_ms):
    last_write = recent_writes.get(user_id)      # small TTL cache
    if last_write is not None and now_ms - last_write < STICKY_MS:
        return primary                            # read-your-writes
    return replica_pool.next()                    # everyone else scales out

# 2. Session consistency: carry the exact log position the write produced and
#    require the replica to have applied at least that far. Precise instead of
#    time-based -- no guessing at how long lag lasts today.
def write_then_token(sql, params):
    with primary.begin() as tx:
        tx.execute(sql, params)
        # Postgres: the WAL position this transaction committed at.
        lsn = tx.scalar("SELECT pg_current_wal_lsn()")
    return lsn                                    # hand back to the client

def consistent_read(sql, lsn, timeout_ms=50):
    r = replica_pool.next()
    # Wait briefly for the replica to catch up; fall back rather than block.
    if not r.wait_for_lsn(lsn, timeout_ms):
        return primary.execute(sql)
    return r.execute(sql)`,
  },
  realWorld: [
    "Vitess implements MySQL GTID-based consistent reads so an application can require a replica to have applied its own transaction before answering.",
    "GitHub's MySQL setup routes reads to replicas by default and marks the queries that must see their own writes, because the failure is invisible until a user reports it.",
    "Managed reader endpoints such as RDS load-balance across replicas, which means consecutive reads can hit replicas with different lag — monotonic reads are not guaranteed either.",
  ],
  pitfalls: [
    "Flipping the whole ORM to the reader endpoint. It works in staging, where lag is zero, and produces unreproducible staleness in production.",
    "Assuming lag is small because it usually is. A bulk backfill or a long query on the replica can push it to minutes, and the routing rule keeps sending reads there.",
    "Load-balancing a user's consecutive reads across different replicas. Data can appear, then disappear again — a monotonic-reads violation, which is even more confusing than plain staleness.",
    "Adding replicas to fix write throughput. Every replica applies every write, so replicas add read capacity only, and replay eventually becomes the ceiling.",
  ],
  usedBy: [
    {
      company: "PostgreSQL",
      product: "Streaming replication / hot standby",
      usage:
        "Ships WAL to standbys that serve reads while replaying; exposes the replay LSN so applications can measure or wait on lag.",
      href: "https://www.postgresql.org/docs/current/warm-standby.html",
    },
    {
      company: "GitHub",
      product: "MySQL at GitHub",
      usage:
        "Runs a primary with many replicas behind a proxy layer, routing reads away from the primary and failing over with orchestrator.",
      href: "https://github.blog/2018-06-20-mysql-high-availability-at-github/",
    },
    {
      company: "AWS",
      product: "RDS read replicas",
      usage:
        "Managed replicas behind a reader endpoint, with a replica-lag metric that applications are expected to route on.",
      href: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html",
    },
  ],
  references: [
    {
      label: "PostgreSQL — Log-shipping standby servers",
      href: "https://www.postgresql.org/docs/current/warm-standby.html",
    },
    {
      label: "AWS — Working with read replicas",
      href: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html",
    },
  ],
  challenge: {
    prompt:
      "Implement sticky read routing. Operations arrive in time order, each with a type ('read' or 'write'), a user and a timestamp in milliseconds. Every write goes to the primary. A read goes to the primary when that same user wrote less than lagMs ago — that is the window in which a replica might not have their row yet — and to a replica otherwise. Exactly lagMs after the write, the replica is considered caught up. Return the target for each operation, in order.",
    entry: "routeReads",
    starter: `/**
 * @param {Array<{type: "read"|"write", user: string, t: number}>} ops - time ordered.
 * @param {number} lagMs - how long a user's writes may be invisible on a replica.
 * @returns {Array<"primary"|"replica">} target per operation.
 */
function routeReads(ops, lagMs) {
  // Writes always go to the primary. A read is sticky only for the user who
  // just wrote, and only until the replica has had lagMs to catch up.
}
`,
    tests: [
      {
        name: "a write always goes to the primary",
        body: `assertEquals(solution([{ type: "write", user: "a", t: 0 }], 800), ["primary"]);`,
      },
      {
        name: "a read with no preceding write goes to a replica",
        body: `assertEquals(solution([{ type: "read", user: "a", t: 0 }], 800), ["replica"]);`,
      },
      {
        name: "a read straight after that user's write is pinned to the primary",
        body: `var ops = [
  { type: "write", user: "a", t: 0 },
  { type: "read", user: "a", t: 200 },
];
assertEquals(solution(ops, 800), ["primary", "primary"]);`,
      },
      {
        name: "the pin expires once the replica has had time to catch up",
        body: `var ops = [
  { type: "write", user: "a", t: 0 },
  { type: "read", user: "a", t: 900 },
];
assertEquals(solution(ops, 800), ["primary", "replica"]);`,
      },
      {
        name: "the window boundary is exclusive",
        body: `var ops = [
  { type: "write", user: "a", t: 0 },
  { type: "read", user: "a", t: 799 },
  { type: "read", user: "a", t: 800 },
];
assertEquals(solution(ops, 800), ["primary", "primary", "replica"]);`,
      },
      {
        name: "one user's write does not pin another user's reads",
        body: `// This is the whole reason sticky routing scales: only the writer pays.
var ops = [
  { type: "write", user: "a", t: 0 },
  { type: "read", user: "b", t: 10 },
  { type: "read", user: "a", t: 10 },
];
assertEquals(solution(ops, 800), ["primary", "replica", "primary"]);`,
      },
      {
        name: "a later write extends the window",
        body: `var ops = [
  { type: "write", user: "a", t: 0 },
  { type: "write", user: "a", t: 700 },
  { type: "read", user: "a", t: 1000 },
];
assertEquals(solution(ops, 800), ["primary", "primary", "primary"]);`,
      },
      {
        name: "zero lag sends every read to a replica",
        body: `var ops = [
  { type: "write", user: "a", t: 0 },
  { type: "read", user: "a", t: 0 },
];
assertEquals(solution(ops, 0), ["primary", "replica"]);`,
      },
      {
        name: "no operations",
        body: `assertEquals(solution([], 800), []);`,
      },
      {
        name: "a read-heavy workload still sends almost everything to replicas",
        body: `// 100k operations, 1 in 50 a write, from 1000 users.
var ops = [];
for (var i = 0; i < 100000; i++) {
  ops.push({ type: i % 50 === 0 ? "write" : "read", user: "u" + (i % 1000), t: i });
}
var out = solution(ops, 800);
var primary = 0;
for (var j = 0; j < out.length; j++) if (out[j] === "primary") primary++;
assert(primary < out.length * 0.1, "sticky routing must not send 10% of reads to the primary");
assert(primary >= 2000, "every write, at least, is on the primary");`,
      },
    ],
    hints: [
      "One map from user to the timestamp of their most recent write is all the state you need.",
      "A write both routes to the primary and updates that map — do not forget the second half.",
      "'Less than lagMs ago' means t - lastWrite < lagMs, so a lag of 0 pins nothing at all.",
    ],
    reference: `function routeReads(ops, lagMs) {
  // user -> timestamp of their most recent write. This is the entire state of
  // a sticky-read router; production versions keep it in a short-TTL cache.
  const lastWrite = new Map();
  const out = [];

  for (const op of ops) {
    if (op.type === "write") {
      lastWrite.set(op.user, op.t);
      out.push("primary");
      continue;
    }

    const wrote = lastWrite.get(op.user);
    // Strictly less than: at exactly lagMs the replica is assumed caught up.
    // Only the user who wrote pays this cost -- everyone else scales out.
    if (wrote !== undefined && op.t - wrote < lagMs) {
      out.push("primary");
    } else {
      out.push("replica");
    }
  }

  return out;
}
`,
  },
};
