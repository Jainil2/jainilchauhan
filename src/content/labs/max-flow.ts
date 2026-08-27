import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "max-flow",
  title: "Max Flow",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "Push as much flow as possible from source to sink.",
  caption:
    "Augment paths through a small network and watch capacities fill. Residual capacity determines where more flow can still move.",
  skillTags: ["DSA", "Graphs", "Optimization"],
  concept:
    "Max flow asks for the largest amount that can be sent from a source to a sink through capacity-limited edges. Algorithms maintain a residual graph: unused forward capacity and backward edges that allow earlier choices to be revised.\n\nThe abstraction appears anywhere limited resources move through a network: bandwidth, assignments, traffic, supply chains, and matching problems.",
  complexity: [
    {
      operation: "Ford-Fulkerson",
      time: "O(E * maxFlow) for integer capacities",
      space: "O(V + E)",
    },
    { operation: "Residual update", time: "O(path length)", space: "O(E)" },
  ],
  realWorld: [
    "Bandwidth allocation, evacuation planning, supply chains, bipartite matching, and image segmentation.",
  ],
  pitfalls: [
    "Naive path choice can be slow.",
    "Irrational capacities can prevent Ford-Fulkerson termination in theory.",
    "Residual backward edges are essential, not optional.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Residual graph: pushing flow forward creates reverse capacity to undo it.
class FlowNetwork {
  cap = new Map<string, number>();
  key = (u: string, v: string) => \`\${u}->\${v}\`;
  addEdge(u: string, v: string, c: number) {
    this.cap.set(this.key(u, v), c);
    this.cap.set(this.key(v, u), this.cap.get(this.key(v, u)) ?? 0);
  }
  push(u: string, v: string, amount: number) {
    this.cap.set(this.key(u, v), this.cap.get(this.key(u, v))! - amount);
    this.cap.set(this.key(v, u), this.cap.get(this.key(v, u))! + amount); // undo path
  }
}
// Max-flow = repeatedly find an augmenting s->t path with residual capacity.`,
  },
  usedBy: [
    {
      company: "Google",
      product: "Ad allocation & budget pacing",
      usage:
        "Impressions to advertisers under budget caps is a flow problem with capacities on both sides.",
      href: "https://research.google/pubs/pub37409/",
    },
    {
      company: "Amazon",
      product: "Fulfilment network routing",
      usage:
        "Units flow from inventory nodes through capacity-limited lanes to destinations — a min-cost flow at scale.",
    },
    {
      company: "Airlines (Delta, United)",
      product: "Crew and aircraft rotation",
      usage:
        "Legal pairings are modelled as network flow with capacity constraints per crew and aircraft.",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — Maximum flow (Ford-Fulkerson / Edmonds-Karp)",
      href: "https://cp-algorithms.com/graph/edmonds_karp.html",
    },
    {
      label: "Ford & Fulkerson (1956) — Maximal flow through a network",
      href: "https://www.rand.org/pubs/papers/P605.html",
    },
  ],
  challenge: {
    prompt:
      "Compute the maximum flow from a source to a sink. The idea that makes it work is the residual graph: every unit you push forward also creates the option to push back, so a greedy choice made early can be undone later.",
    entry: "maxFlow",
    starter: `/**
 * @param {number[][]} capacity - capacity[u][v], zero when there is no edge.
 * @param {number} source
 * @param {number} sink
 * @returns {number} the maximum flow value.
 */
function maxFlow(capacity, source, sink) {
  // Repeatedly find any source-to-sink path with spare capacity and push the
  // bottleneck along it. Remember to add the same amount to the REVERSE edge.
}
`,
    tests: [
      {
        name: "a single pipe",
        body: `assertEquals(solution([[0, 5], [0, 0]], 0, 1), 5);`,
      },
      {
        name: "a series is limited by its narrowest link",
        body: `assertEquals(solution([[0, 5, 0], [0, 0, 3], [0, 0, 0]], 0, 2), 3);`,
      },
      {
        name: "parallel routes add up",
        body: `var c = [[0, 3, 3, 0], [0, 0, 0, 3], [0, 0, 0, 3], [0, 0, 0, 0]];
assertEquals(solution(c, 0, 3), 6);`,
      },
      {
        name: "no path means no flow",
        body: `assertEquals(solution([[0, 0], [0, 0]], 0, 1), 0);`,
      },
      {
        name: "source equals sink",
        body: `assertEquals(solution([[0, 5], [0, 0]], 0, 0), 0);`,
      },
      {
        name: "needs to undo an earlier choice",
        body: `var c = [[0, 3, 3, 0, 0], [0, 0, 1, 3, 0], [0, 0, 0, 0, 3], [0, 0, 0, 0, 4], [0, 0, 0, 0, 0]];
assertEquals(solution(c, 0, 4), 6);`,
      },
      {
        name: "handles a wider graph",
        body: `var n = 40;
var c = [];
for (var i = 0; i < n; i++) c.push(new Array(n).fill(0));
for (var j = 1; j < n - 1; j++) { c[0][j] = 2; c[j][n - 1] = 2; }
assertEquals(solution(c, 0, n - 1), 2 * (n - 2));`,
      },
    ],
    hints: [
      "Work on a copy of the capacity matrix; subtract from the forward edge and add to the reverse one.",
      "Find a path with BFS over edges that still have residual capacity above zero.",
      "The bottleneck is the smallest residual capacity along the path; add it to the total and repeat until no path remains.",
    ],
    reference: `function maxFlow(capacity, source, sink) {
  // Guard first: with source === sink, BFS "reaches" the sink instantly, the
  // bottleneck loop never runs, and the total grows by Infinity forever.
  if (source === sink) return 0;
  const n = capacity.length;
  const residual = capacity.map((row) => row.slice());
  let total = 0;

  for (;;) {
    // BFS for any augmenting path in the residual graph.
    const parent = new Array(n).fill(-1);
    parent[source] = source;
    const queue = [source];
    for (let head = 0; head < queue.length && parent[sink] === -1; head++) {
      const u = queue[head];
      for (let v = 0; v < n; v++) {
        if (parent[v] !== -1 || residual[u][v] <= 0) continue;
        parent[v] = u;
        queue.push(v);
      }
    }
    if (parent[sink] === -1) break; // no path left

    let bottleneck = Infinity;
    for (let v = sink; v !== source; v = parent[v]) {
      bottleneck = Math.min(bottleneck, residual[parent[v]][v]);
    }
    for (let v = sink; v !== source; v = parent[v]) {
      residual[parent[v]][v] -= bottleneck;
      // The reverse edge is what lets a later path undo this choice.
      residual[v][parent[v]] += bottleneck;
    }
    total += bottleneck;
  }
  return total;
}
`,
  },
};
