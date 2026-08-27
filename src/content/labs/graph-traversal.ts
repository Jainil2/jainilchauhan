import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "graph-traversal",
  title: "BFS vs DFS",
  category: "Algorithms",
  difficulty: "Beginner",
  readingTimeMin: 4,
  blurb: "Same graph, two strategies — Queue vs Stack.",
  caption:
    "Step through BFS and DFS on identical graphs. Watch the queue (FIFO) explore in layers and the stack (LIFO) plunge depth-first. The shape of the frontier is everything.",
  skillTags: ["DSA"],
  concept:
    "BFS (Breadth-First Search) explores layer by layer using a queue. It finds the shortest path in an unweighted graph — the first time you reach a node, you've reached it through the fewest edges.\n\nDFS (Depth-First Search) plunges as deep as possible before backtracking, using a stack (or recursion). It's the right tool for cycle detection, topological sort, finding connected components, and any problem where you need to enumerate paths or do tree-shaped recursion.\n\nBoth are O(V + E) time, O(V) space. The difference is the data structure — and that's why they're often the first interview question after arrays: they teach how a tiny choice (queue vs stack) reshapes the entire algorithm's behavior.",
  complexity: [
    { operation: "BFS", time: "O(V + E)", space: "O(V) queue" },
    { operation: "DFS", time: "O(V + E)", space: "O(V) stack/recursion" },
  ],
  codeSnippet: {
    language: "ts",
    code: `function bfs(start: string, adj: Map<string, string[]>) {
  const visited = new Set<string>([start]);
  const queue = [start];
  while (queue.length) {
    const node = queue.shift()!; // FIFO
    for (const nb of adj.get(node) ?? []) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
    }
  }
  return visited;
}

function dfs(start: string, adj: Map<string, string[]>) {
  const visited = new Set<string>([start]);
  const stack = [start];
  while (stack.length) {
    const node = stack.pop()!; // LIFO
    for (const nb of adj.get(node) ?? []) {
      if (!visited.has(nb)) { visited.add(nb); stack.push(nb); }
    }
  }
  return visited;
}`,
  },
  realWorld: [
    "BFS — web crawlers (politeness layer), shortest-path in unweighted graphs, social-network 'degrees of separation'.",
    "DFS — topological sort (build systems, npm install order), cycle detection (deadlock detection!), maze solving.",
    "Garbage collectors mark phase: typically DFS to keep stack small.",
  ],
  pitfalls: [
    "DFS recursion blows the stack on deep graphs — convert to iterative DFS with explicit stack.",
    "Never forget to mark visited at enqueue time (BFS), not dequeue — otherwise a node can be enqueued many times.",
  ],
  usedBy: [
    {
      company: "Meta",
      product: "Friends-of-friends / degrees of separation",
      usage:
        'BFS over the social graph with early termination powers mutual-friend counts and "people you may know" candidate generation.',
      href: "https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/",
    },
    {
      company: "LinkedIn",
      product: "1st / 2nd / 3rd degree connection badges",
      usage:
        "Every profile view runs a bounded breadth-first distance query against the connection graph.",
      href: "https://engineering.linkedin.com/blog",
    },
    {
      company: "Google",
      product: "Crawler frontier",
      usage:
        "Web crawling is a prioritised breadth-first walk over discovered links with dedupe on visited URLs.",
      href: "http://infolab.stanford.edu/~backrub/google.html",
    },
  ],
  references: [
    {
      label: "Meta Engineering — TAO graph store",
      href: "https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/",
    },
    {
      label: "CP-Algorithms — BFS and DFS",
      href: "https://cp-algorithms.com/graph/breadth-first-search.html",
    },
  ],
};
