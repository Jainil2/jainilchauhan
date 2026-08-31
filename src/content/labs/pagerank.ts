import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "pagerank",
  title: "PageRank",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "The logic of influence.",
  caption:
    "See the web through Google's original lens. Watch 'authority' flow between nodes via links. Adjust the damping factor and watch how the most connected and influential pages rise to the top of the rankings.",
  skillTags: ["Algorithms", "Graphs", "Data Science"],
  bridgesFrom: [
    {
      slug: "graph-traversal",
      sameness:
        "It IS a walk over the graph. Start at a node, follow an outgoing edge, repeat — the same neighbour iteration as BFS, with the next step chosen at random rather than from a queue.",
      delta:
        "The walk never ends and never marks anything visited. Each node holds a probability instead of a boolean, and the answer is where that distribution settles after many steps, so there is no termination condition, only a convergence threshold. The walk's failure modes need patching too: a node with no outgoing links traps the surfer and a disconnected region is unreachable, which is exactly what the damping factor's random jump repairs.",
    },
    {
      slug: "sparse-matrix",
      sameness:
        "One iteration IS a sparse matrix-vector multiply. The link structure is a matrix with a non-zero wherever a link exists, the ranks are a vector, and the update multiplies one by the other.",
      delta:
        "The web's link matrix is almost entirely zeros, so the dense form would be billions squared and the sparse form is merely billions — the algorithm is only computable because the representation refuses to store what is not there. Cost per iteration is O(E), not O(V squared), and the whole computation becomes a handful of passes over an edge list, which is why it parallelises across machines so cleanly.",
    },
  ],
  concept:
    "PageRank is the algorithm that launched Google. it measures the importance of website pages by treating links as votes. A page is important if many other pages link to it, especially if those linking pages are themselves important.\n\nIt works via a 'random surfer' model: a user clicks random links, and occasionally jumps to a random page (the **Damping Factor**, usually 0.85). The PageRank of a node is the probability that the surfer ends up there after many steps.\n\nMathematically, it's an eigenvector problem: we repeatedly multiply a probability vector by a transition matrix until it converges.",
  complexity: [
    { operation: "Iteration", time: "O(V + E)", space: "O(V)" },
    { operation: "Convergence", time: "Depends on graph", space: "—" },
  ],
  realWorld: [
    "Search Engines: for ranking web pages by authority.",
    "Social Networks: identifying 'influencers' or key nodes in a social graph.",
    "Bioinformatics: ranking the importance of genes or proteins in biological pathways.",
    "Recommendation Systems: predicting which products a user might like based on graph similarity.",
  ],
  pitfalls: [
    "Link Farms: groups of pages that link to each other to artificially inflate their PageRank.",
    "Dangling Nodes: nodes with no outgoing links can 'drain' the PageRank from the system if not handled with a jump factor.",
  ],
  references: [
    {
      label: "The Anatomy of a Large-Scale Hypertextual Web Search Engine (Brin & Page, 1998)",
      href: "http://infolab.stanford.edu/~backrub/google.html",
    },
  ],
  codeSnippet: {
    language: "py",
    code: `# Power iteration with a damping factor: rank flows along links.
def pagerank(out_links, d=0.85, iters=30):
    nodes = list(out_links)
    n = len(nodes)
    rank = {v: 1 / n for v in nodes}
    for _ in range(iters):
        nxt = {v: (1 - d) / n for v in nodes}          # teleport term
        dangling = sum(rank[v] for v in nodes if not out_links[v])
        for v in nodes:
            share = d * rank[v] / len(out_links[v]) if out_links[v] else 0
            for w in out_links[v]:
                nxt[w] += share
            nxt[v] += d * dangling / n                 # redistribute sinks
        rank = nxt
    return rank`,
  },
  usedBy: [
    {
      company: "Google",
      product: "Search ranking (original algorithm)",
      usage:
        "PageRank scored pages by the random-surfer probability of landing on them; it remains one signal among many today.",
      href: "http://infolab.stanford.edu/~backrub/google.html",
    },
    {
      company: "Twitter / X",
      product: 'WTF "Who to Follow" (personalised PageRank)',
      usage: "Personalised random walks over the follow graph generate account recommendations.",
      href: "https://dl.acm.org/doi/10.1145/2488388.2488433",
    },
    {
      company: "Neo4j",
      product: "Graph Data Science library",
      usage:
        "PageRank ships as a built-in centrality algorithm for influence and importance scoring in enterprise graphs.",
      href: "https://neo4j.com/docs/graph-data-science/current/algorithms/page-rank/",
    },
  ],
  challenge: {
    prompt:
      "Compute PageRank scores by repeatedly redistributing weight along links. The damping factor models a reader who sometimes stops following links and jumps somewhere random, which is also what keeps dangling pages from swallowing all the weight.",
    entry: "pagerank",
    starter: `/**
 * @param {number} n - pages 0..n-1.
 * @param {Array<[number, number]>} edges - [from, to] links.
 * @param {number} damping - probability of following a link, e.g. 0.85.
 * @param {number} iterations - how many rounds to run.
 * @returns {number[]} scores, summing to 1.
 */
function pagerank(n, edges, damping, iterations) {
  // Every page starts at 1/n. A page with NO outgoing links must spread its
  // score across everyone, or weight leaks away every round.
}
`,
    tests: [
      {
        name: "scores always sum to one",
        body: `var s = solution(3, [[0, 1], [1, 2], [2, 0]], 0.85, 20);
var total = 0;
for (var i = 0; i < s.length; i++) total += s[i];
assert(Math.abs(total - 1) < 1e-9, 'sum was ' + total);`,
      },
      {
        name: "a symmetric cycle is uniform",
        body: `var s = solution(3, [[0, 1], [1, 2], [2, 0]], 0.85, 50);
assert(Math.abs(s[0] - s[1]) < 1e-9 && Math.abs(s[1] - s[2]) < 1e-9, 'not uniform');`,
      },
      {
        name: "a page with more inbound links scores higher",
        body: `var s = solution(3, [[0, 2], [1, 2]], 0.85, 50);
assert(s[2] > s[0] && s[2] > s[1], 'hub did not win');`,
      },
      {
        name: "no links leaves everything uniform",
        body: `var s = solution(4, [], 0.85, 10);
for (var i = 0; i < 4; i++) assert(Math.abs(s[i] - 0.25) < 1e-9, 'not uniform');`,
      },
      {
        name: "dangling pages do not leak weight",
        body: `var s = solution(2, [[0, 1]], 0.85, 100);
var total = s[0] + s[1];
assert(Math.abs(total - 1) < 1e-9, 'weight leaked: ' + total);`,
      },
      {
        name: "zero iterations leaves the starting distribution",
        body: `var s = solution(4, [[0, 1]], 0.85, 0);
for (var i = 0; i < 4; i++) assert(Math.abs(s[i] - 0.25) < 1e-9, 'start was not uniform');`,
      },
      {
        name: "a single page holds all the weight",
        body: `var s = solution(1, [], 0.85, 5);
assert(Math.abs(s[0] - 1) < 1e-9, 'expected 1');`,
      },
    ],
    hints: [
      "Start every page at 1/n and build a fresh score array each round rather than updating in place.",
      "Each round begins with the teleport term (1 - damping) / n for every page.",
      "Collect the score of every dangling page and spread it evenly, or the totals shrink each round.",
    ],
    reference: `function pagerank(n, edges, damping, iterations) {
  const out = Array.from({ length: n }, () => []);
  for (const [from, to] of edges) out[from].push(to);

  let score = new Array(n).fill(1 / n);
  for (let round = 0; round < iterations; round++) {
    // Teleport term first: this is the random jump, and it is what keeps the
    // distribution from collapsing.
    const next = new Array(n).fill((1 - damping) / n);

    // A page with no outgoing links would otherwise destroy its own weight.
    let dangling = 0;
    for (let v = 0; v < n; v++) if (out[v].length === 0) dangling += score[v];
    const spread = (damping * dangling) / n;
    for (let v = 0; v < n; v++) next[v] += spread;

    for (let v = 0; v < n; v++) {
      if (out[v].length === 0) continue;
      const share = (damping * score[v]) / out[v].length;
      for (const target of out[v]) next[target] += share;
    }
    score = next;
  }
  return score;
}
`,
  },
};
