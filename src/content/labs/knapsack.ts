import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "knapsack",
  title: "0/1 Knapsack",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "Choose items under capacity to maximize value.",
  caption:
    "Adjust capacity and compare item choices. Each item can be taken or skipped exactly once.",
  skillTags: ["DSA", "Dynamic Programming"],
  concept:
    "0/1 knapsack asks for the maximum value that fits within a weight capacity when each item can be chosen at most once. The recurrence compares skipping the item vs taking it and adding the best value for remaining capacity.\n\nIt is a canonical DP because the same subproblem appears repeatedly: best value using first i items and capacity w.",
  complexity: [
    { operation: "DP table", time: "O(nW)", space: "O(nW)" },
    { operation: "1D optimized", time: "O(nW)", space: "O(W)" },
  ],
  realWorld: ["Budget allocation, packing, feature selection, and constrained resource planning."],
  pitfalls: [
    "Pseudo-polynomial: W matters.",
    "Loop direction matters for 1D 0/1 DP.",
    "Fractional knapsack is a different greedy problem.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// 0/1 knapsack, 1-D rolling array. Iterate capacity downward so each item is used once.
export function knapsack(items: { w: number; v: number }[], cap: number): number {
  const dp = new Array(cap + 1).fill(0);
  for (const it of items) {
    for (let c = cap; c >= it.w; c--) {
      dp[c] = Math.max(dp[c], dp[c - it.w] + it.v);
    }
  }
  return dp[cap]; // pseudo-polynomial: O(n * cap), cap is a value not a size
}`,
  },
  usedBy: [
    {
      company: "Amazon",
      product: "Package / container loading",
      usage:
        "Choosing which units fill a box or truck under weight and volume caps is a multi-dimensional knapsack solved heuristically.",
    },
    {
      company: "Google",
      product: "Ad budget allocation",
      usage:
        "Selecting a set of candidate ads with the highest expected value under a budget cap is a knapsack formulation.",
      href: "https://research.google/pubs/pub37409/",
    },
    {
      company: "Kubernetes / CNCF",
      product: "Pod bin-packing on nodes",
      usage:
        "The MostAllocated / bin-packing scoring strategy chooses placements that pack requests tightly into node capacity.",
      href: "https://kubernetes.io/docs/reference/scheduling/config/",
    },
  ],
  references: [
    {
      label: "Kubernetes — scheduler scoring & bin packing config",
      href: "https://kubernetes.io/docs/reference/scheduling/config/",
    },
    {
      label: "CP-Algorithms — knapsack style DP",
      href: "https://cp-algorithms.com/dynamic_programming/knapsack.html",
    },
  ],
};
