import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "n-queens",
  title: "N-Queens",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Backtrack through board placements with constraint pruning.",
  caption:
    "Place one queen per row and reject attacked columns or diagonals. Backtracking searches only valid partial states.",
  skillTags: ["DSA", "Backtracking"],
  concept:
    "N-Queens asks for placing N queens on an N x N chessboard so no two attack each other. Backtracking places a queen row by row, maintaining used columns and diagonals. If a placement violates constraints, that branch is abandoned immediately.\n\nThe technique generalizes to constraint satisfaction: build partial solutions, prune invalid states, and backtrack when no option remains.",
  complexity: [{ operation: "Backtracking search", time: "O(N!) worst-ish", space: "O(N)" }],
  realWorld: ["Constraint solvers, scheduling, puzzle engines, and test-case generation."],
  pitfalls: [
    "Naive board scanning is slower than column/diagonal sets.",
    "Symmetric solutions can duplicate work.",
    "Backtracking still has exponential worst-case growth.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Backtracking with O(1) conflict checks via column/diagonal bitmasks.
export function countSolutions(n: number): number {
  const full = (1 << n) - 1;
  let count = 0;
  const place = (cols: number, d1: number, d2: number) => {
    if (cols === full) { count++; return; }
    let free = ~(cols | d1 | d2) & full; // candidate squares in this row
    while (free) {
      const bit = free & -free; // lowest set bit
      free ^= bit;
      place(cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1);
    }
  };
  place(0, 0, 0);
  return count; // prune early: never explore a partially invalid board
}`,
  },
  usedBy: [
    {
      company: "Google",
      product: "OR-Tools CP-SAT",
      usage:
        "N-Queens is the shipped teaching model for constraint propagation plus backtracking search in OR-Tools.",
      href: "https://developers.google.com/optimization/cp/queens",
    },
    {
      company: "Microsoft",
      product: "Z3 / SAT-style solvers",
      usage:
        "Conflict-driven search with backjumping generalises exactly this prune-on-conflict pattern.",
      href: "https://github.com/Z3Prover/z3",
    },
    {
      company: "IBM",
      product: "CPLEX CP optimizer benchmarks",
      usage:
        "Placement-under-constraints problems (VLSI, seating, timetabling) use the same feasibility search.",
    },
  ],
  references: [
    {
      label: "Google OR-Tools — the N-queens problem",
      href: "https://developers.google.com/optimization/cp/queens",
    },
    { label: "Z3 theorem prover", href: "https://github.com/Z3Prover/z3" },
  ],
};
