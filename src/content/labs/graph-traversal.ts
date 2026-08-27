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
  challenge: {
    prompt:
      "Return the order breadth-first search visits nodes from a source. BFS explores by distance, which is why it finds the fewest-hops path on an unweighted graph while depth-first search does not.",
    entry: "bfsOrder",
    starter: `/**
 * @param {number[][]} adj - adjacency list; neighbours already ascending.
 * @param {number} start
 * @returns {number[]} nodes in the order BFS first reaches them.
 */
function bfsOrder(adj, start) {
  // Mark a node as seen when you ENQUEUE it, not when you dequeue it, or it can
  // enter the queue twice.
}
`,
    tests: [
      {
        name: "visits by distance",
        body: `assertEquals(solution([[1, 2], [3], [3], []], 0), [0, 1, 2, 3]);`,
      },
      {
        name: "does not revisit on a cycle",
        body: `assertEquals(solution([[1], [2], [0]], 0), [0, 1, 2]);`,
      },
      {
        name: "unreachable nodes are omitted",
        body: `assertEquals(solution([[1], [], []], 0), [0, 1]);`,
      },
      {
        name: "a lone node visits only itself",
        body: `assertEquals(solution([[], []], 1), [1]);`,
      },
      {
        name: "neighbour order is respected",
        body: `assertEquals(solution([[2, 1], [], []], 0), [0, 2, 1]);`,
      },
      {
        name: "handles a long chain without recursion",
        body: `var adj = [];
for (var i = 0; i < 50000; i++) adj.push([i + 1]);
adj.push([]);
assertEquals(solution(adj, 0).length, 50001);`,
      },
    ],
    hints: [
      "Use a queue and a seen set, both seeded with the start node.",
      "Read the queue with an index cursor rather than shift(), which is O(n) each call.",
      "Only enqueue a neighbour the first time you see it.",
    ],
    reference: `function bfsOrder(adj, start) {
  const seen = new Array(adj.length).fill(false);
  const order = [];
  const queue = [start];
  seen[start] = true; // marked on enqueue, so it cannot be queued twice
  // A cursor instead of shift(): shift() is O(n) and would make this quadratic.
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    order.push(node);
    for (const next of adj[node]) {
      if (seen[next]) continue;
      seen[next] = true;
      queue.push(next);
    }
  }
  return order;
}
`,
  },
};
