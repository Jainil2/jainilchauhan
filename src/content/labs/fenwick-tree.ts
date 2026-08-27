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
};
