import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "binary-search-tree",
  title: "Binary Search Tree",
  category: "Data Structures",
  difficulty: "Beginner",
  readingTimeMin: 4,
  blurb: "Ordered tree where left is smaller and right is larger.",
  caption:
    "Search for values by branching left or right at each comparison. Balanced height gives logarithmic lookup.",
  skillTags: ["DSA", "Trees"],
  bridgesFrom: [
    {
      slug: "binary-tree",
      sameness:
        "It IS a binary tree. Same nodes, same at-most-two-children shape, same traversals — pre-order, in-order and post-order all work here exactly as you wrote them.",
      delta:
        "One rule is added: everything in the left subtree is smaller than the node, everything in the right is larger. That single invariant turns a structure you could only traverse into one you can search, because a comparison at each node discards half the remaining tree, and it makes the in-order walk emit sorted output for free. The invariant is also the liability — nothing enforces balance, so inserting already-sorted keys builds a tree of height n and every O(log n) claim collapses to O(n).",
    },
  ],
  concept:
    "A binary search tree stores keys so every left subtree is smaller than the node and every right subtree is larger. This lets search, insert, and delete discard half-ish of the remaining tree at each step when the tree is balanced.\n\nThe weakness is shape. Inserting sorted data into a naive BST creates a linked list with O(n) operations. Balanced trees such as AVL and red-black trees add rotations to keep height logarithmic.",
  complexity: [
    { operation: "Search/insert/delete balanced", time: "O(log n)", space: "O(h)" },
    { operation: "Search/insert/delete worst", time: "O(n)", space: "O(h)" },
  ],
  realWorld: [
    "Ordered maps, range queries, symbol tables, and educational search-tree foundations.",
  ],
  pitfalls: [
    "Sorted inserts can degrade to a chain.",
    "Delete cases are easy to implement incorrectly.",
    "Duplicate-key policy must be explicit.",
  ],
  codeSnippet: {
    language: "ts",
    code: `interface BST { key: number; left?: BST; right?: BST }

function insert(node: BST | undefined, key: number): BST {
  if (!node) return { key };
  if (key < node.key) node.left = insert(node.left, key);
  else if (key > node.key) node.right = insert(node.right, key);
  return node;
}

// Ordered range scan: the property a hash map cannot give you.
function range(node: BST | undefined, lo: number, hi: number, out: number[] = []) {
  if (!node) return out;
  if (node.key > lo) range(node.left, lo, hi, out);
  if (node.key >= lo && node.key <= hi) out.push(node.key);
  if (node.key < hi) range(node.right, lo, hi, out);
  return out;
}`,
  },
  usedBy: [
    {
      company: "Oracle",
      product: "Java TreeMap / TreeSet",
      usage:
        "Sorted map APIs (headMap, tailMap, ceilingKey) are backed by a balanced search tree, giving ordered iteration a HashMap can't.",
      href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html",
    },
    {
      company: "Google",
      product: "Abseil btree_map",
      usage:
        "Google replaced node-per-key trees with B-tree-shaped ordered containers for better cache behaviour at the same ordered-API surface.",
      href: "https://abseil.io/docs/cpp/guides/container",
    },
    {
      company: "SQLite",
      product: "In-memory ephemeral tables",
      usage:
        "Ordered lookups and range constraints inside query execution rely on search-tree structures rather than hashing.",
    },
  ],
  references: [
    {
      label: "Java — TreeMap (sorted map contract)",
      href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html",
    },
    {
      label: "Abseil — ordered container guide",
      href: "https://abseil.io/docs/cpp/guides/container",
    },
  ],
  challenge: {
    prompt:
      "Insert values into a binary search tree, then return them in order. The payoff of the BST invariant is that an in-order walk emerges sorted without ever running a sort.",
    entry: "bstSorted",
    starter: `/**
 * @param {number[]} values - inserted left to right. Duplicates are ignored.
 * @returns {number[]} every stored value, ascending.
 */
function bstSorted(values) {
  // Insert: go left when smaller, right when larger, until you find an empty spot.
  // Read back: left subtree, then the node, then the right subtree.
}
`,
    tests: [
      {
        name: "sorts unordered input",
        body: `assertEquals(solution([5, 3, 8, 1]), [1, 3, 5, 8]);`,
      },
      {
        name: "already sorted input still works",
        body: `assertEquals(solution([1, 2, 3]), [1, 2, 3]);`,
      },
      {
        name: "reverse sorted input",
        body: `assertEquals(solution([3, 2, 1]), [1, 2, 3]);`,
      },
      {
        name: "duplicates are ignored",
        body: `assertEquals(solution([2, 2, 1]), [1, 2]);`,
      },
      {
        name: "empty input",
        body: `assertEquals(solution([]), []);`,
      },
      {
        name: "single value",
        body: `assertEquals(solution([42]), [42]);`,
      },
      {
        name: "handles negatives and zero",
        body: `assertEquals(solution([0, -5, 3, -1]), [-5, -1, 0, 3]);`,
      },
      {
        name: "a degenerate tree does not overflow the stack",
        body: `var vs = [];
for (var i = 0; i < 20000; i++) vs.push(i);
var out = solution(vs);
assertEquals(out.length, 20000);
assertEquals(out[0], 0);`,
      },
    ],
    hints: [
      "Insert iteratively: walk from the root until the direction you want is null, then hang the node there.",
      "In-order means recurse left, emit the value, recurse right.",
      "Sorted input builds a tree that is really a linked list, so a recursive read can blow the stack — walk it with an explicit stack instead.",
    ],
    reference: `function bstSorted(values) {
  let root = null;
  for (const value of values) {
    const node = { value, left: null, right: null };
    if (!root) {
      root = node;
      continue;
    }
    let cur = root;
    for (;;) {
      if (value === cur.value) break; // duplicate: drop it
      const dir = value < cur.value ? 'left' : 'right';
      if (!cur[dir]) {
        cur[dir] = node;
        break;
      }
      cur = cur[dir];
    }
  }

  // Iterative in-order. Sorted input degenerates the tree into a chain, so
  // recursion here would overflow on large inputs.
  const out = [];
  const stack = [];
  let cur = root;
  while (cur || stack.length) {
    while (cur) {
      stack.push(cur);
      cur = cur.left;
    }
    cur = stack.pop();
    out.push(cur.value);
    cur = cur.right;
  }
  return out;
}
`,
  },
};
