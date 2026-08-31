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
  challenge: {
    prompt:
      "Return a binary tree's values level by level, top to bottom, left to right. Nodes are { value, left, right } with null for a missing child. Level-order is breadth-first search on a tree, and the queue is what makes it work.",
    entry: "levelOrder",
    starter: `/**
 * @param {{value: any, left: object|null, right: object|null}|null} root
 * @returns {any[][]} one array per level, top level first.
 */
function levelOrder(root) {
  // Process a whole level before starting the next one. Record how many nodes
  // are in the queue when the level begins -- that count is the level.
}
`,
    tests: [
      {
        name: "a single node",
        body: `assertEquals(solution({ value: 1, left: null, right: null }), [[1]]);`,
      },
      {
        name: "two full levels",
        body: `var t = { value: 1, left: { value: 2, left: null, right: null }, right: { value: 3, left: null, right: null } };
assertEquals(solution(t), [[1], [2, 3]]);`,
      },
      {
        name: "left to right within a level",
        body: `var leaf = function (v) { return { value: v, left: null, right: null }; };
var t = { value: 1, left: { value: 2, left: leaf(4), right: leaf(5) }, right: leaf(3) };
assertEquals(solution(t), [[1], [2, 3], [4, 5]]);`,
      },
      {
        name: "a lopsided tree still levels correctly",
        body: `var t = { value: 1, left: { value: 2, left: { value: 3, left: null, right: null }, right: null }, right: null };
assertEquals(solution(t), [[1], [2], [3]]);`,
      },
      {
        name: "an empty tree",
        body: `assertEquals(solution(null), []);`,
      },
      {
        name: "handles a deep tree without stack overflow",
        body: `var root = { value: 0, left: null, right: null };
var cur = root;
for (var i = 1; i < 10000; i++) { cur.left = { value: i, left: null, right: null }; cur = cur.left; }
var out = solution(root);
assertEquals(out.length, 10000);`,
      },
    ],
    hints: [
      "Use a queue seeded with the root, and loop while the queue has anything in it.",
      "At the top of each iteration, capture queue.length — that is exactly one level's worth of nodes.",
      "Only enqueue children that exist, or you will produce levels full of nulls.",
    ],
    reference: `function levelOrder(root) {
  if (!root) return [];
  const out = [];
  let queue = [root];
  while (queue.length) {
    const level = [];
    const next = [];
    // Everything currently queued belongs to this level; children go to 'next'.
    for (const node of queue) {
      level.push(node.value);
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    out.push(level);
    queue = next;
  }
  return out;
}
`,
  },
};
