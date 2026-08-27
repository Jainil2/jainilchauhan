import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "dijkstra",
  title: "Dijkstra Pathfinder",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Shortest path on a weighted grid.",
  caption:
    "Click cells to drop walls. Run Dijkstra and watch the visited frontier expand before the shortest path lights up.",
  skillTags: ["DSA"],
  concept:
    "Dijkstra's algorithm finds the shortest path from a source to every other node in a graph with non-negative edge weights. It maintains a priority queue of (distance, node) and repeatedly pops the closest unvisited node, relaxing edges to its neighbors.\n\nWith a binary-heap priority queue: O((V + E) log V). With a Fibonacci heap: O(E + V log V), but constants make binary heaps faster in practice.\n\nFor maps and games where you have a heuristic (e.g. Euclidean distance to the goal), A* — Dijkstra plus an admissible heuristic — explores far fewer nodes. For negative edges, use Bellman-Ford. For all-pairs, use Floyd-Warshall.",
  complexity: [{ operation: "Single-source", time: "O((V + E) log V)", space: "O(V)" }],
  codeSnippet: {
    language: "ts",
    code: `function dijkstra(graph: Map<string, [string, number][]>, src: string) {
  const dist = new Map<string, number>();
  for (const v of graph.keys()) dist.set(v, Infinity);
  dist.set(src, 0);
  const pq: [number, string][] = [[0, src]]; // (dist, node)
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;
    if (d > dist.get(u)!) continue;
    for (const [v, w] of graph.get(u) ?? []) {
      if (d + w < dist.get(v)!) {
        dist.set(v, d + w);
        pq.push([d + w, v]);
      }
    }
  }
  return dist;
}`,
  },
  realWorld: [
    "Google Maps / OSRM — variants of Dijkstra (often A* with contraction hierarchies) for routing.",
    "OSPF / IS-IS — link-state routing protocols run Dijkstra over the network topology.",
    "Game pathfinding (often A* with grid heuristic).",
  ],
  pitfalls: [
    "Negative edge weights break it — use Bellman-Ford instead.",
    "Re-using a stale (distance, node) entry in the priority queue is the classic off-by-one bug — check if popped distance matches current best.",
  ],
  usedBy: [
    {
      company: "Google",
      product: "Maps routing",
      usage:
        "Production routing starts from Dijkstra/A* over the road graph and layers contraction hierarchies for continent-scale queries.",
      href: "https://research.google/pubs/pub41336/",
    },
    {
      company: "Uber",
      product: "ETA & dispatch routing",
      usage:
        "Shortest-path search over a live, traffic-weighted road graph drives both ETA and driver assignment.",
      href: "https://www.uber.com/blog/engineering/",
    },
    {
      company: "Internet Engineering Task Force",
      product: "OSPF link-state routing",
      usage:
        "Every OSPF router runs Dijkstra over the flooded link-state database to build its forwarding table.",
      href: "https://datatracker.ietf.org/doc/html/rfc2328",
    },
  ],
  references: [
    {
      label: "RFC 2328 — OSPF v2 (SPF calculation)",
      href: "https://datatracker.ietf.org/doc/html/rfc2328",
    },
    {
      label: "CP-Algorithms — Dijkstra with priority queue",
      href: "https://cp-algorithms.com/graph/dijkstra_sparse.html",
    },
  ],
};
