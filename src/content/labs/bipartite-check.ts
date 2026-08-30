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
  bridgesFrom: [
    {
      slug: "graph-traversal",
      sameness:
        "It IS BFS or DFS with one extra field per vertex. Traverse as usual, and colour each newly discovered vertex the opposite of the one you came from.",
      delta:
        "The test is a single check on every edge you touch: if a neighbour is already coloured the same as the current vertex, the graph is not bipartite. That turns an abstract property into a linear-time traversal, and it proves something concrete — a failure means an odd-length cycle exists, and the traversal tree tells you where. Disconnected graphs need the same outer loop as components, since each island is coloured independently.",
    },
  ],
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
  challenge: {
    prompt:
      "Decide whether an undirected graph can be two-coloured so no edge joins two nodes of the same colour. Equivalent to having no odd-length cycle, and it is the precondition every bipartite matching algorithm assumes.",
    entry: "isBipartite",
    starter: `/**
 * @param {number} n - nodes 0..n-1.
 * @param {Array<[number, number]>} edges - undirected.
 * @returns {boolean}
 */
function isBipartite(n, edges) {
  // Colour as you traverse. A neighbour that already has YOUR colour is the
  // contradiction. Remember the graph may be disconnected.
}
`,
    tests: [
      {
        name: "a single edge is bipartite",
        body: `assertEquals(solution(2, [[0, 1]]), true);`,
      },
      {
        name: "an even cycle is bipartite",
        body: `assertEquals(solution(4, [[0, 1], [1, 2], [2, 3], [3, 0]]), true);`,
      },
      {
        name: "an odd cycle is not",
        body: `assertEquals(solution(3, [[0, 1], [1, 2], [2, 0]]), false);`,
      },
      {
        name: "no edges is bipartite",
        body: `assertEquals(solution(3, []), true);`,
      },
      {
        name: "a self loop breaks it",
        body: `assertEquals(solution(1, [[0, 0]]), false);`,
      },
      {
        name: "checks every component",
        body: `assertEquals(solution(5, [[0, 1], [2, 3], [3, 4], [4, 2]]), false);`,
      },
      {
        name: "a long even cycle stays bipartite",
        body: `var edges = [];
var n = 50000;
for (var i = 0; i < n - 1; i++) edges.push([i, i + 1]);
edges.push([n - 1, 0]);
assertEquals(solution(n, edges), true);`,
      },
    ],
    hints: [
      "Track colours in an array using -1 for uncoloured, then 0 and 1.",
      "Start a fresh traversal from every uncoloured node so disconnected parts are covered.",
      "Give each neighbour the opposite colour; if it already holds the same colour as the current node, fail.",
    ],
    reference: `function isBipartite(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  const colour = new Array(n).fill(-1);
  for (let start = 0; start < n; start++) {
    if (colour[start] !== -1) continue;
    colour[start] = 0;
    const queue = [start];
    for (let head = 0; head < queue.length; head++) {
      const node = queue[head];
      for (const next of adj[node]) {
        // A self loop lands here with next === node, which always clashes.
        if (colour[next] === colour[node]) return false;
        if (colour[next] !== -1) continue;
        colour[next] = 1 - colour[node];
        queue.push(next);
      }
    }
  }
  return true;
}
`,
  },
};
