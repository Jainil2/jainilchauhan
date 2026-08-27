import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "avl-tree",
  title: "AVL Tree",
  category: "Data Structures",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Self-balancing BST with strict height guarantees.",
  caption:
    "Insert a skewing value and rotate back into balance. AVL tracks balance factor and performs rotations when height differs too much.",
  skillTags: ["DSA", "Trees"],
  concept:
    "An AVL tree is a self-balancing binary search tree. For every node, the height difference between left and right subtrees must be -1, 0, or 1. After insertion or deletion, the tree restores this invariant using single or double rotations.\n\nAVL trees are stricter than red-black trees, so lookups are very fast due to lower height. The cost is more frequent rotations on write-heavy workloads.",
  complexity: [
    { operation: "Search", time: "O(log n)", space: "O(1)" },
    { operation: "Insert/delete", time: "O(log n)", space: "O(1)" },
    { operation: "Rotation", time: "O(1)", space: "O(1)" },
  ],
  realWorld: [
    "Read-heavy in-memory indexes, language libraries, and schedulers needing ordered lookup.",
  ],
  pitfalls: [
    "Balance-factor updates are easy to get wrong.",
    "More rotations than red-black trees under frequent writes.",
    "Recursive implementations must handle height updates carefully.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// AVL keeps |height(left) - height(right)| <= 1 via rotations.
interface AVL { key: number; h: number; left?: AVL; right?: AVL }
const h = (n?: AVL) => n?.h ?? 0;
const fix = (n: AVL) => { n.h = 1 + Math.max(h(n.left), h(n.right)); return n; };

function rotateRight(y: AVL): AVL {
  const x = y.left!;
  y.left = x.right;
  x.right = fix(y);
  return fix(x);
}

function rebalance(n: AVL): AVL {
  const bf = h(n.left) - h(n.right);
  if (bf > 1) {
    if (h(n.left!.left) < h(n.left!.right)) n.left = rotateLeft(n.left!); // left-right case
    return rotateRight(n);
  }
  if (bf < -1) {
    if (h(n.right!.right) < h(n.right!.left)) n.right = rotateRight(n.right!);
    return rotateLeft(n);
  }
  return fix(n);
}`,
  },
  usedBy: [
    {
      company: "Oracle",
      product: "MySQL / InnoDB adaptive structures",
      usage:
        "Strictly height-balanced trees are chosen where reads dominate writes, because the tighter bound means fewer comparisons per lookup.",
    },
    {
      company: "Ethereum Foundation",
      product: "AVL+ trees in Merkle-authenticated stores",
      usage:
        "Authenticated dictionaries use AVL-style rebalancing so proof paths stay logarithmic and deterministic.",
      href: "https://eprint.iacr.org/2016/994",
    },
    {
      company: "Redis",
      product: "RedisAI / module indexes",
      usage:
        "Read-heavy in-memory indexes favour strict balancing so lookup latency has a tight upper bound.",
    },
  ],
  references: [
    {
      label: "Adelson-Velsky & Landis — original balancing paper (overview)",
      href: "https://en.wikipedia.org/wiki/AVL_tree",
    },
    {
      label: "Improving authenticated dynamic dictionaries (AVL+)",
      href: "https://eprint.iacr.org/2016/994",
    },
  ],
};
