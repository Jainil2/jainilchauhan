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
};
