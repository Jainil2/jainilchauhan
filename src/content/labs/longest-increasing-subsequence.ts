import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "longest-increasing-subsequence",
  title: "Longest Increasing Subsequence",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "Find the longest ordered subsequence without requiring contiguity.",
  caption: "Advance across values and track the best subsequence ending at each index.",
  skillTags: ["DSA", "Dynamic Programming"],
  concept:
    "The O(n^2) LIS DP defines lis[i] as the longest increasing subsequence ending at i. It scans all earlier j where nums[j] < nums[i], then extends the best candidate. A faster O(n log n) method keeps tails: the smallest possible ending value for each length.\n\nLIS is useful for ordering, ranking, diffing, and reducing problems to monotonic subsequences.",
  complexity: [
    { operation: "Classic DP", time: "O(n^2)", space: "O(n)" },
    { operation: "Tails + binary search", time: "O(n log n)", space: "O(n)" },
  ],
  realWorld: ["Version diffing, ranking systems, envelope nesting, and sequence analysis."],
  pitfalls: [
    "Subsequence is not substring.",
    "Strict vs non-decreasing comparison changes answer.",
    "The O(n log n) tails array does not directly store the sequence without parent links.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// O(n log n): tails[i] = smallest possible tail of an increasing run of length i+1.
export function lisLength(xs: number[]): number {
  const tails: number[] = [];
  for (const x of xs) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      tails[mid] < x ? (lo = mid + 1) : (hi = mid);
    }
    tails[lo] = x; // extend or tighten
  }
  return tails.length; // tails is NOT the subsequence itself
}`,
  },
  usedBy: [
    {
      company: "Git / Linux Foundation",
      product: "Diff & patience diff",
      usage:
        "Patience diff computes a longest increasing subsequence over unique matching lines to anchor a readable diff.",
      href: "https://bramcohen.livejournal.com/73318.html",
    },
    {
      company: "Vue.js core team",
      product: "Keyed children DOM patching",
      usage:
        "The reconciler finds the longest increasing subsequence of stable indexes so only the remaining nodes are moved.",
      href: "https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts",
    },
    {
      company: "Bioinformatics tooling (BLAST-family)",
      product: "Seed chaining in sequence alignment",
      usage:
        "Chaining co-linear seed matches is an increasing-subsequence problem over match coordinates.",
    },
  ],
  references: [
    {
      label: "Patience diff — LIS over unique lines",
      href: "https://bramcohen.livejournal.com/73318.html",
    },
    {
      label: "CP-Algorithms — longest increasing subsequence",
      href: "https://cp-algorithms.com/sequences/longest_increasing_subsequence.html",
    },
  ],
};
