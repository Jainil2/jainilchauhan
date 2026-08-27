import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "btree-index",
  title: "B-Tree Index",
  category: "Data Structures",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "Insert keys and watch nodes split — Postgres-style.",
  caption:
    "Insert keys into a B-tree of order 4 and watch nodes split as they fill. Lookup any key to compare against a naive table scan — this is exactly how Postgres and MySQL turn O(n) into O(log n).",
  skillTags: ["DSA", "Postgres", "System Design"],
  concept:
    "A B-tree (or B+ tree) is a self-balancing search tree where each node holds many keys instead of just one. This is critical for storage engines: a node fits inside a single disk page (~4KB-16KB), so each level of the tree is one disk read.\n\nWith a fanout of 100+, a B-tree of 100 million rows is only 4 levels deep — meaning a row lookup costs ~4 disk reads. A binary tree at the same scale would be 27+ levels deep.\n\nWhen a node fills (more than `order` keys), it splits in half and pushes the median key up to the parent. The tree grows at the root, never the leaves, which is why B-trees stay balanced. B+ trees (the variant Postgres and MySQL use) keep all data in leaf nodes and link the leaves into a sorted list, making range scans O(log n + k) instead of O((log n) × k).",
  complexity: [
    { operation: "Search", time: "O(log_b n)", space: "O(1)" },
    { operation: "Insert", time: "O(log_b n)", space: "O(log_b n) splits" },
    { operation: "Range scan (B+)", time: "O(log_b n + k)", space: "O(1)" },
  ],
  codeSnippet: {
    language: "sql",
    code: `-- Postgres: every PRIMARY KEY and UNIQUE constraint
-- is backed by a B-tree index. You can also create them explicitly:
CREATE INDEX users_email_idx ON users (email);

-- Compound index supports prefix queries
CREATE INDEX orders_user_date_idx ON orders (user_id, created_at);

-- Use EXPLAIN to see the planner pick the index
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'jainil@example.com';
-- Index Scan using users_email_idx  (cost=0.43..8.45 rows=1)`,
  },
  realWorld: [
    "PostgreSQL — default index type. B+ tree with 8KB pages.",
    "MySQL InnoDB — clustered B+ tree on the primary key (the table is the index).",
    "SQLite, Oracle, SQL Server — all default to B-trees.",
    "LSM-trees (RocksDB, Cassandra, ScyllaDB) are the alternative for write-heavy workloads.",
  ],
  pitfalls: [
    "Indexes speed reads but slow writes — every INSERT/UPDATE rewrites every affected index.",
    "Composite index (a, b, c) helps WHERE a=… and WHERE a=… AND b=… but NOT WHERE b=… alone.",
    "Index bloat from updates — VACUUM or REINDEX periodically on Postgres.",
    "High-cardinality indexes work great; low-cardinality (boolean) often don't help vs full scan.",
  ],
  usedBy: [
    {
      company: "PostgreSQL",
      product: "btree / covering indexes",
      usage:
        "Default indexes are Lehman-Yao B+trees; INCLUDE columns enable index-only scans that never touch the heap.",
      href: "https://www.postgresql.org/docs/current/indexes-index-only-scans.html",
    },
    {
      company: "Oracle / MySQL",
      product: "InnoDB clustered + secondary indexes",
      usage:
        "Rows live in the primary-key tree, so a secondary index lookup costs an extra primary-key traversal.",
      href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html",
    },
    {
      company: "MongoDB",
      product: "Compound index prefix rules",
      usage:
        "A compound index serves queries that use a left prefix of its keys — the same ordering constraint as SQL engines.",
      href: "https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/",
    },
    {
      company: "SQLite",
      product: "Query planner index selection",
      usage:
        "SQLite's documented planner rules show exactly when a B-tree index can satisfy WHERE plus ORDER BY.",
      href: "https://www.sqlite.org/queryplanner.html",
    },
  ],
  references: [
    {
      label: "PostgreSQL — index-only scans and covering indexes",
      href: "https://www.postgresql.org/docs/current/indexes-index-only-scans.html",
    },
    { label: "SQLite — the query planner", href: "https://www.sqlite.org/queryplanner.html" },
  ],
  challenge: {
    prompt:
      "Split a full B-tree node. Given a node's sorted keys, its maximum capacity, and a new key, return the two halves and the key that gets promoted to the parent. Splitting is the one operation that makes a B-tree grow, and it grows at the root, which is why the tree stays balanced for free.",
    entry: "splitNode",
    starter: `/**
 * @param {number[]} keys - the node's keys, sorted, already at capacity.
 * @param {number} newKey - the key being inserted.
 * @returns {{left: number[], promoted: number, right: number[]}}
 *   The promoted key belongs to neither half.
 */
function splitNode(keys, newKey) {
  // Insert first so the node is momentarily over capacity, then cut at the
  // middle. The middle key moves up to the parent.
}
`,
    tests: [
      {
        name: "splits an odd node",
        body: `assertEquals(solution([10, 20, 30], 25), { left: [10, 20], promoted: 25, right: [30] });`,
      },
      {
        name: "new key lands at the front",
        body: `assertEquals(solution([10, 20, 30], 5), { left: [5, 10], promoted: 20, right: [30] });`,
      },
      {
        name: "new key lands at the back",
        body: `assertEquals(solution([10, 20, 30], 40), { left: [10, 20], promoted: 30, right: [40] });`,
      },
      {
        name: "splits an even node",
        body: `assertEquals(solution([10, 20], 15), { left: [10], promoted: 15, right: [20] });`,
      },
      {
        name: "the promoted key belongs to neither half",
        body: `var r = solution([1, 2, 3, 4, 5], 6);
assert(r.left.indexOf(r.promoted) === -1, 'promoted leaked into left');
assert(r.right.indexOf(r.promoted) === -1, 'promoted leaked into right');`,
      },
      {
        name: "no key is lost in the split",
        body: `var r = solution([1, 3, 5, 7], 4);
var all = r.left.concat([r.promoted], r.right);
assertEquals(all, [1, 3, 4, 5, 7]);`,
      },
      {
        name: "both halves stay sorted",
        body: `var r = solution([9, 3, 5, 7].sort(function (a, b) { return a - b; }), 1);
var sorted = function (xs) { for (var i = 1; i < xs.length; i++) if (xs[i - 1] > xs[i]) return false; return true; };
assert(sorted(r.left) && sorted(r.right), 'a half came out unsorted');`,
      },
    ],
    hints: [
      "Insert the new key into a copy of the array at the position that keeps it sorted.",
      "The split point is the middle index of the combined array, found with a floor division by two.",
      "Everything before the middle is the left half, everything after is the right, and the middle itself is promoted.",
    ],
    reference: `function splitNode(keys, newKey) {
  const all = keys.slice();
  let at = 0;
  while (at < all.length && all[at] < newKey) at++;
  all.splice(at, 0, newKey);

  // The middle key moves up to the parent and belongs to neither child.
  const mid = Math.floor(all.length / 2);
  return {
    left: all.slice(0, mid),
    promoted: all[mid],
    right: all.slice(mid + 1),
  };
}
`,
  },
};
