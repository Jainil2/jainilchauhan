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
};
