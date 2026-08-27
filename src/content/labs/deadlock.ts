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
  challenge: {
    prompt:
      "Detect deadlock by finding a cycle in the wait-for graph. Every transaction in that cycle is waiting on another one in it, so none can ever proceed and the database has to break the tie by aborting someone.",
    entry: "findDeadlock",
    starter: `/**
 * @param {number} n - transactions 0..n-1.
 * @param {Array<[number, number]>} waitsFor - [a, b] means a waits on b.
 * @returns {number[]|null} the transactions in one cycle, ascending, or null
 *   when nothing is deadlocked.
 */
function findDeadlock(n, waitsFor) {
  // A transaction waiting on one that has already finished waiting is fine.
  // Only a cycle is a deadlock.
}
`,
    tests: [
      {
        name: "two transactions waiting on each other",
        body: `assertEquals(solution(2, [[0, 1], [1, 0]]), [0, 1]);`,
      },
      {
        name: "a chain is not a deadlock",
        body: `assertEquals(solution(3, [[0, 1], [1, 2]]), null);`,
      },
      {
        name: "a three-way cycle",
        body: `assertEquals(solution(3, [[0, 1], [1, 2], [2, 0]]), [0, 1, 2]);`,
      },
      {
        name: "a transaction waiting on itself",
        body: `assertEquals(solution(1, [[0, 0]]), [0]);`,
      },
      {
        name: "nobody waiting",
        body: `assertEquals(solution(3, []), null);`,
      },
      {
        name: "finds a cycle among non-waiting transactions",
        body: `assertEquals(solution(4, [[0, 1], [2, 3], [3, 2]]), [2, 3]);`,
      },
      {
        name: "a diamond of waits is not a cycle",
        body: `assertEquals(solution(4, [[0, 1], [0, 2], [1, 3], [2, 3]]), null);`,
      },
    ],
    hints: [
      "This is directed cycle detection: a three-state DFS distinguishes 'on the current path' from 'already finished'.",
      "When you meet a node that is still on the current path, the cycle is the slice of the path from that node onward.",
      "Sort the members before returning so the answer does not depend on where the search started.",
    ],
    reference: `function findDeadlock(n, waitsFor) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of waitsFor) adj[a].push(b);

  const state = new Array(n).fill(0); // 0 unseen, 1 on path, 2 finished
  const path = [];

  const walk = (node) => {
    state[node] = 1;
    path.push(node);
    for (const next of adj[node]) {
      if (state[next] === 1) {
        // Everything from 'next' onwards in the path is the cycle.
        return path.slice(path.indexOf(next)).sort((a, b) => a - b);
      }
      if (state[next] === 0) {
        const found = walk(next);
        if (found) return found;
      }
    }
    path.pop();
    state[node] = 2; // finished: safe to reach again later
    return null;
  };

  for (let i = 0; i < n; i++) {
    if (state[i] !== 0) continue;
    const found = walk(i);
    if (found) return found;
  }
  return null;
}
`,
  },
};
