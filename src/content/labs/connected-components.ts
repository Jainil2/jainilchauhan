import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "connected-components",
  title: "Connected Components",
  category: "Algorithms",
  difficulty: "Beginner",
  readingTimeMin: 4,
  blurb: "Group reachable nodes in an undirected graph.",
  caption:
    "Highlight each component. DFS or BFS marks all nodes reachable from a start node before moving to the next unvisited node.",
  skillTags: ["DSA", "Graphs"],
  concept:
    "A connected component is a maximal group of nodes where every node can reach every other node through undirected edges. To find all components, iterate over vertices; whenever a vertex is unvisited, start DFS or BFS and mark the entire reachable group.\n\nConnected components answer whether a graph is split into islands. They are also the foundation for clustering, image regions, account merging, and graph cleanup.",
  complexity: [
    { operation: "Find all components", time: "O(V + E)", space: "O(V)" },
    { operation: "Single BFS/DFS", time: "O(component vertices + edges)", space: "O(V)" },
  ],
  realWorld: [
    "Network partition detection, image segmentation, social communities, and duplicate-account clusters.",
  ],
  pitfalls: [
    "Directed graphs need weak or strong component definitions.",
    "For huge graphs, recursion can overflow; use iterative traversal.",
    "Disconnected isolated nodes are components of size one.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Label every vertex with its component id via BFS flood fill.
function components(adj: Map<string, string[]>): Map<string, number> {
  const label = new Map<string, number>();
  let id = 0;
  for (const start of adj.keys()) {
    if (label.has(start)) continue;
    const q = [start];
    label.set(start, id);
    while (q.length) {
      const v = q.shift()!;
      for (const n of adj.get(v) ?? []) {
        if (!label.has(n)) { label.set(n, id); q.push(n); }
      }
    }
    id++;
  }
  return label; // id count = number of isolated islands
}`,
  },
  usedBy: [
    {
      company: "Meta",
      product: "Duplicate account / entity resolution",
      usage:
        "Match signals form a graph; each connected component becomes one merged identity cluster.",
    },
    {
      company: "Stripe",
      product: "Radar fraud rings",
      usage:
        "Shared cards, devices and IPs link accounts into components, and a whole ring can be actioned together.",
      href: "https://stripe.com/radar",
    },
    {
      company: "Google",
      product: "Photos face clustering",
      usage:
        "Similarity edges above a threshold are grouped into components so each cluster becomes one suggested person.",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — Search for connected components",
      href: "https://cp-algorithms.com/graph/search-for-connected-components.html",
    },
    { label: "Stripe Radar — network-level fraud signals", href: "https://stripe.com/radar" },
  ],
};
