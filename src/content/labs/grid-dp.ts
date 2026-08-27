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
};
