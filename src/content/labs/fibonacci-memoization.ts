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
  bridgesFrom: [
    {
      slug: "hash-table",
      sameness:
        "The memo IS a hash table sitting in front of a pure function. Key is the argument, value is the result, and the lookup is the same average O(1) get you already implemented.",
      delta:
        "What changes is what the cache is worth. A cache normally saves latency; here it saves a complexity class, because the naive recursion recomputes the same subproblems exponentially many times and the table collapses that to one evaluation each — exponential to linear. That only works if the function is deterministic and side-effect free, which is why memoisation is a property of the function as much as of the table.",
    },
    {
      slug: "lru-cache",
      sameness:
        "It IS a cache: same map from a computed key to a computed value, same hit-or-compute path on every call.",
      delta:
        "This one never evicts, and that is not laziness. Every entry may be needed again by a caller further up the recursion, so dropping a subproblem does not cost one recomputation — it costs the entire exponential subtree beneath it. A memo table with an LRU policy can be arbitrarily slower than one without, which is the inverse of the usual trade-off and the reason memo tables are bounded by the problem size rather than by a capacity you choose.",
    },
  ],
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
  challenge: {
    prompt:
      "Compute Fibonacci numbers fast by remembering what you have already computed. The naive recursion recalculates the same subproblems exponentially many times; a cache turns that into one computation per value.",
    entry: "fib",
    starter: `/**
 * @param {number} n - index, 0-based. fib(0) is 0, fib(1) is 1.
 * @returns {number} the nth Fibonacci number.
 */
function fib(n) {
  // Without memoisation this recomputes fib(30) over a million times.
}
`,
    tests: [
      {
        name: "base cases",
        body: `assertEquals(solution(0), 0);
assertEquals(solution(1), 1);`,
      },
      {
        name: "small values",
        body: `assertEquals(solution(10), 55);`,
      },
      {
        name: "a value the naive version chokes on",
        body: `assertEquals(solution(40), 102334155);`,
      },
      {
        name: "large index stays exact",
        body: `assertEquals(solution(70), 190392490709135);`,
      },
      {
        name: "repeated calls stay fast",
        body: `for (var i = 0; i < 2000; i++) solution(60);
assertEquals(solution(60), 1548008755920);`,
      },
      {
        name: "consecutive values satisfy the recurrence",
        body: `for (var n = 2; n < 30; n++) assertEquals(solution(n), solution(n - 1) + solution(n - 2));`,
      },
    ],
    hints: [
      "A plain object or Map keyed by n is enough of a cache.",
      "Check the cache before recursing, and store the result before returning it.",
      "An iterative bottom-up loop needs no cache at all — just the last two values.",
    ],
    reference: `function fib(n) {
  if (n < 2) return n;
  // Bottom-up: no recursion, no cache, and constant memory. The two previous
  // values are the only state the recurrence actually needs.
  let prev = 0;
  let cur = 1;
  for (let i = 2; i <= n; i++) {
    const next = prev + cur;
    prev = cur;
    cur = next;
  }
  return cur;
}
`,
  },
};
