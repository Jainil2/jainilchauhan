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
  bridgesFrom: [
    {
      slug: "btree-index",
      sameness:
        "It IS a B-tree. Same high fan-out, same split-on-full growth, same all-leaves-at-equal-depth shape, same page-sized nodes chosen to match the disk.",
      delta:
        "Values are removed from the internal nodes and live only at the leaves, which are then chained together left to right. Internal nodes hold nothing but separator keys, so they pack more of them per page and the tree gets shallower — fewer disk reads per lookup. The chained leaves are the real prize: a range scan descends once and then walks the leaf list sequentially instead of re-traversing the tree per key, which is why every relational database index is a B+ tree rather than a B-tree.",
    },
  ],
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
  challenge: {
    prompt:
      "Scan a key range from a B+ tree. All records live in the leaves, and the leaves are chained in order — so a range query finds the first leaf and then walks sideways. That linked leaf level is exactly why B+ trees, not B-trees, back database indexes.",
    entry: "rangeScan",
    starter: `/**
 * @param {number[][]} leaves - leaf pages, each sorted, and sorted relative to each other.
 * @param {number} lo - inclusive lower bound.
 * @param {number} hi - inclusive upper bound.
 * @returns {number[]} every key in [lo, hi], ascending.
 */
function rangeScan(leaves, lo, hi) {
  // Find the first leaf that could contain lo, then walk forward leaf by leaf
  // and stop as soon as a key passes hi. Do not scan leaves before or after.
}
`,
    tests: [
      {
        name: "range inside one leaf",
        body: `assertEquals(solution([[1, 2, 3], [4, 5, 6]], 1, 3), [1, 2, 3]);`,
      },
      {
        name: "range spanning two leaves",
        body: `assertEquals(solution([[1, 2, 3], [4, 5, 6]], 3, 5), [3, 4, 5]);`,
      },
      {
        name: "range covering everything",
        body: `assertEquals(solution([[1, 2], [3, 4]], 0, 99), [1, 2, 3, 4]);`,
      },
      {
        name: "range matching nothing",
        body: `assertEquals(solution([[1, 2], [7, 8]], 3, 6), []);`,
      },
      {
        name: "bounds are inclusive",
        body: `assertEquals(solution([[1, 2, 3]], 2, 2), [2]);`,
      },
      {
        name: "empty leaves are skipped",
        body: `assertEquals(solution([[], [1, 2], []], 1, 2), [1, 2]);`,
      },
      {
        name: "no leaves at all",
        body: `assertEquals(solution([], 1, 5), []);`,
      },
      {
        name: "stops early instead of scanning every leaf",
        body: `var leaves = [];
for (var i = 0; i < 20000; i++) leaves.push([i * 10, i * 10 + 1]);
var out = solution(leaves, 50, 71);
assertEquals(out, [50, 51, 60, 61, 70, 71]);`,
      },
    ],
    hints: [
      "Binary search the leaves on their last key to find the first one that could hold lo.",
      "Once inside the range, take keys while they are at most hi and stop at the first one that is not.",
      "Skip empty leaves rather than treating them as a stopping point.",
    ],
    reference: `function rangeScan(leaves, lo, hi) {
  const out = [];
  // Binary search for the first leaf whose last key reaches lo.
  let start = 0;
  let left = 0;
  let right = leaves.length - 1;
  start = leaves.length;
  while (left <= right) {
    const mid = (left + right) >> 1;
    const page = leaves[mid];
    if (page.length === 0 || page[page.length - 1] < lo) {
      left = mid + 1;
    } else {
      start = mid;
      right = mid - 1;
    }
  }
  // Walk the linked leaf level forward; bail out at the first key past hi.
  for (let i = start; i < leaves.length; i++) {
    for (const key of leaves[i]) {
      if (key > hi) return out;
      if (key >= lo) out.push(key);
    }
  }
  return out;
}
`,
  },
};
