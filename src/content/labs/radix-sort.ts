import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "radix-sort",
  title: "Radix Sort",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Sort integers or strings digit by digit.",
  caption:
    "Bucket numbers by ones or tens digit. Stable passes from least-significant to most-significant digit produce sorted output.",
  skillTags: ["DSA", "Algorithms"],
  concept:
    "Radix sort processes keys by digits rather than comparing whole values. LSD radix sort starts with the least-significant digit and uses a stable sort, often counting sort, for each digit. MSD radix sort starts from the most-significant digit and recursively partitions.\n\nFor fixed-width integers or strings, radix sort can be linear in the number of digits times n.",
  complexity: [{ operation: "Sort", time: "O(d(n + b))", space: "O(n + b)" }],
  realWorld: [
    "Integer sorting, string sorting, network addresses, IDs, and high-performance analytics kernels.",
  ],
  pitfalls: [
    "Requires stable per-digit sorting for LSD radix.",
    "Variable-length keys need padding or careful ordering.",
    "Constants can beat comparison sorts only for suitable key types.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// LSD radix sort: stable counting pass per 8-bit digit, 4 passes for 32-bit keys.
export function radixSort(xs: Uint32Array): Uint32Array {
  let src = xs, dst = new Uint32Array(xs.length);
  for (let shift = 0; shift < 32; shift += 8) {
    const counts = new Uint32Array(256);
    for (const x of src) counts[(x >>> shift) & 255]++;
    let sum = 0;
    for (let i = 0; i < 256; i++) { const c = counts[i]; counts[i] = sum; sum += c; }
    for (const x of src) dst[counts[(x >>> shift) & 255]++] = x;
    [src, dst] = [dst, src];
  }
  return src;
}`,
  },
  usedBy: [
    {
      company: "NVIDIA",
      product: "CUB / Thrust GPU sort",
      usage:
        "GPU sorting primitives are radix-based because digit passes are embarrassingly parallel, unlike comparison sorts.",
      href: "https://nvidia.github.io/cccl/cub/",
    },
    {
      company: "Apache Software Foundation",
      product: "Lucene / Spark shuffle key sorting",
      usage:
        "Fixed-width binary keys (doc ids, prefixes) are radix-sorted to avoid comparator overhead.",
      href: "https://lucene.apache.org/core/9_9_0/core/org/apache/lucene/util/RadixSelector.html",
    },
    {
      company: "Databricks",
      product: "Tungsten sort-based shuffle",
      usage:
        "Records are sorted on packed prefix keys so most comparisons never touch the full row.",
    },
  ],
  references: [
    { label: "NVIDIA CUB — device-wide radix sort", href: "https://nvidia.github.io/cccl/cub/" },
    {
      label: "Lucene — radix-based selection/sorting utilities",
      href: "https://lucene.apache.org/core/9_9_0/core/org/apache/lucene/util/RadixSelector.html",
    },
  ],
};
