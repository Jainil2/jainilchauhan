import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "fibonacci-memoization",
  title: "Fibonacci Memoization",
  category: "Algorithms",
  difficulty: "Beginner",
  readingTimeMin: 3,
  blurb: "Turn exponential recursion into linear work by caching subproblems.",
  caption:
    "Move n and watch solved Fibonacci values stay cached. Memoization is top-down dynamic programming.",
  skillTags: ["DSA", "Dynamic Programming"],
  concept:
    "Naive Fibonacci recursion recomputes the same subproblems many times. Memoization stores each solved F(n), so later calls return immediately. This changes the runtime from exponential to linear.\n\nThis is the core dynamic programming move: identify overlapping subproblems, define a recurrence, cache results, and reuse them.",
  complexity: [
    { operation: "Naive recursion", time: "O(2^n)", space: "O(n)" },
    { operation: "Memoized DP", time: "O(n)", space: "O(n)" },
  ],
  realWorld: [
    "Recursive optimization, parsers, route planning, and expensive repeated computations.",
  ],
  pitfalls: [
    "Cache key must capture all state.",
    "Memoization can trade too much memory for speed.",
    "Cycles in recurrence need detection.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Memoization turns an exponential recursion tree into a linear walk.
const memo = new Map<number, number>();
function fib(n: number): number {
  if (n < 2) return n;
  const hit = memo.get(n);
  if (hit !== undefined) return hit; // overlapping subproblem, computed once
  const v = fib(n - 1) + fib(n - 2);
  memo.set(n, v);
  return v;
}

// The same shape as a request-level cache: pure function + stable key + store.
function memoize<A extends unknown[], R>(fn: (...a: A) => R, key: (...a: A) => string) {
  const cache = new Map<string, R>();
  return (...args: A): R => {
    const k = key(...args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k)!;
  };
}`,
  },
  usedBy: [
    {
      company: "Meta",
      product: "React useMemo / cache()",
      usage:
        "Component memoization skips recomputation when inputs are unchanged — the same overlapping-subproblem argument at UI scale.",
      href: "https://react.dev/reference/react/useMemo",
    },
    {
      company: "Vercel",
      product: "Next.js request-level deduplication",
      usage:
        "Identical fetches in one render pass are deduped from a per-request cache instead of hitting the origin repeatedly.",
      href: "https://nextjs.org/docs/app/building-your-application/caching",
    },
    {
      company: "Google",
      product: "Bazel action cache",
      usage:
        "Build actions are keyed by input hashes so an already-computed subgraph is fetched, not rebuilt.",
      href: "https://bazel.build/remote/caching",
    },
  ],
  references: [
    { label: "React — useMemo", href: "https://react.dev/reference/react/useMemo" },
    {
      label: "Bazel — remote caching of build actions",
      href: "https://bazel.build/remote/caching",
    },
  ],
};
