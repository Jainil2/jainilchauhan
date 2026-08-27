import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "edmonds-karp",
  title: "Edmonds-Karp",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Max flow using BFS shortest augmenting paths.",
  caption:
    "Run BFS augmentations and track bottlenecks. Edmonds-Karp is slower than modern flow algorithms but easier to reason about.",
  skillTags: ["DSA", "Graphs", "Optimization"],
  concept:
    "Edmonds-Karp is the Ford-Fulkerson method with one rule: choose augmenting paths using BFS in the residual graph. That shortest-path rule gives a polynomial O(VE^2) bound and avoids pathological path choices.\n\nIt is a practical teaching algorithm for residual graphs, bottlenecks, and flow conservation before moving to Dinic or Push-Relabel.",
  complexity: [
    { operation: "Max flow", time: "O(VE^2)", space: "O(V + E)" },
    { operation: "One BFS augmentation", time: "O(E)", space: "O(V)" },
  ],
  realWorld: [
    "Teaching max flow, small assignment systems, and correctness baselines for optimized solvers.",
  ],
  pitfalls: [
    "Too slow for very large flow networks.",
    "Must update reverse edges after every augmentation.",
    "BFS is over residual capacity, not original capacity.",
  ],
  codeSnippet: {
    language: "py",
    code: `from collections import deque

# Ford-Fulkerson with BFS augmenting paths => O(V * E^2), no bad orderings.
def edmonds_karp(cap, s, t):
    flow = 0
    while True:
        parent = {s: None}
        q = deque([s])
        while q and t not in parent:
            u = q.popleft()
            for v, c in cap[u].items():
                if c > 0 and v not in parent:
                    parent[v] = u
                    q.append(v)
        if t not in parent:
            return flow                     # no augmenting path left
        bottleneck, v = float("inf"), t
        while parent[v] is not None:
            u = parent[v]; bottleneck = min(bottleneck, cap[u][v]); v = u
        v = t
        while parent[v] is not None:
            u = parent[v]
            cap[u][v] -= bottleneck
            cap[v][u] = cap[v].get(u, 0) + bottleneck
            v = u
        flow += bottleneck`,
  },
  usedBy: [
    {
      company: "Kubernetes / CNCF",
      product: "Bin-packing & scheduling research",
      usage:
        "Flow formulations (e.g. Firmament-style schedulers) assign tasks to machines by solving min-cost flow.",
      href: "https://www.usenix.org/conference/osdi16/technical-sessions/presentation/gog",
    },
    {
      company: "Netflix",
      product: "Content delivery capacity planning",
      usage:
        "Deciding which Open Connect appliance serves which ISP under link capacity is a flow assignment.",
      href: "https://openconnect.netflix.com/en/",
    },
    {
      company: "Sports leagues (MLB, NFL)",
      product: "Playoff elimination proofs",
      usage:
        "The classic baseball-elimination problem is decided by a max-flow computation over remaining games.",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — Edmonds-Karp",
      href: "https://cp-algorithms.com/graph/edmonds_karp.html",
    },
    {
      label: "Firmament — fast, centralized cluster scheduling (OSDI '16)",
      href: "https://www.usenix.org/conference/osdi16/technical-sessions/presentation/gog",
    },
  ],
};
