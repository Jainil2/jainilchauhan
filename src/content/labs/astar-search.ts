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
};
