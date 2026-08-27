import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "binary-search",
  title: "Binary Search",
  category: "Algorithms",
  difficulty: "Beginner",
  readingTimeMin: 4,
  blurb: "Find a target in sorted data by halving the search space.",
  caption:
    "Step through lo, mid, and hi. Binary search is simple, but boundary handling is where most bugs live.",
  skillTags: ["DSA", "Algorithms"],
  concept:
    "Binary search works on sorted monotonic data. It compares the target with the middle element, discards the half that cannot contain the answer, and repeats. The same idea applies to arrays, answer-space search, lower_bound/upper_bound, and monotonic predicates.\n\nThe key is maintaining an invariant: the answer is always inside the active range, or the active range represents the boundary being searched.",
  complexity: [
    { operation: "Search", time: "O(log n)", space: "O(1)" },
    { operation: "Recursive search", time: "O(log n)", space: "O(log n)" },
  ],
  realWorld: [
    "Database index lookup, sorted logs, feature thresholds, pagination cursors, and capacity planning search.",
  ],
  pitfalls: [
    "Off-by-one errors in lo/hi updates.",
    "Requires sorted or monotonic data.",
    "mid = (lo + hi) / 2 can overflow in low-level languages; use lo + (hi-lo)/2.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Overflow-safe lower bound: first index whose value is >= target.
export function lowerBound(xs: number[], target: number): number {
  let lo = 0, hi = xs.length; // invariant: answer in [lo, hi]
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1); // not (lo + hi) / 2
    if (xs[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// Binary search on the answer: smallest capacity that fits the SLA.
function minCapacity(canServe: (c: number) => boolean, hiBound: number) {
  let lo = 1, hi = hiBound;
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    canServe(mid) ? (hi = mid) : (lo = mid + 1);
  }
  return lo;
}`,
  },
  usedBy: [
    {
      company: "PostgreSQL",
      product: "Index page search",
      usage:
        "Locating a key inside a btree page is a binary search over the page's item pointers before descending a level.",
      href: "https://www.postgresql.org/docs/current/btree-implementation.html",
    },
    {
      company: "Google",
      product: "Chrome / V8 sorted lookups",
      usage:
        "Sorted-array lookups (source maps, ICU tables, timestamp ranges) resolve by binary search rather than linear scan.",
      href: "https://v8.dev/blog/array-sort",
    },
    {
      company: "Elastic",
      product: "Lucene term dictionary seeks",
      usage:
        "Block-based term dictionaries binary-search to a block before decoding it, keeping seek cost logarithmic.",
    },
  ],
  references: [
    {
      label: "Google Research blog — nearly all binary searches are broken (overflow)",
      href: "https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/",
    },
    {
      label: "CP-Algorithms — Binary search",
      href: "https://cp-algorithms.com/num_methods/binary_search.html",
    },
  ],
};
