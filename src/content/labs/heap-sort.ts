import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "heap-sort",
  title: "Heap Sort",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Sort in-place using a binary heap.",
  caption:
    "Build a heap, extract the root into the sorted suffix, and heapify the remaining prefix.",
  skillTags: ["DSA", "Algorithms"],
  concept:
    "Heap sort first transforms the array into a max heap. The largest item is at the root, so it swaps the root with the end of the array, shrinks the heap, and heapifies the root again. Repeating this produces a sorted suffix.\n\nIt has guaranteed O(n log n) time and O(1) auxiliary space, but it is not stable and usually has worse cache behavior than quicksort or TimSort.",
  complexity: [
    { operation: "Build heap", time: "O(n)", space: "O(1)" },
    { operation: "Sort", time: "O(n log n)", space: "O(1)" },
  ],
  realWorld: ["In-place sorting under tight memory constraints and priority-queue fundamentals."],
  pitfalls: [
    "Not stable.",
    "Often slower in practice than optimized quicksort/TimSort.",
    "Heap index arithmetic is prone to off-by-one errors.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// In-place, O(1) extra memory, guaranteed O(n log n) — no quicksort worst case.
export function heapSort(a: number[]) {
  const sift = (i: number, n: number) => {
    while (true) {
      const l = 2 * i + 1, r = l + 1;
      let m = i;
      if (l < n && a[l] > a[m]) m = l;
      if (r < n && a[r] > a[m]) m = r;
      if (m === i) return;
      [a[i], a[m]] = [a[m], a[i]];
      i = m;
    }
  };
  for (let i = (a.length >> 1) - 1; i >= 0; i--) sift(i, a.length); // heapify O(n)
  for (let n = a.length - 1; n > 0; n--) {
    [a[0], a[n]] = [a[n], a[0]]; // max to the back
    sift(0, n);
  }
  return a;
}`,
  },
  usedBy: [
    {
      company: "LLVM / C++ standard library",
      product: "std::sort introsort fallback",
      usage:
        "Introsort starts with quicksort and switches to heapsort once recursion gets too deep, bounding the worst case at O(n log n).",
      href: "https://en.cppreference.com/w/cpp/algorithm/sort",
    },
    {
      company: "Linux kernel",
      product: "sort() in lib/sort.c",
      usage:
        "The kernel uses heapsort because it needs constant extra memory and no recursion on a small kernel stack.",
      href: "https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/lib/sort.c",
    },
    {
      company: "Embedded / real-time vendors",
      product: "Deterministic sorting paths",
      usage:
        "Predictable worst-case time and no allocation make heapsort the safe choice under hard deadlines.",
    },
  ],
  references: [
    {
      label: "Linux kernel — lib/sort.c (heapsort)",
      href: "https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/lib/sort.c",
    },
    {
      label: "cppreference — std::sort (introsort guarantees)",
      href: "https://en.cppreference.com/w/cpp/algorithm/sort",
    },
  ],
};
