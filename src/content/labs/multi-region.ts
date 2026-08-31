import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "multi-region",
  title: "Multi-Region",
  category: "System Design",
  difficulty: "Advanced",
  readingTimeMin: 7,
  blurb:
    "Going multi-region does not buy availability. It buys a choice about which writes to lose.",
  caption:
    "Writes acknowledged in the primary region against a replication stream that lags. At the default 400ms lag with a lag spike partway through, the failover completes cleanly, the dashboard reports success, and three acknowledged writes no longer exist.",
  skillTags: ["System Design", "Distributed Systems", "Reliability"],
  bridgesFrom: [
    {
      slug: "cap-theorem",
      sameness:
        "This IS the CAP theorem, with the abstractions removed. The partition is not a thought experiment — it is 80 milliseconds of ocean between Virginia and Frankfurt, present on a good day and total on a bad one. Choosing active-passive is choosing C; choosing active-active with local writes is choosing A.",
      delta:
        "CAP asks what you give up during a partition. Operating across regions asks what you give up all the time, because the latency is permanent even when nothing is broken. A synchronous cross-region write costs a round trip on every request forever, so most systems pick asynchronous replication and accept a non-zero RPO — a quantity of acknowledged data they have decided in advance to lose.",
    },
    {
      slug: "vector-clocks",
      sameness:
        "Active-active writes ARE the concurrent-update problem vector clocks exist for. Two regions accept writes to the same key without having seen each other, which is the textbook definition of concurrent events, and the reconciliation you built is exactly what a global table has to run on conflict.",
      delta:
        "The clock is no longer the interesting part — the merge is, and it is a product decision rather than an algorithm. Last-writer-wins silently discards a real customer action; a CRDT keeps both but changes what the field means; a manual queue needs a human. Whichever you choose, someone in another timezone will read the result.",
    },
  ],
  concept:
    "A second region is expensive: double the infrastructure, cross-region data transfer charges, and a permanent latency floor set by physics — roughly 40ms Dublin to Virginia, 80ms Virginia to Frankfurt, 150ms London to Singapore, and no amount of money changes that. It is worth paying only when you can name the failure you are buying protection against, and the honest list is short: a regional outage of a cloud provider, a regional network partition, and data residency law.\n\nThe two shapes are active-passive and active-active. Active-passive keeps a warm standby replicating asynchronously; it is simple, and its cost is measured by two numbers. RPO — recovery point objective — is how much acknowledged data you are willing to lose, and it equals the replication lag at the moment of failure. RTO — recovery time objective — is how long the failover takes, and it is dominated not by the database but by DNS TTLs, connection pools reconnecting, and a human deciding to press the button.\n\nActive-active removes the failover step and introduces conflicts. Both regions accept writes, replication is bidirectional, and the same row can be modified in two places within the replication window. DynamoDB global tables resolve this with last-writer-wins on a timestamp, which is a correct-by-construction rule and a lossy one: a customer's address change can vanish because another region wrote a stale value a few milliseconds later by the clock. Systems that cannot tolerate that either partition the keyspace so each region owns a disjoint set of rows, or pay for consensus across regions — Spanner's approach, where TrueTime and Paxos give external consistency at the cost of a commit that waits out clock uncertainty.\n\nThe part that fails in practice is not the data plane but the failover procedure. It is rehearsed rarely, depends on a control plane that may itself be in the failing region, and touches DNS, which is cached by resolvers that ignore your TTL. Netflix's answer was to run the failover continuously rather than keeping it as a plan: regularly evacuate a region in production so the procedure is exercised, the capacity is known to exist, and the runbook is not fiction. A failover plan that has never been executed is an untested code path in the highest-stakes place you have one.\n\nAnd the honest accounting: multi-region raises availability only if the regions are genuinely independent. A shared control plane, a shared identity provider, a global config store, or a deploy pipeline that ships the same bad binary everywhere within five minutes are all single points of failure that survive the topology. Most multi-region outages are correlated failures, not regional ones.",
  complexity: [
    { operation: "Same-region round trip", time: "0.5–2 ms", space: "—" },
    { operation: "Cross-region round trip", time: "40–150 ms, permanent", space: "—" },
    {
      operation: "Async failover",
      time: "RTO: minutes",
      space: "RPO: writes inside the lag window",
    },
    {
      operation: "Sync cross-region commit",
      time: "RPO 0",
      space: "cost: a round trip on every write",
    },
  ],
  codeSnippet: {
    language: "sql",
    code: `-- The RPO of an asynchronous replica is a number you can read, not a policy
-- you can declare. On Postgres, ask the primary how far behind each standby is
-- in bytes and in time.
SELECT
  application_name              AS replica,
  state,                                     -- streaming | catchup
  sync_state,                                -- async | sync | quorum
  pg_wal_lsn_diff(sent_lsn, replay_lsn)      AS bytes_behind,
  replay_lag                                 AS time_behind
FROM pg_stat_replication;

--  replica    | state     | sync_state | bytes_behind | time_behind
-- ------------+-----------+------------+--------------+-------------
--  eu-west-1  | streaming | async      |     41943040 | 00:00:00.412
--
-- 412ms behind. Fail over now and every write acknowledged in the last 412ms
-- is gone -- committed, returned 200 to the client, and absent from the new
-- primary. That is the RPO, and it is not constant: it spikes with write
-- volume, during vacuum, and precisely when the incident that forces the
-- failover starts.`,
  },
  realWorld: [
    "DynamoDB global tables replicate multi-master with last-writer-wins conflict resolution, which is fast, eventually consistent, and quietly lossy for concurrent writes.",
    "Spanner uses TrueTime and Paxos to offer externally consistent cross-region transactions, paying a commit-wait for clock uncertainty instead of resolving conflicts afterwards.",
    "Netflix runs regional evacuations against production so the failover path is exercised routinely rather than discovered during an incident.",
  ],
  pitfalls: [
    "Treating replication lag as a constant. It is smallest when you measure it and largest during the incident that makes you fail over.",
    "Failing over the database but not the traffic. DNS resolvers cache past your TTL, so a meaningful fraction of clients keep talking to the dead region for minutes.",
    "Assuming last-writer-wins is a conflict resolution strategy. It is a conflict deletion strategy, and the deleted write was a real user action.",
    "Counting two regions as independent while both depend on one control plane, one identity provider, or one deploy pipeline that ships the same bad build to both.",
  ],
  usedBy: [
    {
      company: "AWS",
      product: "DynamoDB global tables",
      usage:
        "Multi-region, multi-active replication with last-writer-wins reconciliation, documented as eventually consistent across regions.",
      href: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html",
    },
    {
      company: "Google Cloud",
      product: "Spanner TrueTime",
      usage:
        "Externally consistent multi-region transactions built on bounded clock uncertainty, trading commit latency for zero-conflict global writes.",
      href: "https://cloud.google.com/spanner/docs/true-time-external-consistency",
    },
    {
      company: "Netflix",
      product: "Active-active regional architecture",
      usage:
        "Runs multiple AWS regions active-active and rehearses full regional evacuations in production so the failover path is known to work.",
      href: "https://netflixtechblog.com/active-active-for-multi-regional-resiliency-c47719f6685b",
    },
  ],
  references: [
    {
      label: "AWS — Disaster recovery options in the cloud",
      href: "https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html",
    },
    {
      label: "Google Cloud — Spanner TrueTime and external consistency",
      href: "https://cloud.google.com/spanner/docs/true-time-external-consistency",
    },
  ],
  challenge: {
    prompt:
      "Compute the real RPO of a failover. Each write is acknowledged to the client at some time and reaches the standby one replication lag later, where the lag is a step function sampled over the day — it is not constant, and it spikes exactly when traffic does. Given the writes, the lag samples, and the moment the primary is lost, return the ids of the writes that were acknowledged but never replicated, ascending. Those are the ones a customer saw succeed and will never see again.",
    entry: "writesLostOnFailover",
    starter: `/**
 * @param {Array<{id: number, ackedAt: number}>} writes
 * @param {Array<{at: number, lagMs: number}>} lagSamples - not necessarily sorted.
 *   A write acked at t replicates at t + the lag of the latest sample with
 *   at <= t. Writes before the first sample use the first sample's lag.
 * @param {number} failoverAt
 * @returns {number[]} ids of lost writes, ascending.
 */
function writesLostOnFailover(writes, lagSamples, failoverAt) {
  // A write is lost when ackedAt + lagAt(ackedAt) > failoverAt.
}
`,
    tests: [
      {
        name: "zero lag loses nothing",
        body: `var w = [{ id: 1, ackedAt: 10 }, { id: 2, ackedAt: 99 }];
assertEquals(solution(w, [{ at: 0, lagMs: 0 }], 100), []);`,
      },
      {
        name: "writes inside the lag window are lost",
        body: `var w = [{ id: 1, ackedAt: 100 }, { id: 2, ackedAt: 900 }];
// 400ms of lag: the write at 900 replicates at 1300, after the failover.
assertEquals(solution(w, [{ at: 0, lagMs: 400 }], 1000), [2]);`,
      },
      {
        name: "a lag spike changes the answer for later writes",
        body: `var samples = [{ at: 0, lagMs: 50 }, { at: 100, lagMs: 800 }];
var w = [
  { id: 1, ackedAt: 90 },   // 90 + 50 = 140, safe
  { id: 2, ackedAt: 110 },  // 110 + 800 = 910, lost
  { id: 3, ackedAt: 400 },  // 400 + 800 = 1200, lost
];
assertEquals(solution(w, samples, 500), [2, 3]);`,
      },
      {
        name: "a write before the first sample uses the first sample",
        body: `var w = [{ id: 1, ackedAt: -50 }];
assertEquals(solution(w, [{ at: 0, lagMs: 500 }], 100), [1]);`,
      },
      {
        name: "replicating exactly at the failover instant is not a loss",
        body: `var w = [{ id: 1, ackedAt: 600 }];
assertEquals(solution(w, [{ at: 0, lagMs: 400 }], 1000), []);`,
      },
      {
        name: "unsorted lag samples are handled",
        body: `var samples = [{ at: 100, lagMs: 800 }, { at: 0, lagMs: 50 }];
assertEquals(solution([{ id: 7, ackedAt: 110 }], samples, 500), [7]);`,
      },
      {
        name: "results come back ascending by id",
        body: `var w = [
  { id: 9, ackedAt: 950 },
  { id: 4, ackedAt: 960 },
  { id: 6, ackedAt: 10 },
];
assertEquals(solution(w, [{ at: 0, lagMs: 400 }], 1000), [4, 9]);`,
      },
      {
        name: "no writes in flight",
        body: `assertEquals(solution([], [{ at: 0, lagMs: 400 }], 1000), []);`,
      },
      {
        name: "a sample landing exactly on the ack time applies",
        body: `var samples = [{ at: 0, lagMs: 10 }, { at: 500, lagMs: 900 }];
assertEquals(solution([{ id: 1, ackedAt: 500 }], samples, 1000), [1]);`,
      },
      {
        name: "handles a busy primary with a long lag history",
        body: `var samples = [];
for (var s = 0; s < 200; s++) samples.push({ at: s * 500, lagMs: s % 2 === 0 ? 100 : 5000 });
var w = [];
for (var i = 1; i <= 5000; i++) w.push({ id: i, ackedAt: i * 20 });
var out = solution(w, samples, 100000);
// Only writes inside a spike window near the end can still be outstanding.
assert(out.length > 0, "some writes must be lost");
assertEquals(out[out.length - 1], 5000);`,
      },
    ],
    hints: [
      "Sort the lag samples by `at` once, up front. Doing it inside the per-write loop turns a linear job into a quadratic one.",
      "For each write, find the last sample whose `at` is <= ackedAt. Binary search over the sorted samples keeps the whole thing O((n + m) log m).",
      "The comparison is strict: replicatedAt > failoverAt is a loss, and replicatedAt exactly equal to failoverAt made it. Then sort the surviving ids ascending before returning.",
    ],
    reference: `function writesLostOnFailover(writes, lagSamples, failoverAt) {
  // Sort once. Lag is a step function, so lookup is "last sample at or
  // before t" -- a classic upper-bound binary search.
  const samples = lagSamples.slice().sort((a, b) => a.at - b.at);
  if (samples.length === 0) return [];

  function lagAt(t) {
    // Before the first observation we have nothing better than the first
    // observation. Pretending the lag was zero would understate the RPO,
    // which is the direction that gets people hurt.
    if (t < samples[0].at) return samples[0].lagMs;
    let lo = 0;
    let hi = samples.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (samples[mid].at <= t) lo = mid;
      else hi = mid - 1;
    }
    return samples[lo].lagMs;
  }

  const lost = [];
  for (const w of writes) {
    // Acknowledged to the client, not yet on the standby, and the primary is
    // gone. This is the RPO, measured in individual customer actions.
    if (w.ackedAt + lagAt(w.ackedAt) > failoverAt) lost.push(w.id);
  }
  return lost.sort((a, b) => a - b);
}
`,
  },
};
