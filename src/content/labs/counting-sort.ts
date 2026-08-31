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
  bridgesFrom: [
    {
      slug: "array",
      sameness:
        "It IS an array used as a lookup table, with the value being sorted as the index. Count how many times each value appears, then walk the counters in order and write each value out that many times.",
      delta:
        "No two elements are ever compared, so the O(n log n) comparison lower bound simply does not apply — this is genuinely linear. The cost moves from time into space and becomes proportional to the range of the values rather than their count: sorting a hundred small integers is trivial, sorting a hundred 32-bit integers this way would ask for four billion counters. That constraint is the entire reason radix sort exists.",
    },
  ],
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
  challenge: {
    prompt:
      "Sort small non-negative integers by counting how many times each value appears, then writing them back out. No comparisons at all, so it beats the n log n lower bound — which only applies to comparison sorts.",
    entry: "countingSort",
    starter: `/**
 * @param {number[]} xs - non-negative integers.
 * @param {number} maxValue - the largest value that can appear.
 * @returns {number[]} a new sorted array, ascending.
 */
function countingSort(xs, maxValue) {
  // Tally each value, then walk the tallies in order. Nothing is ever compared
  // against anything else.
}
`,
    tests: [
      {
        name: "sorts small integers",
        body: `assertEquals(solution([3, 1, 2], 3), [1, 2, 3]);`,
      },
      {
        name: "keeps duplicates",
        body: `assertEquals(solution([2, 1, 2], 2), [1, 2, 2]);`,
      },
      {
        name: "handles zero",
        body: `assertEquals(solution([2, 0, 1], 2), [0, 1, 2]);`,
      },
      {
        name: "empty input",
        body: `assertEquals(solution([], 5), []);`,
      },
      {
        name: "all the same value",
        body: `assertEquals(solution([4, 4, 4], 4), [4, 4, 4]);`,
      },
      {
        name: "gaps in the range are skipped",
        body: `assertEquals(solution([5, 0], 5), [0, 5]);`,
      },
      {
        name: "does not mutate the input",
        body: `var xs = [3, 1];
solution(xs, 3);
assertEquals(xs, [3, 1]);`,
      },
      {
        name: "linear on a large input",
        body: `var xs = [];
for (var i = 0; i < 300000; i++) xs.push(i % 256);
var out = solution(xs, 255);
assertEquals(out.length, 300000);
assertEquals(out[0], 0);
assertEquals(out[299999], 255);`,
      },
    ],
    hints: [
      "Allocate maxValue + 1 counters, all starting at zero.",
      "One pass to count, then one pass over the counters emitting each value that many times.",
      "Build a new array rather than sorting in place, so the caller's input is untouched.",
    ],
    reference: `function countingSort(xs, maxValue) {
  const counts = new Array(maxValue + 1).fill(0);
  for (const v of xs) counts[v]++;
  const out = [];
  // Walking the counters in order is what produces sorted output -- no
  // comparison between elements ever happens.
  for (let v = 0; v <= maxValue; v++) {
    for (let k = 0; k < counts[v]; k++) out.push(v);
  }
  return out;
}
`,
  },
};
