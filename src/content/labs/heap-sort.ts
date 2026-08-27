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
  challenge: {
    prompt:
      "Sort an array in place using a binary heap. Build a max-heap, then repeatedly swap the root to the end and shrink the heap. Guaranteed n log n with no extra memory, which is why it backs worst-case-sensitive systems.",
    entry: "heapSort",
    starter: `/**
 * @param {number[]} xs - values. Sort them in place.
 * @returns {number[]} the same array, ascending.
 */
function heapSort(xs) {
  // Build a MAX heap so the largest value is at index 0. Swapping it to the
  // end grows a sorted suffix while the heap shrinks.
}
`,
    tests: [
      {
        name: "sorts unordered input",
        body: `assertEquals(solution([3, 1, 2]), [1, 2, 3]);`,
      },
      {
        name: "already sorted",
        body: `assertEquals(solution([1, 2, 3]), [1, 2, 3]);`,
      },
      {
        name: "reverse sorted",
        body: `assertEquals(solution([3, 2, 1]), [1, 2, 3]);`,
      },
      {
        name: "duplicates",
        body: `assertEquals(solution([2, 1, 2]), [1, 2, 2]);`,
      },
      {
        name: "empty",
        body: `assertEquals(solution([]), []);`,
      },
      {
        name: "single element",
        body: `assertEquals(solution([7]), [7]);`,
      },
      {
        name: "negatives",
        body: `assertEquals(solution([0, -3, 2, -9]), [-9, -3, 0, 2]);`,
      },
      {
        name: "sorts in place, returning the same array",
        body: `var xs = [3, 1, 2];
var out = solution(xs);
assert(out === xs, 'expected the same array object back');`,
      },
      {
        name: "n log n on a large input",
        body: `var xs = [];
for (var i = 0; i < 200000; i++) xs.push((i * 7919) % 100000);
var out = solution(xs);
assertEquals(out.length, 200000);
for (var j = 1; j < out.length; j++) if (out[j - 1] > out[j]) throw new Error('not sorted at ' + j);`,
      },
    ],
    hints: [
      "Children of index i are 2i+1 and 2i+2; sift down by swapping with the larger child while it is bigger.",
      "Heapify bottom-up from Math.floor(n/2) - 1 down to 0 — leaves are already valid heaps.",
      "Then loop end downwards: swap index 0 with index end, and sift down within the shrinking prefix.",
    ],
    reference: `function heapSort(xs) {
  const n = xs.length;

  const siftDown = (start, size) => {
    let root = start;
    for (;;) {
      const left = 2 * root + 1;
      if (left >= size) break;
      const right = left + 1;
      // Compare against the LARGER child, or the heap property breaks.
      let swap = left;
      if (right < size && xs[right] > xs[left]) swap = right;
      if (xs[root] >= xs[swap]) break;
      [xs[root], xs[swap]] = [xs[swap], xs[root]];
      root = swap;
    }
  };

  // Leaves are already heaps, so start at the last internal node.
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
  for (let end = n - 1; end > 0; end--) {
    [xs[0], xs[end]] = [xs[end], xs[0]];
    siftDown(0, end); // the sorted suffix is excluded
  }
  return xs;
}
`,
  },
};
