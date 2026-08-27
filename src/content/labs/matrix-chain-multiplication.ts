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
};
