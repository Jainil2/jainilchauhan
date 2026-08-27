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
};
