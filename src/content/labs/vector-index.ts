import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "vector-index",
  title: "Vector Index: Recall vs Latency",
  category: "AI Systems",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "The index tradeoff you already know, except now the index can be wrong.",
  caption:
    "Turn nprobe up and down. Every step costs latency and buys recall — and at low nprobe you can watch the true nearest document sit in a cluster the query never opens.",
  skillTags: ["AI Systems", "Retrieval", "Indexing"],
  bridgesFrom: [
    {
      slug: "btree-index",
      sameness:
        "Same bargain as the B-tree index you built: pay memory and write amplification up front so a read touches a few pages instead of the whole table. Clusters are the pages, the centroid list is the root, and choosing how much of the index to open is still the query planner's job.",
      delta:
        "A B-tree read is exact — if the row is there, the index finds it, every time. A vector index answers 'probably'. Opening fewer clusters does not just cost you speed, it silently changes the answer, so the tuning knob is not latency versus throughput but latency versus correctness, measured as recall against a brute-force baseline.",
    },
    {
      slug: "bloom-filter",
      sameness:
        "You have already shipped a structure that trades exactness for size, with an error rate you dial deliberately. Same deal here: a fixed budget buys a fixed quality of answer, and you choose the point on the curve.",
      delta:
        "A Bloom filter's error is one-sided — a false positive, which a lookup in the real store immediately corrects. A vector index errs the other way: it returns false negatives, neighbours it never looked at. There is no cheap verification step, because verifying means the exact scan the index exists to avoid. So the error is invisible in production and must be measured offline.",
    },
  ],
  concept:
    "A vector index is a promise to look at less than everything. IVF — inverted file — is the simplest form: cluster the corpus with k-means, store each vector in its nearest centroid's list, and at query time score only the nprobe clusters whose centroids are closest to the query. With 1024 clusters and nprobe 8, a query touches under 1% of the corpus.\n\nThat is also where recall goes. A true nearest neighbour sitting just across a cluster boundary is never scored, and nothing in the result signals it was missed. Recall@k — the fraction of the true top-k the index actually returned — is therefore measured offline against a brute-force scan, and nprobe (or efSearch on an HNSW index) is chosen as the smallest value that clears the target.\n\nThe curve has a knee. Recall usually climbs steeply for the first few probes, then flattens: going from nprobe 1 to 8 might move recall from 0.6 to 0.95, while 8 to 64 buys 0.98 for eight times the work. Choosing the operating point is the whole job, and it is a product decision — a support bot missing one good passage in twenty is fine, a legal discovery tool is not.\n\nThe other half of the tradeoff is memory. Storing raw float32 vectors is often the largest line item in the bill, so production indexes usually pair the coarse structure with quantisation — the shortlist comes from the index, the scores from compressed codes, and only a final handful are rescored exactly.",
  complexity: [
    { operation: "Exact scan", time: "O(n·d)", space: "O(n·d)" },
    { operation: "IVF query", time: "O(c·d + (n·nprobe/c)·d)", space: "O(n·d)" },
    { operation: "Build (k-means)", time: "O(iters·n·c·d)", space: "O(c·d)" },
    { operation: "Recall measurement", time: "O(q·n·d) brute force", space: "O(q·k)" },
  ],
  codeSnippet: {
    language: "py",
    code: `# Pick the operating point with numbers, not vibes.
def recall_at_k(index, truth, queries, k):
    hits = 0
    for q in queries:
        got = set(index.search(q, k))
        hits += len(got & set(truth[q][:k]))
    return hits / (len(queries) * k)

# Sweep the one knob, then take the cheapest setting that clears the bar.
for nprobe in (1, 2, 4, 8, 16, 32, 64):
    index.nprobe = nprobe
    r = recall_at_k(index, truth, queries, k=10)
    print(nprobe, round(r, 3), index.last_latency_ms)

# Typical shape: 1 -> 0.61, 8 -> 0.95, 64 -> 0.98.
# Eight times the work past the knee buys three points of recall.`,
  },
  realWorld: [
    "FAISS exposes nprobe directly; pgvector's ivfflat exposes the same idea as ivfflat.probes, and HNSW as hnsw.ef_search.",
    "Search teams keep a frozen query set and a brute-force ground truth in CI, so an index config change that drops recall fails the build.",
    "Billion-scale systems combine a coarse index with product quantisation, then exactly rescore the top few hundred.",
  ],
  pitfalls: [
    "Shipping without ever measuring recall. The index is never wrong loudly, so nobody finds out until answers quietly get worse.",
    "Rebuilding the corpus without retraining centroids. Clusters trained on last quarter's data unbalance as the distribution shifts, and recall drifts down with no config change to blame.",
    "Filtering after the search. Retrieving 10 and then dropping the 7 that fail a metadata filter leaves 3 results; the filter has to reach into the search, not sit after it.",
    "Comparing indexes on latency alone. A config is only faster than another if both are measured at the same recall.",
  ],
  usedBy: [
    {
      company: "Meta",
      product: "FAISS",
      usage:
        "IVF, HNSW and PQ as composable index factories, with nprobe as the standard recall dial.",
      href: "https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index",
    },
    {
      company: "Postgres",
      product: "pgvector",
      usage:
        "ivfflat.probes and hnsw.ef_search are ordinary session GUCs, so recall is tunable per query.",
      href: "https://github.com/pgvector/pgvector#index-options",
    },
    {
      company: "Pinecone",
      product: "Serverless index",
      usage:
        "Hides the knob behind a managed target, and publishes recall benchmarks rather than raw latency.",
      href: "https://www.pinecone.io/learn/vector-database/",
    },
  ],
  references: [
    {
      label: "FAISS — Guidelines to choose an index",
      href: "https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index",
    },
    { label: "pgvector — Index options", href: "https://github.com/pgvector/pgvector#indexing" },
  ],
  challenge: {
    prompt:
      "Implement an IVF query. Rank the clusters by how close their centroid is to the query, open only the nearest nprobe of them, and return the ids of the k closest documents found inside those clusters — closest first, ties by lower id. Use squared Euclidean distance. Documents in unopened clusters are invisible, even when one of them is the true nearest: that missed neighbour is the recall you are trading away, so do not go looking for it.",
    entry: "ivfSearch",
    starter: `/**
 * @param {number[]} query
 * @param {Array<{centroid: number[], docs: Array<{id: number, vec: number[]}>}>} clusters
 * @param {number} nprobe - how many clusters to open.
 * @param {number} k
 * @returns {number[]} ids of the k nearest docs among the opened clusters, nearest first.
 */
function ivfSearch(query, clusters, nprobe, k) {
  // Two rankings, same distance function: clusters by centroid, then the
  // docs inside the ones you opened.
}
`,
    tests: [
      {
        name: "opens the nearest cluster and ranks inside it",
        body: `var clusters = [
  { centroid: [0, 0], docs: [{ id: 1, vec: [0, 1] }, { id: 2, vec: [0, 0] }] },
  { centroid: [50, 0], docs: [{ id: 3, vec: [50, 0] }] },
];
assertEquals(solution([0, 0], clusters, 1, 2), [2, 1]);`,
      },
      {
        name: "misses a true nearest neighbour in an unopened cluster",
        body: `// Doc 9 is by far the closest document, but its centroid is the second
// nearest, so nprobe 1 never scores it. That is the recall trade, not a bug.
var clusters = [
  { centroid: [0, 0], docs: [{ id: 1, vec: [3, 0] }] },
  { centroid: [12, 0], docs: [{ id: 9, vec: [1, 0] }] },
];
assertEquals(solution([0, 0], clusters, 1, 1), [1]);`,
      },
      {
        name: "raising nprobe recovers it",
        body: `var clusters = [
  { centroid: [0, 0], docs: [{ id: 1, vec: [3, 0] }] },
  { centroid: [12, 0], docs: [{ id: 9, vec: [1, 0] }] },
];
assertEquals(solution([0, 0], clusters, 2, 1), [9]);`,
      },
      {
        name: "merges results across every opened cluster",
        body: `var clusters = [
  { centroid: [0, 0], docs: [{ id: 1, vec: [2, 0] }] },
  { centroid: [1, 0], docs: [{ id: 2, vec: [1, 0] }] },
  { centroid: [40, 0], docs: [{ id: 3, vec: [40, 0] }] },
];
assertEquals(solution([0, 0], clusters, 2, 2), [2, 1]);`,
      },
      {
        name: "ties between documents break by lower id",
        body: `var clusters = [
  { centroid: [0, 0], docs: [{ id: 8, vec: [0, 2] }, { id: 4, vec: [2, 0] }] },
];
assertEquals(solution([0, 0], clusters, 1, 1), [4]);`,
      },
      {
        name: "nprobe larger than the cluster count opens everything",
        body: `var clusters = [
  { centroid: [0, 0], docs: [{ id: 1, vec: [5, 0] }] },
  { centroid: [9, 0], docs: [{ id: 2, vec: [0, 0] }] },
];
assertEquals(solution([0, 0], clusters, 99, 2), [2, 1]);`,
      },
      {
        name: "k larger than the documents found returns what there is",
        body: `var clusters = [{ centroid: [0, 0], docs: [{ id: 1, vec: [1, 0] }] }];
assertEquals(solution([0, 0], clusters, 1, 10), [1]);`,
      },
      {
        name: "nprobe of zero opens nothing",
        body: `var clusters = [{ centroid: [0, 0], docs: [{ id: 1, vec: [1, 0] }] }];
assertEquals(solution([0, 0], clusters, 0, 3), []);`,
      },
      {
        name: "an empty cluster is opened without breaking the merge",
        body: `var clusters = [
  { centroid: [0, 0], docs: [] },
  { centroid: [3, 0], docs: [{ id: 7, vec: [3, 0] }] },
];
assertEquals(solution([0, 0], clusters, 2, 2), [7]);`,
      },
      {
        name: "scales past a trivial corpus",
        body: `var clusters = [];
for (var c = 0; c < 50; c++) {
  var docs = [];
  for (var i = 0; i < 200; i++) docs.push({ id: c * 1000 + i, vec: [c * 100 + i, 0] });
  clusters.push({ centroid: [c * 100, 0], docs: docs });
}
assertEquals(solution([0, 0], clusters, 1, 3), [0, 1, 2]);`,
      },
    ],
    hints: [
      "Write the squared-distance helper once and use it for both rankings — centroids and documents are scored the same way.",
      "Sort the clusters by centroid distance, slice to nprobe, then flatten the docs of just those clusters.",
      "Rank the flattened docs by distance ascending, falling back to the lower id on a tie, then slice to k.",
    ],
    reference: `function ivfSearch(query, clusters, nprobe, k) {
  function dist(vec) {
    let sum = 0;
    for (let i = 0; i < query.length; i++) {
      const d = vec[i] - query[i];
      sum += d * d;
    }
    return sum;
  }

  // Coarse stage: which lists are worth opening at all.
  const opened = clusters
    .map((c) => ({ cluster: c, d: dist(c.centroid) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, Math.max(0, nprobe));

  // Fine stage: everything in those lists, and nothing else. A nearer vector
  // in an unopened list is simply not part of the answer.
  return opened
    .flatMap((o) => o.cluster.docs)
    .map((doc) => ({ id: doc.id, d: dist(doc.vec) }))
    .sort((a, b) => a.d - b.d || a.id - b.id)
    .slice(0, k)
    .map((doc) => doc.id);
}
`,
  },
};
