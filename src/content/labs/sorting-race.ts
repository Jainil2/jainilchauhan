import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "sorting-race",
  title: "Sorting Race",
  category: "Algorithms",
  difficulty: "Beginner",
  readingTimeMin: 3,
  blurb: "Bubble vs Quick vs Merge — same array, side by side.",
  caption:
    "Three algorithms sort identical inputs. Compare comparison counts and watch the bars settle in real time.",
  skillTags: ["DSA"],
  concept:
    "Sorting is the canonical algorithm comparison. Bubble sort is O(n²) and easy to write. Quicksort averages O(n log n) by partitioning around a pivot but degrades to O(n²) on adversarial inputs (sorted/reverse with bad pivot choice). Mergesort guarantees O(n log n) by recursively splitting and merging — at the cost of O(n) extra space.\n\nReal-world sort routines are hybrids: V8/CPython use Timsort (mergesort variant tuned for partially-sorted real data), C++ std::sort uses introsort (quicksort that falls back to heapsort if recursion gets too deep), Java Arrays.sort uses dual-pivot quicksort for primitives.",
  complexity: [
    { operation: "Bubble sort", time: "O(n²)", space: "O(1)" },
    { operation: "Quicksort", time: "O(n log n) avg, O(n²) worst", space: "O(log n)" },
    { operation: "Mergesort", time: "O(n log n)", space: "O(n)" },
  ],
  realWorld: [
    "V8 / CPython — Timsort (mergesort + insertion sort for small runs).",
    "C++ STL — introsort (quicksort + heapsort fallback).",
    "Java primitive arrays — dual-pivot quicksort.",
    "PostgreSQL — external mergesort for ORDER BY that exceeds work_mem.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Why engines pick different algorithms for the same call:
//   n < 22            -> insertion sort   (tiny, cache-resident, low overhead)
//   objects / stable  -> TimSort          (stability is required by the spec)
//   primitives        -> quicksort family (in-place, great constants)
//   adversarial depth -> heapsort         (introsort's O(n log n) safety net)

const byPrice = [...items].sort((a, b) => a.price - b.price); // stable since ES2019
// Comparator contract: consistent, transitive, returns 0 only for true ties.
// A comparator that returns a boolean (a > b) is the #1 real-world sorting bug.`,
  },
  pitfalls: [
    "Comparator bugs beat algorithm choice: `(a, b) => a > b` returns a boolean, not -1/0/1, and silently produces wrong order.",
    "Big-O hides constants — insertion sort wins below ~20 elements, which is why every real sort has a small-array cutoff.",
    "Quicksort's worst case is O(n^2) on adversarial input; production sorts randomise the pivot or fall back to heapsort.",
    "Stability matters when sorting by a second key; unstable sorts silently scramble previously applied ordering.",
  ],
  usedBy: [
    {
      company: "Google",
      product: "V8 Array.prototype.sort",
      usage:
        "V8 uses TimSort with an insertion-sort cutoff for small runs, and JavaScript sorting is now stable by specification.",
      href: "https://v8.dev/blog/array-sort",
    },
    {
      company: "Rust project",
      product: "slice::sort vs sort_unstable",
      usage:
        "Rust exposes the tradeoff directly: a stable merge-based sort with allocation, or an in-place pattern-defeating quicksort.",
      href: "https://doc.rust-lang.org/std/primitive.slice.html#method.sort_unstable",
    },
    {
      company: "Oracle",
      product: "Java dual-pivot quicksort for primitives",
      usage:
        "Primitives use dual-pivot quicksort (no stability requirement); objects use TimSort because stability is contractual.",
      href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html",
    },
  ],
  references: [
    { label: "V8 — getting things sorted", href: "https://v8.dev/blog/array-sort" },
    {
      label: "Rust — sort vs sort_unstable tradeoffs",
      href: "https://doc.rust-lang.org/std/primitive.slice.html#method.sort_unstable",
    },
  ],
};
