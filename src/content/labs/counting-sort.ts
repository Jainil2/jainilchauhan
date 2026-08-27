import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "counting-sort",
  title: "Counting Sort",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Linear-time sorting for small integer ranges.",
  caption:
    "Count each key, then rebuild output from frequencies. Counting sort wins when the value range is bounded.",
  skillTags: ["DSA", "Algorithms"],
  concept:
    "Counting sort avoids comparisons. It counts how many times each integer key appears, then emits keys in order. A stable variant uses prefix sums to place records in output while preserving equal-key order.\n\nThe runtime is O(n + k), where k is the key range. That is linear only when k is reasonably small.",
  complexity: [
    { operation: "Sort", time: "O(n + k)", space: "O(k)" },
    { operation: "Stable placement", time: "O(n + k)", space: "O(n + k)" },
  ],
  realWorld: [
    "Grades, small IDs, histogram sorting, radix sort subroutine, and frequency analytics.",
  ],
  pitfalls: [
    "Large key ranges waste memory.",
    "Negative keys need offset mapping.",
    "Plain count expansion is not stable unless prefix placement is used.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// O(n + k) for small integer keys, and stable if you walk input backwards.
export function countingSort(xs: number[], k: number): number[] {
  const counts = new Array(k + 1).fill(0);
  for (const x of xs) counts[x]++;
  for (let i = 1; i <= k; i++) counts[i] += counts[i - 1]; // prefix sums = end positions
  const out = new Array(xs.length);
  for (let i = xs.length - 1; i >= 0; i--) out[--counts[xs[i]]] = xs[i]; // stable
  return out;
}`,
  },
  usedBy: [
    {
      company: "Illumina / bioinformatics tooling",
      product: "Read bucketing by quality score",
      usage:
        "Scores live in a tiny fixed range, so counting them beats comparison sorting billions of reads.",
    },
    {
      company: "Elastic",
      product: "Histogram aggregations",
      usage:
        "Bucketed value counts are computed with counting-style passes over doc values rather than sorting.",
    },
    {
      company: "Apache Lucene",
      product: "Radix sort building blocks",
      usage:
        "Counting sort is the stable per-digit pass inside LSD radix sorting of doc ids and terms.",
      href: "https://lucene.apache.org/core/9_9_0/core/org/apache/lucene/util/RadixSelector.html",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — sorting by counting",
      href: "https://cp-algorithms.com/sequences/index.html",
    },
    {
      label: "Lucene — RadixSelector (counting passes)",
      href: "https://lucene.apache.org/core/9_9_0/core/org/apache/lucene/util/RadixSelector.html",
    },
  ],
};
