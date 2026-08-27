import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "timsort",
  title: "TimSort",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Production hybrid sort optimized for real-world partially ordered data.",
  caption:
    "Identify natural sorted runs and merge them. TimSort powers Python and Java object sorting because real data is often already partly sorted.",
  skillTags: ["DSA", "Algorithms"],
  concept:
    "TimSort is a hybrid stable sorting algorithm derived from merge sort and insertion sort. It scans for natural ordered runs already present in the input, extends small runs with insertion sort, and merges runs while maintaining stack invariants that keep merging balanced.\n\nIt performs especially well on real-world data because logs, UI lists, and database results are often partially sorted before sorting begins.",
  complexity: [
    { operation: "Best case", time: "O(n)", space: "O(n)" },
    { operation: "Worst case", time: "O(n log n)", space: "O(n)" },
  ],
  realWorld: [
    "Python list.sort/sorted, Java object arrays, Android, and production UI/data sorting.",
  ],
  pitfalls: [
    "Implementation is complex because run invariants matter.",
    "Needs extra memory for merges.",
    "Primitive-array sorts may use different algorithms.",
  ],
  codeSnippet: {
    language: "py",
    code: `# Timsort exploits existing order: find natural runs, extend to minrun, merge.
def find_run(a, lo):
    hi = lo + 1
    if hi == len(a):
        return hi, False
    if a[hi] < a[lo]:                  # strictly descending run
        while hi + 1 < len(a) and a[hi + 1] < a[hi]:
            hi += 1
        return hi + 1, True            # reverse it in place -> stable ascending run
    while hi + 1 < len(a) and a[hi + 1] >= a[hi]:
        hi += 1
    return hi + 1, False

# Already-sorted or reverse-sorted input costs O(n); merges obey stack invariants
# so run lengths stay balanced.`,
  },
  usedBy: [
    {
      company: "Python Software Foundation",
      product: "list.sort() / sorted()",
      usage:
        "Timsort was written for CPython and is the reason sorting near-ordered real-world data is close to linear.",
      href: "https://github.com/python/cpython/blob/main/Objects/listsort.txt",
    },
    {
      company: "Oracle / Android",
      product: "java.util.Arrays.sort for objects",
      usage:
        "Java uses Timsort for reference arrays because stability is required by the spec; Android inherits it.",
      href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html",
    },
    {
      company: "Google",
      product: "V8 Array.prototype.sort",
      usage:
        "V8 replaced its old sort with TimSort in 2018, making JavaScript sorting stable across engines.",
      href: "https://v8.dev/blog/array-sort",
    },
  ],
  references: [
    {
      label: "CPython — listsort.txt (Timsort design notes)",
      href: "https://github.com/python/cpython/blob/main/Objects/listsort.txt",
    },
    {
      label: "V8 — getting things sorted (TimSort in V8)",
      href: "https://v8.dev/blog/array-sort",
    },
  ],
  challenge: {
    prompt:
      "Find the natural runs in an array — the already-ordered stretches Timsort exploits instead of ignoring. Ascending runs are taken as they are; strictly descending runs are reversed in place. Real data is full of these, which is why Timsort beats a textbook merge sort on it.",
    entry: "findRuns",
    starter: `/**
 * @param {number[]} xs
 * @returns {number[][]} consecutive runs covering xs in order. A descending run
 *   is reversed so every returned run is ascending. Runs of one are allowed.
 */
function findRuns(xs) {
  // At each position decide the direction from the next element, extend the run
  // while it holds, and reverse it if it was descending.
}
`,
    tests: [
      {
        name: "one ascending run",
        body: `assertEquals(solution([1, 2, 3]), [[1, 2, 3]]);`,
      },
      {
        name: "a descending run comes back reversed",
        body: `assertEquals(solution([3, 2, 1]), [[1, 2, 3]]);`,
      },
      {
        name: "splits at a direction change",
        body: `assertEquals(solution([1, 2, 3, 2, 1]), [[1, 2, 3], [1, 2]]);`,
      },
      {
        name: "equal values continue an ascending run",
        body: `assertEquals(solution([1, 1, 2]), [[1, 1, 2]]);`,
      },
      {
        name: "equal values end a descending run",
        body: `assertEquals(solution([3, 2, 2]), [[2, 3], [2]]);`,
      },
      {
        name: "single element",
        body: `assertEquals(solution([5]), [[5]]);`,
      },
      {
        name: "empty input",
        body: `assertEquals(solution([]), []);`,
      },
      {
        name: "runs cover the input exactly once",
        body: `var xs = [5, 1, 4, 4, 2, 9, 8];
var runs = solution(xs);
var total = 0;
for (var i = 0; i < runs.length; i++) total += runs[i].length;
assertEquals(total, xs.length);`,
      },
      {
        name: "already sorted input is a single run",
        body: `var xs = [];
for (var i = 0; i < 100000; i++) xs.push(i);
assertEquals(solution(xs).length, 1);`,
      },
    ],
    hints: [
      "Start each run at index i and look at xs[i+1] to decide whether it ascends or descends.",
      "Ascending extends while the next value is greater than or equal; descending extends only while strictly less.",
      "Reverse a descending run before pushing it, so every run you return is ascending.",
    ],
    reference: `function findRuns(xs) {
  const runs = [];
  let i = 0;
  while (i < xs.length) {
    let j = i + 1;
    if (j < xs.length && xs[j] < xs[i]) {
      // Strictly descending only. Allowing equals here would make the reverse
      // unstable, which is exactly what Timsort must avoid.
      while (j < xs.length && xs[j] < xs[j - 1]) j++;
      runs.push(xs.slice(i, j).reverse());
    } else {
      while (j < xs.length && xs[j] >= xs[j - 1]) j++;
      runs.push(xs.slice(i, j));
    }
    i = j;
  }
  return runs;
}
`,
  },
};
