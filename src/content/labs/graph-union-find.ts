import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "graph-union-find",
  title: "Graph Union-Find",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Answer dynamic connectivity in undirected graphs.",
  caption:
    "Union incoming edges and watch components merge. Union-Find is the graph connectivity workhorse behind Kruskal and online component tracking.",
  skillTags: ["DSA", "Graphs"],
  bridgesFrom: [
    {
      slug: "disjoint-set-union",
      sameness:
        "It IS the disjoint set union you already built, with graph vertices as the elements. Each edge that arrives is a union, each connectivity question is two finds compared for equality.",
      delta:
        "Framing it as a graph makes the restriction visible: this answers whether two vertices are connected, and nothing else. It cannot produce the path between them, it cannot tell you the distance, and it cannot handle an edge being removed — deletion would require splitting a set, which the structure has no way to do.",
    },
    {
      slug: "connected-components",
      sameness:
        "It answers the same question as the component labelling you did with traversal: which vertices are in the same group.",
      delta:
        "The difference is when the edges arrive. Traversal needs the whole graph up front and costs O(V + E) every time it changes; union-find absorbs edges one at a time and answers queries in between at effectively constant cost. That makes it the right tool for a stream and the wrong tool for a snapshot you also want to explore, since it stores connectivity without storing the graph.",
    },
  ],
  concept:
    "Union-Find maintains connected components as edges arrive. Each node points to a parent representative. Find returns the root; union merges two roots. Path compression and union by size or rank make operations almost constant time.\n\nFor undirected graphs where edges are only added, Union-Find is usually faster and simpler than rerunning DFS after every edge.",
  complexity: [
    { operation: "Find/union", time: "O(alpha(V))", space: "O(V)" },
    { operation: "Process E edges", time: "O(E alpha(V))", space: "O(V)" },
  ],
  realWorld: [
    "Kruskal minimum spanning tree, network connectivity, account merge, percolation, and image regions.",
  ],
  pitfalls: [
    "Does not support arbitrary deletions cleanly.",
    "Works for undirected connectivity, not directed reachability.",
    "Without path compression/rank, trees can become tall.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Connectivity queries under a stream of merges — no re-traversal.
const parent = new Map<string, string>();
const find = (x: string): string => {
  const p = parent.get(x) ?? x;
  if (p === x) return x;
  const root = find(p);
  parent.set(x, root); // path compression
  return root;
};
const union = (a: string, b: string) => {
  const ra = find(a), rb = find(b);
  if (ra !== rb) parent.set(rb, ra);
};

union("user:1", "device:a");
union("device:a", "user:2");
find("user:1") === find("user:2"); // true -> same cluster`,
  },
  usedBy: [
    {
      company: "Stripe",
      product: "Linked-account clustering",
      usage:
        "Streaming signals union accounts into fraud clusters without recomputing components from scratch.",
      href: "https://stripe.com/radar",
    },
    {
      company: "Apache Spark",
      product: "GraphX connected components",
      usage: "Distributed union-find style label propagation groups vertices across partitions.",
      href: "https://spark.apache.org/docs/latest/graphx-programming-guide.html",
    },
    {
      company: "Google",
      product: "Percolation / image segmentation",
      usage:
        "Pixel similarity merges produce segments incrementally, which is exactly incremental connectivity.",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — DSU applications",
      href: "https://cp-algorithms.com/data_structures/disjoint_set_union.html",
    },
    {
      label: "Spark GraphX — connected components",
      href: "https://spark.apache.org/docs/latest/graphx-programming-guide.html",
    },
  ],
  challenge: {
    prompt:
      "Find the first edge that closes a cycle as you add edges one at a time. Union-find answers 'are these already connected' before you join them, which is exactly the test Kruskal uses to skip an edge.",
    entry: "firstCycleEdge",
    starter: `/**
 * @param {number} n - nodes 0..n-1.
 * @param {Array<[number, number]>} edges - undirected, added in order.
 * @returns {number} index of the first edge whose endpoints were already
 *   connected, or -1 when the edges form a forest.
 */
function firstCycleEdge(n, edges) {
  // Before joining two nodes, ask whether they already share a root.
}
`,
    tests: [
      {
        name: "a triangle closes on the third edge",
        body: `assertEquals(solution(3, [[0, 1], [1, 2], [2, 0]]), 2);`,
      },
      {
        name: "a tree closes nothing",
        body: `assertEquals(solution(3, [[0, 1], [1, 2]]), -1);`,
      },
      {
        name: "a duplicate edge closes a cycle",
        body: `assertEquals(solution(2, [[0, 1], [0, 1]]), 1);`,
      },
      {
        name: "a self loop closes immediately",
        body: `assertEquals(solution(2, [[0, 0]]), 0);`,
      },
      {
        name: "no edges",
        body: `assertEquals(solution(3, []), -1);`,
      },
      {
        name: "ignores separate components",
        body: `assertEquals(solution(4, [[0, 1], [2, 3]]), -1);`,
      },
      {
        name: "reports the FIRST closing edge",
        body: `assertEquals(solution(4, [[0, 1], [1, 2], [0, 2], [2, 3], [1, 3]]), 2);`,
      },
      {
        name: "fast on a long chain",
        body: `var edges = [];
for (var i = 0; i < 100000; i++) edges.push([i, i + 1]);
assertEquals(solution(100001, edges), -1);`,
      },
    ],
    hints: [
      "Start with every node as its own root and find roots with path compression.",
      "For each edge, compare the two roots. Equal roots mean the edge would close a cycle.",
      "Return the edge's index the moment that happens; otherwise union the two sets and continue.",
    ],
    reference: `function firstCycleEdge(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    let root = x;
    while (parent[root] !== root) root = parent[root];
    while (parent[x] !== root) {
      const next = parent[x];
      parent[x] = root;
      x = next;
    }
    return root;
  };
  for (let i = 0; i < edges.length; i++) {
    const [u, v] = edges[i];
    const ru = find(u);
    const rv = find(v);
    // Already connected, so this edge creates a cycle.
    if (ru === rv) return i;
    parent[ru] = rv;
  }
  return -1;
}
`,
  },
};
