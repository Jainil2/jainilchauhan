import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "floyd-warshall",
  title: "Floyd-Warshall",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "All-pairs shortest paths with dynamic programming.",
  caption:
    "Allow each intermediate node and update the distance matrix. Floyd-Warshall is compact and powerful for dense graphs.",
  skillTags: ["DSA", "Graphs", "Dynamic Programming"],
  concept:
    "Floyd-Warshall computes shortest paths between every pair of vertices. It uses dynamic programming over allowed intermediate nodes: when node k becomes available, every pair i,j checks whether going through k improves its distance.\n\nThe algorithm is simple and handles negative edges, but not negative cycles. Its O(V^3) runtime makes it best for small or dense graphs where all-pairs answers are needed.",
  complexity: [
    { operation: "All-pairs shortest paths", time: "O(V^3)", space: "O(V^2)" },
    { operation: "Path reconstruction", time: "O(path length)", space: "O(V^2)" },
  ],
  realWorld: [
    "Small network routing tables, game maps, transitive closure, and dependency distance analysis.",
  ],
  pitfalls: [
    "Too expensive for large sparse graphs.",
    "Negative cycles require separate detection.",
    "Path reconstruction needs a next-hop matrix, not just distances.",
  ],
  codeSnippet: {
    language: "py",
    code: `# All-pairs shortest paths in O(V^3) — dense graphs, small V.
def floyd_warshall(dist):
    n = len(dist)
    for k in range(n):              # allow k as an intermediate hop
        dk = dist[k]
        for i in range(n):
            dik = dist[i][k]
            if dik == float("inf"):
                continue
            row = dist[i]
            for j in range(n):
                if dik + dk[j] < row[j]:
                    row[j] = dik + dk[j]
    for i in range(n):
        if dist[i][i] < 0:
            raise ValueError("negative cycle")
    return dist`,
  },
  usedBy: [
    {
      company: "Uber",
      product: "Zone-to-zone travel-time matrices",
      usage:
        "Small aggregated region graphs are precomputed all-pairs so pricing and ETA services do table lookups, not searches.",
    },
    {
      company: "Amazon",
      product: "Warehouse network transfer costs",
      usage:
        "Inter-facility cost matrices are dense and modest in size — the exact case Floyd-Warshall wins.",
    },
    {
      company: "Google",
      product: "Transitive closure in static analysis",
      usage:
        "Reachability closure over dependency/type graphs is the boolean variant of the same triple loop.",
      href: "https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — Floyd-Warshall",
      href: "https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html",
    },
    {
      label: "Floyd (1962) — Algorithm 97: Shortest path",
      href: "https://dl.acm.org/doi/10.1145/367766.368168",
    },
  ],
  challenge: {
    prompt:
      "Compute shortest distances between every pair of nodes. The loop order is the whole algorithm: the intermediate node k must be the outermost loop, because the invariant is 'best path using only nodes up to k'.",
    entry: "allPairs",
    starter: `/**
 * @param {number} n - nodes 0..n-1.
 * @param {Array<[number, number, number]>} edges - [u, v, weight], directed.
 * @returns {(number|null)[][]} matrix of distances; null where no path exists.
 *   Distance from a node to itself is 0.
 */
function allPairs(n, edges) {
  // k must be the OUTER loop. Putting i or j outside computes something that
  // looks similar and is wrong.
}
`,
    tests: [
      {
        name: "direct edges",
        body: `assertEquals(solution(2, [[0, 1, 5]]), [[0, 5], [null, 0]]);`,
      },
      {
        name: "routes through an intermediate node",
        body: `assertEquals(solution(3, [[0, 1, 1], [1, 2, 1]])[0][2], 2);`,
      },
      {
        name: "prefers the cheaper of two routes",
        body: `assertEquals(solution(3, [[0, 2, 10], [0, 1, 1], [1, 2, 1]])[0][2], 2);`,
      },
      {
        name: "self distance is zero",
        body: `assertEquals(solution(2, [])[1][1], 0);`,
      },
      {
        name: "unreachable pairs are null",
        body: `assertEquals(solution(2, [])[0][1], null);`,
      },
      {
        name: "handles negative edges without a negative cycle",
        body: `assertEquals(solution(3, [[0, 1, 4], [1, 2, -2]])[0][2], 2);`,
      },
      {
        name: "parallel edges take the cheapest",
        body: `assertEquals(solution(2, [[0, 1, 9], [0, 1, 3]])[0][1], 3);`,
      },
      {
        name: "cubic but correct on a modest graph",
        body: `var n = 60;
var edges = [];
for (var i = 0; i < n - 1; i++) edges.push([i, i + 1, 1]);
assertEquals(solution(n, edges)[0][n - 1], n - 1);`,
      },
    ],
    hints: [
      "Start from a matrix of Infinity, zero on the diagonal, then lay in the edges taking the minimum for parallel ones.",
      "Three nested loops with k outermost, then i, then j.",
      "Skip the update when either half of the route is still Infinity.",
    ],
    reference: `function allPairs(n, edges) {
  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)),
  );
  for (const [u, v, w] of edges) dist[u][v] = Math.min(dist[u][v], w);

  // k outermost: the invariant is 'shortest path using intermediates < k'.
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      if (dist[i][k] === Infinity) continue; // nothing to route through
      for (let j = 0; j < n; j++) {
        const through = dist[i][k] + dist[k][j];
        if (through < dist[i][j]) dist[i][j] = through;
      }
    }
  }
  return dist.map((row) => row.map((d) => (d === Infinity ? null : d)));
}
`,
  },
};
