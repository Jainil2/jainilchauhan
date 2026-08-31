import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "reranking",
  title: "Reranking",
  category: "AI Systems",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "Top-k twice: a cheap comparator to shortlist, an expensive one to decide.",
  caption:
    "Widen the shortlist and watch the right answer climb into view — then watch the latency bill climb with it. The second stage can only reorder what the first stage handed it.",
  skillTags: ["AI Systems", "Retrieval", "Ranking"],
  bridgesFrom: [
    {
      slug: "heap-priority-queue",
      sameness:
        "This is top-k, the operation you already implemented with a heap: keep the k best seen so far, evict the worst as better ones arrive, never sort the whole input.",
      delta:
        "The comparator changes between stages. Stage one ranks thousands of candidates by a cheap similarity you already have; stage two re-scores a shortlist with a cross-encoder that reads the query and the document together. Comparisons are no longer free — each one is a model call worth roughly ten milliseconds — so the shortlist size, not the heap, is what the design is about.",
    },
    {
      slug: "quickselect",
      sameness:
        "Same insight as quickselect: you never needed the whole ordering, only the boundary between the top group and the rest, so most of the sorting work was waste.",
      delta:
        "Quickselect wins by doing less work on a fixed input. Here the two stages score different things — the cheap score is a proxy, the expensive one is closer to what you actually want — so cutting the shortlist does not merely save time, it discards documents the accurate scorer would have ranked first. A perfect stage-two model cannot recover a document stage one dropped.",
    },
  ],
  concept:
    "Vector search is fast because it compares two vectors that were embedded independently — a bi-encoder. That independence is what lets you embed the corpus once, ahead of time, and it is also the limitation: the document was encoded without ever seeing the query, so subtle relevance is lost.\n\nA cross-encoder reads the query and the document together in one forward pass and scores the pair. It is far more accurate and completely impractical for a corpus, because nothing can be precomputed — scoring a million documents means a million model calls per query.\n\nSo production retrieval is two-stage: retrieve maybe 100 candidates with the cheap index, rerank those 100 with the cross-encoder, return the top 5 or 10. The rerank cost is bounded by the shortlist size rather than the corpus size, which is what makes it affordable at all.\n\nThe shortlist is the whole design decision. Too narrow and stage two never sees the best document — a ceiling no model quality can lift. Too wide and latency and cost climb linearly for diminishing gains. The measurement that matters is recall of the first stage at the shortlist size: if retrieving 100 captures 98% of the truly relevant documents, a reranker over those 100 is working near its ceiling.\n\nThe same shape recurs everywhere: candidate generation then scoring in ads and feeds, coarse index then exact rescoring in vector search, retrieval then an LLM judge in RAG evaluation.",
  complexity: [
    { operation: "Stage 1 shortlist (heap)", time: "O(n log s)", space: "O(s)" },
    { operation: "Stage 2 rerank", time: "O(s) model calls", space: "O(s)" },
    { operation: "Cross-encoding everything", time: "O(n) model calls", space: "O(1)" },
    { operation: "End-to-end latency", time: "index + s·(model call)", space: "—" },
  ],
  codeSnippet: {
    language: "py",
    code: `# The shortlist size is the only real knob, and it is a budget, not a constant.
SHORTLIST = 100     # ~1s of cross-encoder at 10ms per pair, batched
TOP_K     = 5

def search(query, index, reranker):
    shortlist = index.search(query, k=SHORTLIST)      # cheap, precomputed vectors
    scored = reranker.score(query, shortlist)         # one batched forward pass
    return sorted(scored, key=lambda d: -d.score)[:TOP_K]

# Measure stage one's recall AT the shortlist size before touching the model:
#   recall@100 = 0.98  -> the reranker is the bottleneck, buy a better one
#   recall@100 = 0.70  -> 30% of good documents never reach it, widen instead`,
  },
  realWorld: [
    "Cohere Rerank and Voyage rerank-2 are hosted cross-encoders sold specifically as the second stage of a RAG pipeline.",
    "Elasticsearch and OpenSearch expose reranking as a search pipeline step over the first-pass hits.",
    "Recommender systems have used the same candidate-generation-then-ranking split for a decade; RAG rediscovered it.",
  ],
  pitfalls: [
    "Blaming the reranker for a first-stage miss. If retrieval never surfaced the document, no reranker can promote it — measure recall at the shortlist size first.",
    "Reranking the whole corpus in a demo, then discovering the latency at production scale.",
    "Mixing the two scores. Cheap similarity and cross-encoder scores are on unrelated scales; averaging them produces a ranking that is neither.",
    "Dropping the cheap score entirely for absolute thresholds on the reranker output — those thresholds rarely survive a model version bump.",
  ],
  usedBy: [
    {
      company: "Cohere",
      product: "Rerank",
      usage:
        "A hosted cross-encoder built for the second stage; the documented pattern is retrieve 100, rerank to 5.",
      href: "https://docs.cohere.com/docs/reranking",
    },
    {
      company: "Elastic",
      product: "Search pipelines",
      usage:
        "Applies a reranking model as a post-processing step over the first-pass hits, inside the search request.",
      href: "https://www.elastic.co/search-labs/blog/elasticsearch-semantic-reranking",
    },
    {
      company: "Google",
      product: "Vertex AI Ranking API",
      usage: "Standalone ranking endpoint intended to sit behind any retrieval system.",
      href: "https://cloud.google.com/generative-ai-app-builder/docs/ranking",
    },
  ],
  references: [
    {
      label: "Nogueira & Cho — Passage Re-ranking with BERT",
      href: "https://arxiv.org/abs/1901.04085",
    },
    { label: "Cohere — Reranking", href: "https://docs.cohere.com/docs/reranking" },
  ],
  challenge: {
    prompt:
      "Implement a two-stage ranker. Each candidate carries a cheap score already computed by the vector index and an exact score the cross-encoder would produce. Take the best `shortlist` candidates by cheap score, re-rank only those by exact score, and return the top k ids, best first. Higher scores win; ties break by lower id at both stages. A candidate outside the shortlist is gone even if its exact score is the highest in the set — that ceiling is the lesson, not a case to special-case away.",
    entry: "rerank",
    starter: `/**
 * @param {Array<{id: number, cheap: number, exact: number}>} candidates
 * @param {number} shortlist - how many candidates stage two is allowed to score.
 * @param {number} k
 * @returns {number[]} ids of the final top k, best first.
 */
function rerank(candidates, shortlist, k) {
  // Two sorts, two different keys. The second one may only see what the
  // first one passed through.
}
`,
    tests: [
      {
        name: "reorders the shortlist by the exact score",
        body: `var c = [
  { id: 1, cheap: 9, exact: 1 },
  { id: 2, cheap: 8, exact: 5 },
];
assertEquals(solution(c, 2, 2), [2, 1]);`,
      },
      {
        name: "a narrow shortlist loses the best document",
        body: `// Doc 3 has the top exact score but the worst cheap score, so stage one
// never passes it through. No reranker can recover it.
var c = [
  { id: 1, cheap: 9, exact: 2 },
  { id: 2, cheap: 8, exact: 3 },
  { id: 3, cheap: 1, exact: 99 },
];
assertEquals(solution(c, 2, 1), [2]);`,
      },
      {
        name: "widening the shortlist recovers it",
        body: `var c = [
  { id: 1, cheap: 9, exact: 2 },
  { id: 2, cheap: 8, exact: 3 },
  { id: 3, cheap: 1, exact: 99 },
];
assertEquals(solution(c, 3, 1), [3]);`,
      },
      {
        name: "cheap-score ties break by lower id",
        body: `var c = [
  { id: 5, cheap: 7, exact: 1 },
  { id: 2, cheap: 7, exact: 0 },
];
assertEquals(solution(c, 1, 1), [2]);`,
      },
      {
        name: "exact-score ties break by lower id",
        body: `var c = [
  { id: 6, cheap: 9, exact: 4 },
  { id: 3, cheap: 8, exact: 4 },
];
assertEquals(solution(c, 2, 2), [3, 6]);`,
      },
      {
        name: "k smaller than the shortlist truncates after reranking, not before",
        body: `var c = [
  { id: 1, cheap: 9, exact: 1 },
  { id: 2, cheap: 8, exact: 2 },
  { id: 3, cheap: 7, exact: 3 },
];
assertEquals(solution(c, 3, 1), [3]);`,
      },
      {
        name: "k larger than the shortlist returns only what was reranked",
        body: `var c = [
  { id: 1, cheap: 9, exact: 1 },
  { id: 2, cheap: 8, exact: 2 },
  { id: 3, cheap: 7, exact: 3 },
];
assertEquals(solution(c, 2, 10), [2, 1]);`,
      },
      {
        name: "a shortlist of zero returns nothing",
        body: `assertEquals(solution([{ id: 1, cheap: 9, exact: 9 }], 0, 5), []);`,
      },
      { name: "no candidates", body: `assertEquals(solution([], 10, 5), []);` },
      {
        name: "negative scores rank normally",
        body: `var c = [
  { id: 1, cheap: -1, exact: -9 },
  { id: 2, cheap: -5, exact: -2 },
];
assertEquals(solution(c, 2, 1), [2]);`,
      },
      {
        name: "scales to a real first-stage result set",
        body: `var c = [];
for (var i = 0; i < 20000; i++) c.push({ id: i, cheap: i, exact: i % 100 });
// Top 100 by cheap score are ids 19900..19999; among those the best exact
// score is 99, held by id 19999.
assertEquals(solution(c, 100, 1), [19999]);`,
      },
    ],
    hints: [
      "Sort a copy by cheap score descending, tie-breaking on the lower id, and slice to the shortlist size.",
      "Sort that slice again by exact score descending with the same tie-break, then slice to k.",
      "Do not look at the exact score before the shortlist cut — that would be a cross-encoder call per candidate, which is the thing the whole design avoids.",
    ],
    reference: `function rerank(candidates, shortlist, k) {
  // Stage one: the cheap score is all that exists yet. Anything cut here is
  // invisible to the reranker, which is why shortlist size is the design.
  const passed = candidates
    .slice()
    .sort((a, b) => b.cheap - a.cheap || a.id - b.id)
    .slice(0, Math.max(0, shortlist));

  // Stage two: the expensive score, paid only for what survived.
  return passed
    .slice()
    .sort((a, b) => b.exact - a.exact || a.id - b.id)
    .slice(0, k)
    .map((c) => c.id);
}
`,
  },
};
