import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "topological-sort",
  title: "Topological Sort",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Order dependent work in a DAG with Kahn's algorithm.",
  caption:
    "Run tasks only when dependencies are complete. The ready queue reveals how topological ordering powers builds, migrations, and schedulers.",
  skillTags: ["DSA", "Algorithms"],
  bridgesFrom: [
    {
      slug: "graph-traversal",
      sameness:
        "Kahn's algorithm IS breadth-first search. Same queue, same pop-and-expand loop; the only difference is which vertices are allowed to enter it.",
      delta:
        "A vertex joins the frontier when its in-degree hits zero rather than when it is first discovered, so it waits for its last dependency instead of its first. That gating is also the cycle detector: if the queue empties while vertices remain, those vertices are waiting on each other, and the algorithm reports it by counting rather than by any extra pass. Unlike BFS the output order is not unique — any order the dependencies permit is a correct answer, which makes this the rare algorithm where two implementations can both be right and disagree.",
    },
  ],
  concept:
    "Topological sort orders nodes in a directed acyclic graph so every dependency appears before the work that depends on it. Kahn's algorithm tracks each node's in-degree, pushes zero-dependency nodes into a queue, removes them one by one, and decreases the in-degree of their outgoing neighbors.\n\nIf nodes remain but the ready queue is empty, the graph contains a cycle. That makes topological sort useful both for scheduling valid work and detecting invalid dependency graphs.",
  complexity: [
    { operation: "Topological sort", time: "O(V + E)", space: "O(V + E)" },
    { operation: "Cycle detection", time: "O(V + E)", space: "O(V)" },
  ],
  realWorld: [
    "Build systems, package managers, database migrations, workflow engines, compiler passes, and spreadsheet recalculation.",
  ],
  pitfalls: [
    "Only works on DAGs; cycles must be reported clearly.",
    "Multiple valid orders can exist.",
    "Dynamic dependency graphs need incremental recomputation or invalidation.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Kahn's algorithm: repeatedly emit nodes with no remaining dependencies.
export function topoSort(nodes: string[], edges: [string, string][]): string[] {
  const indeg = new Map(nodes.map((n) => [n, 0]));
  const adj = new Map(nodes.map((n) => [n, [] as string[]]));
  for (const [from, to] of edges) {
    adj.get(from)!.push(to);
    indeg.set(to, indeg.get(to)! + 1);
  }
  const ready = nodes.filter((n) => indeg.get(n) === 0);
  const order: string[] = [];
  while (ready.length) {
    const n = ready.shift()!; // any ready node -> parallelisable batch
    order.push(n);
    for (const next of adj.get(n)!) {
      indeg.set(next, indeg.get(next)! - 1);
      if (indeg.get(next) === 0) ready.push(next);
    }
  }
  if (order.length !== nodes.length) throw new Error("cycle detected");
  return order;
}`,
  },
  usedBy: [
    {
      company: "Google",
      product: "Bazel build graph",
      usage:
        'Actions run in dependency order, and every independent "ready" set is dispatched in parallel across workers.',
      href: "https://bazel.build/basics/build-graph",
    },
    {
      company: "Apache Airflow",
      product: "DAG task scheduling",
      usage:
        "The scheduler queues tasks whose upstream dependencies have all succeeded — Kahn's algorithm with retries.",
      href: "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html",
    },
    {
      company: "Vercel",
      product: "Turborepo task pipelines",
      usage:
        "`turbo run build` topologically orders package tasks and parallelises independent branches of the graph.",
      href: "https://turbo.build/repo/docs/crafting-your-repository/running-tasks",
    },
  ],
  references: [
    { label: "Bazel — the build graph", href: "https://bazel.build/basics/build-graph" },
    {
      label: "Turborepo — task graph & parallel execution",
      href: "https://turbo.build/repo/docs/crafting-your-repository/running-tasks",
    },
  ],
  challenge: {
    prompt:
      "Order the tasks of a dependency graph so every task comes after its prerequisites, using Kahn's algorithm. Return null when the graph has a cycle, because then no valid order exists. An agent planning tool calls, or a build system scheduling targets, runs exactly this.",
    entry: "topoSort",
    starter: `/**
 * @param {number} n - tasks 0..n-1.
 * @param {Array<[number, number]>} edges - [a, b] means a must come before b.
 * @returns {number[]|null} a valid order with ties broken by smallest id first,
 *   or null when the graph has a cycle.
 */
function topoSort(n, edges) {
  // Count how many prerequisites each task still has. Anything at zero is ready.
  // If you finish without emitting every task, something was never freed.
}
`,
    tests: [
      {
        name: "respects a dependency",
        body: `assertEquals(solution(2, [[0, 1]]), [0, 1]);`,
      },
      {
        name: "independent tasks come out by id",
        body: `assertEquals(solution(3, []), [0, 1, 2]);`,
      },
      {
        name: "a diamond orders correctly",
        body: `assertEquals(solution(4, [[0, 1], [0, 2], [1, 3], [2, 3]]), [0, 1, 2, 3]);`,
      },
      {
        name: "a cycle has no order",
        body: `assertEquals(solution(2, [[0, 1], [1, 0]]), null);`,
      },
      {
        name: "a self loop has no order",
        body: `assertEquals(solution(1, [[0, 0]]), null);`,
      },
      {
        name: "ties break toward the smaller id",
        body: `assertEquals(solution(3, [[2, 0]]), [1, 2, 0]);`,
      },
      {
        name: "a partial cycle still fails",
        body: `assertEquals(solution(4, [[0, 1], [2, 3], [3, 2]]), null);`,
      },
      {
        name: "handles a long dependency chain",
        body: `var edges = [];
for (var i = 0; i < 50000; i++) edges.push([i, i + 1]);
var order = solution(50001, edges);
assertEquals(order.length, 50001);
assertEquals(order[0], 0);`,
      },
    ],
    hints: [
      "Compute an in-degree per node, then seed a ready set with everything at zero.",
      "To break ties by smallest id, keep the ready set as a sorted structure or a min-heap rather than a plain queue.",
      "If the emitted order is shorter than n, the leftovers are all inside a cycle.",
    ],
    reference: `function topoSort(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  for (const [a, b] of edges) {
    adj[a].push(b);
    indegree[b]++;
  }

  // Min-heap keeps the tie-break deterministic: smallest ready id first.
  const ready = [];
  const push = (v) => {
    ready.push(v);
    let i = ready.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (ready[p] <= ready[i]) break;
      [ready[p], ready[i]] = [ready[i], ready[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = ready[0];
    const last = ready.pop();
    if (ready.length) {
      ready[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let small = i;
        if (l < ready.length && ready[l] < ready[small]) small = l;
        if (r < ready.length && ready[r] < ready[small]) small = r;
        if (small === i) break;
        [ready[small], ready[i]] = [ready[i], ready[small]];
        i = small;
      }
    }
    return top;
  };

  for (let v = 0; v < n; v++) if (indegree[v] === 0) push(v);

  const order = [];
  while (ready.length) {
    const node = pop();
    order.push(node);
    for (const next of adj[node]) {
      if (--indegree[next] === 0) push(next);
    }
  }
  // Anything never freed is stuck behind a cycle.
  return order.length === n ? order : null;
}
`,
  },
};
