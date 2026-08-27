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
};
