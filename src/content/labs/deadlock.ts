import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "deadlock",
  title: "Dining Philosophers — Deadlock",
  category: "Distributed Systems",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "5 philosophers, 5 forks, one classic deadlock.",
  caption:
    "Run the naive strategy and watch all 5 philosophers grab the left fork → instant deadlock. Switch to resource ordering or asymmetric and watch them eat. The wait-for graph never closes a cycle.",
  skillTags: ["DSA", "System Design", "Distributed Systems"],
  concept:
    "Dijkstra's Dining Philosophers problem is the canonical concurrency parable. Five philosophers sit around a table; between each pair is one fork. Each needs both adjacent forks to eat. If everyone grabs their left fork at the same time, everyone waits forever for their right — a perfect circular wait, the textbook deadlock.\n\nDeadlock requires four conditions (Coffman, 1971): mutual exclusion, hold-and-wait, no preemption, and a circular wait. Break any one and you can't deadlock.\n\nClassic fixes: (1) global resource ordering — always grab the lower-numbered fork first, breaking the circular wait; (2) asymmetric solution — one philosopher reverses their order; (3) try-and-back-off with random retry (livelock risk!); (4) waiter/arbitrator mediates fork access.\n\nReal systems hit this constantly: database transactions waiting on row locks, distributed locks across services, even goroutine channel sends.",
  realWorld: [
    "Postgres deadlock detector — runs every deadlock_timeout (1s default), aborts one transaction.",
    "MySQL InnoDB — same; SHOW ENGINE INNODB STATUS shows the last detected cycle.",
    "JVM thread dumps — jstack flags 'Found one Java-level deadlock' with the cycle.",
    "Distributed locks (Redlock, ZooKeeper) — careful lock ordering across services.",
  ],
  pitfalls: [
    "Random back-off can become livelock — both retry, both back off, both retry…",
    "Lock ordering only works if all callers know the order — one rogue path = deadlock returns.",
    "Holding a transaction open across user input is the #1 way to deadlock a database in production.",
  ],
  references: [
    {
      label: "Coffman et al. — System Deadlocks (1971)",
      href: "https://dl.acm.org/doi/10.1145/356586.356588",
    },
  ],
  codeSnippet: {
    language: "sql",
    code: `-- Classic deadlock: two transactions lock the same rows in opposite order.
-- tx A                                  -- tx B
BEGIN;                                    BEGIN;
UPDATE accounts SET bal = bal - 10        UPDATE accounts SET bal = bal - 5
  WHERE id = 1;                             WHERE id = 2;
UPDATE accounts SET bal = bal + 10        UPDATE accounts SET bal = bal + 5
  WHERE id = 2;  -- waits for B             WHERE id = 1;  -- waits for A  => cycle

-- Fixes, in order of preference:
--   1. always lock rows in a deterministic order (e.g. ORDER BY id)
--   2. keep transactions short and touch fewer rows
--   3. set a lock timeout and retry the victim transaction
SET lock_timeout = '2s';`,
  },
  usedBy: [
    {
      company: "Oracle",
      product: "MySQL InnoDB deadlock detector",
      usage:
        "InnoDB maintains a wait-for graph, detects cycles, and rolls back the transaction with the fewest changes.",
      href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlock-detection.html",
    },
    {
      company: "PostgreSQL",
      product: "deadlock_timeout detection",
      usage:
        "Postgres waits deadlock_timeout, then checks the lock graph and aborts one transaction with a detailed error.",
      href: "https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS",
    },
    {
      company: "Microsoft",
      product: "SQL Server deadlock graphs",
      usage:
        "Extended Events capture the deadlock graph so teams can see which statements locked resources in conflicting order.",
      href: "https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide",
    },
    {
      company: "Go project",
      product: 'Runtime "all goroutines are asleep" detector',
      usage:
        "Go panics on total deadlock, surfacing circular channel waits that would otherwise hang silently.",
      href: "https://go.dev/ref/mem",
    },
  ],
};
