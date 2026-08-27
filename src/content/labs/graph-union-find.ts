import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "graph-union-find",
  title: "Graph Union-Find",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Answer dynamic connectivity in undirected graphs.",
  caption:
    "Union incoming edges and watch components merge. Union-Find is the graph connectivity workhorse behind Kruskal and online component tracking.",
  skillTags: ["DSA", "Graphs"],
  concept:
    "Union-Find maintains connected components as edges arrive. Each node points to a parent representative. Find returns the root; union merges two roots. Path compression and union by size or rank make operations almost constant time.\n\nFor undirected graphs where edges are only added, Union-Find is usually faster and simpler than rerunning DFS after every edge.",
  complexity: [
    { operation: "Find/union", time: "O(alpha(V))", space: "O(V)" },
    { operation: "Process E edges", time: "O(E alpha(V))", space: "O(V)" },
  ],
  realWorld: [
    "Kruskal minimum spanning tree, network connectivity, account merge, percolation, and image regions.",
  ],
  pitfalls: [
    "Does not support arbitrary deletions cleanly.",
    "Works for undirected connectivity, not directed reachability.",
    "Without path compression/rank, trees can become tall.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Connectivity queries under a stream of merges — no re-traversal.
const parent = new Map<string, string>();
const find = (x: string): string => {
  const p = parent.get(x) ?? x;
  if (p === x) return x;
  const root = find(p);
  parent.set(x, root); // path compression
  return root;
};
const union = (a: string, b: string) => {
  const ra = find(a), rb = find(b);
  if (ra !== rb) parent.set(rb, ra);
};

union("user:1", "device:a");
union("device:a", "user:2");
find("user:1") === find("user:2"); // true -> same cluster`,
  },
  usedBy: [
    {
      company: "Stripe",
      product: "Linked-account clustering",
      usage:
        "Streaming signals union accounts into fraud clusters without recomputing components from scratch.",
      href: "https://stripe.com/radar",
    },
    {
      company: "Apache Spark",
      product: "GraphX connected components",
      usage: "Distributed union-find style label propagation groups vertices across partitions.",
      href: "https://spark.apache.org/docs/latest/graphx-programming-guide.html",
    },
    {
      company: "Google",
      product: "Percolation / image segmentation",
      usage:
        "Pixel similarity merges produce segments incrementally, which is exactly incremental connectivity.",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — DSU applications",
      href: "https://cp-algorithms.com/data_structures/disjoint_set_union.html",
    },
    {
      label: "Spark GraphX — connected components",
      href: "https://spark.apache.org/docs/latest/graphx-programming-guide.html",
    },
  ],
};
