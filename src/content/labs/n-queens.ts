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
  challenge: {
    prompt:
      "Count the ways to place n queens on an n by n board with none attacking another. Backtracking works here only because the constraint is checked as the board is built — placing a queen prunes entire branches before they are explored.",
    entry: "countSolutions",
    starter: `/**
 * @param {number} n - board size.
 * @returns {number} number of distinct valid placements.
 */
function countSolutions(n) {
  // Place one queen per row. A column or either diagonal is either free or it
  // is not -- three sets are enough to check in constant time.
}
`,
    tests: [
      {
        name: "one queen on a 1x1 board",
        body: `assertEquals(solution(1), 1);`,
      },
      {
        name: "no solution on 2x2",
        body: `assertEquals(solution(2), 0);`,
      },
      {
        name: "no solution on 3x3",
        body: `assertEquals(solution(3), 0);`,
      },
      {
        name: "the classic 8x8 answer",
        body: `assertEquals(solution(8), 92);`,
      },
      {
        name: "4x4 has two",
        body: `assertEquals(solution(4), 2);`,
      },
      {
        name: "6x6 has four",
        body: `assertEquals(solution(6), 4);`,
      },
      {
        name: "an empty board",
        body: `assertEquals(solution(0), 1);`,
      },
      {
        name: "9x9 has 352",
        body: `assertEquals(solution(9), 352);`,
      },
    ],
    hints: [
      "Recurse one row at a time; reaching row n means you found a valid board.",
      "Two queens share a descending diagonal when row - col matches, and an ascending one when row + col matches.",
      "Offset the row - col value so it can index an array, or use a Set.",
    ],
    reference: `function countSolutions(n) {
  const cols = new Array(n).fill(false);
  const diag = new Array(2 * n).fill(false); // row - col, offset by n
  const anti = new Array(2 * n).fill(false); // row + col
  let total = 0;

  const place = (row) => {
    if (row === n) {
      total++;
      return;
    }
    for (let col = 0; col < n; col++) {
      const d = row - col + n;
      const a = row + col;
      // Checking before descending is what prunes whole subtrees.
      if (cols[col] || diag[d] || anti[a]) continue;
      cols[col] = diag[d] = anti[a] = true;
      place(row + 1);
      cols[col] = diag[d] = anti[a] = false;
    }
  };

  place(0);
  return total;
}
`,
  },
};
