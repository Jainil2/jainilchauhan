import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "bellman-ford",
  title: "Bellman-Ford",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Shortest paths with negative edges and cycle detection.",
  caption:
    "Relax every edge pass by pass. Unlike Dijkstra, Bellman-Ford can handle negative weights and detect reachable negative cycles.",
  skillTags: ["DSA", "Graphs"],
  bridgesFrom: [
    {
      slug: "dijkstra",
      sameness:
        "The inner step IS Dijkstra's relaxation, unchanged: if the distance to u plus the weight of edge u-v beats the distance to v, improve v. Same test, same update, same array of tentative distances.",
      delta:
        "What is dropped is the greedy order. Instead of trusting a priority queue to hand you vertices in a safe sequence, it relaxes every edge V-1 times, which costs O(VE) but never assumes a finalised distance can only stay put. That assumption was the thing negative edges broke, so the slower algorithm is the one that survives them — and a V-th pass that still improves something is a proof of a negative cycle, a condition Dijkstra cannot even detect, let alone report.",
    },
  ],
  concept:
    "Bellman-Ford computes shortest paths from one source by repeatedly relaxing every edge. After at most V-1 passes, every shortest path without cycles has been discovered. A final pass that can still improve a distance proves a reachable negative-weight cycle.\n\nIt is slower than Dijkstra but more general because edge weights may be negative. This matters in systems that model credits, arbitrage, penalties, or constraint differences.",
  complexity: [
    { operation: "Shortest paths", time: "O(VE)", space: "O(V)" },
    { operation: "Negative-cycle check", time: "O(E)", space: "O(1)" },
  ],
  realWorld: [
    "Currency arbitrage, routing with penalties, constraint systems, and graph sanity checks.",
  ],
  pitfalls: [
    "Negative cycles make shortest paths undefined.",
    "It is usually too slow for very large sparse graphs when weights are non-negative.",
    "Only cycles reachable from the source are detected in the standard version.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Handles negative weights and reports negative cycles. O(V*E).
type Edge = { from: number; to: number; w: number };

function bellmanFord(n: number, edges: Edge[], src: number) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let i = 0; i < n - 1; i++) {
    let changed = false;
    for (const e of edges) {
      if (dist[e.from] + e.w < dist[e.to]) { dist[e.to] = dist[e.from] + e.w; changed = true; }
    }
    if (!changed) break; // early exit when distances settle
  }
  for (const e of edges) {
    if (dist[e.from] + e.w < dist[e.to]) throw new Error("negative cycle reachable");
  }
  return dist;
}`,
  },
  usedBy: [
    {
      company: "Cisco",
      product: "RIP distance-vector routing",
      usage:
        "Routers exchange distance vectors and relax neighbour estimates — Bellman-Ford executed by the network itself.",
      href: "https://datatracker.ietf.org/doc/html/rfc2453",
    },
    {
      company: "Internet Engineering Task Force",
      product: "BGP path selection (path-vector)",
      usage:
        "BGP is a path-vector descendant of distance-vector routing, carrying AS paths to avoid the count-to-infinity loop problem.",
      href: "https://datatracker.ietf.org/doc/html/rfc4271",
    },
    {
      company: "Coinbase-style exchanges",
      product: "Currency arbitrage detection",
      usage:
        "Taking -log of exchange rates turns a profitable cycle into a negative cycle Bellman-Ford can flag.",
    },
  ],
  references: [
    {
      label: "RFC 2453 — RIP version 2 (distance vector)",
      href: "https://datatracker.ietf.org/doc/html/rfc2453",
    },
    {
      label: "CP-Algorithms — Bellman-Ford",
      href: "https://cp-algorithms.com/graph/bellman_ford.html",
    },
  ],
  challenge: {
    prompt:
      "Compute shortest distances when edges may be negative, and report when no answer exists. Relax every edge n-1 times; if an nth pass still improves something, a negative cycle is draining the path and there is no shortest distance at all.",
    entry: "bellmanFord",
    starter: `/**
 * @param {number} n - nodes 0..n-1.
 * @param {Array<[number, number, number]>} edges - [u, v, weight], directed.
 * @param {number} source
 * @returns {(number|null)[]|null} distances (null per unreachable node), or null
 *   overall when a negative cycle is reachable from the source.
 */
function bellmanFord(n, edges, source) {
  // n-1 rounds is enough for any real shortest path, because one cannot contain
  // more than n-1 edges. An improvement after that means a negative cycle.
}
`,
    tests: [
      {
        name: "handles positive weights",
        body: `assertEquals(solution(3, [[0, 1, 1], [1, 2, 2]], 0), [0, 1, 3]);`,
      },
      {
        name: "handles a negative edge",
        body: `assertEquals(solution(3, [[0, 1, 4], [0, 2, 5], [2, 1, -3]], 0), [0, 2, 5]);`,
      },
      {
        name: "detects a negative cycle",
        body: `assertEquals(solution(3, [[0, 1, 1], [1, 2, -1], [2, 1, -1]], 0), null);`,
      },
      {
        name: "unreachable nodes are null",
        body: `assertEquals(solution(3, [[0, 1, 1]], 0), [0, 1, null]);`,
      },
      {
        name: "an unreachable negative cycle is not an error",
        body: `assertEquals(solution(4, [[0, 1, 1], [2, 3, -1], [3, 2, -1]], 0), [0, 1, null, null]);`,
      },
      {
        name: "the source starts at zero",
        body: `assertEquals(solution(2, [], 0), [0, null]);`,
      },
      {
        name: "handles a chain needing many rounds",
        body: `var edges = [];
for (var i = 0; i < 300; i++) edges.push([i, i + 1, 1]);
var d = solution(301, edges, 0);
assertEquals(d[300], 300);`,
      },
    ],
    hints: [
      "Relax every edge in each of n-1 rounds: if dist[u] + w beats dist[v], take it.",
      "Never relax from a node still at Infinity, or the arithmetic produces nonsense.",
      "Do one extra round afterwards. Any further improvement proves a reachable negative cycle.",
    ],
    reference: `function bellmanFord(n, edges, source) {
  const dist = new Array(n).fill(Infinity);
  dist[source] = 0;

  for (let round = 0; round < n - 1; round++) {
    let changed = false;
    for (const [u, v, w] of edges) {
      // Relaxing from an unreachable node would invent a distance.
      if (dist[u] === Infinity) continue;
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
      }
    }
    if (!changed) break; // settled early
  }

  // One more pass: any improvement now can only come from a negative cycle.
  for (const [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) return null;
  }
  return dist.map((d) => (d === Infinity ? null : d));
}
`,
  },
};
