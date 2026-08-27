import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "graph-representations",
  title: "Graph Representations",
  category: "Algorithms",
  difficulty: "Beginner",
  readingTimeMin: 4,
  blurb: "Adjacency lists vs matrices for storing relationships.",
  caption:
    "Switch between adjacency list and matrix views. Sparse graphs favor lists; dense graphs and O(1) edge checks can favor matrices.",
  skillTags: ["DSA", "Graphs"],
  concept:
    "A graph models entities as vertices and relationships as edges. The representation determines memory use and operation cost. An adjacency list stores neighbors per vertex, using O(V + E) space and working well for sparse graphs. An adjacency matrix stores every possible pair, using O(V^2) space but giving O(1) edge-existence checks.\n\nDirected graphs store edge direction; weighted graphs attach costs; multigraphs allow repeated edges. Choosing the representation is often the first performance decision in a graph problem.",
  complexity: [
    { operation: "Adjacency list space", time: "—", space: "O(V + E)" },
    { operation: "Adjacency matrix space", time: "—", space: "O(V^2)" },
    { operation: "Matrix edge check", time: "O(1)", space: "O(1)" },
  ],
  realWorld: [
    "Social graphs, dependency graphs, route maps, knowledge graphs, and network topologies.",
  ],
  pitfalls: [
    "A matrix is wasteful for sparse graphs.",
    "A list makes edge-existence checks O(degree) unless indexed.",
    "Directed vs undirected edge insertion must be explicit.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Adjacency list: O(V + E) memory, iterate neighbours fast.
const list = new Map<string, string[]>([
  ["api", ["auth", "db"]],
  ["auth", ["db"]],
  ["db", []],
]);
for (const dep of list.get("api") ?? []) console.log(dep);

// Adjacency matrix: O(V^2) memory, O(1) "is there an edge?"
const nodes = ["api", "auth", "db"];
const idx = new Map(nodes.map((n, i) => [n, i]));
const matrix = nodes.map(() => new Uint8Array(nodes.length));
matrix[idx.get("api")!][idx.get("db")!] = 1;
const connected = matrix[idx.get("api")!][idx.get("db")!] === 1;`,
  },
  usedBy: [
    {
      company: "Meta",
      product: "TAO social graph",
      usage:
        "Friend and interest edges are stored as adjacency lists behind a cache tier because the social graph is extremely sparse.",
      href: "https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/",
    },
    {
      company: "Google",
      product: "Web link graph / PageRank",
      usage:
        "Billions of pages with a handful of outlinks each are only tractable as sparse adjacency, never as a matrix.",
      href: "http://infolab.stanford.edu/~backrub/google.html",
    },
    {
      company: "Neo4j",
      product: "Native graph storage",
      usage:
        'Records store direct pointers to relationship chains ("index-free adjacency") so traversal cost is independent of total graph size.',
      href: "https://neo4j.com/docs/getting-started/get-started-with-neo4j/graph-database/",
    },
  ],
  references: [
    {
      label: "Meta Engineering — TAO: the power of the graph",
      href: "https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/",
    },
    {
      label: "Neo4j — index-free adjacency",
      href: "https://neo4j.com/docs/getting-started/get-started-with-neo4j/graph-database/",
    },
  ],
  challenge: {
    prompt:
      "Turn an edge list into an adjacency list. The representation you choose decides what is cheap: adjacency lists make 'who are my neighbours' O(degree), which is what every traversal actually asks.",
    entry: "toAdjacency",
    starter: `/**
 * @param {number} n - nodes 0..n-1.
 * @param {Array<[number, number]>} edges
 * @param {boolean} directed - when false, record each edge in both directions.
 * @returns {number[][]} neighbours per node, each ascending.
 */
function toAdjacency(n, edges, directed) {
  // Every node gets a list, including isolated ones.
}
`,
    tests: [
      {
        name: "directed edges go one way",
        body: `assertEquals(solution(3, [[0, 1]], true), [[1], [], []]);`,
      },
      {
        name: "undirected edges go both ways",
        body: `assertEquals(solution(3, [[0, 1]], false), [[1], [0], []]);`,
      },
      {
        name: "neighbours come back ascending",
        body: `assertEquals(solution(4, [[0, 3], [0, 1]], true), [[1, 3], [], [], []]);`,
      },
      {
        name: "isolated nodes still get a list",
        body: `assertEquals(solution(2, [], false), [[], []]);`,
      },
      {
        name: "self loop on an undirected graph",
        body: `assertEquals(solution(2, [[0, 0]], false), [[0, 0], []]);`,
      },
      {
        name: "handles a dense-ish graph",
        body: `var edges = [];
for (var i = 0; i < 999; i++) edges.push([i, i + 1]);
var adj = solution(1000, edges, false);
assertEquals(adj[0], [1]);
assertEquals(adj[500], [499, 501]);`,
      },
    ],
    hints: [
      "Create n empty arrays up front so isolated nodes are represented, not missing.",
      "For an undirected edge push u into v's list as well as v into u's.",
      "Sort each list at the end rather than trying to insert in order.",
    ],
    reference: `function toAdjacency(n, edges, directed) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    // An undirected edge is simply two directed ones.
    if (!directed) adj[v].push(u);
  }
  for (const list of adj) list.sort((a, b) => a - b);
  return adj;
}
`,
  },
};
