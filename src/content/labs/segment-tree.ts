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
};
