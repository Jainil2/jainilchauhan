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
};
