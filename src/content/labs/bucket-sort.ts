import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "bucket-sort",
  title: "Bucket Sort",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Distribute values into buckets, sort locally, then concatenate.",
  caption:
    "Map normalized values into ranges. Bucket sort is powerful when input is roughly uniformly distributed.",
  skillTags: ["DSA", "Algorithms"],
  concept:
    "Bucket sort partitions input into value ranges, sorts each bucket, then concatenates buckets in order. If values are uniformly distributed and bucket counts stay small, the result is close to linear time.\n\nIt is a distribution sort: performance depends less on comparisons and more on how evenly the bucket function spreads data.",
  complexity: [
    { operation: "Average sort", time: "O(n + k)", space: "O(n + k)" },
    { operation: "Worst case", time: "O(n^2)", space: "O(n)" },
  ],
  realWorld: [
    "Floating-point ranges, histogram processing, distributed partitioning, and approximate ranking.",
  ],
  pitfalls: [
    "Skewed input overloads a bucket.",
    "Bucket boundaries must preserve global ordering.",
    "Needs a local sorting strategy inside each bucket.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Scatter into buckets by value range, sort each bucket, concatenate.
export function bucketSort(xs: number[], bucketCount = 16): number[] {
  if (xs.length === 0) return xs;
  const min = Math.min(...xs), max = Math.max(...xs);
  const span = (max - min) / bucketCount || 1;
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);
  for (const x of xs) {
    const i = Math.min(bucketCount - 1, Math.floor((x - min) / span));
    buckets[i].push(x); // skewed data -> one hot bucket -> O(n^2)
  }
  return buckets.flatMap((b) => b.sort((a, z) => a - z));
}`,
  },
  usedBy: [
    {
      company: "Apache Software Foundation",
      product: "Hadoop TeraSort range partitioner",
      usage:
        "Sampled key ranges assign records to reducers so each reducer sorts a bucket and output is globally ordered.",
      href: "https://hadoop.apache.org/docs/stable/api/org/apache/hadoop/examples/terasort/package-summary.html",
    },
    {
      company: "Databricks",
      product: "Spark range partitioning",
      usage:
        "`repartitionByRange` samples the key distribution to build balanced buckets before per-partition sorting.",
      href: "https://spark.apache.org/docs/latest/sql-performance-tuning.html",
    },
    {
      company: "Snowflake / analytics warehouses",
      product: "Histogram-based data skipping",
      usage: "Value-range buckets drive both partition pruning and parallel sort placement.",
    },
  ],
  references: [
    {
      label: "Hadoop TeraSort — range partitioning",
      href: "https://hadoop.apache.org/docs/stable/api/org/apache/hadoop/examples/terasort/package-summary.html",
    },
    {
      label: "Spark — performance tuning and partitioning",
      href: "https://spark.apache.org/docs/latest/sql-performance-tuning.html",
    },
  ],
};
