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
  challenge: {
    prompt:
      "Compute shortest distances from a source over non-negative weights. The greedy step only works because weights cannot be negative: once a node is settled, nothing later can improve it.",
    entry: "shortestDistances",
    starter: `/**
 * @param {number} n - nodes 0..n-1.
 * @param {Array<[number, number, number]>} edges - [u, v, weight], directed, weight >= 0.
 * @param {number} source
 * @returns {(number|null)[]} distance per node; null when unreachable.
 */
function shortestDistances(n, edges, source) {
  // Always expand the closest unsettled node. Skip a queue entry whose recorded
  // distance is already worse than the best you know.
}
`,
    tests: [
      {
        name: "follows a chain",
        body: `assertEquals(solution(3, [[0, 1, 1], [1, 2, 2]], 0), [0, 1, 3]);`,
      },
      {
        name: "prefers the cheaper route",
        body: `assertEquals(solution(3, [[0, 1, 10], [0, 2, 1], [2, 1, 1]], 0), [0, 2, 1]);`,
      },
      {
        name: "unreachable nodes are null",
        body: `assertEquals(solution(3, [[0, 1, 1]], 0), [0, 1, null]);`,
      },
      {
        name: "the source is at distance zero",
        body: `assertEquals(solution(2, [], 1), [null, 0]);`,
      },
      {
        name: "zero-weight edges are fine",
        body: `assertEquals(solution(2, [[0, 1, 0]], 0), [0, 0]);`,
      },
      {
        name: "parallel edges take the cheapest",
        body: `assertEquals(solution(2, [[0, 1, 5], [0, 1, 2]], 0), [0, 2]);`,
      },
      {
        name: "handles a long weighted chain",
        body: `var edges = [];
for (var i = 0; i < 50000; i++) edges.push([i, i + 1, 2]);
var d = solution(50001, edges, 0);
assertEquals(d[50000], 100000);`,
      },
    ],
    hints: [
      "Keep tentative distances in an array, starting at Infinity except the source.",
      "A binary heap of [distance, node] gives you the closest unsettled node in log n.",
      "JavaScript heaps have no decrease-key, so push duplicates and ignore any entry whose distance is stale.",
    ],
    reference: `function shortestDistances(n, edges, source) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) adj[u].push([v, w]);

  const dist = new Array(n).fill(Infinity);
  dist[source] = 0;

  const heap = [[0, source]];
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

  while (heap.length) {
    const [d, node] = pop();
    // Stale entry: we already found a better route to this node.
    if (d > dist[node]) continue;
    for (const [next, w] of adj[node]) {
      const candidate = d + w;
      if (candidate < dist[next]) {
        dist[next] = candidate;
        heap.push([candidate, next]);
        up(heap.length - 1);
      }
    }
  }
  return dist.map((d) => (d === Infinity ? null : d));
}
`,
  },
};
