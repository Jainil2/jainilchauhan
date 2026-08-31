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
  bridgesFrom: [
    {
      slug: "longest-common-subsequence",
      sameness:
        "It IS a longest common subsequence problem. Take the array, sort a copy of it, and the LIS of the array is the LCS of the array with its own sorted copy — the same table you already filled solves this with no new recurrence.",
      delta:
        "That reduction costs O(n squared), and it is worth knowing mainly because it explains why LIS feels like LCS. The extra structure here — one sequence, a total order — allows something LCS cannot do: keep an array of the smallest possible tail for each length and binary search it per element, which brings the whole thing to O(n log n). The tails array is not itself a valid subsequence, only its length is meaningful, which is the detail that makes reconstructing the actual sequence need a separate parent array.",
    },
    {
      slug: "binary-search",
      sameness:
        "The fast solution IS binary search in a loop. Maintain a sorted array of the smallest tail value achievable for each subsequence length, and for each element binary search for the position it belongs in.",
      delta:
        "The array being searched changes as you go, which is the part that feels wrong at first — but it stays sorted by construction, so the invariant holds. Each element costs one O(log n) search and one write, giving O(n log n) instead of the quadratic scan over all previous elements. The trade is interpretability: the quadratic DP stores an answer per index and can be read directly, while the tails array stores something that is not a subsequence at all.",
    },
  ],
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
  challenge: {
    prompt:
      "Find the length of the longest strictly increasing subsequence in n log n. The trick is that you never need the subsequence itself while searching — only the smallest possible tail for each achievable length.",
    entry: "lisLength",
    starter: `/**
 * @param {number[]} xs
 * @returns {number} length of the longest strictly increasing subsequence.
 */
function lisLength(xs) {
  // Keep an array where tails[k] is the smallest value that can end an
  // increasing subsequence of length k+1. It stays sorted, so you can binary
  // search it.
}
`,
    tests: [
      {
        name: "classic example",
        body: `assertEquals(solution([10, 9, 2, 5, 3, 7, 101, 18]), 4);`,
      },
      {
        name: "already increasing",
        body: `assertEquals(solution([1, 2, 3]), 3);`,
      },
      {
        name: "strictly decreasing",
        body: `assertEquals(solution([3, 2, 1]), 1);`,
      },
      {
        name: "duplicates do not extend a strict run",
        body: `assertEquals(solution([2, 2, 2]), 1);`,
      },
      {
        name: "empty input",
        body: `assertEquals(solution([]), 0);`,
      },
      {
        name: "single element",
        body: `assertEquals(solution([5]), 1);`,
      },
      {
        name: "handles negatives",
        body: `assertEquals(solution([-5, -1, -3, 0]), 3);`,
      },
      {
        name: "n log n on a large input",
        body: `var xs = [];
for (var i = 0; i < 100000; i++) xs.push((i * 7919) % 100000);
assert(solution(xs) > 0, 'expected a positive length');`,
      },
    ],
    hints: [
      "Maintain a tails array; its length at the end is the answer.",
      "For each value, binary search the first tail that is greater than or equal to it.",
      "Replace that tail if one was found, otherwise append — replacing keeps future options as open as possible.",
    ],
    reference: `function lisLength(xs) {
  const tails = []; // tails[k] = smallest possible tail of a length k+1 run
  for (const v of xs) {
    // First tail >= v. Using >= keeps the subsequence strictly increasing.
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < v) lo = mid + 1;
      else hi = mid;
    }
    // Replacing rather than appending keeps later options as open as possible.
    if (lo === tails.length) tails.push(v);
    else tails[lo] = v;
  }
  return tails.length;
}
`,
  },
};
