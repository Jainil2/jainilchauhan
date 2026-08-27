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
};
