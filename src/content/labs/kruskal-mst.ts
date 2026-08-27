import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "kruskal-mst",
  title: "Kruskal MST",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Build an MST by sorting edges and skipping cycles.",
  caption:
    "Consider edges in ascending weight order. Union-Find accepts edges that connect different components and rejects cycle-forming edges.",
  skillTags: ["DSA", "Graphs"],
  concept:
    "Kruskal's algorithm sorts all edges by weight, then scans from cheapest to most expensive. An edge is accepted only if it connects two different components; otherwise it would create a cycle. Union-Find makes the component test fast.\n\nKruskal is especially clean when edges are already available as a list or when the graph is sparse.",
  complexity: [
    { operation: "Sort edges", time: "O(E log E)", space: "O(E)" },
    { operation: "Union-Find scan", time: "O(E alpha(V))", space: "O(V)" },
  ],
  realWorld: ["Clustering, network design, image segmentation, and offline graph optimization."],
  pitfalls: [
    "Parallel edges are allowed; choose the cheapest useful one.",
    "Disconnected input yields a minimum spanning forest.",
    "Sorting dominates runtime for most inputs.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Sort edges, add the cheapest that doesn't close a cycle (union-find).
function kruskal(n: number, edges: { a: number; b: number; w: number }[]) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const tree: typeof edges = [];
  for (const e of [...edges].sort((x, y) => x.w - y.w)) {
    const ra = find(e.a), rb = find(e.b);
    if (ra === rb) continue; // would create a cycle
    parent[rb] = ra;
    tree.push(e);
    if (tree.length === n - 1) break;
  }
  return tree;
}`,
  },
  usedBy: [
    {
      company: "Cloudflare / CDN operators",
      product: "Backbone link selection",
      usage:
        "Sparse candidate-link graphs are cheaper to solve edge-first, which is exactly Kruskal's ordering.",
    },
    {
      company: "Scikit-learn contributors",
      product: "Single-linkage clustering",
      usage:
        "Single-linkage hierarchical clustering is an MST computation; cutting the largest edges yields clusters.",
      href: "https://scikit-learn.org/stable/modules/clustering.html#hierarchical-clustering",
    },
    {
      company: "Autodesk",
      product: "Mesh simplification / segmentation",
      usage:
        "Minimum spanning forests over dual graphs drive region growing in geometry pipelines.",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — Kruskal with DSU",
      href: "https://cp-algorithms.com/graph/mst_kruskal_with_dsu.html",
    },
    {
      label: "scikit-learn — hierarchical (single linkage) clustering",
      href: "https://scikit-learn.org/stable/modules/clustering.html#hierarchical-clustering",
    },
  ],
  challenge: {
    prompt:
      "Pick the edges of a minimum spanning tree by sorting every edge and taking each one that joins two separate components. Where Prim grows one tree, Kruskal merges a forest — and union-find is what makes the 'would this close a cycle' test cheap.",
    entry: "mstEdges",
    starter: `/**
 * @param {number} n - nodes 0..n-1.
 * @param {Array<[number, number, number]>} edges - [u, v, weight], undirected.
 * @returns {number[]} indices of the chosen edges, ascending. Break weight ties
 *   by the lower original index.
 */
function mstEdges(n, edges) {
  // Sort by weight, then take an edge only when its endpoints are still in
  // different components.
}
`,
    tests: [
      {
        name: "skips the expensive edge of a triangle",
        body: `assertEquals(solution(3, [[0, 1, 1], [1, 2, 2], [0, 2, 5]]), [0, 1]);`,
      },
      {
        name: "a chain keeps everything",
        body: `assertEquals(solution(3, [[0, 1, 4], [1, 2, 6]]), [0, 1]);`,
      },
      {
        name: "ties break toward the earlier edge",
        body: `assertEquals(solution(2, [[0, 1, 3], [0, 1, 3]]), [0]);`,
      },
      {
        name: "a cheaper later edge wins",
        body: `assertEquals(solution(2, [[0, 1, 9], [0, 1, 1]]), [1]);`,
      },
      {
        name: "a disconnected graph yields a forest",
        body: `assertEquals(solution(4, [[0, 1, 1], [2, 3, 1]]), [0, 1]);`,
      },
      {
        name: "no edges",
        body: `assertEquals(solution(2, []), []);`,
      },
      {
        name: "skips self loops",
        body: `assertEquals(solution(2, [[0, 0, 1], [0, 1, 2]]), [1]);`,
      },
      {
        name: "selects exactly n-1 edges on a connected graph",
        body: `var edges = [];
for (var i = 0; i < 5000; i++) edges.push([i, i + 1, (i % 7) + 1]);
for (var j = 0; j < 5000; j++) edges.push([0, j + 1, 50]);
assertEquals(solution(5001, edges).length, 5000);`,
      },
    ],
    hints: [
      "Sort indices, not the edges themselves, so you can report original positions.",
      "Sort by weight and use the index as the tie-break to make the result deterministic.",
      "Union-find with path compression answers 'already connected?' in near-constant time.",
    ],
    reference: `function mstEdges(n, edges) {
  const order = edges.map((_, i) => i);
  // Index as the tie-break keeps the choice deterministic.
  order.sort((a, b) => edges[a][2] - edges[b][2] || a - b);

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

  const chosen = [];
  for (const i of order) {
    const [u, v] = edges[i];
    const ru = find(u);
    const rv = find(v);
    if (ru === rv) continue; // would close a cycle (a self loop lands here too)
    parent[ru] = rv;
    chosen.push(i);
  }
  return chosen.sort((a, b) => a - b);
}
`,
  },
};
