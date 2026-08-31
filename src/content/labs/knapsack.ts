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
  bridgesFrom: [
    {
      slug: "coin-change",
      sameness:
        "It IS the same table. Capacity along one axis, one row per item, and the same take-it-or-leave-it recurrence comparing what you get by including an item against what you already had without it.",
      delta:
        "Each item may be used at most once, and remarkably that entire difference is encoded in the direction of one loop. Iterating capacity downward means an item's row reads values that do not yet include that item, so it is used once; iterate upward and you have unbounded coin change back. The other change is what the cell holds — a maximised value rather than a minimised count — which is also why the pseudo-polynomial O(n times W) hides a real cost: the table scales with the numeric capacity, so a knapsack with huge capacities is not tractable just because it has few items.",
    },
  ],
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
  challenge: {
    prompt:
      "Choose items to maximise value without exceeding a weight budget, where each item is taken whole or not at all. The greedy value-per-weight choice is wrong here, which is exactly why the problem needs dynamic programming.",
    entry: "knapsack",
    starter: `/**
 * @param {Array<[number, number]>} items - [weight, value] pairs.
 * @param {number} capacity - total weight allowed.
 * @returns {number} the best achievable total value.
 */
function knapsack(items, capacity) {
  // For each item, the best answer is either 'skip it' or 'take it and solve
  // the smaller budget'. Take the larger.
}
`,
    tests: [
      {
        name: "takes the better single item",
        body: `assertEquals(solution([[3, 4], [2, 3]], 3), 4);`,
      },
      {
        name: "combines items to fill the budget",
        body: `assertEquals(solution([[1, 1], [2, 6], [3, 10]], 5), 16);`,
      },
      {
        name: "greedy by ratio would be wrong here",
        body: `assertEquals(solution([[6, 7], [4, 5], [3, 4]], 7), 9);`,
      },
      {
        name: "zero capacity holds nothing",
        body: `assertEquals(solution([[1, 5]], 0), 0);`,
      },
      {
        name: "no items",
        body: `assertEquals(solution([], 10), 0);`,
      },
      {
        name: "an item heavier than the budget is skipped",
        body: `assertEquals(solution([[100, 99]], 10), 0);`,
      },
      {
        name: "each item may be used only once",
        body: `assertEquals(solution([[2, 5]], 10), 5);`,
      },
      {
        name: "handles a larger instance",
        body: `var items = [];
for (var i = 1; i <= 120; i++) items.push([i % 20 + 1, (i % 13) + 1]);
assert(solution(items, 200) > 0, 'expected a positive value');`,
      },
    ],
    hints: [
      "One row of best-value-per-capacity is enough if you handle the update order carefully.",
      "With a single row, iterate capacity DOWNWARDS, or you will reuse the same item twice.",
      "best[c] = max(best[c], best[c - weight] + value) for every capacity that fits the item.",
    ],
    reference: `function knapsack(items, capacity) {
  const best = new Array(capacity + 1).fill(0);
  for (const [weight, value] of items) {
    // Downwards: an ascending sweep would let this item be taken more than
    // once, which turns 0/1 knapsack into the unbounded version.
    for (let c = capacity; c >= weight; c--) {
      const candidate = best[c - weight] + value;
      if (candidate > best[c]) best[c] = candidate;
    }
  }
  return best[capacity];
}
`,
  },
};
