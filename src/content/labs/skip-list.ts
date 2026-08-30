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
  bridgesFrom: [
    {
      slug: "linked-list",
      sameness:
        "It IS a sorted linked list. The bottom level is exactly the list you already built — same nodes, same next pointers, same linear walk — and every search still ends there.",
      delta:
        "Each node is randomly promoted to extra levels above, so a search starts on a sparse express lane and drops down only when the next node overshoots. That turns the O(n) walk into O(log n) expected, but expected is the operative word: the structure is randomised, so a pathological level assignment is possible and no rebalancing ever happens, unlike a tree that guarantees its height.",
    },
  ],
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
  challenge: {
    prompt:
      "Search a skip list and report the path you walked. Start at the top-left, move right while the next key does not overshoot, and drop a level when it would. The express lanes are why this behaves like a balanced tree without any rebalancing code.",
    entry: "search",
    starter: `/**
 * @param {number[][]} levels - levels[0] is the full sorted list; higher levels are
 *   sparser subsets of it. Every level is sorted ascending.
 * @param {number} target
 * @returns {{found: boolean, path: number[]}} path lists each key you land on,
 *   in order. Dropping a level records nothing on its own.
 */
function search(levels, target) {
  // Begin above the first element of the top level. At each level, step right
  // while the NEXT key is at most the target; otherwise drop down.
}
`,
    tests: [
      {
        name: "reaches a key along the express lane",
        body: `var levels = [[1, 2, 3, 4, 5, 6], [1, 3, 5], [1, 5]];
// Two steps on the top lane, and the lower lanes add nothing: six keys, two moves.
assertEquals(solution(levels, 5), { found: true, path: [1, 5] });`,
      },
      {
        name: "drops down to reach a key",
        body: `var levels = [[1, 2, 3, 4, 5, 6], [1, 3, 5], [1, 5]];
assertEquals(solution(levels, 3), { found: true, path: [1, 3] });`,
      },
      {
        name: "reports a missing key",
        body: `var levels = [[1, 3, 5], [1, 5]];
assertEquals(solution(levels, 4).found, false);`,
      },
      {
        name: "a target below everything walks nowhere",
        body: `var levels = [[5, 6], [5]];
assertEquals(solution(levels, 1), { found: false, path: [] });`,
      },
      {
        name: "finds the very first key",
        body: `var levels = [[1, 2, 3], [1, 3]];
assertEquals(solution(levels, 1), { found: true, path: [1] });`,
      },
      {
        name: "finds the last key",
        body: `var levels = [[1, 2, 3], [1, 3]];
assertEquals(solution(levels, 3), { found: true, path: [1, 3] });`,
      },
      {
        name: "single level behaves like a linked list",
        body: `assertEquals(solution([[1, 2, 3]], 2), { found: true, path: [1, 2] });`,
      },
      {
        name: "express lanes keep the path short",
        body: `var base = [];
for (var i = 0; i < 4096; i++) base.push(i);
var levels = [base];
var cur = base;
while (cur.length > 2) { var up = []; for (var j = 0; j < cur.length; j += 2) up.push(cur[j]); levels.push(up); cur = up; }
var r = solution(levels, 4095);
assertEquals(r.found, true);
assert(r.path.length < 40, 'path too long: ' + r.path.length);`,
      },
    ],
    hints: [
      "Work downwards from the highest level, keeping the key you are currently standing on.",
      "On each level, advance while the next key is less than or equal to the target, recording each key you move onto.",
      "When you drop a level, resume from the position of the key you are standing on within that lower level.",
    ],
    reference: `function search(levels, target) {
  const path = [];
  let current = null; // the key we are standing on, null means before the start

  for (let level = levels.length - 1; level >= 0; level--) {
    const lane = levels[level];
    // Resume from where the current key sits in this lane.
    let i = current === null ? -1 : lane.indexOf(current);
    while (i + 1 < lane.length && lane[i + 1] <= target) {
      i++;
      current = lane[i];
      path.push(current);
    }
  }
  return { found: current === target, path };
}
`,
  },
};
