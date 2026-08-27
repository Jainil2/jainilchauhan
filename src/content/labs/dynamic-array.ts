import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "dynamic-array",
  title: "Dynamic Array",
  category: "Data Structures",
  difficulty: "Beginner",
  readingTimeMin: 4,
  blurb: "Growable array with amortized O(1) append.",
  caption:
    "Push elements until capacity doubles. Most pushes are O(1); the resize push copies old elements into a larger backing array.",
  skillTags: ["DSA", "Memory"],
  concept:
    "A dynamic array wraps a fixed array with a length and capacity. Appending is cheap while capacity remains. When the array fills, it allocates a larger backing store, commonly 2x capacity, copies existing elements, then writes the new value.\n\nA resize is O(n), but it happens rarely enough that append is amortized O(1). This is the structure behind JavaScript arrays, Python lists, Java ArrayList, C++ vector, and Go slices.",
  complexity: [
    { operation: "Access", time: "O(1)", space: "O(1)" },
    { operation: "Append", time: "O(1) amortized", space: "O(n)" },
    { operation: "Insert/delete middle", time: "O(n)", space: "O(1)" },
  ],
  realWorld: ["UI lists, request buffers, parser token streams, and in-memory result sets."],
  pitfalls: [
    "Holding references into a backing array can break after resize in low-level languages.",
    "Over-allocation trades memory for append performance.",
    "Repeated front insertion is a poor fit; use a deque.",
  ],
  codeSnippet: {
    language: "go",
    code: `// Go slices are the canonical dynamic array: len + cap over a backing array.
s := make([]int, 0, 4)
for i := 0; i < 9; i++ {
    s = append(s, i) // grows by ~2x when len == cap
    fmt.Println(len(s), cap(s)) // 1/4 2/4 3/4 4/4 5/8 ... 9/16
}

// The reallocation is why you must reassign: append may return a new array.
func push(dst []int, v int) []int {
    if len(dst) == cap(dst) {
        grown := make([]int, len(dst), max(1, 2*cap(dst)))
        copy(grown, dst)
        dst = grown
    }
    return append(dst, v)
}`,
  },
  usedBy: [
    {
      company: "Google",
      product: "Go standard library",
      usage:
        "Every `append` on a slice is amortised doubling; the growth rule is documented in the Go slice internals post.",
      href: "https://go.dev/blog/slices-intro",
    },
    {
      company: "Python Software Foundation",
      product: "CPython list",
      usage:
        "`list.append` over-allocates on a documented growth pattern so appends stay amortised O(1).",
      href: "https://docs.python.org/3/faq/design.html#how-are-lists-implemented-in-cpython",
    },
    {
      company: "Elastic",
      product: "Elasticsearch bulk indexing",
      usage:
        "Bulk request buffers grow geometrically until a flush threshold, trading memory headroom for fewer copies.",
    },
  ],
  references: [
    {
      label: "Go blog — Arrays, slices and the mechanics of append",
      href: "https://go.dev/blog/slices-intro",
    },
    {
      label: "CPython — how are lists implemented?",
      href: "https://docs.python.org/3/faq/design.html#how-are-lists-implemented-in-cpython",
    },
  ],
};
