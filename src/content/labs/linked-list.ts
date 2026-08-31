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
  challenge: {
    prompt:
      "Reverse a singly linked list and return the new head. Nodes are plain objects shaped { value, next }, with next being null at the tail. Pointer rewiring, no array conversion.",
    entry: "reverseList",
    starter: `/**
 * @param {{value: any, next: object|null}|null} head - first node, or null.
 * @returns {object|null} the new head after reversing.
 */
function reverseList(head) {
  // Walk the list once, pointing each node at the one before it.
  // You need to remember the next node before you overwrite the pointer.
}
`,
    tests: [
      {
        name: "reverses a three-node list",
        body: `function build(vs) { let h = null; for (let i = vs.length - 1; i >= 0; i--) h = { value: vs[i], next: h }; return h; }
function toArray(h) { const o = []; while (h) { o.push(h.value); h = h.next; } return o; }
assertEquals(toArray(solution(build([1, 2, 3]))), [3, 2, 1]);`,
      },
      {
        name: "an empty list reverses to null",
        body: `assertEquals(solution(null), null);`,
      },
      {
        name: "a single node is its own reverse",
        body: `var n = { value: 7, next: null };
var r = solution(n);
assertEquals(r.value, 7);
assertEquals(r.next, null);`,
      },
      {
        name: "the old head becomes the tail",
        body: `function build(vs) { let h = null; for (let i = vs.length - 1; i >= 0; i--) h = { value: vs[i], next: h }; return h; }
var head = build(['a', 'b', 'c']);
var r = solution(head);
assertEquals(head.next, null);
assertEquals(r.value, 'c');`,
      },
      {
        name: "handles a long list without recursing too deep",
        body: `function build(vs) { let h = null; for (let i = vs.length - 1; i >= 0; i--) h = { value: vs[i], next: h }; return h; }
var vs = []; for (var i = 0; i < 20000; i++) vs.push(i);
var r = solution(build(vs));
assertEquals(r.value, 19999);`,
      },
    ],
    hints: [
      "Keep three references as you walk: the previous node, the current node, and the next one.",
      "Capture current.next into a temporary before you overwrite it, or you lose the rest of the list.",
      "When the walk ends, `previous` is standing on the last node you visited — that is the new head.",
    ],
    reference: `function reverseList(head) {
  let previous = null;
  let current = head;
  while (current) {
    const next = current.next; // save it before the pointer is overwritten
    current.next = previous;
    previous = current;
    current = next;
  }
  return previous;
}
`,
  },
};
