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
  bridgesFrom: [
    {
      slug: "max-flow",
      sameness:
        "It IS max flow. Not analogous to it — equal to it: the maximum flow value and the minimum cut capacity are the same number, and after a max-flow run the cut is read straight off the residual graph as the set of vertices still reachable from the source.",
      delta:
        "So the work is already done, and what changes is what you ask for. Flow answers how much can get through; the cut answers which edges are the reason it cannot be more, which turns a throughput number into a list of things to fix. The same duality is why image segmentation and project selection reduce to a flow computation nobody would otherwise have guessed was involved.",
    },
  ],
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
  challenge: {
    prompt:
      "Find which side of the minimum cut each node falls on. Once flow is maximal, the source side is exactly the set still reachable in the residual graph — and the edges leaving it are the bottleneck. That equivalence is the max-flow min-cut theorem, made concrete.",
    entry: "sourceSide",
    starter: `/**
 * @param {number[][]} capacity - capacity[u][v].
 * @param {number} source
 * @param {number} sink
 * @returns {number[]} nodes on the source side of a minimum cut, ascending.
 */
function sourceSide(capacity, source, sink) {
  // Push flow until no augmenting path remains, then report what is still
  // reachable from the source through leftover capacity.
}
`,
    tests: [
      {
        name: "a saturated pipe cuts the two apart",
        body: `assertEquals(solution([[0, 5], [0, 0]], 0, 1), [0]);`,
      },
      {
        name: "the cut lands at the narrow link",
        body: `assertEquals(solution([[0, 5, 0], [0, 0, 3], [0, 0, 0]], 0, 2), [0, 1]);`,
      },
      {
        name: "an unreachable sink leaves everything on the source side",
        body: `assertEquals(solution([[0, 0, 0], [0, 0, 0], [0, 0, 0]], 0, 2), [0]);`,
      },
      {
        name: "the sink is never on the source side",
        body: `var c = [[0, 3, 3, 0], [0, 0, 0, 3], [0, 0, 0, 3], [0, 0, 0, 0]];
var side = solution(c, 0, 3);
assert(side.indexOf(3) === -1, 'sink leaked onto the source side');`,
      },
      {
        name: "the source is always included",
        body: `var c = [[0, 1], [0, 0]];
assert(solution(c, 0, 1).indexOf(0) !== -1, 'source missing');`,
      },
      {
        name: "cut capacity equals the maximum flow",
        body: `var c = [[0, 3, 3, 0, 0], [0, 0, 1, 3, 0], [0, 0, 0, 0, 3], [0, 0, 0, 0, 4], [0, 0, 0, 0, 0]];
var side = solution(c, 0, 4);
var inSide = {};
for (var i = 0; i < side.length; i++) inSide[side[i]] = true;
var cut = 0;
for (var u = 0; u < 5; u++) for (var v = 0; v < 5; v++) if (inSide[u] && !inSide[v]) cut += c[u][v];
assertEquals(cut, 6);`,
      },
    ],
    hints: [
      "Run max flow first, keeping the residual matrix afterwards.",
      "Then do one plain BFS from the source over edges whose residual capacity is still above zero.",
      "Whatever that BFS reaches is the source side; the sink cannot be among it unless no path ever existed.",
    ],
    reference: `function sourceSide(capacity, source, sink) {
  // Same trap as max flow: source === sink makes the augmenting loop spin.
  if (source === sink) return [source];
  const n = capacity.length;
  const residual = capacity.map((row) => row.slice());

  const bfsParents = () => {
    const parent = new Array(n).fill(-1);
    parent[source] = source;
    const queue = [source];
    for (let head = 0; head < queue.length; head++) {
      const u = queue[head];
      for (let v = 0; v < n; v++) {
        if (parent[v] !== -1 || residual[u][v] <= 0) continue;
        parent[v] = u;
        queue.push(v);
      }
    }
    return parent;
  };

  for (;;) {
    const parent = bfsParents();
    if (parent[sink] === -1) break;
    let bottleneck = Infinity;
    for (let v = sink; v !== source; v = parent[v]) {
      bottleneck = Math.min(bottleneck, residual[parent[v]][v]);
    }
    for (let v = sink; v !== source; v = parent[v]) {
      residual[parent[v]][v] -= bottleneck;
      residual[v][parent[v]] += bottleneck;
    }
  }

  // Max-flow min-cut: at saturation, reachability in the residual graph IS the cut.
  const parent = bfsParents();
  const out = [];
  for (let v = 0; v < n; v++) if (parent[v] !== -1) out.push(v);
  return out;
}
`,
  },
};
