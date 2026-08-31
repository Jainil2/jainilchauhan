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
  bridgesFrom: [
    {
      slug: "counting-sort",
      sameness:
        "It IS counting sort with wider slots. Map each value to a slot by arithmetic, drop it in, then read the slots out in order — the same no-comparisons distribution step, with each slot covering a range of values rather than exactly one.",
      delta:
        "Because a slot now holds several distinct values, it needs sorting internally before concatenation, which is what makes this work on floats and on ranges too wide to count. The linear-time claim quietly acquires a condition: it holds only if the input is spread evenly across the buckets. Skewed data piles everything into one bucket and the runtime degrades to whatever sort runs inside it, so this is the rare algorithm whose complexity depends on the distribution rather than the size.",
    },
  ],
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
  challenge: {
    prompt:
      "Sort values that are roughly uniform across a range by scattering them into buckets, sorting each small bucket, then concatenating. Linear when the distribution cooperates, and quadratic when everything lands in one bucket — which is the whole lesson.",
    entry: "bucketSort",
    starter: `/**
 * @param {number[]} xs - values in [0, 1).
 * @param {number} bucketCount - how many buckets to scatter into. At least 1.
 * @returns {number[]} a new sorted array, ascending.
 */
function bucketSort(xs, bucketCount) {
  // Bucket index comes from the value's position in the range. Sort each
  // bucket on its own, then join them in order.
}
`,
    tests: [
      {
        name: "sorts fractions",
        body: `assertEquals(solution([0.5, 0.1, 0.9], 3), [0.1, 0.5, 0.9]);`,
      },
      {
        name: "handles values landing in one bucket",
        body: `assertEquals(solution([0.11, 0.12, 0.1], 2), [0.1, 0.11, 0.12]);`,
      },
      {
        name: "zero sorts first",
        body: `assertEquals(solution([0.5, 0], 2), [0, 0.5]);`,
      },
      {
        name: "duplicates",
        body: `assertEquals(solution([0.3, 0.3], 4), [0.3, 0.3]);`,
      },
      {
        name: "empty",
        body: `assertEquals(solution([], 4), []);`,
      },
      {
        name: "single bucket still sorts",
        body: `assertEquals(solution([0.9, 0.1], 1), [0.1, 0.9]);`,
      },
      {
        name: "values near the top of the range do not overflow the buckets",
        body: `assertEquals(solution([0.999, 0.001], 10), [0.001, 0.999]);`,
      },
      {
        name: "handles a large uniform input",
        body: `var xs = [];
for (var i = 0; i < 50000; i++) xs.push(((i * 7919) % 100000) / 100000);
var out = solution(xs, 500);
for (var j = 1; j < out.length; j++) if (out[j - 1] > out[j]) throw new Error('not sorted at ' + j);`,
      },
    ],
    hints: [
      "Bucket index is Math.floor(value * bucketCount), which spreads [0,1) evenly.",
      "Clamp the index to bucketCount - 1 so a value at the very top of the range does not fall off the end.",
      "Sort each bucket numerically — the default sort compares strings, so 10 would come before 9.",
    ],
    reference: `function bucketSort(xs, bucketCount) {
  const n = Math.max(1, bucketCount);
  const buckets = Array.from({ length: n }, () => []);
  for (const v of xs) {
    // Clamp: a value of exactly 1 would otherwise index one past the end.
    const i = Math.min(n - 1, Math.floor(v * n));
    buckets[i].push(v);
  }
  const out = [];
  for (const bucket of buckets) {
    // Numeric comparator: the default sort would order these as strings.
    bucket.sort((a, b) => a - b);
    for (const v of bucket) out.push(v);
  }
  return out;
}
`,
  },
};
