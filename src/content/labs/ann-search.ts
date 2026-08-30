import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "ann-search",
  title: "ANN Search & HNSW",
  category: "AI Systems",
  difficulty: "Advanced",
  readingTimeMin: 7,
  blurb: "A skip list whose ordering is distance — so greedy descent can get it wrong.",
  caption:
    "Drop a query anywhere and watch the greedy walk. Add layers and it lands on the true nearest point; take them away and it strands on a local minimum — a miss the search cannot detect.",
  skillTags: ["AI Systems", "Retrieval", "Graphs"],
  bridgesFrom: [
    {
      slug: "skip-list",
      sameness:
        "HNSW IS a skip list. A sparse top layer takes huge strides across the whole set, each layer below is denser, and you descend a layer the moment the current one stops improving — the same express-lane-then-local-lane trick you already implemented, with the same probabilistic layer assignment per node.",
      delta:
        "A skip list keys on a total order, so 'too far, drop a level' is always correct. Distance in 300 dimensions gives no total order, so the greedy walk is a heuristic: it can settle on a point that beats all its neighbours while a nearer one sits elsewhere in the graph. A skip list never returns the wrong node. This does, and cannot tell you when it has.",
    },
    {
      slug: "quadtree",
      sameness:
        "Same premise as the quadtree: partition space so a lookup touches a small region rather than every point, and let the structure of the data decide where the cuts go.",
      delta:
        "Recursive partitioning collapses past roughly ten dimensions — the cells needed to cover the space outgrow the points, and every query ends up touching most of them anyway. So high-dimensional search abandons partitioning for a navigable graph: nodes hold links to a few near neighbours plus a couple of deliberately long-range ones, and you walk edges instead of descending cells.",
    },
  ],
  concept:
    "Exact nearest-neighbour search over n vectors costs a full scan, O(n·d). At ten million 1536-dimensional vectors that is tens of gigaflops per query, so production systems give up exactness and accept an approximate answer that is right most of the time — approximate nearest neighbour, ANN.\n\nHNSW is the dominant approach. It builds a layered proximity graph: every node links to a handful of near neighbours, and nodes are promoted to sparser upper layers with exponentially decaying probability, exactly as skip-list levels are assigned. A query enters at the top layer, greedily hops to whichever neighbour is closer to the query, and drops a layer when no neighbour improves. The top layers cross the space in a few hops; the bottom layer does the fine-grained work.\n\nThe search is greedy, so it can halt at a local minimum. Real implementations soften this by keeping a candidate list of size efSearch rather than a single current node, exploring the best unvisited candidates until none of them improves the worst of the current best set. Larger efSearch means more of the graph explored, higher recall, and more latency — the one knob most teams ever touch.\n\nThe cost is on the build side and in memory: the graph itself typically adds tens of percent on top of the raw vectors, and inserts are far more expensive than appends to a flat array. Deletes are worse — most implementations only tombstone, and reclaim on a rebuild.",
  complexity: [
    { operation: "Exact scan", time: "O(n·d)", space: "O(1)" },
    { operation: "HNSW query", time: "~O(log n · d · efSearch)", space: "O(efSearch)" },
    { operation: "HNSW insert", time: "~O(log n · d · efConstruction)", space: "O(M) links/node" },
    { operation: "Graph overhead", time: "—", space: "O(n·M) links" },
  ],
  codeSnippet: {
    language: "py",
    code: `# The whole search, minus the candidate list that turns it from greedy
# into beam search.
def greedy_search(graph, vectors, entry, query, dist):
    current = entry
    best = dist(vectors[current], query)
    while True:
        moved = False
        for nbr in graph[current]:
            d = dist(vectors[nbr], query)
            if d < best:                # strictly better, or this never halts
                current, best, moved = nbr, d, True
        if not moved:
            return current              # local minimum -- possibly not the global one

# efSearch is the recall dial: keep the ef best candidates instead of one
# current node, and a single bad hop stops being fatal.`,
  },
  realWorld: [
    "pgvector, Qdrant, Weaviate, Milvus and Elasticsearch all ship HNSW as the default index for dense vectors.",
    "FAISS pairs it with quantisation — HNSW to narrow the candidates, compressed codes to score them cheaply.",
    "Search teams tune recall offline against a brute-force ground truth, then pick the smallest efSearch that clears their target.",
  ],
  pitfalls: [
    "Treating results as exact. A missing neighbour never raises an error; it looks like a slightly worse answer, which is why recall must be measured against a brute-force baseline rather than assumed.",
    "Tuning efSearch on a small corpus. The setting that gives 99% recall over 100k vectors can fall well short at 10M.",
    "Ignoring delete behaviour. Tombstoned vectors keep occupying graph links and memory until a rebuild, so a high-churn collection degrades quietly.",
    "Building the index with the wrong metric. Cosine and L2 rank differently unless the vectors are unit length, and the index cannot detect the mismatch.",
  ],
  usedBy: [
    {
      company: "Meta",
      product: "FAISS",
      usage:
        "Reference library for billion-scale ANN, combining HNSW graphs with product quantisation to keep vectors in RAM.",
      href: "https://github.com/facebookresearch/faiss",
    },
    {
      company: "Postgres",
      product: "pgvector",
      usage:
        "Adds HNSW and IVFFlat indexes to ordinary SQL, so retrieval lives in the database already holding the rows.",
      href: "https://github.com/pgvector/pgvector",
    },
    {
      company: "Qdrant",
      product: "Vector database",
      usage:
        "HNSW with payload filtering applied during the graph walk rather than after it, so filtered queries keep their recall.",
      href: "https://qdrant.tech/documentation/concepts/indexing/",
    },
  ],
  references: [
    {
      label:
        "Malkov & Yashunin — Efficient and robust approximate nearest neighbor search using HNSW",
      href: "https://arxiv.org/abs/1603.09320",
    },
    {
      label: "Pinecone — HNSW explained",
      href: "https://www.pinecone.io/learn/series/faiss/hnsw/",
    },
  ],
  challenge: {
    prompt:
      "Implement the greedy walk at the heart of HNSW. Starting at an entry node, repeatedly hop to whichever linked neighbour is strictly closer to the query, and return the node where no neighbour improves. Use squared Euclidean distance — the square root changes nothing about the ordering. Two things this must survive: cycles in the link graph, and the fact that the node you halt on may not be the nearest one in the set. That second one is not a bug to fix; it is what 'approximate' means.",
    entry: "greedySearch",
    starter: `/**
 * @param {Array<{id: number, vec: number[], links: number[]}>} nodes
 * @param {number} entry - id of the node the walk starts from.
 * @param {number[]} query
 * @returns {number} id of the node where the walk halts.
 */
function greedySearch(nodes, entry, query) {
  // Hop only on a STRICT improvement -- equal distance must not move, or a
  // pair of equidistant nodes bounces forever.
}
`,
    tests: [
      {
        name: "halts immediately when the entry is already the best of its neighbourhood",
        body: `var nodes = [
  { id: 1, vec: [0, 0], links: [2] },
  { id: 2, vec: [9, 9], links: [1] },
];
assertEquals(solution(nodes, 1, [0, 0]), 1);`,
      },
      {
        name: "walks a chain toward the query",
        body: `var nodes = [
  { id: 1, vec: [0, 0], links: [2] },
  { id: 2, vec: [3, 0], links: [1, 3] },
  { id: 3, vec: [6, 0], links: [2] },
];
assertEquals(solution(nodes, 1, [6, 0]), 3);`,
      },
      {
        name: "strands on a local minimum — the nearest node is not linked in",
        body: `// Node 4 is the true nearest, but nothing on the walk links to it.
// A correct greedy search returns 2. This is the recall miss HNSW pays for.
var nodes = [
  { id: 1, vec: [0, 0], links: [2] },
  { id: 2, vec: [4, 0], links: [1, 3] },
  { id: 3, vec: [0, 8], links: [2] },
  { id: 4, vec: [9, 0], links: [3] },
];
assertEquals(solution(nodes, 1, [10, 0]), 2);`,
      },
      {
        name: "does not loop forever on a cycle",
        body: `var nodes = [
  { id: 1, vec: [0, 0], links: [2, 3] },
  { id: 2, vec: [1, 0], links: [1, 3] },
  { id: 3, vec: [2, 0], links: [1, 2] },
];
assertEquals(solution(nodes, 1, [2, 0]), 3);`,
      },
      {
        name: "an equidistant neighbour is not an improvement",
        body: `// Both sit exactly 5 from the query; moving on a tie would ping-pong.
var nodes = [
  { id: 1, vec: [-5, 0], links: [2] },
  { id: 2, vec: [5, 0], links: [1] },
];
assertEquals(solution(nodes, 1, [0, 0]), 1);`,
      },
      {
        name: "picks the best neighbour, not merely the first better one",
        body: `var nodes = [
  { id: 1, vec: [0, 0], links: [2, 3] },
  { id: 2, vec: [2, 0], links: [] },
  { id: 3, vec: [9, 0], links: [] },
];
assertEquals(solution(nodes, 1, [10, 0]), 3);`,
      },
      {
        name: "a node with no links halts there",
        body: `assertEquals(solution([{ id: 1, vec: [0, 0], links: [] }], 1, [99, 99]), 1);`,
      },
      {
        name: "crosses a long chain without stack or time blowup",
        body: `var nodes = [];
for (var i = 0; i < 5000; i++) {
  nodes.push({ id: i, vec: [i, 0], links: i + 1 < 5000 ? [i + 1] : [] });
}
assertEquals(solution(nodes, 0, [4999, 0]), 4999);`,
      },
      {
        name: "works in higher dimensions",
        body: `var nodes = [
  { id: 1, vec: [0, 0, 0, 0], links: [2] },
  { id: 2, vec: [1, 1, 1, 1], links: [1, 3] },
  { id: 3, vec: [2, 2, 2, 2], links: [2] },
];
assertEquals(solution(nodes, 1, [2, 2, 2, 2]), 3);`,
      },
    ],
    hints: [
      "Index the nodes by id once up front — the walk looks up neighbours by id on every hop, and a linear scan each time turns the search quadratic.",
      "Squared Euclidean distance is the sum of (a[i] - b[i])² — skip the square root, it does not change which node is closer.",
      "Loop until a pass over the current node's links produces no strict improvement, then return that node. Requiring strict improvement is also what makes a cycle safe.",
    ],
    reference: `function greedySearch(nodes, entry, query) {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  function dist(vec) {
    // Squared distance: monotonic in the real distance, so the ordering is
    // identical and the sqrt is wasted work.
    let sum = 0;
    for (let i = 0; i < query.length; i++) {
      const d = vec[i] - query[i];
      sum += d * d;
    }
    return sum;
  }

  let current = byId.get(entry);
  let best = dist(current.vec);

  for (;;) {
    let next = null;
    for (const id of current.links) {
      const nbr = byId.get(id);
      if (!nbr) continue;
      const d = dist(nbr.vec);
      // Strictly better only. An equal-distance hop would let two nodes
      // bounce off each other forever, cycle or not.
      if (d < best) {
        best = d;
        next = nbr;
      }
    }
    if (!next) return current.id; // local minimum -- not necessarily the global one
    current = next;
  }
}
`,
  },
};
