import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "disjoint-set-union",
  title: "Disjoint Set Union",
  category: "Data Structures",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Track connected components with union-find.",
  caption:
    "Union sets and watch components merge. DSU answers whether two nodes belong to the same component almost instantly.",
  skillTags: ["DSA", "Graphs"],
  concept:
    "Disjoint Set Union, also called union-find, maintains a partition of items into non-overlapping sets. Find returns a representative root; union merges two sets. Path compression flattens trees during find, and union by rank/size keeps them shallow.\n\nWith both optimizations, operations are effectively constant time: O(alpha(n)), where alpha is the inverse Ackermann function and grows so slowly it is below 5 for practical inputs.",
  complexity: [
    { operation: "Find/union optimized", time: "O(alpha(n))", space: "O(n)" },
    { operation: "Connected?", time: "O(alpha(n))", space: "O(1)" },
  ],
  realWorld: [
    "Kruskal MST, image segmentation, network connectivity, percolation, and account merging.",
  ],
  pitfalls: [
    "Naive union can create tall trees.",
    "Path compression mutates parent pointers during reads.",
    "DSU handles merges well but not arbitrary edge deletions.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Union-Find with path compression + union by size: near O(1) amortised.
export class DSU {
  private parent: number[];
  private size: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
  }
  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; // halve the path
      x = this.parent[x];
    }
    return x;
  }
  union(a: number, b: number): boolean {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false; // already connected -> would create a cycle
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    return true;
  }
}`,
  },
  usedBy: [
    {
      company: "Meta",
      product: "Friend / entity clustering",
      usage:
        "Merging duplicate entities and connected social components is a union-find over billions of pair decisions.",
    },
    {
      company: "Google",
      product: "Kruskal-based network planning",
      usage:
        "Minimum spanning tree construction uses union-find to reject edges that would close a cycle.",
      href: "https://cp-algorithms.com/data_structures/disjoint_set_union.html",
    },
    {
      company: "Percona / MySQL ecosystem",
      product: "Deduplication pipelines",
      usage:
        "Record-linkage jobs union candidate pairs into clusters and then pick a survivor per cluster.",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — Disjoint set union",
      href: "https://cp-algorithms.com/data_structures/disjoint_set_union.html",
    },
    {
      label: "Tarjan — Efficiency of a good but not linear set union algorithm",
      href: "https://dl.acm.org/doi/10.1145/321879.321884",
    },
  ],
  challenge: {
    prompt:
      "Count the connected components of an undirected graph using union-find. Merge the endpoints of every edge, then count the distinct roots. Union by size plus path compression is what keeps this effectively constant time per operation.",
    entry: "countComponents",
    starter: `/**
 * @param {number} n - nodes, labelled 0..n-1.
 * @param {Array<[number, number]>} edges - undirected.
 * @returns {number} how many connected components exist.
 */
function countComponents(n, edges) {
  // Every node starts as its own component. Each edge that joins two different
  // components reduces the count by one.
}
`,
    tests: [
      {
        name: "no edges means every node is alone",
        body: `assertEquals(solution(4, []), 4);`,
      },
      {
        name: "a chain is one component",
        body: `assertEquals(solution(3, [[0, 1], [1, 2]]), 1);`,
      },
      {
        name: "two separate groups",
        body: `assertEquals(solution(4, [[0, 1], [2, 3]]), 2);`,
      },
      {
        name: "a repeated edge changes nothing",
        body: `assertEquals(solution(2, [[0, 1], [0, 1]]), 1);`,
      },
      {
        name: "a self loop changes nothing",
        body: `assertEquals(solution(3, [[1, 1]]), 3);`,
      },
      {
        name: "zero nodes",
        body: `assertEquals(solution(0, []), 0);`,
      },
      {
        name: "a cycle is still one component",
        body: `assertEquals(solution(3, [[0, 1], [1, 2], [2, 0]]), 1);`,
      },
      {
        name: "stays fast on a long chain",
        body: `var edges = [];
for (var i = 0; i < 100000; i++) edges.push([i, i + 1]);
assertEquals(solution(100001, edges), 1);`,
      },
    ],
    hints: [
      "Start with parent[i] = i and a component count of n.",
      "find(x) should flatten as it walks — point each node it passes directly at the root.",
      "Only decrement the count when the two roots actually differ; an edge inside one component is a no-op.",
    ],
    reference: `function countComponents(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = new Array(n).fill(1);
  let components = n;

  // Iterative find with path compression: every node on the path ends up
  // pointing straight at the root, so later lookups are nearly free.
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

  for (const [a, b] of edges) {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) continue; // already together
    // Hang the smaller tree off the bigger one to keep paths short.
    const [big, small] = size[ra] >= size[rb] ? [ra, rb] : [rb, ra];
    parent[small] = big;
    size[big] += size[small];
    components--;
  }
  return components;
}
`,
  },
};
