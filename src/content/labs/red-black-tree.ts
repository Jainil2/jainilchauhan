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
};
