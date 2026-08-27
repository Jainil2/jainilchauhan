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
};
