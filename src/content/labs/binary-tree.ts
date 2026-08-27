import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "binary-tree",
  title: "Binary Tree",
  category: "Data Structures",
  difficulty: "Beginner",
  readingTimeMin: 4,
  blurb: "Hierarchical nodes with at most two children.",
  caption:
    "Step through level-order traversal and observe array-style child indexing. Binary trees are the base shape behind heaps, search trees, and expression trees.",
  skillTags: ["DSA", "Trees"],
  concept:
    "A binary tree is a hierarchical structure where each node has at most a left and right child. It does not require ordering by itself; it is just a shape. Traversals define how you visit nodes: preorder for serialization, inorder for sorted output in BSTs, postorder for cleanup/evaluation, and level-order for breadth-first scans.\n\nComplete binary trees can be stored compactly in arrays: for node i, left child is 2i+1 and right child is 2i+2.",
  complexity: [
    { operation: "Traversal", time: "O(n)", space: "O(h)" },
    { operation: "Access child pointer", time: "O(1)", space: "O(1)" },
  ],
  realWorld: [
    "ASTs in compilers, expression evaluators, heaps, decision trees, and UI scene graphs.",
  ],
  pitfalls: [
    "A plain binary tree has no search guarantee.",
    "Recursive traversal can overflow on deep trees.",
    "Tree height controls performance for many derived structures.",
  ],
  codeSnippet: {
    language: "ts",
    code: `interface TreeNode { value: string; left?: TreeNode; right?: TreeNode }

// Depth-first: the shape of the tree drives the order.
function inorder(n: TreeNode | undefined, out: string[] = []) {
  if (!n) return out;
  inorder(n.left, out);
  out.push(n.value);
  inorder(n.right, out);
  return out;
}

// Breadth-first: level by level, the traversal UIs use for expand-all.
function levels(root: TreeNode) {
  const q = [root], out: string[][] = [];
  while (q.length) {
    const level = q.splice(0, q.length);
    out.push(level.map((n) => n.value));
    for (const n of level) { if (n.left) q.push(n.left); if (n.right) q.push(n.right); }
  }
  return out;
}`,
  },
  usedBy: [
    {
      company: "Meta",
      product: "React fiber tree",
      usage:
        "The UI is a tree of fiber nodes walked depth-first during render and commit; sibling/child pointers make the walk interruptible.",
      href: "https://react.dev/learn/preserving-and-resetting-state",
    },
    {
      company: "Google",
      product: "Chrome DOM & render tree",
      usage:
        "HTML parses into a DOM tree, which is walked to build the render tree and layout boxes on every frame.",
      href: "https://developer.chrome.com/docs/devtools/dom",
    },
    {
      company: "Git / Linux Foundation",
      product: "Git tree objects",
      usage:
        "A commit points at a tree object whose children are subtrees and blobs, so unchanged directories are shared between commits.",
      href: "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects",
    },
  ],
  references: [
    {
      label: "Git internals — tree objects",
      href: "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects",
    },
    {
      label: "MDN — Introduction to the DOM",
      href: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction",
    },
  ],
};
