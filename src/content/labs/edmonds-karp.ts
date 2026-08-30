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
  bridgesFrom: [
    {
      slug: "max-flow",
      sameness:
        "It IS the max-flow loop you already ran: find an augmenting path in the residual graph, push the bottleneck along it, repeat until no path remains. Nothing about the flow, the residuals or the termination changes.",
      delta:
        "It fixes the choice of path, always taking a shortest one by BFS. That single rule replaces a bound that depends on the capacity values with O(V E squared), which depends only on the graph's size — the difference between an algorithm that can crawl on a graph with large capacities and one whose runtime you can predict from the vertex and edge counts alone.",
    },
  ],
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
  challenge: {
    prompt:
      "Report the bottleneck of each augmenting path Edmonds-Karp uses, in order. Choosing the SHORTEST augmenting path each round, via BFS, is what bounds the algorithm at O(V*E squared) instead of depending on the capacity values.",
    entry: "augmentingPaths",
    starter: `/**
 * BFS must scan neighbours in ascending index order so the result is deterministic.
 *
 * @param {number[][]} capacity - capacity[u][v].
 * @param {number} source
 * @param {number} sink
 * @returns {number[]} the bottleneck pushed on each augmenting path, in order.
 */
function augmentingPaths(capacity, source, sink) {
  // One entry per BFS round. Stop when BFS can no longer reach the sink.
}
`,
    tests: [
      {
        name: "a single pipe takes one round",
        body: `assertEquals(solution([[0, 5], [0, 0]], 0, 1), [5]);`,
      },
      {
        name: "the bottleneck is the narrowest link",
        body: `assertEquals(solution([[0, 5, 0], [0, 0, 3], [0, 0, 0]], 0, 2), [3]);`,
      },
      {
        name: "two disjoint routes take two rounds",
        body: `var c = [[0, 3, 3, 0], [0, 0, 0, 3], [0, 0, 0, 3], [0, 0, 0, 0]];
assertEquals(solution(c, 0, 3), [3, 3]);`,
      },
      {
        name: "no path means no rounds",
        body: `assertEquals(solution([[0, 0], [0, 0]], 0, 1), []);`,
      },
      {
        name: "shortest paths are chosen first",
        body: `// 0->3 direct (1 edge, cap 5), and 0->1->2->3 (3 edges, cap 2).
// BFS must take the direct route first, so the order is [5, 2] and not [2, 5].
var c = [
  [0, 2, 0, 5],
  [0, 0, 2, 0],
  [0, 0, 0, 2],
  [0, 0, 0, 0],
];
assertEquals(solution(c, 0, 3), [5, 2]);`,
      },
      {
        name: "the bottlenecks sum to the maximum flow",
        body: `var c = [[0, 3, 3, 0, 0], [0, 0, 1, 3, 0], [0, 0, 0, 0, 3], [0, 0, 0, 0, 4], [0, 0, 0, 0, 0]];
var paths = solution(c, 0, 4);
var total = 0;
for (var i = 0; i < paths.length; i++) total += paths[i];
assertEquals(total, 6);`,
      },
      {
        name: "every bottleneck is positive",
        body: `var c = [[0, 4, 2, 0], [0, 0, 1, 3], [0, 0, 0, 4], [0, 0, 0, 0]];
var paths = solution(c, 0, 3);
for (var i = 0; i < paths.length; i++) assert(paths[i] > 0, 'zero bottleneck recorded');`,
      },
    ],
    hints: [
      "This is max flow, but recording the bottleneck of each round instead of only the total.",
      "Scanning v from 0 upwards inside the BFS keeps the path choice deterministic.",
      "BFS guarantees the fewest-edges path, which is the only difference between this and generic Ford-Fulkerson.",
    ],
    reference: `function augmentingPaths(capacity, source, sink) {
  // With source === sink, BFS reaches the sink instantly and the bottleneck
  // loop never runs, so the outer loop would spin forever.
  if (source === sink) return [];
  const n = capacity.length;
  const residual = capacity.map((row) => row.slice());
  const out = [];

  for (;;) {
    const parent = new Array(n).fill(-1);
    parent[source] = source;
    const queue = [source];
    for (let head = 0; head < queue.length && parent[sink] === -1; head++) {
      const u = queue[head];
      // Ascending v keeps the chosen path deterministic.
      for (let v = 0; v < n; v++) {
        if (parent[v] !== -1 || residual[u][v] <= 0) continue;
        parent[v] = u;
        queue.push(v);
      }
    }
    if (parent[sink] === -1) return out;

    let bottleneck = Infinity;
    for (let v = sink; v !== source; v = parent[v]) {
      bottleneck = Math.min(bottleneck, residual[parent[v]][v]);
    }
    for (let v = sink; v !== source; v = parent[v]) {
      residual[parent[v]][v] -= bottleneck;
      residual[v][parent[v]] += bottleneck;
    }
    out.push(bottleneck);
  }
}
`,
  },
};
