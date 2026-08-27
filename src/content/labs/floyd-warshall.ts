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
};
