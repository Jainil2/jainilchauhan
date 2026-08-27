import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "tree-dp",
  title: "Tree DP",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Return multiple states per node and combine child answers.",
  caption:
    "Toggle include/exclude root. Tree DP often computes states like take-this-node vs skip-this-node.",
  skillTags: ["DSA", "Dynamic Programming", "Trees"],
  concept:
    "Tree DP solves recursive problems where each node combines answers from children. Many problems return multiple states per node. For example, maximum independent set returns include-node and exclude-node: including a node excludes children, while excluding it allows each child to choose its best state.\n\nBecause trees have no cycles, postorder traversal naturally solves children before parents.",
  complexity: [{ operation: "Postorder DP", time: "O(n)", space: "O(h)" }],
  realWorld: [
    "Org chart optimization, dependency trees, AST optimization, network design, and hierarchical permissions.",
  ],
  pitfalls: [
    "Root choice can matter for directed/parented states.",
    "Rerooting DP is needed when every node may be root.",
    "Recursive depth can overflow on skewed trees.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Post-order DP: combine children results into the parent's answer.
interface Node { id: string; children: Node[]; weight: number }

// Maximum-weight independent set on a tree ("no manager with their report").
function solve(n: Node): { take: number; skip: number } {
  let take = n.weight, skip = 0;
  for (const c of n.children) {
    const r = solve(c);
    take += r.skip;                 // taking n forbids taking a child
    skip += Math.max(r.take, r.skip);
  }
  return { take, skip };
}
const best = (root: Node) => Math.max(...Object.values(solve(root)));`,
  },
  usedBy: [
    {
      company: "Google",
      product: "Bazel build graph analysis",
      usage:
        "Aggregating cost, staleness and cache hits bottom-up over a dependency tree is post-order DP.",
      href: "https://bazel.build/remote/caching",
    },
    {
      company: "Meta",
      product: "React render cost aggregation",
      usage:
        "Profiler timings roll up child subtree costs into parent components in a post-order pass.",
      href: "https://react.dev/reference/react/Profiler",
    },
    {
      company: "Amazon",
      product: "Org / category hierarchy rollups",
      usage:
        "Catalog and org trees compute aggregates (inventory, spend, permissions) once per node instead of re-walking subtrees.",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — DP on trees",
      href: "https://cp-algorithms.com/graph/rerooting.html",
    },
    {
      label: "React — Profiler (subtree cost aggregation)",
      href: "https://react.dev/reference/react/Profiler",
    },
  ],
};
