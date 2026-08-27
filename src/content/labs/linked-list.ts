import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "linked-list",
  title: "Linked List",
  category: "Data Structures",
  difficulty: "Beginner",
  readingTimeMin: 4,
  blurb: "Pointer-linked nodes optimized for local insertion and deletion.",
  caption:
    "Insert at the head and traverse node by node. Linked lists avoid shifting but lose O(1) indexed access and cache locality.",
  skillTags: ["DSA", "Memory"],
  concept:
    "A linked list stores each value in a node that points to the next node. Singly linked lists support forward traversal; doubly linked lists also point backward. Inserting or deleting near a known node is O(1) because only pointers change.\n\nThe cost is lookup: finding index i requires walking from the head. Each node also carries pointer overhead and scattered allocation, which is less cache-friendly than arrays.",
  complexity: [
    { operation: "Insert/delete known node", time: "O(1)", space: "O(1)" },
    { operation: "Search/index lookup", time: "O(n)", space: "O(1)" },
    { operation: "Traversal", time: "O(n)", space: "O(1)" },
  ],
  realWorld: [
    "LRU cache recency chains, adjacency lists, memory allocators, and intrusive kernel lists.",
  ],
  pitfalls: [
    "Pointer bugs create cycles, leaks, or lost sublists.",
    "Poor cache locality can make lists slower than arrays despite better big-O for insertion.",
    "Deleting a node usually requires knowing its predecessor in a singly linked list.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Doubly linked list node — O(1) unlink/relink, the core of an LRU chain.
interface Node<T> { value: T; prev?: Node<T>; next?: Node<T> }

function unlink<T>(n: Node<T>) {
  if (n.prev) n.prev.next = n.next;
  if (n.next) n.next.prev = n.prev;
  n.prev = n.next = undefined;
}

function pushFront<T>(head: Node<T> | undefined, n: Node<T>): Node<T> {
  n.next = head;
  if (head) head.prev = n;
  return n; // new head
}`,
  },
  usedBy: [
    {
      company: "Redis",
      product: "Redis lists / LPUSH-RPUSH",
      usage:
        "Lists are stored as a quicklist — a linked list of compact listpack nodes — so pushes and pops at both ends stay O(1).",
      href: "https://redis.io/docs/latest/develop/data-types/lists/",
    },
    {
      company: "Linux kernel",
      product: "list_head intrusive lists",
      usage:
        "Task, timer and driver structures embed `struct list_head`, giving O(1) insert/remove with no allocation.",
      href: "https://www.kernel.org/doc/html/latest/core-api/kernel-api.html#list-management-functions",
    },
    {
      company: "Memcached",
      product: "Slab LRU chain",
      usage:
        "Each slab class keeps a doubly linked recency list so a hit only relinks pointers instead of shifting data.",
    },
  ],
  references: [
    {
      label: "Redis docs — Lists (quicklist encoding)",
      href: "https://redis.io/docs/latest/develop/data-types/lists/",
    },
    {
      label: "Linux kernel — list management API",
      href: "https://www.kernel.org/doc/html/latest/core-api/kernel-api.html#list-management-functions",
    },
  ],
};
