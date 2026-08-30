import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "fenwick-tree",
  title: "Fenwick Tree",
  category: "Data Structures",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Compact prefix sums with lowbit jumps.",
  caption:
    "Move the prefix endpoint and watch the query summarize values with lowbit jumps. Fenwick trees are smaller and simpler than segment trees for prefix-style operations.",
  skillTags: ["DSA", "Algorithms"],
  bridgesFrom: [
    {
      slug: "segment-tree",
      sameness:
        "It IS the same idea as a segment tree: internal aggregates over ranges so a prefix sum costs O(log n) instead of a scan, and a point update repairs O(log n) of them. The nodes even correspond — a Fenwick tree keeps only the ones a prefix query can actually land on.",
      delta:
        "Dropping the rest means the tree needs no pointers and no 4n array, just n slots navigated by the lowest set bit of the index. Half the memory and much smaller constants, and one real restriction: prefix queries are combined by subtraction, so the operation has to be invertible. Sums and XOR work, range minimum does not, which is the case where the full segment tree is still the answer.",
    },
  ],
  concept:
    "A Fenwick tree, or Binary Indexed Tree, stores partial sums in an array. The lowbit operation, i & -i, tells each index how large a range it summarizes. Prefix queries repeatedly subtract lowbit; point updates repeatedly add lowbit.\n\nFenwick trees are excellent for prefix sums, frequency tables, inversion counts, and dynamic cumulative distributions when the operation has an inverse.",
  complexity: [
    { operation: "Prefix query", time: "O(log n)", space: "O(1)" },
    { operation: "Point update", time: "O(log n)", space: "O(1)" },
    { operation: "Build", time: "O(n log n) or O(n)", space: "O(n)" },
  ],
  realWorld: [
    "Inversion counting, ranked leaderboards, cumulative frequencies, and online analytics buckets.",
  ],
  pitfalls: [
    "Indexing is usually 1-based, which causes off-by-one bugs.",
    "Less flexible than segment trees for arbitrary range operations.",
    "Requires invertible operations for easy range query conversion.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Binary Indexed Tree: prefix sums in O(log n) with one array and i & -i.
export class Fenwick {
  private t: number[];
  constructor(n: number) { this.t = new Array(n + 1).fill(0); }
  add(i: number, delta: number) {          // 1-based index
    for (; i < this.t.length; i += i & -i) this.t[i] += delta;
  }
  prefix(i: number) {
    let s = 0;
    for (; i > 0; i -= i & -i) s += this.t[i];
    return s;
  }
  range(lo: number, hi: number) { return this.prefix(hi) - this.prefix(lo - 1); }
}`,
  },
  usedBy: [
    {
      company: "Riot Games",
      product: "Leaderboard rank queries",
      usage:
        '"How many players scored above X" is a prefix-count over score buckets, updated as matches finish.',
    },
    {
      company: "Cloudflare",
      product: "Rolling analytics counters",
      usage:
        "Per-interval counters with cumulative queries let dashboards report windowed totals without scanning raw events.",
    },
    {
      company: "Codeforces / ICPC",
      product: "Inversion counting & order statistics",
      usage:
        "Counting inversions during a merge or answering k-th order statistics is the canonical Fenwick exercise.",
      href: "https://cp-algorithms.com/data_structures/fenwick.html",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — Fenwick tree",
      href: "https://cp-algorithms.com/data_structures/fenwick.html",
    },
    {
      label: "Fenwick (1994) — A new data structure for cumulative frequency tables",
      href: "https://doi.org/10.1002/spe.4380240306",
    },
  ],
  challenge: {
    prompt:
      "Maintain running prefix sums under point updates. A Fenwick tree does it with one array and a bit trick: each slot covers a span decided by the lowest set bit of its index.",
    entry: "fenwick",
    starter: `/**
 * @param {number} n - number of slots, indexed 0..n-1.
 * @param {Array<[string, number, number]>} ops - ['add', i, delta] | ['sum', i] prefix through i inclusive.
 * @returns {number[]} one entry per 'sum', in order.
 */
function fenwick(n, ops) {
  // Work in 1-based indices internally; the lowest set bit (i & -i) is both the
  // span a slot covers and the step you take between slots.
}
`,
    tests: [
      {
        name: "sum of a single addition",
        body: `assertEquals(solution(4, [['add', 0, 5], ['sum', 0]]), [5]);`,
      },
      {
        name: "prefix sums accumulate",
        body: `assertEquals(solution(4, [['add', 0, 1], ['add', 1, 2], ['sum', 1]]), [3]);`,
      },
      {
        name: "a later element is excluded from an earlier prefix",
        body: `assertEquals(solution(4, [['add', 3, 9], ['sum', 1]]), [0]);`,
      },
      {
        name: "the full prefix covers everything",
        body: `assertEquals(solution(4, [['add', 0, 1], ['add', 3, 4], ['sum', 3]]), [5]);`,
      },
      {
        name: "repeated additions to one slot",
        body: `assertEquals(solution(3, [['add', 1, 2], ['add', 1, 3], ['sum', 2]]), [5]);`,
      },
      {
        name: "handles negative deltas",
        body: `assertEquals(solution(3, [['add', 0, 5], ['add', 1, -2], ['sum', 2]]), [3]);`,
      },
      {
        name: "empty query set",
        body: `assertEquals(solution(4, [['add', 0, 1]]), []);`,
      },
      {
        name: "logarithmic per operation",
        body: `var ops = [];
for (var i = 0; i < 100000; i++) ops.push(['add', i, 1]);
ops.push(['sum', 99999]);
var out = solution(100000, ops);
assertEquals(out, [100000]);`,
      },
    ],
    hints: [
      "Allocate n+1 slots and translate the caller's 0-based index by adding one.",
      "To add: walk upward with i += i & -i, adding the delta to every slot you touch.",
      "To read a prefix: walk downward with i -= i & -i, summing the slots you pass.",
    ],
    reference: `function fenwick(n, ops) {
  const tree = new Array(n + 1).fill(0); // 1-based inside
  const out = [];

  const add = (i, delta) => {
    // i & -i isolates the lowest set bit: the span this slot is responsible for.
    for (let k = i + 1; k <= n; k += k & -k) tree[k] += delta;
  };
  const prefix = (i) => {
    let total = 0;
    for (let k = i + 1; k > 0; k -= k & -k) total += tree[k];
    return total;
  };

  for (const [op, a, b] of ops) {
    if (op === 'add') add(a, b);
    else out.push(prefix(a));
  }
  return out;
}
`,
  },
};
