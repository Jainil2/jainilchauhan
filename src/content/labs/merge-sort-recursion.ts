import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "merge-sort-recursion",
  title: "Merge Sort Recursion",
  category: "Algorithms",
  difficulty: "Beginner",
  readingTimeMin: 4,
  blurb: "Divide arrays into halves, then merge sorted halves.",
  caption:
    "Split down to singletons, then merge back into sorted order. Merge sort is the canonical divide-and-conquer algorithm.",
  skillTags: ["DSA", "Divide and Conquer"],
  bridgesFrom: [
    {
      slug: "sorting-race",
      sameness:
        "It IS the merge sort you already watched run in the race — split in half, sort each half, merge the two sorted halves. This lab just opens the recursion up so you can see the calls.",
      delta:
        "Watching the recursion is what makes the O(n log n) stop being a fact you memorised: there are log n levels, each does O(n) work merging, and neither depends on the input's arrangement, which is why merge sort has no bad case. It also exposes the cost the race hides — merging needs somewhere to put the output, so this is the one contestant that is not in place, and that O(n) extra buffer is precisely what makes it the algorithm that survives when the data no longer fits in memory.",
    },
  ],
  concept:
    "Merge sort divides an array into halves until each piece has one element, then merges sorted halves back together. The divide phase creates log n levels, and each level performs O(n) total merge work.\n\nIt guarantees O(n log n), is stable, and adapts well to linked lists and external sorting because merging is sequential.",
  complexity: [
    { operation: "Sort", time: "O(n log n)", space: "O(n)" },
    { operation: "Merge two sorted arrays", time: "O(n)", space: "O(n)" },
  ],
  realWorld: [
    "Stable sorting, external merge sort, linked-list sorting, and distributed sort pipelines.",
  ],
  pitfalls: [
    "Needs extra memory for arrays.",
    "Recursive allocation can be costly if not optimized.",
    "Small arrays are often faster with insertion sort.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Divide and conquer: T(n) = 2T(n/2) + O(n) => O(n log n), stable.
export function mergeSort(xs: number[]): number[] {
  if (xs.length <= 1) return xs;
  const mid = xs.length >> 1;
  const left = mergeSort(xs.slice(0, mid));
  const right = mergeSort(xs.slice(mid));
  const out: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    out.push(left[i] <= right[j] ? left[i++] : right[j++]); // <= keeps it stable
  }
  return out.concat(left.slice(i), right.slice(j));
}`,
  },
  usedBy: [
    {
      company: "Python Software Foundation",
      product: "Timsort merge phase",
      usage:
        "Timsort is an adaptive merge sort: natural runs are merged with galloping mode instead of blind halving.",
      href: "https://github.com/python/cpython/blob/main/Objects/listsort.txt",
    },
    {
      company: "Google",
      product: "MapReduce / BigQuery shuffle merges",
      usage:
        "Distributed sorts merge sorted partitions across machines — merge sort where each half lives on a different node.",
      href: "https://research.google/pubs/pub62/",
    },
    {
      company: "Elastic",
      product: "Lucene segment merges",
      usage:
        "Sorted postings from multiple segments are merged into a larger sorted segment during background merges.",
      href: "https://lucene.apache.org/core/9_9_0/core/org/apache/lucene/index/MergePolicy.html",
    },
  ],
  references: [
    {
      label: "CPython — listsort.txt (adaptive merging)",
      href: "https://github.com/python/cpython/blob/main/Objects/listsort.txt",
    },
    {
      label: "Lucene — MergePolicy",
      href: "https://lucene.apache.org/core/9_9_0/core/org/apache/lucene/index/MergePolicy.html",
    },
  ],
  challenge: {
    prompt:
      "Merge two sorted arrays into one. This is the step every merge sort is built from, and the reason merge sort is stable: when two values tie, the one from the left array goes first.",
    entry: "merge",
    starter: `/**
 * @param {number[]} a - sorted ascending.
 * @param {number[]} b - sorted ascending.
 * @returns {number[]} all values from both, ascending.
 */
function merge(a, b) {
  // Walk both with one index each, always taking the smaller head.
  // On a tie take from 'a' first, which is what makes merge sort stable.
}
`,
    tests: [
      {
        name: "interleaves two runs",
        body: `assertEquals(solution([1, 3], [2, 4]), [1, 2, 3, 4]);`,
      },
      {
        name: "appends the remainder of the longer array",
        body: `assertEquals(solution([1], [2, 3, 4]), [1, 2, 3, 4]);`,
      },
      {
        name: "one side empty",
        body: `assertEquals(solution([], [1, 2]), [1, 2]);`,
      },
      {
        name: "both empty",
        body: `assertEquals(solution([], []), []);`,
      },
      {
        name: "keeps duplicates",
        body: `assertEquals(solution([1, 1], [1]), [1, 1, 1]);`,
      },
      {
        name: "fully disjoint ranges",
        body: `assertEquals(solution([5, 6], [1, 2]), [1, 2, 5, 6]);`,
      },
      {
        name: "negatives",
        body: `assertEquals(solution([-3, 1], [-5, 0]), [-5, -3, 0, 1]);`,
      },
      {
        name: "linear on large inputs",
        body: `var a = [], b = [];
for (var i = 0; i < 100000; i++) { a.push(i * 2); b.push(i * 2 + 1); }
var out = solution(a, b);
assertEquals(out.length, 200000);
assertEquals(out[0], 0);
assertEquals(out[199999], 199999);`,
      },
    ],
    hints: [
      "Two cursors, one per array, and a loop that runs while both still have values.",
      "Use a <= comparison when taking from the first array, so ties preserve the left-hand order.",
      "When the loop ends, one array still has a tail — append whatever is left of it.",
    ],
    reference: `function merge(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    // <= not <: on a tie the left value goes first, which is stability.
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}
`,
  },
};
