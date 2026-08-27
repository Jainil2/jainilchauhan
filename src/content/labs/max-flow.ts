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
};
