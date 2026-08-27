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
};
