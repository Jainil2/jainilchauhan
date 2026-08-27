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
};
