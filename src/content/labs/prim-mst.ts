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
  challenge: {
    prompt:
      "Compute the total weight of a minimum spanning tree by growing one tree outward, always taking the cheapest edge that reaches somewhere new. Prim is Dijkstra with a different comparison: edge weight instead of accumulated distance.",
    entry: "mstWeight",
    starter: `/**
 * @param {number} n - nodes 0..n-1.
 * @param {Array<[number, number, number]>} edges - [u, v, weight], undirected.
 * @returns {number|null} total MST weight, or null when the graph is disconnected.
 */
function mstWeight(n, edges) {
  // Grow ONE tree. At every step take the cheapest edge with exactly one
  // endpoint already inside it.
}
`,
    tests: [
      {
        name: "a triangle drops its most expensive edge",
        body: `assertEquals(solution(3, [[0, 1, 1], [1, 2, 2], [0, 2, 5]]), 3);`,
      },
      {
        name: "a chain keeps every edge",
        body: `assertEquals(solution(3, [[0, 1, 4], [1, 2, 6]]), 10);`,
      },
      {
        name: "a disconnected graph has no spanning tree",
        body: `assertEquals(solution(3, [[0, 1, 1]]), null);`,
      },
      {
        name: "a single node weighs nothing",
        body: `assertEquals(solution(1, []), 0);`,
      },
      {
        name: "parallel edges take the cheaper",
        body: `assertEquals(solution(2, [[0, 1, 7], [0, 1, 2]]), 2);`,
      },
      {
        name: "ignores a self loop",
        body: `assertEquals(solution(2, [[0, 0, 9], [0, 1, 3]]), 3);`,
      },
      {
        name: "handles a larger graph",
        body: `var edges = [];
for (var i = 0; i < 20000; i++) edges.push([i, i + 1, 2]);
assertEquals(solution(20001, edges), 40000);`,
      },
    ],
    hints: [
      "Track the cheapest known edge reaching each node that is not yet in the tree.",
      "A min-heap of [weight, node] gives the next node to absorb; skip entries for nodes already absorbed.",
      "If you absorb fewer than n nodes, the graph was disconnected.",
    ],
    reference: `function mstWeight(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) {
    if (u === v) continue; // a self loop can never join two components
    adj[u].push([v, w]);
    adj[v].push([u, w]);
  }

  const inTree = new Array(n).fill(false);
  const heap = [[0, 0]]; // [weight, node]
  const up = (i) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let small = i;
        if (l < heap.length && heap[l][0] < heap[small][0]) small = l;
        if (r < heap.length && heap[r][0] < heap[small][0]) small = r;
        if (small === i) break;
        [heap[small], heap[i]] = [heap[i], heap[small]];
        i = small;
      }
    }
    return top;
  };

  let total = 0;
  let absorbed = 0;
  while (heap.length) {
    const [w, node] = pop();
    if (inTree[node]) continue; // stale entry
    inTree[node] = true;
    total += w;
    absorbed++;
    for (const [next, weight] of adj[node]) {
      if (!inTree[next]) {
        heap.push([weight, next]);
        up(heap.length - 1);
      }
    }
  }
  return absorbed === n ? total : null;
}
`,
  },
};
