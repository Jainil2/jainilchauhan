import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "b-plus-tree",
  title: "B+ Tree",
  category: "Data Structures",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "Disk-friendly ordered index with linked leaf pages.",
  caption:
    "Scan linked leaf pages under a small internal index. B+ trees optimize databases for range scans and block storage.",
  skillTags: ["DSA", "Databases", "System Design"],
  concept:
    "A B+ tree is a high-fanout balanced search tree used for storage indexes. Internal nodes store separator keys that guide search. Records live in leaf pages, and leaves are linked so range scans can proceed sequentially.\n\nHigh fanout keeps height small, often 3-4 levels for millions of keys. Because nodes align with disk or SSD pages, each search performs a small number of page reads instead of many pointer hops.",
  complexity: [
    { operation: "Search/insert/delete", time: "O(log_f n)", space: "O(n)" },
    { operation: "Range scan k records", time: "O(log_f n + k)", space: "O(1)" },
  ],
  realWorld: ["PostgreSQL, MySQL/InnoDB, SQLite, filesystems, and ordered key-value stores."],
  pitfalls: [
    "Page splits and merges must preserve balance.",
    "Random inserts fragment pages more than sequential keys.",
    "Concurrency requires latching or optimistic page protocols.",
  ],
  codeSnippet: {
    language: "sql",
    code: `-- A B+tree index only helps if the query can use a prefix of its key order.
CREATE INDEX idx_orders_customer_created
  ON orders (customer_id, created_at DESC);

-- Index range scan: seek to (42, max) then walk leaf pages backwards.
EXPLAIN ANALYZE
SELECT id, total
FROM orders
WHERE customer_id = 42
  AND created_at >= now() - interval '30 days'
ORDER BY created_at DESC
LIMIT 20;

-- Covering index: leaves carry \`total\`, so the heap is never touched.
CREATE INDEX idx_orders_covering
  ON orders (customer_id, created_at DESC) INCLUDE (total);`,
  },
  usedBy: [
    {
      company: "PostgreSQL",
      product: "Default btree indexes",
      usage:
        "Postgres implements Lehman & Yao high-concurrency B+trees; leaf pages are linked so range scans walk sideways.",
      href: "https://www.postgresql.org/docs/current/btree-implementation.html",
    },
    {
      company: "Oracle / MySQL",
      product: "InnoDB clustered index",
      usage:
        "Table rows are stored in the leaves of the primary-key B+tree, so secondary indexes store PKs and require a second lookup.",
      href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html",
    },
    {
      company: "MongoDB",
      product: "WiredTiger row-store indexes",
      usage: "Index B+trees with page-level compression back equality, range and sort pushdown.",
      href: "https://www.mongodb.com/docs/manual/indexes/",
    },
  ],
  references: [
    {
      label: "PostgreSQL — btree implementation notes",
      href: "https://www.postgresql.org/docs/current/btree-implementation.html",
    },
    {
      label: "MySQL — InnoDB index types (clustered vs secondary)",
      href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html",
    },
  ],
};
