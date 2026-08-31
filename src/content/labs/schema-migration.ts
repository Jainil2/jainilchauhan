import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "schema-migration",
  title: "Schema Migration",
  category: "System Design",
  difficulty: "Advanced",
  readingTimeMin: 7,
  blurb: "Old code and new code run at the same time. Every migration has to be true for both.",
  caption:
    "The same rename shipped two ways against a rolling deploy. The demo opens on the one-step plan — rename the column, deploy the code — and marks the two steps where the old replicas are still reading a column that no longer exists.",
  skillTags: ["System Design", "Databases", "Release Engineering"],
  bridgesFrom: [
    {
      slug: "btree-index",
      sameness:
        "An online migration IS the B-tree build you already did, running while the table is being written to. ADD INDEX and ADD COLUMN with a default both mean walking every row and constructing a new sorted structure beside the old one — same traversal, same page splits, same write amplification.",
      delta:
        "The table does not hold still while you build. Rows change under you, so the tool has to capture the changes it misses — a trigger, or the binlog — and replay them onto the copy until it catches up. That replay is why the operation is measured in hours on a large table, and why it can never quite finish on a table whose write rate exceeds the copy rate.",
    },
    {
      slug: "distributed-tx",
      sameness:
        "The dual-write phase IS a distributed transaction, run without a coordinator. You write the old column and the new column and need both or neither, which is exactly the atomic-commit problem — and here nobody is holding the prepare phase for you.",
      delta:
        "There is no coordinator, so there is no abort. A crash between the two writes leaves a row that is permanently inconsistent, and nothing raises an error. The mitigation is not two-phase commit but reconciliation: a backfill that runs continuously and a comparison job that reports divergence, so 'both or neither' becomes 'eventually both, and we can prove it'.",
    },
  ],
  concept:
    "The rule that generates every other rule: during a rolling deploy, version N and version N+1 of your application run against the same database at the same time, for minutes. Any schema change that is only valid for one of them takes an outage. So a migration is not one step — it is a sequence in which every intermediate state is compatible with both the code before it and the code after it.\n\nThat sequence is expand and contract. To rename a column you add the new one (expand), backfill it, write to both, switch reads to the new one, stop writing the old one, and only then drop it (contract). Six deploys where the naive plan had one, spread over days, and every intermediate state survives a rollback. The discipline is that expand steps are additive and safe, contract steps are destructive and irreversible, and they must be separated by at least one full deploy cycle — long enough that you are certain no running process still references the old shape.\n\nThe backfill is its own hazard. UPDATE on a hundred million rows is one enormous transaction: it holds locks, generates gigabytes of write-ahead log, blows out the replication stream, and if it is killed halfway it rolls back for as long as it ran. The safe pattern is small batched updates driven by a keyset cursor — WHERE id > :last ORDER BY id LIMIT 1000 — with a pause between batches and a check on replica lag that stops the job when it climbs. Never OFFSET: it rescans everything it has already skipped, so the job gets quadratically slower and the last batch is the slowest.\n\nDDL itself lies about how fast it is. In Postgres, ADD COLUMN with a constant default is instant on modern versions but rewrites the whole table on old ones; ADD CONSTRAINT takes an ACCESS EXCLUSIVE lock while it validates, unless you add it NOT VALID and validate separately; CREATE INDEX blocks writes unless it is CONCURRENTLY. In MySQL, the online-DDL support matrix varies by algorithm and by version, which is why tools like gh-ost and Vitess's managed schema changes exist: they build a shadow table, replay the binlog onto it, and cut over with a brief atomic rename, so the lock is milliseconds rather than hours.\n\nThe last discipline is the least fun: a migration is only finished when the old thing is gone. Half-completed expand/contract migrations accumulate — a nullable column nobody populates, a dual-write nobody removed, a table with two sources of truth — and each one is a trap for the next engineer, who cannot tell which column is authoritative. Track the contract step as work, not as cleanup.",
  complexity: [
    {
      operation: "ADD COLUMN (constant default)",
      time: "O(1) metadata on modern Postgres",
      space: "O(1)",
    },
    {
      operation: "Backfill, batched keyset",
      time: "O(n) with bounded lock time",
      space: "O(batch)",
    },
    { operation: "Backfill with OFFSET", time: "O(n²) — the classic mistake", space: "O(batch)" },
    {
      operation: "Online index build",
      time: "O(n log n), hours on a big table",
      space: "a second copy",
    },
  ],
  codeSnippet: {
    language: "sql",
    code: `-- Expand / contract for a rename, one deploy per step.

-- Step 1 (expand): additive, instant, safe to roll back.
ALTER TABLE accounts ADD COLUMN email_address text;

-- Step 2 (backfill): keyset cursor, small batches, pause between them.
-- Never OFFSET -- it rescans everything already skipped, so the job gets
-- quadratically slower and the final batch is the slowest one.
UPDATE accounts SET email_address = email
WHERE id > :cursor AND email_address IS NULL
ORDER BY id LIMIT 1000;
-- then: :cursor = last id written; sleep; check replica lag; repeat.

-- Step 3 (dual write): application writes BOTH columns. Old code still
-- reads \`email\` and is entirely happy.
-- Step 4 (switch reads): application reads email_address. Rollback is
-- still safe because \`email\` is still being written.
-- Step 5 (stop writing the old column). Now a rollback would lose data,
-- so this step waits until step 4 has been stable for a full cycle.

-- Step 6 (contract): irreversible, and the step teams forget to schedule.
ALTER TABLE accounts DROP COLUMN email;`,
  },
  realWorld: [
    "GitHub's gh-ost migrates MySQL tables by building a shadow copy and replaying the binlog, so the only lock is the atomic cut-over rename.",
    "Stripe describes a four-phase online migration — dual write, backfill, dual read, drop — used to move production data without downtime.",
    "Vitess offers managed online schema changes so a migration is a tracked, resumable operation rather than a DDL statement someone runs by hand.",
  ],
  pitfalls: [
    "Assuming your deploy is atomic. It is a rolling replacement, so old and new code query the same schema simultaneously for the length of the rollout.",
    "Backfilling with a single UPDATE. It holds locks, floods replication, and rolls back for as long as it ran if you cancel it.",
    "Paginating the backfill with OFFSET. It re-reads every skipped row, so the job degrades from linear to quadratic and appears to hang near the end.",
    "Adding a NOT NULL column with a default and a constraint in one statement. On several engines that is a full table rewrite under an exclusive lock, discovered in production at the size where it matters.",
  ],
  usedBy: [
    {
      company: "GitHub",
      product: "gh-ost",
      usage:
        "Triggerless online schema migration for MySQL: copies rows to a shadow table, tails the binlog for concurrent changes, then cuts over atomically.",
      href: "https://github.blog/2016-08-01-gh-ost-github-s-online-migration-tool-for-mysql/",
    },
    {
      company: "Stripe",
      product: "Online migrations",
      usage:
        "Documents the dual-write / backfill / dual-read / drop sequence used to migrate live production tables without downtime.",
      href: "https://stripe.com/blog/online-migrations",
    },
    {
      company: "Vitess",
      product: "Managed online schema changes",
      usage:
        "Runs schema changes as tracked, throttled, resumable operations across shards, with cut-over coordinated by the cluster rather than an operator.",
      href: "https://vitess.io/docs/user-guides/schema-changes/managed-online-schema-changes/",
    },
  ],
  references: [
    {
      label: "Stripe — Online migrations at scale",
      href: "https://stripe.com/blog/online-migrations",
    },
    {
      label: "gh-ost: GitHub's online schema migration tool for MySQL",
      href: "https://github.blog/2016-08-01-gh-ost-github-s-online-migration-tool-for-mysql/",
    },
  ],
  challenge: {
    prompt:
      "Plan a backfill. Given the rows of a table — some already migrated by an earlier run — produce the batches a keyset-cursor job would process: only the rows still needing work, in ascending id order, split into chunks of at most batchSize. Ordering is not cosmetic; it is what lets the job resume from the last id it wrote instead of re-scanning from the start. A batch size below one is not a slow backfill, it is an infinite loop, so reject it.",
    entry: "backfillBatches",
    starter: `/**
 * @param {Array<{id: number, migrated: boolean}>} rows - arbitrary order.
 * @param {number} batchSize
 * @returns {number[][]} batches of ids needing work, ascending, each at most
 *   batchSize long. Throws when batchSize < 1.
 */
function backfillBatches(rows, batchSize) {
  // Filter to the unmigrated rows, sort by id, chunk. No empty trailing batch.
}
`,
    tests: [
      {
        name: "splits into batches of the requested size",
        body: `var rows = [1, 2, 3, 4, 5].map(function (id) { return { id: id, migrated: false }; });
assertEquals(solution(rows, 2), [[1, 2], [3, 4], [5]]);`,
      },
      {
        name: "an exact multiple leaves no empty trailing batch",
        body: `var rows = [1, 2, 3, 4].map(function (id) { return { id: id, migrated: false }; });
assertEquals(solution(rows, 2), [[1, 2], [3, 4]]);`,
      },
      {
        name: "rows an earlier run already migrated are skipped",
        body: `var rows = [
  { id: 1, migrated: true },
  { id: 2, migrated: false },
  { id: 3, migrated: true },
  { id: 4, migrated: false },
];
assertEquals(solution(rows, 10), [[2, 4]]);`,
      },
      {
        name: "output is ascending whatever order the rows arrive in",
        body: `var rows = [
  { id: 40, migrated: false },
  { id: 7, migrated: false },
  { id: 19, migrated: false },
];
assertEquals(solution(rows, 2), [[7, 19], [40]]);`,
      },
      {
        name: "a finished backfill produces no batches",
        body: `var rows = [{ id: 1, migrated: true }, { id: 2, migrated: true }];
assertEquals(solution(rows, 100), []);`,
      },
      {
        name: "an empty table produces no batches",
        body: `assertEquals(solution([], 100), []);`,
      },
      {
        name: "a batch size larger than the table is one batch",
        body: `var rows = [{ id: 5, migrated: false }, { id: 6, migrated: false }];
assertEquals(solution(rows, 1000), [[5, 6]]);`,
      },
      {
        name: "a batch size of one gives single-row batches",
        body: `var rows = [{ id: 2, migrated: false }, { id: 1, migrated: false }];
assertEquals(solution(rows, 1), [[1], [2]]);`,
      },
      {
        name: "a batch size below one is rejected instead of looping forever",
        body: `var rows = [{ id: 1, migrated: false }];
assertThrows(function () { solution(rows, 0); }, "batchSize 0 must throw");
assertThrows(function () { solution(rows, -5); }, "a negative batchSize must throw");`,
      },
      {
        name: "handles a table worth backfilling",
        body: `var rows = [];
for (var i = 50000; i >= 1; i--) rows.push({ id: i, migrated: i % 5 === 0 });
var batches = solution(rows, 500);
assertEquals(batches.length, 80);
assertEquals(batches[0][0], 1);
assertEquals(batches[0].length, 500);
assertEquals(batches[79][499], 50000 - 1);`,
      },
    ],
    hints: [
      "Guard the batch size before doing any work: throw when it is less than one, otherwise the chunking loop never advances.",
      "Filter to the rows that still need work first, then sort those ids ascending — sorting the full table and filtering afterwards does strictly more work for the same answer.",
      "Chunk with a stepping index and `slice(i, i + batchSize)`, which naturally produces a short final batch and no empty one.",
    ],
    reference: `function backfillBatches(rows, batchSize) {
  // A batch size below one never advances the cursor. Failing loudly here is
  // the difference between a config typo and a job that pins a database.
  if (!(batchSize >= 1)) {
    throw new Error("batchSize must be at least 1");
  }

  // Only the rows still needing work, in id order. The ordering is what makes
  // the job resumable: the cursor is "the last id I wrote".
  const pending = [];
  for (const row of rows) {
    if (!row.migrated) pending.push(row.id);
  }
  pending.sort((a, b) => a - b);

  const batches = [];
  for (let i = 0; i < pending.length; i += batchSize) {
    batches.push(pending.slice(i, i + batchSize));
  }
  return batches;
}
`,
  },
};
