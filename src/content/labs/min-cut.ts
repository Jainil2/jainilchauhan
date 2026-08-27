import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "min-cut",
  title: "Min Cut",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Find the smallest capacity separating source from sink.",
  caption: "Compare two cuts through the network. The best cut capacity equals the max-flow value.",
  skillTags: ["DSA", "Graphs", "Optimization"],
  concept:
    "An s-t cut partitions vertices into a source side and a sink side. Its capacity is the sum of capacities on edges crossing from source side to sink side. The min-cut problem asks for the lowest such capacity.\n\nThe max-flow min-cut theorem states that the maximum source-to-sink flow equals the minimum cut capacity. After a max-flow run, nodes reachable from the source in the residual graph identify a minimum cut.",
  complexity: [
    { operation: "After max-flow", time: "O(V + E)", space: "O(V)" },
    { operation: "Via flow algorithm", time: "depends on max-flow", space: "O(V + E)" },
  ],
  realWorld: [
    "Image segmentation, network reliability, graph partitioning, and identifying bottleneck links.",
  ],
  pitfalls: [
    "Cut direction matters in directed graphs.",
    "A visually small cut is not always the minimum-capacity cut.",
    "Min cut depends on capacities, not just edge count.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Max-flow min-cut: after saturating flow, the cut is the reachable set.
function minCut(residual: Map<string, Map<string, number>>, s: string) {
  const seen = new Set([s]);
  const stack = [s];
  while (stack.length) {
    const u = stack.pop()!;
    for (const [v, c] of residual.get(u) ?? []) {
      if (c > 0 && !seen.has(v)) { seen.add(v); stack.push(v); }
    }
  }
  // Edges from \`seen\` to its complement are the bottleneck set.
  return seen;
}`,
  },
  usedBy: [
    {
      company: "Microsoft",
      product: "GrabCut image segmentation",
      usage:
        "Foreground/background separation is solved as a graph cut over pixel similarity, shipped in Office/Photos tooling.",
      href: "https://www.microsoft.com/en-us/research/publication/grabcut-interactive-foreground-extraction-using-iterated-graph-cuts/",
    },
    {
      company: "Cloudflare",
      product: "Network resilience analysis",
      usage:
        "The minimum cut identifies the smallest set of links whose failure would partition a region.",
    },
    {
      company: "Meta",
      product: "Community / cluster boundaries",
      usage: "Cut-based objectives separate weakly connected communities in large social graphs.",
    },
  ],
  references: [
    {
      label: "GrabCut — interactive foreground extraction using graph cuts",
      href: "https://www.microsoft.com/en-us/research/publication/grabcut-interactive-foreground-extraction-using-iterated-graph-cuts/",
    },
    {
      label: "CP-Algorithms — flow and cuts",
      href: "https://cp-algorithms.com/graph/edmonds_karp.html",
    },
  ],
};
