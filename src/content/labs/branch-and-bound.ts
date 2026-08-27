import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "branch-and-bound",
  title: "Branch and Bound",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Search optimization branches while pruning hopeless states.",
  caption:
    "Expand the best bound and prune branches that cannot beat the incumbent. This is exhaustive search with math-guided cuts.",
  skillTags: ["DSA", "Optimization"],
  concept:
    "Branch and bound solves optimization problems by branching over decisions and computing a bound on the best possible result inside each branch. If a branch cannot beat the current best solution, it is pruned.\n\nThe quality of the bound determines performance. Strong bounds prune aggressively; weak bounds degrade toward brute force.",
  complexity: [
    { operation: "Worst case", time: "exponential", space: "depends on frontier" },
    {
      operation: "Pruned practical case",
      time: "problem/bound dependent",
      space: "problem dependent",
    },
  ],
  realWorld: [
    "Integer programming, knapsack optimization, TSP solvers, scheduling, and search planning.",
  ],
  pitfalls: [
    "A wrong bound can prune the optimal answer.",
    "Weak bounds do little work reduction.",
    "Priority frontier can grow large.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Explore the search tree, but prune any branch whose optimistic bound
// cannot beat the best solution found so far.
function branchAndBound(root: State, bound: (s: State) => number, value: (s: State) => number) {
  let best = -Infinity, bestState: State | null = null;
  const stack = [root];
  while (stack.length) {
    const s = stack.pop()!;
    if (bound(s) <= best) continue; // optimistic estimate is still worse -> prune
    if (s.isComplete) {
      const v = value(s);
      if (v > best) { best = v; bestState = s; }
      continue;
    }
    stack.push(...s.children());
  }
  return { best, bestState }; // bound quality decides whether this is fast or exponential
}`,
  },
  usedBy: [
    {
      company: "Google",
      product: "OR-Tools routing & MIP solvers",
      usage:
        "Vehicle routing and mixed-integer models are solved by branch-and-bound over LP relaxations.",
      href: "https://developers.google.com/optimization/routing",
    },
    {
      company: "Gurobi / IBM CPLEX",
      product: "Commercial MIP solvers",
      usage:
        "Branch-and-cut (bound + cutting planes) is the industry-standard exact method for supply-chain and scheduling models.",
      href: "https://www.gurobi.com/resources/mixed-integer-programming-mip-a-primer-on-the-basics/",
    },
    {
      company: "Bitcoin Core",
      product: "Coin selection",
      usage:
        "The wallet runs a bounded branch-and-bound search for an exact-match input set before falling back to random selection.",
      href: "https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp",
    },
  ],
  references: [
    {
      label: "Gurobi — MIP basics (branch and bound)",
      href: "https://www.gurobi.com/resources/mixed-integer-programming-mip-a-primer-on-the-basics/",
    },
    {
      label: "Google OR-Tools — routing solver",
      href: "https://developers.google.com/optimization/routing",
    },
  ],
  challenge: {
    prompt:
      "Compute the bound that makes branch and bound work: the best value achievable if items could be split fractionally. Because the relaxed problem can never do worse than the real one, any branch whose bound falls below the best known answer can be discarded unexplored.",
    entry: "fractionalBound",
    starter: `/**
 * @param {Array<[number, number]>} items - [weight, value], each positive.
 * @param {number} capacity
 * @returns {number} the best value when the LAST item taken may be split.
 */
function fractionalBound(items, capacity) {
  // Take items by value-per-weight, best first. When one no longer fits whole,
  // take the fraction that does and stop.
}
`,
    tests: [
      {
        name: "everything fits",
        body: `assertEquals(solution([[1, 10], [2, 20]], 5), 30);`,
      },
      {
        name: "splits the last item",
        body: `assertEquals(solution([[10, 100]], 5), 50);`,
      },
      {
        name: "prefers the better ratio first",
        body: `assertEquals(solution([[10, 10], [10, 100]], 10), 100);`,
      },
      {
        name: "zero capacity",
        body: `assertEquals(solution([[1, 5]], 0), 0);`,
      },
      {
        name: "no items",
        body: `assertEquals(solution([], 10), 0);`,
      },
      {
        name: "the bound is at least the integral answer",
        body: `assertEquals(solution([[6, 7], [4, 5], [3, 4]], 7) >= 9, true);`,
      },
      {
        name: "classic fractional example",
        body: `assertEquals(solution([[10, 60], [20, 100], [30, 120]], 50), 240);`,
      },
      {
        name: "handles many items",
        body: `var items = [];
for (var i = 1; i <= 5000; i++) items.push([i % 17 + 1, (i % 23) + 1]);
assert(solution(items, 1000) > 0, 'expected a positive bound');`,
      },
    ],
    hints: [
      "Sort a copy by value divided by weight, descending.",
      "Take each item whole while it fits, subtracting from the remaining capacity.",
      "When one does not fit, add value * remaining / weight and stop immediately.",
    ],
    reference: `function fractionalBound(items, capacity) {
  // Best ratio first: this greedy IS optimal once splitting is allowed, which
  // is precisely why it upper-bounds the 0/1 answer.
  const sorted = items.slice().sort((a, b) => b[1] / b[0] - a[1] / a[0]);
  let remaining = capacity;
  let total = 0;
  for (const [weight, value] of sorted) {
    if (remaining <= 0) break;
    if (weight <= remaining) {
      total += value;
      remaining -= weight;
    } else {
      total += (value * remaining) / weight;
      break; // capacity is exhausted by the fraction
    }
  }
  return total;
}
`,
  },
};
