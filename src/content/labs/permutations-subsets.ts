import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "permutations-subsets",
  title: "Permutations & Subsets",
  category: "Algorithms",
  difficulty: "Beginner",
  readingTimeMin: 4,
  blurb: "Generate combinatorial search spaces with recursion.",
  caption:
    "Switch between include/exclude subsets and order-sensitive permutations. Both are core backtracking templates.",
  skillTags: ["DSA", "Backtracking"],
  concept:
    "Subset generation branches on each item: include it or skip it. Permutation generation branches by choosing each remaining item for the next position. These templates are the basis for exhaustive search and many pruning algorithms.\n\nThe output size dominates runtime: there are 2^n subsets and n! permutations.",
  complexity: [
    { operation: "Generate subsets", time: "O(n 2^n)", space: "O(n)" },
    { operation: "Generate permutations", time: "O(n n!)", space: "O(n)" },
  ],
  realWorld: [
    "Feature combinations, brute-force search, puzzle solving, and small input optimization.",
  ],
  pitfalls: [
    "Output grows explosively.",
    "Duplicate input values need deduping rules.",
    "Mutable path arrays must be copied at output time.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Subsets via bitmask enumeration — 2^n combinations.
function subsets<T>(xs: T[]): T[][] {
  const out: T[][] = [];
  for (let mask = 0; mask < 1 << xs.length; mask++) {
    out.push(xs.filter((_, i) => mask & (1 << i)));
  }
  return out;
}

// Permutations via backtracking with an in-place swap.
function permute<T>(xs: T[], k = 0, out: T[][] = []): T[][] {
  if (k === xs.length) return (out.push([...xs]), out);
  for (let i = k; i < xs.length; i++) {
    [xs[k], xs[i]] = [xs[i], xs[k]];
    permute(xs, k + 1, out);
    [xs[k], xs[i]] = [xs[i], xs[k]]; // undo
  }
  return out;
}`,
  },
  usedBy: [
    {
      company: "Optimizely / experimentation platforms",
      product: "Feature-flag combination testing",
      usage:
        "Multivariate experiments enumerate the subset/permutation space of variants before pruning to a testable set.",
    },
    {
      company: "Netflix",
      product: "Chaos experiment matrices",
      usage:
        "Failure-injection suites enumerate combinations of failing dependencies to find the ones that break the request path.",
      href: "https://netflixtechblog.com/tagged/chaos-engineering",
    },
    {
      company: "Meta",
      product: "Property-based / fuzz input generation",
      usage:
        "Systematic enumeration of small input combinations catches ordering bugs random testing misses.",
    },
  ],
  references: [
    {
      label: "Netflix Tech Blog — chaos engineering",
      href: "https://netflixtechblog.com/tagged/chaos-engineering",
    },
    {
      label: "CP-Algorithms — submask enumeration",
      href: "https://cp-algorithms.com/algebra/all-submasks.html",
    },
  ],
  challenge: {
    prompt:
      "Generate every subset of a list, in bitmask order: subset i contains element j whenever bit j of i is set. Enumerating the power set this way needs no recursion at all, and the ordering falls out for free.",
    entry: "subsets",
    starter: `/**
 * @param {any[]} xs
 * @returns {any[][]} all 2**n subsets. Subset i holds xs[j] for every set bit j
 *   of i, with elements in their original order.
 */
function subsets(xs) {
  // Count from 0 to 2**n - 1 and read the bits of each number.
}
`,
    tests: [
      {
        name: "empty input has one subset",
        body: `assertEquals(solution([]), [[]]);`,
      },
      {
        name: "single element",
        body: `assertEquals(solution([1]), [[], [1]]);`,
      },
      {
        name: "two elements in bitmask order",
        body: `assertEquals(solution([1, 2]), [[], [1], [2], [1, 2]]);`,
      },
      {
        name: "three elements",
        body: `assertEquals(solution(['a', 'b', 'c']).length, 8);`,
      },
      {
        name: "elements keep their original order",
        body: `assertEquals(solution([1, 2, 3])[7], [1, 2, 3]);`,
      },
      {
        name: "the full set is last",
        body: `var out = solution([1, 2]);
assertEquals(out[out.length - 1], [1, 2]);`,
      },
      {
        name: "count doubles with each element",
        body: `assertEquals(solution([1, 2, 3, 4, 5]).length, 32);`,
      },
      {
        name: "handles duplicate values as distinct positions",
        body: `assertEquals(solution([1, 1]), [[], [1], [1], [1, 1]]);`,
      },
    ],
    hints: [
      "There are 2 to the power n subsets, so loop i from 0 up to that.",
      "Element j belongs to subset i when (i >> j) & 1 is 1.",
      "Build each subset by walking j from 0 upwards, which keeps the original order.",
    ],
    reference: `function subsets(xs) {
  const n = xs.length;
  const out = [];
  const total = 1 << n;
  for (let mask = 0; mask < total; mask++) {
    const subset = [];
    // j ascending keeps elements in their original order.
    for (let j = 0; j < n; j++) {
      if ((mask >> j) & 1) subset.push(xs[j]);
    }
    out.push(subset);
  }
  return out;
}
`,
  },
};
