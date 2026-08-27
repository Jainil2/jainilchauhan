import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "bipartite-check",
  title: "Bipartite Check",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Determine whether a graph can be colored with two sets.",
  caption:
    "Toggle a conflict and see two-coloring fail. A graph is bipartite when every edge connects opposite colors.",
  skillTags: ["DSA", "Graphs"],
  concept:
    "A graph is bipartite if its vertices can be split into two sets such that every edge connects nodes from different sets. BFS or DFS can test this by assigning alternating colors. If an edge ever connects nodes with the same color, the graph is not bipartite.\n\nBipartite graphs are exactly graphs with no odd-length cycles. They are the structure behind matching problems, assignment systems, recommendations, and constraint checks.",
  complexity: [{ operation: "Two-color check", time: "O(V + E)", space: "O(V)" }],
  realWorld: [
    "Job-to-worker matching, user-item recommendation graphs, conflict constraints, and scheduling.",
  ],
  pitfalls: [
    "Disconnected graphs require starting BFS from every uncolored node.",
    "Self-loops immediately violate bipartiteness.",
    "Odd cycles are the reason two-coloring fails.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Two-colour the graph; a conflict proves an odd cycle exists.
function isBipartite(adj: Map<string, string[]>): boolean {
  const side = new Map<string, 0 | 1>();
  for (const start of adj.keys()) {
    if (side.has(start)) continue;
    side.set(start, 0);
    const q = [start];
    while (q.length) {
      const v = q.shift()!;
      for (const n of adj.get(v) ?? []) {
        if (!side.has(n)) { side.set(n, side.get(v)! === 0 ? 1 : 0); q.push(n); }
        else if (side.get(n) === side.get(v)) return false; // same side -> odd cycle
      }
    }
  }
  return true;
}`,
  },
  usedBy: [
    {
      company: "Uber",
      product: "Rider ↔ driver matching graph",
      usage:
        "Supply and demand are two disjoint sides; feasible pairings are edges, and dispatch is a matching over that bipartite graph.",
      href: "https://www.uber.com/blog/engineering/",
    },
    {
      company: "Amazon",
      product: "Order ↔ fulfilment centre assignment",
      usage:
        "Shipments and warehouses form a bipartite graph where edges encode cost and availability.",
    },
    {
      company: "Google",
      product: "Ad impression ↔ advertiser allocation",
      usage:
        "Online bipartite matching underpins allocating incoming impressions to budgeted advertisers.",
      href: "https://research.google/pubs/pub37409/",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — Bipartite graph check",
      href: "https://cp-algorithms.com/graph/bipartite-check.html",
    },
    {
      label: "Google Research — AdWords and generalized online matching",
      href: "https://research.google/pubs/pub37409/",
    },
  ],
};
