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
  challenge: {
    prompt:
      "Group the nodes of an undirected graph into connected components. Return each component as a sorted list, the components themselves ordered by their smallest member, so the answer is canonical rather than dependent on traversal order.",
    entry: "components",
    starter: `/**
 * @param {number} n - nodes 0..n-1.
 * @param {Array<[number, number]>} edges - undirected.
 * @returns {number[][]} components, each ascending, ordered by first element.
 */
function components(n, edges) {
  // Every node belongs to exactly one component, including isolated ones.
}
`,
    tests: [
      {
        name: "one component",
        body: `assertEquals(solution(3, [[0, 1], [1, 2]]), [[0, 1, 2]]);`,
      },
      {
        name: "two components",
        body: `assertEquals(solution(4, [[0, 1], [2, 3]]), [[0, 1], [2, 3]]);`,
      },
      {
        name: "isolated nodes are their own components",
        body: `assertEquals(solution(3, [[0, 1]]), [[0, 1], [2]]);`,
      },
      {
        name: "no edges",
        body: `assertEquals(solution(3, []), [[0], [1], [2]]);`,
      },
      {
        name: "no nodes",
        body: `assertEquals(solution(0, []), []);`,
      },
      {
        name: "a cycle is still one component",
        body: `assertEquals(solution(3, [[0, 1], [1, 2], [2, 0]]), [[0, 1, 2]]);`,
      },
      {
        name: "output order does not depend on edge order",
        body: `assertEquals(solution(4, [[2, 3], [0, 1]]), [[0, 1], [2, 3]]);`,
      },
      {
        name: "handles a long chain",
        body: `var edges = [];
for (var i = 0; i < 50000; i++) edges.push([i, i + 1]);
var cs = solution(50001, edges);
assertEquals(cs.length, 1);
assertEquals(cs[0].length, 50001);`,
      },
    ],
    hints: [
      "Build an adjacency list first, then sweep every node that has not been assigned yet.",
      "From each unseen node, collect everything reachable with an iterative BFS or DFS.",
      "Sorting each component and starting the sweep at node 0 upwards makes the output canonical without a final sort.",
    ],
    reference: `function components(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  const seen = new Array(n).fill(false);
  const out = [];
  // Sweeping 0..n-1 means components come out ordered by smallest member.
  for (let start = 0; start < n; start++) {
    if (seen[start]) continue;
    const group = [];
    const stack = [start];
    seen[start] = true;
    while (stack.length) {
      const node = stack.pop();
      group.push(node);
      for (const next of adj[node]) {
        if (seen[next]) continue;
        seen[next] = true;
        stack.push(next);
      }
    }
    out.push(group.sort((a, b) => a - b));
  }
  return out;
}
`,
  },
};
