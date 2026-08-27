import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "sparse-matrix",
  title: "Sparse Matrix",
  category: "Data Structures",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "Store only non-zero cells instead of the full grid.",
  caption:
    "Scan non-zero matrix cells and compare the dense grid to coordinate triples. Sparse storage saves memory when most entries are zero.",
  skillTags: ["DSA", "ML", "Databases"],
  concept:
    "A sparse matrix represents a grid where most values are zero or empty. Instead of storing every cell, formats like COO store triples (row, column, value), CSR groups values by row, and CSC groups by column.\n\nSparse matrices are fundamental in search, recommendation systems, graphs, scientific computing, machine learning, and analytics because real relationships are often sparse.",
  complexity: [
    { operation: "Dense storage", time: "O(rows * cols)", space: "O(rows * cols)" },
    { operation: "Sparse storage", time: "O(nonZero)", space: "O(nonZero)" },
    { operation: "Lookup", time: "O(1) to O(log n)", space: "depends on index" },
  ],
  realWorld: [
    "User-item recommendation matrices, graph adjacency matrices, inverted indexes, and ML feature vectors.",
  ],
  pitfalls: [
    "Random lookup can be slower unless an index is added.",
    "Wrong sparse format makes operations expensive.",
    "When density grows, dense arrays can become faster and simpler.",
  ],
  codeSnippet: {
    language: "py",
    code: `import numpy as np
from scipy.sparse import csr_matrix

# 3 users x 4 items, only 4 ratings stored instead of 12 cells.
rows = [0, 0, 1, 2]
cols = [1, 3, 0, 2]
vals = [5.0, 3.0, 4.0, 2.0]
R = csr_matrix((vals, (rows, cols)), shape=(3, 4))

R.data          # non-zero values, row-major
R.indices       # column index of each value
R.indptr        # where each row starts -> O(nnz per row) scans

similar = R @ R.T   # cosine-style neighbourhood, touches only non-zeros`,
  },
  usedBy: [
    {
      company: "Netflix",
      product: "Recommendation matrix factorisation",
      usage:
        "The user x title rating matrix is over 99% empty, so latent-factor models iterate only over observed cells.",
      href: "https://netflixtechblog.com/netflix-recommendations-beyond-the-5-stars-part-1-55838468f429",
    },
    {
      company: "Google",
      product: "PageRank web graph",
      usage:
        "The web link matrix is stored as sparse adjacency: each page links to a handful of pages, not billions.",
      href: "http://infolab.stanford.edu/~backrub/google.html",
    },
    {
      company: "Spotify",
      product: "Implicit-feedback collaborative filtering",
      usage: "Play counts form a sparse user x track matrix consumed by ALS-style factorisation.",
    },
  ],
  references: [
    {
      label: "SciPy — compressed sparse row (CSR) format",
      href: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.sparse.csr_matrix.html",
    },
    {
      label: "Netflix Tech Blog — recommendations beyond the 5 stars",
      href: "https://netflixtechblog.com/netflix-recommendations-beyond-the-5-stars-part-1-55838468f429",
    },
  ],
  challenge: {
    prompt:
      "Multiply a sparse matrix by a dense vector. The matrix arrives as coordinate triples [row, col, value] and every unlisted cell is zero. Work proportional to the non-zeros, not to rows times columns. Recommendation and retrieval systems live on this operation because their matrices are almost entirely empty.",
    entry: "sparseMatVec",
    starter: `/**
 * @param {Array<[number, number, number]>} triples - [row, col, value], only non-zeros.
 * @param {number[]} vector - dense, indexed by column.
 * @param {number} rows - height of the matrix.
 * @returns {number[]} the product, length 'rows'.
 */
function sparseMatVec(triples, vector, rows) {
  // Touch only the non-zero cells. A zero cell contributes nothing, so there is
  // no reason to visit it.
}
`,
    tests: [
      {
        name: "identity-like matrix",
        body: `assertEquals(solution([[0, 0, 1], [1, 1, 1]], [5, 7], 2), [5, 7]);`,
      },
      {
        name: "sums multiple entries in a row",
        body: `assertEquals(solution([[0, 0, 2], [0, 1, 3]], [10, 100], 1), [320]);`,
      },
      {
        name: "empty rows produce zero",
        body: `assertEquals(solution([[2, 0, 4]], [3], 3), [0, 0, 12]);`,
      },
      {
        name: "no non-zeros gives an all-zero result",
        body: `assertEquals(solution([], [1, 2, 3], 2), [0, 0]);`,
      },
      {
        name: "handles negatives",
        body: `assertEquals(solution([[0, 0, -2]], [5], 1), [-10]);`,
      },
      {
        name: "cost tracks non-zeros, not the grid",
        body: `var triples = [];
for (var i = 0; i < 2000; i++) triples.push([i % 100, i % 50, 1]);
var v = new Array(50).fill(1);
var out = solution(triples, v, 100);
assertEquals(out.length, 100);
var total = out.reduce(function (a, b) { return a + b; }, 0);
assertEquals(total, 2000);`,
      },
    ],
    hints: [
      "Start with a result array of the right length, filled with zeros.",
      "Each triple contributes value * vector[col] to result[row]. Accumulate, do not assign.",
      "Nothing needs sorting — order of the triples does not change the sum.",
    ],
    reference: `function sparseMatVec(triples, vector, rows) {
  const out = new Array(rows).fill(0);
  // One pass over the non-zeros. A dense multiply would be rows * cols;
  // this is O(nnz), which is the whole point of the representation.
  for (const [row, col, value] of triples) {
    out[row] += value * vector[col];
  }
  return out;
}
`,
  },
};
