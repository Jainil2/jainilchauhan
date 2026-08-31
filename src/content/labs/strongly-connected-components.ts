import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "strongly-connected-components",
  title: "Strongly Connected Components",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "Find maximal mutually reachable groups in directed graphs.",
  caption:
    "Step through SCC groups. Tarjan compresses cycles into components using discovery indexes and low-link values.",
  skillTags: ["DSA", "Graphs"],
  bridgesFrom: [
    {
      slug: "connected-components",
      sameness:
        "It IS the same question — group the vertices that can all reach each other — and Kosaraju's answer IS the same traversal, run twice.",
      delta:
        "Direction breaks the symmetry that made one pass enough. In an undirected graph reachability goes both ways, so a single traversal from any vertex captures the whole component; with directed edges u reaching v says nothing about v reaching u, so you need a pass to order the vertices by finish time and a second pass on the reversed graph to close the loop. The output also gains a structure the undirected version never had: contract each component and what remains is always a DAG, which is why this is the standard first step before running anything that requires acyclicity.",
    },
  ],
  concept:
    "A strongly connected component, or SCC, is a maximal set of directed graph nodes where every node can reach every other node. Tarjan's algorithm performs one DFS, assigns discovery indexes, maintains low-link values, and pops a component when a node is the root of an SCC.\n\nCollapsing SCCs turns a directed graph into a DAG, which is useful for dependency analysis, compiler optimization, deadlock reasoning, and graph simplification.",
  complexity: [
    { operation: "Tarjan SCC", time: "O(V + E)", space: "O(V)" },
    { operation: "Kosaraju SCC", time: "O(V + E)", space: "O(V + E)" },
  ],
  realWorld: [
    "Compiler control-flow analysis, dependency cycles, web link graphs, and service-call cycle detection.",
  ],
  pitfalls: [
    "Low-link updates must distinguish tree edges from back edges.",
    "SCCs apply to directed graphs; undirected components are simpler.",
    "Recursive Tarjan can overflow on very deep graphs.",
  ],
  codeSnippet: {
    language: "py",
    code: `# Tarjan's SCC: one DFS, low-link values, an explicit stack.
def tarjan(adj):
    index, low, on_stack, stack, out = {}, {}, set(), [], []
    counter = [0]

    def dfs(v):
        index[v] = low[v] = counter[0]; counter[0] += 1
        stack.append(v); on_stack.add(v)
        for w in adj.get(v, ()):
            if w not in index:
                dfs(w); low[v] = min(low[v], low[w])
            elif w in on_stack:
                low[v] = min(low[v], index[w])
        if low[v] == index[v]:               # v is an SCC root
            comp = []
            while True:
                w = stack.pop(); on_stack.discard(w); comp.append(w)
                if w == v: break
            out.append(comp)

    for v in list(adj):
        if v not in index: dfs(v)
    return out`,
  },
  usedBy: [
    {
      company: "Google",
      product: "Web spam / link-farm detection",
      usage:
        "Tightly interlinked page groups surface as strongly connected components in the link graph.",
      href: "http://infolab.stanford.edu/~backrub/google.html",
    },
    {
      company: "Uber",
      product: "Service dependency analysis",
      usage:
        "Cyclic call chains between microservices show up as SCCs and are the first thing to break when untangling a monolith.",
    },
    {
      company: "LLVM / Apple",
      product: "Compiler call-graph SCCs",
      usage:
        "The pass manager processes the call graph bottom-up by SCC so mutually recursive functions are optimised together.",
      href: "https://llvm.org/docs/Passes.html",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — Strongly connected components",
      href: "https://cp-algorithms.com/graph/strongly-connected-components.html",
    },
    { label: "LLVM — CallGraph SCC passes", href: "https://llvm.org/docs/Passes.html" },
  ],
  challenge: {
    prompt:
      "Find the strongly connected components of a directed graph — the groups where every node can reach every other. Kosaraju does it in two passes: order by finish time, then explore the reversed graph in that order.",
    entry: "sccs",
    starter: `/**
 * @param {number} n - nodes 0..n-1.
 * @param {Array<[number, number]>} edges - directed.
 * @returns {number[][]} components, each ascending, ordered by first element.
 */
function sccs(n, edges) {
  // Pass one: record nodes by finish time on the original graph.
  // Pass two: walk the REVERSED graph in reverse finish order.
}
`,
    tests: [
      {
        name: "a two-cycle is one component",
        body: `assertEquals(solution(2, [[0, 1], [1, 0]]), [[0, 1]]);`,
      },
      {
        name: "a chain has no shared components",
        body: `assertEquals(solution(3, [[0, 1], [1, 2]]), [[0], [1], [2]]);`,
      },
      {
        name: "isolated nodes are their own components",
        body: `assertEquals(solution(2, []), [[0], [1]]);`,
      },
      {
        name: "a triangle is one component",
        body: `assertEquals(solution(3, [[0, 1], [1, 2], [2, 0]]), [[0, 1, 2]]);`,
      },
      {
        name: "separates a cycle from its tail",
        body: `assertEquals(solution(3, [[0, 1], [1, 0], [1, 2]]), [[0, 1], [2]]);`,
      },
      {
        name: "a self loop is its own component",
        body: `assertEquals(solution(1, [[0, 0]]), [[0]]);`,
      },
      {
        name: "handles two separate cycles",
        body: `assertEquals(solution(4, [[0, 1], [1, 0], [2, 3], [3, 2]]), [[0, 1], [2, 3]]);`,
      },
      {
        name: "survives a long chain without recursing",
        body: `var edges = [];
for (var i = 0; i < 50000; i++) edges.push([i, i + 1]);
assertEquals(solution(50001, edges).length, 50001);`,
      },
    ],
    hints: [
      "Build both the graph and its reverse up front.",
      "The first pass is a DFS that appends a node to an order list when it finishes, not when it starts.",
      "The second pass walks that order backwards; everything reachable in the reversed graph from an unvisited node is one component.",
    ],
    reference: `function sccs(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  const rev = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    rev[v].push(u);
  }

  // Pass one: finish order. Iterative, because 50k-deep recursion overflows.
  const seen = new Array(n).fill(false);
  const order = [];
  for (let start = 0; start < n; start++) {
    if (seen[start]) continue;
    const stack = [[start, 0]];
    seen[start] = true;
    while (stack.length) {
      const frame = stack[stack.length - 1];
      const [node, i] = frame;
      if (i < adj[node].length) {
        frame[1]++;
        const next = adj[node][i];
        if (!seen[next]) {
          seen[next] = true;
          stack.push([next, 0]);
        }
      } else {
        order.push(node); // finished
        stack.pop();
      }
    }
  }

  // Pass two: reversed graph, in reverse finish order.
  const done = new Array(n).fill(false);
  const out = [];
  for (let i = order.length - 1; i >= 0; i--) {
    const root = order[i];
    if (done[root]) continue;
    const group = [];
    const stack = [root];
    done[root] = true;
    while (stack.length) {
      const node = stack.pop();
      group.push(node);
      for (const next of rev[node]) {
        if (done[next]) continue;
        done[next] = true;
        stack.push(next);
      }
    }
    out.push(group.sort((a, b) => a - b));
  }
  return out.sort((a, b) => a[0] - b[0]);
}
`,
  },
};
