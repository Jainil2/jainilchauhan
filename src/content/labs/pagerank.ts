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
};
