import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "red-black-tree",
  title: "Red-Black Tree",
  category: "Data Structures",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Balanced BST using color rules and rotations.",
  caption:
    "Toggle a violation fix to see recoloring and rotation. Red-black trees keep height bounded without being as strict as AVL.",
  skillTags: ["DSA", "Trees"],
  bridgesFrom: [
    {
      slug: "avl-tree",
      sameness:
        "It IS a self-balancing binary search tree of the same kind as the AVL tree. Same ordering invariant, same rotations, same idea that the tree repairs its own shape on the way back up from a write.",
      delta:
        "The invariant is looser — equal black-height rather than heights within one — so a red-black tree can be up to twice as tall as an AVL tree of the same size. It accepts slower lookups to make writes cheaper: rebalancing after an insert takes at most a couple of rotations and mostly recolouring, where AVL may rotate all the way to the root. That is why read-heavy in-memory indexes reach for AVL and general-purpose libraries like the standard library map and the Linux scheduler reach for red-black.",
    },
  ],
  concept:
    "A red-black tree is a balanced BST with color invariants: nodes are red or black, the root is black, red nodes cannot have red children, and every path to a null leaf has the same number of black nodes. These rules bound height to O(log n).\n\nCompared with AVL, red-black trees allow looser balance and typically perform fewer rotations on updates, which makes them popular for general-purpose ordered maps.",
  complexity: [
    { operation: "Search/insert/delete", time: "O(log n)", space: "O(1)" },
    { operation: "Recolor/rotation fix", time: "O(log n)", space: "O(1)" },
  ],
  realWorld: ["Java TreeMap, C++ std::map/std::set, Linux kernel rbtree, and epoll timers."],
  pitfalls: [
    "Color invariants are subtle to preserve.",
    "Implementation complexity is higher than AVL or treap.",
    "Not optimal for cache locality compared with B-trees.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Red-black invariants (relaxed balance -> fewer rotations than AVL):
// 1. every node is red or black; the root is black
// 2. a red node cannot have a red child
// 3. every root-to-leaf path has the same number of black nodes
// => longest path <= 2x shortest path, so height is O(log n)

type Color = "R" | "B";
interface RB { key: number; color: Color; left?: RB; right?: RB }

function insertFixup(n: RB, parent: RB, grandparent: RB, uncle?: RB): void {
  if (uncle?.color === "R") {
    parent.color = uncle.color = "B"; // recolor, push the problem up
    grandparent.color = "R";
    return;
  }
  // black/absent uncle -> single or double rotation at the grandparent
}`,
  },
  usedBy: [
    {
      company: "Linux kernel",
      product: "CFS scheduler & VMA lookup",
      usage:
        "Runnable tasks and virtual memory areas live in red-black trees; the leftmost node is the next task to run.",
      href: "https://www.kernel.org/doc/html/latest/core-api/rbtree.html",
    },
    {
      company: "Oracle",
      product: "Java TreeMap / HashMap treeified bins",
      usage:
        "TreeMap is a red-black tree, and HashMap converts a long collision chain into one when a bucket exceeds 8 entries.",
      href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html",
    },
    {
      company: "GNU / C++ standard library",
      product: "std::map, std::set",
      usage:
        "Ordered associative containers are specified with logarithmic bounds that implementations meet with red-black trees.",
      href: "https://en.cppreference.com/w/cpp/container/map",
    },
  ],
  references: [
    {
      label: "Linux kernel — Red-black trees (rbtree)",
      href: "https://www.kernel.org/doc/html/latest/core-api/rbtree.html",
    },
    {
      label: "cppreference — std::map complexity guarantees",
      href: "https://en.cppreference.com/w/cpp/container/map",
    },
  ],
  challenge: {
    prompt:
      "Classify the fix-up case after a red-black insert. Given the colours around a freshly inserted red node, return 'recolor', 'rotate', or 'none'. A red uncle recolours and pushes the problem up the tree; a black uncle rotates and stops it there.",
    entry: "fixupCase",
    starter: `/**
 * @param {{parent: 'red'|'black'|null, uncle: 'red'|'black'|null, isRoot: boolean}} state
 *   parent and uncle are null when that node does not exist (treated as black).
 * @returns {'recolor'|'rotate'|'none'}
 */
function fixupCase(state) {
  // No violation exists unless the new red node has a RED parent.
  // Given a violation, the uncle's colour decides the remedy.
}
`,
    tests: [
      {
        name: "the root needs no fix",
        body: `assertEquals(solution({ parent: null, uncle: null, isRoot: true }), 'none');`,
      },
      {
        name: "a black parent is already legal",
        body: `assertEquals(solution({ parent: 'black', uncle: 'red', isRoot: false }), 'none');`,
      },
      {
        name: "red parent and red uncle recolours",
        body: `assertEquals(solution({ parent: 'red', uncle: 'red', isRoot: false }), 'recolor');`,
      },
      {
        name: "red parent and black uncle rotates",
        body: `assertEquals(solution({ parent: 'red', uncle: 'black', isRoot: false }), 'rotate');`,
      },
      {
        name: "a missing uncle counts as black",
        body: `assertEquals(solution({ parent: 'red', uncle: null, isRoot: false }), 'rotate');`,
      },
      {
        name: "root wins even with a red parent recorded",
        body: `assertEquals(solution({ parent: 'red', uncle: 'red', isRoot: true }), 'none');`,
      },
    ],
    hints: [
      "Handle the root first and return early — the root is always recoloured black and no fix-up applies.",
      "Two reds in a row is the only violation. A black or missing parent means there is nothing to do.",
      "Null means a leaf sentinel, and those are black, so treat a missing uncle exactly like a black one.",
    ],
    reference: `function fixupCase(state) {
  const { parent, uncle, isRoot } = state;
  if (isRoot) return 'none';
  // The invariant only breaks when a red node has a red parent.
  if (parent !== 'red') return 'none';
  // Missing nodes are the black leaf sentinel, so null behaves as black.
  return uncle === 'red' ? 'recolor' : 'rotate';
}
`,
  },
};
