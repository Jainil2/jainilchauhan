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
};
