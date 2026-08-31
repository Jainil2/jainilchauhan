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
  challenge: {
    prompt:
      "Rotate an array left by k positions and return a new array. Index arithmetic only — no repeated shifting. Ring buffers all over inference serving do exactly this to reuse a fixed block of memory instead of reallocating.",
    entry: "rotate",
    starter: `/**
 * @param {number[]} xs - the values.
 * @param {number} k - positions to rotate left. May exceed xs.length.
 * @returns {number[]} a new rotated array; xs is left untouched.
 */
function rotate(xs, k) {
  // The element that ends up at index i came from index (i + k) in the original.
}
`,
    tests: [
      {
        name: "rotates left by one",
        body: `assertEquals(solution([1, 2, 3, 4], 1), [2, 3, 4, 1]);`,
      },
      {
        name: "rotates by zero",
        body: `assertEquals(solution([1, 2, 3], 0), [1, 2, 3]);`,
      },
      {
        name: "wraps when k exceeds the length",
        body: `assertEquals(solution([1, 2, 3], 4), [2, 3, 1]);`,
      },
      {
        name: "k equal to the length is a no-op",
        body: `assertEquals(solution([1, 2, 3], 3), [1, 2, 3]);`,
      },
      {
        name: "handles an empty array",
        body: `assertEquals(solution([], 3), []);`,
      },
      {
        name: "does not mutate the input",
        body: `var xs = [1, 2, 3];
solution(xs, 2);
assertEquals(xs, [1, 2, 3]);`,
      },
      {
        name: "stays linear on a large array",
        body: `var xs = [];
for (var i = 0; i < 50000; i++) xs.push(i);
var out = solution(xs, 12345);
assertEquals(out[0], 12345);
assertEquals(out.length, 50000);`,
      },
    ],
    hints: [
      "Rotating by the array's own length changes nothing, so reduce k with the remainder operator first.",
      "Build the result in one pass: the value at result[i] is xs[(i + k) % xs.length].",
      "Guard the empty array before taking a remainder — dividing by zero gives NaN.",
    ],
    reference: `function rotate(xs, k) {
  const n = xs.length;
  if (n === 0) return [];
  const shift = ((k % n) + n) % n; // tolerate k larger than n, and negatives
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = xs[(i + shift) % n];
  return out;
}
`,
  },
};
