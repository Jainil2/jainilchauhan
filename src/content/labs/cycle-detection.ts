import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "cycle-detection",
  title: "Cycle Detection",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "Detect loops in directed and undirected graphs.",
  caption:
    "Add an edge to create a cycle. DFS detects back edges in directed graphs and non-parent visited edges in undirected graphs.",
  skillTags: ["DSA", "Graphs"],
  concept:
    "Cycle detection asks whether a path can return to a previously visited node. In directed graphs, DFS tracks three states: unvisited, visiting, and done. Seeing an edge to a visiting node means a back edge and therefore a cycle. In undirected graphs, seeing a visited neighbor that is not the parent indicates a cycle.\n\nCycle detection is essential for dependency validation, deadlock detection, scheduling, and graph sanity checks.",
  complexity: [
    { operation: "DFS cycle detection", time: "O(V + E)", space: "O(V)" },
    { operation: "Union-Find undirected cycle check", time: "O(E alpha(V))", space: "O(V)" },
  ],
  realWorld: [
    "Package managers, build systems, lock graphs, workflow engines, and schema dependency checks.",
  ],
  pitfalls: [
    "Directed and undirected cycle rules differ.",
    "A visited node is not always a cycle in directed DFS; it must be in the current recursion stack.",
    "Self-loops and parallel edges need explicit handling.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Directed cycle detection with white/grey/black colouring.
type Color = 0 | 1 | 2; // 0 unvisited, 1 in-stack, 2 done

function hasCycle(adj: Map<string, string[]>): string[] | null {
  const color = new Map<string, Color>();
  const stack: string[] = [];
  const dfs = (v: string): string[] | null => {
    color.set(v, 1);
    stack.push(v);
    for (const n of adj.get(v) ?? []) {
      if (color.get(n) === 1) return [...stack.slice(stack.indexOf(n)), n]; // back edge
      if (!color.get(n)) { const c = dfs(n); if (c) return c; }
    }
    color.set(v, 2);
    stack.pop();
    return null;
  };
  for (const v of adj.keys()) if (!color.get(v)) { const c = dfs(v); if (c) return c; }
  return null;
}`,
  },
  usedBy: [
    {
      company: "npm / GitHub",
      product: "Dependency resolution",
      usage:
        "Package managers and bundlers detect circular imports and cyclic peer requirements before install or build.",
      href: "https://docs.npmjs.com/cli/v10/configuring-npm/package-json",
    },
    {
      company: "Apache Airflow",
      product: "DAG validation",
      usage:
        "A pipeline must be acyclic; the scheduler rejects a DAG whose task dependencies close a loop.",
      href: "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html",
    },
    {
      company: "Oracle",
      product: "MySQL / InnoDB deadlock detector",
      usage:
        "The lock wait-for graph is scanned for cycles; the cheapest transaction in the cycle is rolled back.",
      href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlock-detection.html",
    },
  ],
  references: [
    {
      label: "Airflow — DAGs must be acyclic",
      href: "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html",
    },
    {
      label: "MySQL — InnoDB deadlock detection",
      href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlock-detection.html",
    },
  ],
  challenge: {
    prompt:
      "Detect a cycle in a directed graph. The trick is that seeing a node again is not enough — it must be a node still on the current path. Three colours distinguish 'not visited', 'on the stack', and 'finished'.",
    entry: "hasCycle",
    starter: `/**
 * @param {number} n - nodes 0..n-1.
 * @param {Array<[number, number]>} edges - directed, u to v.
 * @returns {boolean} true when a directed cycle exists.
 */
function hasCycle(n, edges) {
  // Revisiting a FINISHED node is fine -- that is just a diamond. Only an edge
  // back into a node still on the current path is a cycle.
}
`,
    tests: [
      {
        name: "a simple cycle",
        body: `assertEquals(solution(2, [[0, 1], [1, 0]]), true);`,
      },
      {
        name: "a chain has no cycle",
        body: `assertEquals(solution(3, [[0, 1], [1, 2]]), false);`,
      },
      {
        name: "a diamond is not a cycle",
        body: `assertEquals(solution(4, [[0, 1], [0, 2], [1, 3], [2, 3]]), false);`,
      },
      {
        name: "a self loop is a cycle",
        body: `assertEquals(solution(1, [[0, 0]]), true);`,
      },
      {
        name: "no edges",
        body: `assertEquals(solution(3, []), false);`,
      },
      {
        name: "finds a cycle in a disconnected part",
        body: `assertEquals(solution(4, [[0, 1], [2, 3], [3, 2]]), true);`,
      },
      {
        name: "a long chain is not a cycle",
        body: `var edges = [];
for (var i = 0; i < 50000; i++) edges.push([i, i + 1]);
assertEquals(solution(50001, edges), false);`,
      },
      {
        name: "detects a cycle closed at the far end",
        body: `var edges = [];
for (var i = 0; i < 50000; i++) edges.push([i, i + 1]);
edges.push([50000, 0]);
assertEquals(solution(50001, edges), true);`,
      },
    ],
    hints: [
      "Keep a state per node: 0 unvisited, 1 on the current path, 2 finished.",
      "An edge to a node in state 1 is a back edge, which means a cycle. An edge to state 2 is harmless.",
      "Recursion overflows on long chains — use an explicit stack and mark a node finished when you pop it.",
    ],
    reference: `function hasCycle(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) adj[u].push(v);

  const state = new Array(n).fill(0); // 0 unvisited, 1 on path, 2 done
  for (let start = 0; start < n; start++) {
    if (state[start] !== 0) continue;
    // Iterative DFS: a recursive one blows the stack on a 50k chain.
    const stack = [[start, 0]];
    state[start] = 1;
    while (stack.length) {
      const frame = stack[stack.length - 1];
      const [node, i] = frame;
      if (i < adj[node].length) {
        frame[1]++;
        const next = adj[node][i];
        if (state[next] === 1) return true; // back edge into the live path
        if (state[next] === 0) {
          state[next] = 1;
          stack.push([next, 0]);
        }
      } else {
        state[node] = 2; // finished: safe to revisit later
        stack.pop();
      }
    }
  }
  return false;
}
`,
  },
};
