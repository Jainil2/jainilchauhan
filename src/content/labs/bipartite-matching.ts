import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "bipartite-matching",
  title: "Bipartite Matching",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Pair left and right sets with augmenting paths.",
  caption:
    "Augment the matching until no improving path remains. Matching powers assignment, scheduling, and recommendation constraints.",
  skillTags: ["DSA", "Graphs", "Optimization"],
  concept:
    "Bipartite matching pairs nodes from a left set to nodes in a right set so no node is used more than once. An augmenting path alternates between unmatched and matched edges; flipping that path increases the matching size by one.\n\nThe problem can be solved with DFS augmenting paths, Hopcroft-Karp for better asymptotics, or max-flow by connecting a source to left nodes and right nodes to a sink.",
  complexity: [
    { operation: "DFS augmenting paths", time: "O(VE)", space: "O(V + E)" },
    { operation: "Hopcroft-Karp", time: "O(E sqrt(V))", space: "O(V + E)" },
  ],
  realWorld: [
    "Job assignment, school admissions, ad allocation, dating/recommendation constraints, and resource scheduling.",
  ],
  pitfalls: [
    "Greedy matching can get stuck below optimal.",
    "Weighted matching is a different problem.",
    "The graph must be bipartite for these algorithms.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Kuhn's algorithm: try to find an augmenting path for each left vertex.
function maxMatching(left: number, adj: number[][]) {
  const matchRight = new Map<number, number>();
  const tryKuhn = (u: number, seen: Set<number>): boolean => {
    for (const v of adj[u]) {
      if (seen.has(v)) continue;
      seen.add(v);
      const cur = matchRight.get(v);
      if (cur === undefined || tryKuhn(cur, seen)) { // bump the current owner
        matchRight.set(v, u);
        return true;
      }
    }
    return false;
  };
  let size = 0;
  for (let u = 0; u < left; u++) if (tryKuhn(u, new Set())) size++;
  return { size, matchRight };
}`,
  },
  usedBy: [
    {
      company: "Uber",
      product: "Batched dispatch",
      usage:
        "Instead of greedy first-come matching, riders and drivers are matched in batches to maximise global assignment quality.",
      href: "https://www.uber.com/blog/engineering/",
    },
    {
      company: "National Resident Matching Program",
      product: "Medical residency match",
      usage:
        "Applicants and hospital programmes are matched by a stable-matching variant of bipartite assignment.",
      href: "https://www.nrmp.org/intro-to-the-match/how-matching-algorithm-works/",
    },
    {
      company: "Google",
      product: "Online ad slot assignment",
      usage:
        "Impressions arrive online and must be matched to advertisers with budget — online bipartite matching theory in production.",
      href: "https://research.google/pubs/pub37409/",
    },
  ],
  references: [
    {
      label: "CP-Algorithms — Kuhn's algorithm for maximum matching",
      href: "https://cp-algorithms.com/graph/kuhn_maximum_bipartite_matching.html",
    },
    {
      label: "NRMP — how the matching algorithm works",
      href: "https://www.nrmp.org/intro-to-the-match/how-matching-algorithm-works/",
    },
  ],
  challenge: {
    prompt:
      "Find the largest set of pairings between two groups where nobody is matched twice. The augmenting-path idea is the same one behind max flow: when a candidate is taken, ask whether its current partner can move elsewhere.",
    entry: "maxMatching",
    starter: `/**
 * @param {number} left - nodes on the left, 0..left-1.
 * @param {number} right - nodes on the right, 0..right-1.
 * @param {Array<[number, number]>} edges - [leftNode, rightNode] pairs.
 * @returns {number} the size of a maximum matching.
 */
function maxMatching(left, right, edges) {
  // For each left node, try to claim a partner. If a candidate is taken, ask
  // its current owner to find a different one -- recursively.
}
`,
    tests: [
      {
        name: "a perfect pairing",
        body: `assertEquals(solution(2, 2, [[0, 0], [1, 1]]), 2);`,
      },
      {
        name: "contention allows only one",
        body: `assertEquals(solution(2, 1, [[0, 0], [1, 0]]), 1);`,
      },
      {
        name: "reassignment finds a bigger matching",
        body: `assertEquals(solution(2, 2, [[0, 0], [1, 0], [0, 1]]), 2);`,
      },
      {
        name: "no edges",
        body: `assertEquals(solution(2, 2, []), 0);`,
      },
      {
        name: "extra candidates do not help beyond the left size",
        body: `assertEquals(solution(1, 3, [[0, 0], [0, 1], [0, 2]]), 1);`,
      },
      {
        name: "a longer augmenting chain",
        body: `assertEquals(solution(3, 3, [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]]), 3);`,
      },
      {
        name: "handles a moderately large instance",
        body: `var edges = [];
for (var i = 0; i < 500; i++) { edges.push([i, i]); edges.push([i, (i + 1) % 500]); }
assertEquals(solution(500, 500, edges), 500);`,
      },
    ],
    hints: [
      "Keep an array recording which left node currently owns each right node, or -1.",
      "Try each left node in turn with a depth-first search over its candidates, using a per-attempt visited set.",
      "If a candidate is owned, recurse on the owner; if the owner can move, take the candidate.",
    ],
    reference: `function maxMatching(left, right, edges) {
  const adj = Array.from({ length: left }, () => []);
  for (const [l, r] of edges) adj[l].push(r);

  const ownerOf = new Array(right).fill(-1);
  let total = 0;

  const tryClaim = (l, seen) => {
    for (const r of adj[l]) {
      if (seen[r]) continue;
      seen[r] = true;
      // Free, or the current owner can be rehoused.
      if (ownerOf[r] === -1 || tryClaim(ownerOf[r], seen)) {
        ownerOf[r] = l;
        return true;
      }
    }
    return false;
  };

  for (let l = 0; l < left; l++) {
    // A fresh visited set per attempt: it guards this search, not the matching.
    if (tryClaim(l, new Array(right).fill(false))) total++;
  }
  return total;
}
`,
  },
};
