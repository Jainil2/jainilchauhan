import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "quickselect",
  title: "Quickselect",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Find the kth smallest element without fully sorting.",
  caption:
    "Partition around a pivot and recurse only into the side containing rank k. Quickselect is selection, not sorting.",
  skillTags: ["DSA", "Algorithms"],
  concept:
    "Quickselect uses the same partitioning idea as quicksort, but after partitioning it only recurses into the side containing the desired rank. This gives O(n) average time for kth smallest/largest selection.\n\nIt is ideal when you need a median, percentile, or top-k threshold without paying O(n log n) to sort the full input.",
  complexity: [
    { operation: "Average selection", time: "O(n)", space: "O(1)" },
    { operation: "Worst case", time: "O(n^2)", space: "O(1)" },
  ],
  realWorld: [
    "Median latency, percentile dashboards, top-k filtering, and approximate ranking pipelines.",
  ],
  pitfalls: [
    "Bad pivots create quadratic behavior.",
    "It mutates the input unless copied.",
    "k indexing must be consistent: zero-based vs one-based.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// k-th smallest in O(n) average — partition, then recurse into one side only.
export function quickselect(xs: number[], k: number, lo = 0, hi = xs.length - 1): number {
  while (lo < hi) {
    const pivot = xs[lo + Math.floor(Math.random() * (hi - lo + 1))];
    let i = lo, j = hi;
    while (i <= j) {
      while (xs[i] < pivot) i++;
      while (xs[j] > pivot) j--;
      if (i <= j) { [xs[i], xs[j]] = [xs[j], xs[i]]; i++; j--; }
    }
    if (k <= j) hi = j;
    else if (k >= i) lo = i;
    else return xs[k];
  }
  return xs[k];
}

// p99 latency without a full sort:
// quickselect(samples, Math.floor(0.99 * samples.length))`,
  },
  usedBy: [
    {
      company: "Datadog",
      product: "Latency percentile computation",
      usage:
        "Exact percentiles over a batch of samples need only selection, not a full sort (sketches take over at streaming scale).",
      href: "https://www.datadoghq.com/blog/engineering/computing-accurate-percentiles-with-ddsketch/",
    },
    {
      company: "NumPy / scientific Python",
      product: "np.partition & median",
      usage:
        "`np.partition` exposes introselect so medians and quantiles avoid an O(n log n) sort.",
      href: "https://numpy.org/doc/stable/reference/generated/numpy.partition.html",
    },
    {
      company: "Elastic",
      product: "Top-k aggregation shortcuts",
      usage:
        '"Top N by score" only needs the boundary element, so selection beats sorting the whole candidate set.',
    },
  ],
  references: [
    {
      label: "NumPy — np.partition (introselect)",
      href: "https://numpy.org/doc/stable/reference/generated/numpy.partition.html",
    },
    {
      label: "Datadog — computing accurate percentiles",
      href: "https://www.datadoghq.com/blog/engineering/computing-accurate-percentiles-with-ddsketch/",
    },
  ],
  challenge: {
    prompt:
      "Find the kth smallest value without sorting the whole array. Partition around a pivot and recurse into only the side that can contain rank k — average linear time, versus n log n to sort everything you are about to throw away. A reranker that needs the best few of thousands does exactly this.",
    entry: "kthSmallest",
    starter: `/**
 * @param {number[]} xs - values, unsorted. May be mutated.
 * @param {number} k - zero-based rank: 0 is the smallest.
 * @returns {number|null} the kth smallest, or null when k is out of range.
 */
function kthSmallest(xs, k) {
  // Partition, then recurse into ONE side only. Sorting the whole array works
  // but throws away the entire point of the algorithm.
}
`,
    tests: [
      {
        name: "smallest element",
        body: `assertEquals(solution([5, 2, 8], 0), 2);`,
      },
      {
        name: "largest element",
        body: `assertEquals(solution([5, 2, 8], 2), 8);`,
      },
      {
        name: "middle element",
        body: `assertEquals(solution([5, 2, 8], 1), 5);`,
      },
      {
        name: "handles duplicates",
        body: `assertEquals(solution([4, 4, 1], 1), 4);
assertEquals(solution([4, 4, 1], 0), 1);`,
      },
      {
        name: "k out of range returns null",
        body: `assertEquals(solution([1, 2], 5), null);`,
      },
      {
        name: "negative k returns null",
        body: `assertEquals(solution([1, 2], -1), null);`,
      },
      {
        name: "empty array",
        body: `assertEquals(solution([], 0), null);`,
      },
      {
        name: "handles negatives",
        body: `assertEquals(solution([-5, -1, -9], 0), -9);`,
      },
      {
        name: "already sorted input does not degrade to a crawl",
        body: `var xs = [];
for (var i = 0; i < 100000; i++) xs.push(i);
assertEquals(solution(xs, 50000), 50000);`,
      },
    ],
    hints: [
      "Partition the working range around a pivot so smaller values end up left of it and larger ones right.",
      "After partitioning, the pivot sits at its final sorted index. Compare that index with k to decide which side to keep.",
      "A fixed pivot turns sorted input into O(n squared) — pick the pivot at random, or from the middle.",
    ],
    reference: `function kthSmallest(xs, k) {
  if (k < 0 || k >= xs.length) return null;
  const a = xs;
  let lo = 0;
  let hi = a.length - 1;

  while (lo <= hi) {
    // A random pivot keeps already-sorted input from degenerating.
    const pivotIndex = lo + Math.floor(Math.random() * (hi - lo + 1));
    const pivot = a[pivotIndex];
    [a[pivotIndex], a[hi]] = [a[hi], a[pivotIndex]];

    let store = lo;
    for (let i = lo; i < hi; i++) {
      if (a[i] < pivot) {
        [a[i], a[store]] = [a[store], a[i]];
        store++;
      }
    }
    [a[store], a[hi]] = [a[hi], a[store]];

    // store is now the pivot's final sorted position.
    if (store === k) return a[store];
    if (store < k) lo = store + 1;
    else hi = store - 1;
  }
  return null;
}
`,
  },
};
