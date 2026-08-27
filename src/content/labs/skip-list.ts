import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "skip-list",
  title: "Skip List",
  category: "Data Structures",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Probabilistic search structure.",
  caption:
    "A linked list that acts like a balanced tree. Use 'express lanes' (higher levels) to skip large sections of data. Watch the coin-flip decide the height of each node during insertion. The simplicity of a list with the speed of a tree.",
  skillTags: ["DSA", "Redis"],
  concept:
    "A Skip List is a probabilistic data structure that provides the same O(log N) search and insertion complexity as a balanced binary tree (like an AVL or Red-Black tree), but with a much simpler implementation based on linked lists.\n\nIt consists of multiple layers. The bottom layer is a standard sorted linked list. Each higher layer acts as an 'express lane' for the lists below. To find a value, you start at the top level and 'skip' forward until you would overshoot, then drop down a level.\n\nInsertion height is determined randomly (usually a 50% chance to grow a level), which statistically ensures that the layers maintain the proper density for O(log N) performance.",
  complexity: [
    { operation: "Search", time: "O(log N) avg", space: "O(N) avg" },
    { operation: "Insert", time: "O(log N) avg", space: "O(1) per node" },
  ],
  realWorld: [
    "Redis: the internal structure for `Sorted Sets` (ZSET).",
    "LevelDB / RocksDB: the implementation used for the in-memory MemTable.",
    "Lucene: used for some parts of the inverted index.",
  ],
  pitfalls: [
    "Worst-case performance is O(N) if the coin flips are extremely unlucky (all nodes height 1), though the probability is infinitesimally small.",
    "Pointer overhead: the multiple levels of pointers consume more memory than a compact array-based structure.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Probabilistic layered linked list: expected O(log n) search, no rotations.
function randomLevel(maxLevel = 16, p = 0.5) {
  let lvl = 1;
  while (Math.random() < p && lvl < maxLevel) lvl++;
  return lvl; // coin flips replace rebalancing logic
}

interface SkipNode { key: number; next: (SkipNode | undefined)[] }

function search(head: SkipNode, key: number): SkipNode | undefined {
  let node: SkipNode | undefined = head;
  for (let lvl = head.next.length - 1; lvl >= 0; lvl--) {
    while (node?.next[lvl] && node.next[lvl]!.key < key) node = node.next[lvl];
  }
  const cand = node?.next[0];
  return cand?.key === key ? cand : undefined;
}`,
  },
  usedBy: [
    {
      company: "Redis",
      product: "Sorted sets (ZSET / ZRANGEBYSCORE)",
      usage:
        "Redis backs sorted sets with a skip list plus a hash map, giving ranked leaderboards with O(log n) rank queries.",
      href: "https://redis.io/docs/latest/develop/data-types/sorted-sets/",
    },
    {
      company: "Apache Software Foundation",
      product: "HBase / Cassandra memtables",
      usage:
        "Concurrent skip lists keep in-memory writes sorted before flushing them to immutable SSTables.",
      href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentSkipListMap.html",
    },
    {
      company: "MongoDB / WiredTiger",
      product: "In-memory update lists",
      usage:
        "Skip lists provide lock-friendly ordered inserts for concurrent writers without tree rotations.",
    },
  ],
  references: [
    {
      label: "Redis docs — Sorted sets (skiplist encoding)",
      href: "https://redis.io/docs/latest/develop/data-types/sorted-sets/",
    },
    {
      label: "Pugh (1990) — Skip lists: a probabilistic alternative to balanced trees",
      href: "https://dl.acm.org/doi/10.1145/78973.78977",
    },
  ],
};
