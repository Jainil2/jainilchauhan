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
  bridgesFrom: [
    {
      slug: "grid-dp",
      sameness:
        "It IS the same dynamic programming. Each subproblem solved once, each answer assembled from the answers of smaller subproblems, and a table keyed by whatever identifies a subproblem — here a node instead of a cell.",
      delta:
        "A grid hands you the fill order for free; a tree does not, so the traversal supplies it — a post-order DFS guarantees every child is solved before its parent. And each node returns several answers rather than one, typically the best with this node taken and the best without, because the parent's decision constrains what the child is allowed to do. That tuple is the whole technique: collapse it to a single number and there is no way for a parent to know which of its children's answers are still compatible with its own choice.",
    },
  ],
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
  challenge: {
    prompt:
      "Pick a set of tree nodes with the largest total value where no two chosen nodes are adjacent. Every node has exactly two states — taken or not — and a child's best answer depends only on which state its parent chose.",
    entry: "maxIndependentSet",
    starter: `/**
 * @param {number} n - nodes 0..n-1, rooted at 0.
 * @param {Array<[number, number]>} edges - tree edges, undirected.
 * @param {number[]} values - value of each node.
 * @returns {number} the largest total value with no two chosen nodes adjacent.
 */
function maxIndependentSet(n, edges, values) {
  // Per node compute two numbers: the best if it is taken, and the best if it
  // is not. A taken node forces every child to be skipped.
}
`,
    tests: [
      {
        name: "a single node is taken",
        body: `assertEquals(solution(1, [], [5]), 5);`,
      },
      {
        name: "a parent beats its children",
        body: `assertEquals(solution(3, [[0, 1], [0, 2]], [10, 1, 1]), 10);`,
      },
      {
        name: "children beat their parent",
        body: `assertEquals(solution(3, [[0, 1], [0, 2]], [1, 5, 5]), 10);`,
      },
      {
        name: "a chain skips the middle",
        body: `assertEquals(solution(3, [[0, 1], [1, 2]], [4, 9, 4]), 9);`,
      },
      {
        name: "a longer chain alternates",
        body: `assertEquals(solution(4, [[0, 1], [1, 2], [2, 3]], [1, 1, 1, 1]), 2);`,
      },
      {
        name: "grandchildren may join a taken root",
        body: `assertEquals(solution(4, [[0, 1], [1, 2], [1, 3]], [5, 1, 5, 5]), 15);`,
      },
      {
        name: "handles a deep tree without recursing too far",
        body: `var edges = [];
var values = [1];
for (var i = 1; i < 20000; i++) { edges.push([i - 1, i]); values.push(1); }
assertEquals(solution(20000, edges, values), 10000);`,
      },
    ],
    hints: [
      "Build an adjacency list and process children before parents — a post-order walk.",
      "taken[v] = value[v] + sum of notTaken[child]; notTaken[v] = sum of max(taken[child], notTaken[child]).",
      "A 20000-deep chain will overflow a recursive solution, so use an explicit stack or an iterative post-order.",
    ],
    reference: `function maxIndependentSet(n, edges, values) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  // Iterative post-order: a deep chain would blow a recursive stack.
  const parent = new Array(n).fill(-1);
  const order = [];
  const stack = [0];
  const seen = new Array(n).fill(false);
  seen[0] = true;
  while (stack.length) {
    const node = stack.pop();
    order.push(node);
    for (const next of adj[node]) {
      if (seen[next]) continue;
      seen[next] = true;
      parent[next] = node;
      stack.push(next);
    }
  }

  const taken = values.slice();
  const skipped = new Array(n).fill(0);
  // Reverse of a pre-order push sequence is a valid post-order.
  for (let i = order.length - 1; i >= 0; i--) {
    const node = order[i];
    const p = parent[node];
    if (p === -1) continue;
    taken[p] += skipped[node]; // taking p forbids taking its children
    skipped[p] += Math.max(taken[node], skipped[node]);
  }
  return Math.max(taken[0], skipped[0]);
}
`,
  },
};
