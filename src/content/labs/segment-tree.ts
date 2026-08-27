import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "segment-tree",
  title: "Segment Tree",
  category: "Data Structures",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Range queries and point updates in logarithmic time.",
  caption:
    "Select ranges and compute sums from covered intervals. Segment trees trade memory for fast range aggregation.",
  skillTags: ["DSA", "Algorithms"],
  concept:
    "A segment tree recursively partitions an array into intervals. Each tree node stores an aggregate for its interval, such as sum, min, max, gcd, or a custom merge value. Range queries combine only the nodes that fully cover the requested interval.\n\nPoint updates update one leaf and recompute ancestors. Lazy propagation extends the structure to range updates by deferring work until a child interval is needed.",
  complexity: [
    { operation: "Build", time: "O(n)", space: "O(n)" },
    { operation: "Range query", time: "O(log n)", space: "O(log n)" },
    { operation: "Point update", time: "O(log n)", space: "O(1)" },
  ],
  realWorld: [
    "Leaderboard intervals, time-series windows, computational geometry, and competitive programming range queries.",
  ],
  pitfalls: [
    "Uses more memory than a Fenwick tree.",
    "Lazy propagation bugs are common.",
    "The merge function must be associative.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Range sum with point update in O(log n) using an iterative segment tree.
export class SegmentTree {
  private t: number[];
  constructor(private xs: number[]) {
    const n = xs.length;
    this.t = new Array(2 * n).fill(0);
    for (let i = 0; i < n; i++) this.t[n + i] = xs[i];
    for (let i = n - 1; i > 0; i--) this.t[i] = this.t[2 * i] + this.t[2 * i + 1];
  }
  update(i: number, value: number) {
    const n = this.xs.length;
    for (this.t[(i += n)] = value; i > 1; i >>= 1) this.t[i >> 1] = this.t[i] + this.t[i ^ 1];
  }
  query(lo: number, hi: number) { // [lo, hi)
    const n = this.xs.length;
    let sum = 0;
    for (lo += n, hi += n; lo < hi; lo >>= 1, hi >>= 1) {
      if (lo & 1) sum += this.t[lo++];
      if (hi & 1) sum += this.t[--hi];
    }
    return sum;
  }
}`,
  },
  usedBy: [
    {
      company: "Google",
      product: "Monarch / time-series range rollups",
      usage:
        'Hierarchical range-aggregation trees answer "sum over this window" without rescanning every raw sample.',
      href: "https://research.google/pubs/pub50652/",
    },
    {
      company: "Figma",
      product: "Multiplayer text CRDT ranges",
      usage:
        "Interval/segment trees map document offsets to formatting spans so an edit updates ranges in logarithmic time.",
      href: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
    },
    {
      company: "Codeforces / ICPC",
      product: "Competitive programming toolbox",
      usage:
        "The default structure for mixed range-query + point-update workloads, including lazy-propagated range updates.",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — Segment tree",
      href: "https://cp-algorithms.com/data_structures/segment_tree.html",
    },
    {
      label: "Google — Monarch: planet-scale in-memory time series",
      href: "https://research.google/pubs/pub50652/",
    },
  ],
  challenge: {
    prompt:
      "Answer range-minimum queries over an array that keeps changing. Point updates and range queries both in O(log n), by storing a summary of every subrange instead of the raw values alone.",
    entry: "segmentTree",
    starter: `/**
 * @param {number[]} values - initial array.
 * @param {Array<[string, number, number]>} ops - ['update', i, v] | ['min', lo, hi] inclusive.
 * @returns {number[]} one entry per 'min' query, in order.
 */
function segmentTree(values, ops) {
  // Each internal node stores the minimum of its two children. An update walks
  // one leaf-to-root path; a query stitches together O(log n) covering nodes.
}
`,
    tests: [
      {
        name: "minimum of the whole range",
        body: `assertEquals(solution([5, 2, 8], [['min', 0, 2]]), [2]);`,
      },
      {
        name: "minimum of a sub-range",
        body: `assertEquals(solution([5, 2, 8, 1], [['min', 0, 1]]), [2]);`,
      },
      {
        name: "a single element range",
        body: `assertEquals(solution([5, 2, 8], [['min', 1, 1]]), [2]);`,
      },
      {
        name: "update lowers the minimum",
        body: `assertEquals(solution([5, 2, 8], [['update', 2, 0], ['min', 0, 2]]), [0]);`,
      },
      {
        name: "update raises a former minimum",
        body: `assertEquals(solution([5, 2, 8], [['update', 1, 9], ['min', 0, 2]]), [5]);`,
      },
      {
        name: "queries outside the updated range are unaffected",
        body: `assertEquals(solution([5, 2, 8, 1], [['update', 0, -3], ['min', 1, 3]]), [1]);`,
      },
      {
        name: "handles negatives",
        body: `assertEquals(solution([-1, -7, 3], [['min', 0, 2]]), [-7]);`,
      },
      {
        name: "logarithmic, not a rescan per query",
        body: `var vs = [];
for (var i = 0; i < 50000; i++) vs.push(i);
var ops = [];
for (var j = 0; j < 20000; j++) ops.push(['min', j, 49999]);
var out = solution(vs, ops);
assertEquals(out.length, 20000);
assertEquals(out[0], 0);
assertEquals(out[19999], 19999);`,
      },
    ],
    hints: [
      "A flat array of size 2n works: leaves live at n..2n-1, and the parent of i is i>>1.",
      "Build bottom-up: tree[i] = Math.min(tree[2i], tree[2i+1]) walking i downwards from n-1.",
      "For a query, start at the two leaf positions and walk inward; take a node into the answer when it is the odd side of its parent.",
    ],
    reference: `function segmentTree(values, ops) {
  const n = values.length;
  const tree = new Array(2 * n);
  for (let i = 0; i < n; i++) tree[n + i] = values[i];
  for (let i = n - 1; i > 0; i--) tree[i] = Math.min(tree[2 * i], tree[2 * i + 1]);

  const update = (i, v) => {
    let node = n + i;
    tree[node] = v;
    // Repair only the path from this leaf to the root.
    while (node > 1) {
      node >>= 1;
      tree[node] = Math.min(tree[2 * node], tree[2 * node + 1]);
    }
  };

  const query = (lo, hi) => {
    let best = Infinity;
    let l = lo + n;
    let r = hi + n + 1; // half-open on the right
    while (l < r) {
      // An odd index is the right child, so its parent covers more than we want.
      if (l & 1) best = Math.min(best, tree[l++]);
      if (r & 1) best = Math.min(best, tree[--r]);
      l >>= 1;
      r >>= 1;
    }
    return best;
  };

  const out = [];
  for (const [op, a, b] of ops) {
    if (op === 'update') update(a, b);
    else out.push(query(a, b));
  }
  return out;
}
`,
  },
};
