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
};
