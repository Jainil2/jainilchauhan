import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "matrix-chain-multiplication",
  title: "Matrix Chain Multiplication",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Choose multiplication order that minimizes scalar operations.",
  caption: "Compare two parenthesizations with the same result but very different costs.",
  skillTags: ["DSA", "Dynamic Programming"],
  bridgesFrom: [
    {
      slug: "grid-dp",
      sameness:
        "It IS a DP table indexed by two coordinates, filled from smaller answers to larger ones, exactly as you filled the grid.",
      delta:
        "A cell here means a subrange i to j, and it does not depend on its immediate neighbours but on every way of splitting that range in two. So the fill order becomes by increasing interval length rather than row by row, and each cell costs O(n) to evaluate instead of O(1) — the total goes to O(n cubed). This is the shape of every interval DP, and the thing it teaches is that the expensive part was never the multiplication itself but choosing the order, which changes the scalar operation count by orders of magnitude without changing the result at all.",
    },
  ],
  concept:
    "Matrix multiplication is associative, so A(BC) and (AB)C produce the same final matrix, but the number of scalar operations can be wildly different. Matrix-chain DP tries every split k between i and j, combining the best left cost, best right cost, and multiplication cost.\n\nThis is interval DP: solve smaller ranges, then compose larger ranges.",
  complexity: [{ operation: "Optimal parenthesization", time: "O(n^3)", space: "O(n^2)" }],
  realWorld: ["Query planning, tensor algebra, compiler optimization, and scientific computing."],
  pitfalls: [
    "Only optimizes order, not mathematical result.",
    "Requires compatible dimensions.",
    "The split table is needed to reconstruct parentheses.",
  ],
  codeSnippet: {
    language: "py",
    code: `# Choose the parenthesisation with the fewest scalar multiplications.
def matrix_chain(dims):                 # dims[i-1] x dims[i] for matrix i
    n = len(dims) - 1
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            dp[i][j] = min(
                dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j]
                for k in range(i, j)
            )
    return dp[1][n]                     # O(n^3) planning, huge runtime savings`,
  },
  usedBy: [
    {
      company: "Google",
      product: "TensorFlow / XLA operator fusion",
      usage:
        "Compilers reorder and fuse tensor contractions; the multiplication order changes FLOP count by orders of magnitude.",
      href: "https://openxla.org/xla",
    },
    {
      company: "PostgreSQL",
      product: "Join order optimisation",
      usage:
        "Join ordering is the same interval DP — cost depends on the shape of the tree, not just the set of operands.",
      href: "https://www.postgresql.org/docs/current/planner-optimizer.html",
    },
    {
      company: "NVIDIA",
      product: "cuBLAS / einsum contraction paths",
      usage:
        "Optimal contraction ordering for einsum-style expressions is solved with the same dynamic program.",
      href: "https://numpy.org/doc/stable/reference/generated/numpy.einsum_path.html",
    },
  ],
  references: [
    {
      label: "PostgreSQL — planner and join ordering",
      href: "https://www.postgresql.org/docs/current/planner-optimizer.html",
    },
    {
      label: "NumPy — einsum_path (contraction ordering)",
      href: "https://numpy.org/doc/stable/reference/generated/numpy.einsum_path.html",
    },
  ],
  challenge: {
    prompt:
      "Find the cheapest way to parenthesise a chain of matrix multiplications. The result is identical whatever order you choose; the cost is not, often by orders of magnitude. Deep-learning compilers make the same decision when fusing operations.",
    entry: "minMultiplications",
    starter: `/**
 * @param {number[]} dims - matrix i has dims[i] rows and dims[i+1] columns,
 *   so dims.length - 1 matrices in total.
 * @returns {number} minimum scalar multiplications needed.
 */
function minMultiplications(dims) {
  // Solve short chains first. For each chain, try every split point and keep
  // the cheapest: cost(left) + cost(right) + the cost of the final multiply.
}
`,
    tests: [
      {
        name: "a single matrix costs nothing",
        body: `assertEquals(solution([10, 20]), 0);`,
      },
      {
        name: "two matrices",
        body: `assertEquals(solution([10, 20, 30]), 6000);`,
      },
      {
        name: "three matrices, order matters",
        body: `assertEquals(solution([10, 20, 30, 40]), 18000);`,
      },
      {
        name: "classic example",
        body: `assertEquals(solution([40, 20, 30, 10, 30]), 26000);`,
      },
      {
        name: "another classic",
        body: `assertEquals(solution([10, 30, 5, 60]), 4500);`,
      },
      {
        name: "no matrices",
        body: `assertEquals(solution([5]), 0);`,
      },
      {
        name: "handles a longer chain",
        body: `var dims = [];
for (var i = 0; i < 60; i++) dims.push((i % 7) + 2);
assert(solution(dims) > 0, 'expected a positive cost');`,
      },
    ],
    hints: [
      "Index by chain length, from 2 matrices upwards, so smaller chains are always solved first.",
      "For a chain from i to j, try every split k between them.",
      "The final multiply of a split costs dims[i] * dims[k+1] * dims[j+1].",
    ],
    reference: `function minMultiplications(dims) {
  const n = dims.length - 1; // number of matrices
  if (n <= 1) return 0;
  const cost = Array.from({ length: n }, () => new Array(n).fill(0));

  // By chain length, so every subchain is already solved when it is needed.
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      cost[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const total = cost[i][k] + cost[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1];
        if (total < cost[i][j]) cost[i][j] = total;
      }
    }
  }
  return cost[0][n - 1];
}
`,
  },
};
