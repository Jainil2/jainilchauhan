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
  bridgesFrom: [
    {
      slug: "binary-search-tree",
      sameness:
        "It IS a binary search tree — same ordering invariant, same comparison-driven descent, same in-order walk for sorted output. Every search you wrote works here unmodified.",
      delta:
        "Each insert and delete also restores a height rule: the two subtrees of any node differ in height by at most one, enforced with rotations on the way back up. That converts the average case into a worst case guarantee, so the sorted-insertion order that turned a plain BST into a linked list is now harmless. You pay for it on writes, which now do O(log n) extra bookkeeping and can no longer be a simple leaf attachment.",
    },
  ],
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
  challenge: {
    prompt:
      "Decide which rotation an AVL insert needs. Given the balance factor of the unbalanced node and of the child on its heavy side, return 'LL', 'LR', 'RL', 'RR', or 'none'. Getting this decision right is the whole of AVL rebalancing; the pointer work that follows is mechanical.",
    entry: "rotationFor",
    starter: `/**
 * Balance factor = height(left) - height(right).
 *
 * @param {number} balance - balance factor of the unbalanced node.
 * @param {number} childBalance - balance factor of its child on the heavy side.
 * @returns {'LL'|'LR'|'RL'|'RR'|'none'}
 */
function rotationFor(balance, childBalance) {
  // A node is unbalanced only once its balance factor passes +1 or -1.
  // Left-heavy is positive; right-heavy is negative.
  // The child decides whether the case is straight or zig-zag.
}
`,
    tests: [
      {
        name: "balanced needs nothing",
        body: `assertEquals(solution(0, 0), 'none');`,
      },
      {
        name: "tilted but still legal",
        body: `assertEquals(solution(1, 0), 'none');`,
      },
      {
        name: "right tilt still legal",
        body: `assertEquals(solution(-1, 0), 'none');`,
      },
      {
        name: "left-left is a single rotation",
        body: `assertEquals(solution(2, 1), 'LL');`,
      },
      {
        name: "left-right is a zig-zag",
        body: `assertEquals(solution(2, -1), 'LR');`,
      },
      {
        name: "right-right is a single rotation",
        body: `assertEquals(solution(-2, -1), 'RR');`,
      },
      {
        name: "right-left is a zig-zag",
        body: `assertEquals(solution(-2, 1), 'RL');`,
      },
      {
        name: "a balanced child after insertion counts as straight",
        body: `assertEquals(solution(2, 0), 'LL');
assertEquals(solution(-2, 0), 'RR');`,
      },
      {
        name: "deeper imbalance is handled the same way",
        body: `assertEquals(solution(3, 1), 'LL');
assertEquals(solution(-3, 1), 'RL');`,
      },
    ],
    hints: [
      "Nothing is needed while the balance factor is between -1 and 1 inclusive.",
      "Balance greater than 1 means left-heavy, so the first letter is L; less than -1 means R.",
      "The second letter comes from the child: on the left side a negative child balance means the zig-zag LR, and on the right a positive child balance means RL.",
    ],
    reference: `function rotationFor(balance, childBalance) {
  if (balance > 1) {
    // Left-heavy. A child leaning right makes it a zig-zag.
    return childBalance < 0 ? 'LR' : 'LL';
  }
  if (balance < -1) {
    // Right-heavy. A child leaning left makes it a zig-zag.
    return childBalance > 0 ? 'RL' : 'RR';
  }
  return 'none';
}
`,
  },
};
