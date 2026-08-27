import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "prim-mst",
  title: "Prim MST",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Grow a minimum spanning tree from one connected frontier.",
  caption:
    "Add the cheapest edge crossing from the visited set to the unvisited set. Prim keeps one growing connected tree.",
  skillTags: ["DSA", "Graphs"],
  concept:
    "Prim's algorithm finds a minimum spanning tree of a connected weighted undirected graph. It starts from any node, maintains a visited set, and repeatedly chooses the cheapest edge that connects visited to unvisited nodes.\n\nWith a priority queue, Prim is efficient on sparse graphs. It is a natural fit when the graph is already represented by adjacency lists and you want to grow from a known starting point.",
  complexity: [
    { operation: "With binary heap", time: "O(E log V)", space: "O(V + E)" },
    { operation: "Dense matrix version", time: "O(V^2)", space: "O(V)" },
  ],
  realWorld: ["Network cabling, cluster design, road planning, and approximation pipelines."],
  pitfalls: [
    "Requires undirected weighted graphs.",
    "Disconnected graphs produce a spanning forest, not one tree.",
    "MST minimizes total edge cost, not shortest paths from a source.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Grow one tree: always take the cheapest edge leaving the built set.
function prim(n: number, adj: [number, number][][]): number {
  const inTree = new Array(n).fill(false);
  const best = new Array(n).fill(Infinity);
  best[0] = 0;
  let total = 0;
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!inTree[v] && (u === -1 || best[v] < best[u])) u = v;
    inTree[u] = true;
    total += best[u];
    for (const [v, w] of adj[u]) if (!inTree[v] && w < best[v]) best[v] = w;
  }
  return total; // use a binary heap for O(E log V)
}`,
  },
  usedBy: [
    {
      company: "AT&T / telecom operators",
      product: "Fibre backbone planning",
      usage:
        "Connecting every site at minimum trench/fibre cost is the textbook minimum spanning tree problem.",
    },
    {
      company: "Meta",
      product: "Data-centre cable topology planning",
      usage:
        "Dense candidate-link graphs favour Prim's, which grows a single tree from a seed node.",
    },
    {
      company: "Esri",
      product: "Utility network design (GIS)",
      usage:
        "Water/power distribution layouts are generated as minimum-cost spanning structures over service points.",
      href: "https://cp-algorithms.com/graph/mst_prim.html",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — Prim's MST",
      href: "https://cp-algorithms.com/graph/mst_prim.html",
    },
    {
      label: "Prim (1957) — Shortest connection networks",
      href: "https://ieeexplore.ieee.org/document/6773228",
    },
  ],
};
