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
};
