import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "grid-dp",
  title: "Grid DP",
  category: "Algorithms",
  difficulty: "Beginner",
  readingTimeMin: 4,
  blurb: "Solve path/counting problems by combining neighboring cells.",
  caption:
    "Add an obstacle and watch path counts change. Each cell depends on previously solved adjacent cells.",
  skillTags: ["DSA", "Dynamic Programming"],
  bridgesFrom: [
    {
      slug: "fibonacci-memoization",
      sameness:
        "It IS memoised recursion. A cell's answer is built from the cells it depends on, each subproblem is solved once and stored, and the recurrence is the same shape as the one you already cached.",
      delta:
        "The key becomes a pair of coordinates, so the memo is a table rather than a line, and that makes the fill order explicit: iterate rows top to bottom and a cell's dependencies are always already computed, which removes the recursion entirely. It also exposes an optimisation that is invisible in the recursive form — if each row depends only on the row above, you can keep one row instead of the whole grid and the memory drops from O(rows times cols) to O(cols).",
    },
  ],
  concept:
    "Grid DP appears when movement is constrained, often to right/down or four directions with acyclic ordering. For path counting, each cell combines top and left counts. For minimum path sum, each cell takes its cost plus min(top, left).\n\nThe trick is choosing an iteration order where dependencies are already solved.",
  complexity: [
    { operation: "m x n grid", time: "O(mn)", space: "O(mn)" },
    { operation: "Rolling row", time: "O(mn)", space: "O(n)" },
  ],
  realWorld: [
    "Robot paths, image processing, edit-distance grids, game maps, and spreadsheet-like propagation.",
  ],
  pitfalls: [
    "Obstacles need zero/blocked states.",
    "Movement cycles break simple row-order DP.",
    "Boundary initialization controls correctness.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Min-cost path on a grid: each cell depends only on up/left.
export function minPathCost(grid: number[][]): number {
  const rows = grid.length, cols = grid[0].length;
  const dp = new Array(cols).fill(Infinity);
  dp[0] = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const fromLeft = c > 0 ? dp[c - 1] : Infinity;
      dp[c] = (r === 0 && c === 0 ? 0 : Math.min(dp[c], fromLeft)) + grid[r][c];
    }
  }
  return dp[cols - 1]; // O(rows*cols) time, O(cols) memory
}`,
  },
  usedBy: [
    {
      company: "Adobe",
      product: "Content-aware resizing (seam carving)",
      usage:
        "Seam carving finds a minimum-energy path down an image grid with exactly this recurrence.",
      href: "https://dl.acm.org/doi/10.1145/1275808.1276390",
    },
    {
      company: "Blizzard / game studios",
      product: "Tile-based pathfinding costs",
      usage:
        "Terrain-cost grids are pre-solved with DP for flow fields when hundreds of units share a destination.",
    },
    {
      company: "Google",
      product: "Dynamic time warping in speech",
      usage:
        "Aligning two time series is a grid DP over an alignment matrix with the same up/left/diagonal transitions.",
    },
  ],
  references: [
    {
      label: "Avidan & Shamir — Seam carving for content-aware image resizing",
      href: "https://dl.acm.org/doi/10.1145/1275808.1276390",
    },
    {
      label: "CP-Algorithms — dynamic programming basics",
      href: "https://cp-algorithms.com/dynamic_programming/intro-to-dp.html",
    },
  ],
  challenge: {
    prompt:
      "Count the distinct paths from the top-left of a grid to the bottom-right, moving only right or down, with some cells blocked. Each cell's count is just the sum of the cell above and the cell to the left — the whole problem collapses into that one line.",
    entry: "countPaths",
    starter: `/**
 * @param {number[][]} grid - 0 is open, 1 is blocked.
 * @returns {number} number of distinct paths. Zero if start or end is blocked.
 */
function countPaths(grid) {
  // A blocked cell contributes nothing. The first row and column have exactly
  // one way in until a block cuts them off.
}
`,
    tests: [
      {
        name: "a 2x2 open grid",
        body: `assertEquals(solution([[0, 0], [0, 0]]), 2);`,
      },
      {
        name: "a 3x3 open grid",
        body: `assertEquals(solution([[0, 0, 0], [0, 0, 0], [0, 0, 0]]), 6);`,
      },
      {
        name: "a block removes routes",
        body: `assertEquals(solution([[0, 0, 0], [0, 1, 0], [0, 0, 0]]), 2);`,
      },
      {
        name: "a blocked start",
        body: `assertEquals(solution([[1, 0], [0, 0]]), 0);`,
      },
      {
        name: "a blocked finish",
        body: `assertEquals(solution([[0, 0], [0, 1]]), 0);`,
      },
      {
        name: "a single open cell",
        body: `assertEquals(solution([[0]]), 1);`,
      },
      {
        name: "a wall across the grid blocks everything",
        body: `assertEquals(solution([[0, 0], [1, 1], [0, 0]]), 0);`,
      },
      {
        name: "handles a larger grid",
        body: `var g = [];
for (var r = 0; r < 15; r++) { var row = []; for (var c = 0; c < 15; c++) row.push(0); g.push(row); }
assertEquals(solution(g), 40116600);`,
      },
    ],
    hints: [
      "Make a counts grid the same shape, and set the start to 1 unless it is blocked.",
      "For every other cell: 0 if blocked, otherwise the value above plus the value to the left, treating off-grid as 0.",
      "One row of state is enough if you sweep left to right, but a full grid is easier to get right first.",
    ],
    reference: `function countPaths(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  if (grid[0][0] === 1 || grid[rows - 1][cols - 1] === 1) return 0;

  const ways = Array.from({ length: rows }, () => new Array(cols).fill(0));
  ways[0][0] = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        ways[r][c] = 0; // a block has no routes through it
        continue;
      }
      if (r > 0) ways[r][c] += ways[r - 1][c];
      if (c > 0) ways[r][c] += ways[r][c - 1];
    }
  }
  return ways[rows - 1][cols - 1];
}
`,
  },
};
