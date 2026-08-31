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
  bridgesFrom: [
    {
      slug: "array",
      sameness:
        "It IS an array. The storage underneath is the same fixed, contiguous block with the same O(1) indexing, and every read you already know behaves identically.",
      delta:
        "The only addition is a length kept separately from the capacity, plus a reallocation when they meet. That single move is what makes append amortised rather than constant: most appends are free, and one in every n copies the whole buffer, so a latency graph of appends is flat with periodic spikes rather than a straight line.",
    },
  ],
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
  challenge: {
    prompt:
      "Report how a growable array's capacity evolves. Starting from an initial capacity, append n items, doubling capacity whenever it fills. Return the capacity after each append. This is why append is amortized O(1) — and why a KV-cache allocator grows in blocks rather than per token.",
    entry: "capacities",
    starter: `/**
 * @param {number} initial - starting capacity. Always at least 1.
 * @param {number} appends - how many items are appended.
 * @returns {number[]} capacity after each append, one entry per append.
 */
function capacities(initial, appends) {
  // Grow only when the array is already full, and grow by doubling.
}
`,
    tests: [
      {
        name: "no growth while there is room",
        body: `assertEquals(solution(4, 3), [4, 4, 4]);`,
      },
      {
        name: "doubles exactly when full",
        body: `assertEquals(solution(2, 4), [2, 2, 4, 4]);`,
      },
      {
        name: "doubles repeatedly",
        body: `assertEquals(solution(1, 5), [1, 2, 4, 4, 8]);`,
      },
      {
        name: "no appends means no entries",
        body: `assertEquals(solution(8, 0), []);`,
      },
      {
        name: "capacity never shrinks",
        body: `var out = solution(1, 20);
for (var i = 1; i < out.length; i++) assert(out[i] >= out[i - 1], 'capacity shrank');`,
      },
      {
        name: "growth is logarithmic, not linear",
        body: `var out = solution(1, 1024);
var grows = 0;
for (var i = 1; i < out.length; i++) if (out[i] !== out[i - 1]) grows++;
assert(grows <= 12, 'too many reallocations: ' + grows);`,
      },
    ],
    hints: [
      "Track two numbers as you go: the current length and the current capacity.",
      "Check for growth before writing the item — if length equals capacity, double it first.",
      "Record the capacity after each append, so the array you return has exactly `appends` entries.",
    ],
    reference: `function capacities(initial, appends) {
  let capacity = Math.max(1, initial);
  let length = 0;
  const out = [];
  for (let i = 0; i < appends; i++) {
    // Grow first, then write. A resize is O(n), but it happens rarely enough
    // that the cost spread over every append is constant.
    if (length === capacity) capacity *= 2;
    length++;
    out.push(capacity);
  }
  return out;
}
`,
  },
};
