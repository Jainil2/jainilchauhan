import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "astar-search",
  title: "A* Search",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "Heuristic-based pathfinding.",
  caption:
    "Find the optimal path with intelligence. Compare A* to Dijkstra and watch how the heuristic (distance to goal) guides the search, pruning thousands of unnecessary explorations. The standard for game AI and GPS.",
  skillTags: ["DSA", "AI"],
  concept:
    "A* is an extension of Dijkstra's algorithm that uses a heuristic to guide its search. While Dijkstra explores in all directions equally (circularly), A* prioritizes nodes that 'look' closer to the goal.\n\nIt uses the function `f(n) = g(n) + h(n)`:\n- `g(n)`: the actual cost from the start to node `n`.\n- `h(n)`: the estimated cost from `n` to the goal (the heuristic).\n\nIf the heuristic is **admissible** (it never overestimates the cost), A* is guaranteed to find the shortest path while exploring far fewer nodes than Dijkstra.",
  complexity: [{ operation: "Search", time: "O(E) worst case", space: "O(V)" }],
  realWorld: [
    "Video Games: for NPC movement and navigation meshes.",
    "Google Maps: as a base for routing (often with contraction hierarchies).",
    "Robotics: for motion planning in known environments.",
  ],
  pitfalls: [
    "Bad Heuristics: if your heuristic is not admissible, A* might find a sub-optimal path. If it's not consistent, it might be slower than Dijkstra.",
    "Memory: Like Dijkstra, A* keeps all visited nodes in memory, which can be an issue for massive graphs.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// A* = Dijkstra + heuristic. f(n) = g(n) + h(n).
// h must be admissible (never overestimate) or the path may be suboptimal.
function astar(start: string, goal: string, neighbors: (n: string) => [string, number][], h: (n: string) => number) {
  const open = new Map<string, number>([[start, h(start)]]); // node -> f
  const g = new Map([[start, 0]]);
  const cameFrom = new Map<string, string>();
  while (open.size) {
    const [node] = [...open.entries()].sort((a, b) => a[1] - b[1])[0]; // use a heap
    if (node === goal) return reconstruct(cameFrom, node);
    open.delete(node);
    for (const [next, w] of neighbors(node)) {
      const tentative = g.get(node)! + w;
      if (tentative < (g.get(next) ?? Infinity)) {
        g.set(next, tentative);
        cameFrom.set(next, node);
        open.set(next, tentative + h(next));
      }
    }
  }
  return null;
}`,
  },
  usedBy: [
    {
      company: "Google",
      product: "Maps route planning",
      usage:
        "Goal-directed search with geographic heuristics (plus contraction hierarchies) makes continent-scale routing interactive.",
      href: "https://research.google/pubs/pub41336/",
    },
    {
      company: "Blizzard / Unity",
      product: "Game NPC pathfinding",
      usage:
        "A* over navmeshes or tile grids is the default pathfinder in game engines and middleware.",
      href: "https://docs.unity3d.com/Manual/nav-InnerWorkings.html",
    },
    {
      company: "Amazon Robotics",
      product: "Warehouse robot routing",
      usage:
        "Floor robots plan collision-aware paths with heuristic search under time-window constraints.",
    },
  ],
  references: [
    {
      label:
        "Hart, Nilsson & Raphael (1968) — A formal basis for heuristic determination of minimum cost paths",
      href: "https://ieeexplore.ieee.org/document/4082128",
    },
    {
      label: "Unity — navigation and pathfinding internals",
      href: "https://docs.unity3d.com/Manual/nav-InnerWorkings.html",
    },
  ],
  challenge: {
    prompt:
      "Find the shortest path length across a grid with walls, guided by a Manhattan-distance heuristic. A* is Dijkstra plus an estimate of what remains; because that estimate never overshoots, the first time the goal is settled the answer is optimal.",
    entry: "aStar",
    starter: `/**
 * @param {number[][]} grid - 0 is open, 1 is a wall. Moves are 4-directional.
 * @param {[number, number]} start - [row, col].
 * @param {[number, number]} goal - [row, col].
 * @returns {number} number of steps in a shortest path, or -1 if unreachable.
 *   Start and goal being the same is 0 steps.
 */
function aStar(grid, start, goal) {
  // Priority is stepsSoFar + manhattanDistanceToGoal. The heuristic must never
  // overestimate, or the first path you find may not be the shortest.
}
`,
    tests: [
      {
        name: "straight line across an open grid",
        body: `assertEquals(solution([[0, 0, 0]], [0, 0], [0, 2]), 2);`,
      },
      {
        name: "start equals goal",
        body: `assertEquals(solution([[0]], [0, 0], [0, 0]), 0);`,
      },
      {
        name: "routes around a wall",
        body: `var g = [[0, 1, 0], [0, 0, 0]];
assertEquals(solution(g, [0, 0], [0, 2]), 4);`,
      },
      {
        name: "unreachable goal",
        body: `var g = [[0, 1, 0], [1, 1, 0]];
assertEquals(solution(g, [0, 0], [0, 2]), -1);`,
      },
      {
        name: "a walled goal is unreachable",
        body: `assertEquals(solution([[0, 1]], [0, 0], [0, 1]), -1);`,
      },
      {
        name: "diagonal movement is not allowed",
        body: `assertEquals(solution([[0, 0], [0, 0]], [0, 0], [1, 1]), 2);`,
      },
      {
        name: "finds the optimum on a larger open grid",
        body: `var g = [];
for (var r = 0; r < 60; r++) { var row = []; for (var c = 0; c < 60; c++) row.push(0); g.push(row); }
assertEquals(solution(g, [0, 0], [59, 59]), 118);`,
      },
    ],
    hints: [
      "Manhattan distance is the sum of the absolute row and column differences.",
      "Keep the best known step count per cell and skip a popped entry whose count is stale.",
      "Check that the start and the goal are not walls before you begin.",
    ],
    reference: `function aStar(grid, start, goal) {
  const rows = grid.length;
  const cols = grid[0].length;
  const [sr, sc] = start;
  const [gr, gc] = goal;
  if (grid[sr][sc] === 1 || grid[gr][gc] === 1) return -1;

  const h = (r, c) => Math.abs(r - gr) + Math.abs(c - gc);
  const best = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
  best[sr][sc] = 0;

  // [priority, steps, row, col]; a plain array kept sorted is fine at this size.
  const open = [[h(sr, sc), 0, sr, sc]];
  while (open.length) {
    let bestAt = 0;
    for (let i = 1; i < open.length; i++) if (open[i][0] < open[bestAt][0]) bestAt = i;
    const [, steps, r, c] = open.splice(bestAt, 1)[0];
    if (r === gr && c === gc) return steps;
    if (steps > best[r][c]) continue; // stale entry
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (grid[nr][nc] === 1) continue;
      const next = steps + 1;
      if (next >= best[nr][nc]) continue;
      best[nr][nc] = next;
      open.push([next + h(nr, nc), next, nr, nc]);
    }
  }
  return -1;
}
`,
  },
};
