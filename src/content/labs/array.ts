import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "array",
  title: "Array",
  category: "Data Structures",
  difficulty: "Beginner",
  readingTimeMin: 3,
  blurb: "Contiguous memory with constant-time indexed access.",
  caption:
    "Move the highlighted index and sliding window across contiguous cells. Arrays are fast because index lookup is address arithmetic, not traversal.",
  skillTags: ["DSA", "Memory"],
  concept:
    "An array stores equal-sized elements in contiguous memory. If the base address and element size are known, the address of index i is base + i * elementSize, which gives O(1) random access.\n\nThat contiguity is also cache-friendly: scanning adjacent elements tends to use CPU cache lines efficiently. The tradeoff is that inserting or deleting in the middle requires shifting elements, and fixed-size arrays cannot grow without allocating new storage.",
  complexity: [
    { operation: "Access by index", time: "O(1)", space: "O(1)" },
    { operation: "Search unsorted", time: "O(n)", space: "O(1)" },
    { operation: "Insert/delete middle", time: "O(n)", space: "O(1)" },
  ],
  realWorld: [
    "Backing storage for vectors, strings, heaps, hash-table buckets, and database pages.",
    "Sliding-window algorithms over logs, metrics, and time-series samples.",
  ],
  pitfalls: [
    "Out-of-bounds access is unsafe in low-level languages.",
    "Middle insertions are expensive because data must shift.",
    "Sparse data wastes memory when represented as a dense array.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Fixed-size array: index math, not traversal.
const frames = new Float64Array(8); // contiguous, 8 bytes per slot
frames[3] = 16.7; // address = base + 3 * 8  -> O(1)

// Sliding window over contiguous samples (cache-friendly scan).
function maxWindow(xs: Float64Array, w: number): number[] {
  const out: number[] = [];
  let sum = 0;
  for (let i = 0; i < xs.length; i++) {
    sum += xs[i];
    if (i >= w) sum -= xs[i - w];
    if (i >= w - 1) out.push(sum / w);
  }
  return out;
}`,
  },
  usedBy: [
    {
      company: "Google",
      product: "Chrome / V8 engine",
      usage:
        'JavaScript arrays start life as contiguous "packed elements" backing stores so index access is pointer arithmetic; V8 deoptimises to a dictionary only when you create holes.',
      href: "https://v8.dev/blog/elements-kinds",
    },
    {
      company: "Meta",
      product: "React reconciler",
      usage:
        "Fiber children and hook state are kept in ordered arrays, which is why hooks must be called in the same order every render.",
      href: "https://react.dev/reference/rules/rules-of-hooks",
    },
    {
      company: "Netflix",
      product: "Playback telemetry",
      usage:
        "Ring/array buffers hold the last N bitrate and buffer-health samples so the ABR algorithm can scan a fixed window without allocating.",
    },
  ],
  references: [
    { label: "V8 — Elements kinds in V8", href: "https://v8.dev/blog/elements-kinds" },
    {
      label: "MDN — JavaScript typed arrays",
      href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays",
    },
  ],
};
