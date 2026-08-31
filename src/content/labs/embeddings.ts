import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "embeddings",
  title: "Embeddings & Vector Space",
  category: "AI Systems",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "The sparse row you already know, squashed until direction means meaning.",
  caption:
    "Sweep the query direction and watch the ranking reorder. Cosine ignores length entirely — only the angle counts, which is why the one-line note and the long essay pointing the same way both score 1.00.",
  skillTags: ["AI Systems", "Retrieval", "Linear Algebra"],
  bridgesFrom: [
    {
      slug: "sparse-matrix",
      sameness:
        "A bag-of-words document IS a row of a sparse matrix — one column per vocabulary term, almost every entry zero. You already stored it that way, and you already compared two documents by walking their non-zero entries.",
      delta:
        "An embedding is that row compressed to a few hundred dense dimensions, and the compression is learned rather than structural. The consequence is the whole point: sparse rows overlap only when they share literal tokens, so 'car' and 'automobile' score zero. Dense rows can be close without sharing a single term.",
    },
    {
      slug: "hash-table",
      sameness:
        "It is still key-to-value lookup, and the key is still derived from the content itself rather than assigned.",
      delta:
        "A hash deliberately destroys similarity — one changed character must scatter the key across the table, which is what keeps buckets even. An embedding deliberately preserves it. So there is no exact-match probe and no collision to resolve; 'lookup' becomes 'find the nearest points', and every query returns something, whether or not anything relevant exists.",
    },
  ],
  concept:
    "An embedding maps a piece of content to a fixed-length vector of floats, trained so that content people would call similar lands close together. The vector itself is meaningless in isolation — dimension 47 does not stand for anything nameable. Only the geometry carries information.\n\nAlmost every retrieval system compares those vectors with cosine similarity: the dot product of the two vectors divided by the product of their lengths, which is the cosine of the angle between them. It ranges from 1 (same direction) through 0 (orthogonal, unrelated) to -1 (opposite). Length is divided out on purpose, so a tweet and a whitepaper about the same subject compare on topic rather than on size.\n\nMany production models emit vectors that are already unit length. When they do, cosine similarity and the raw dot product are the same number, and a nearest-neighbour search can skip the normalisation entirely — the reason vector databases ask whether your vectors are normalised before choosing a metric.\n\nThe practical trap is that this space is only as good as what trained it. Embeddings inherit the model's idea of similarity, which is often topical rather than logical: 'the deploy succeeded' and 'the deploy failed' sit very close together, because they are about the same thing while meaning opposite things.",
  complexity: [
    { operation: "Cosine of two vectors", time: "O(d)", space: "O(1)" },
    { operation: "Brute-force top-k over n docs", time: "O(n·d)", space: "O(k)" },
    { operation: "Storing n embeddings", time: "O(1) per write", space: "O(n·d)" },
  ],
  codeSnippet: {
    language: "py",
    code: `import numpy as np

def cosine(a, b):
    # Dividing by both norms is what makes this about direction, not size.
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    return 0.0 if denom == 0 else float(a @ b / denom)

# 1536 dims at float32 = 6 KB per vector.
# 10M documents = ~60 GB before any index overhead -- which is the entire
# reason vector indexes and quantisation exist.
docs = np.random.rand(10_000, 1536).astype("float32")

# If vectors are already unit length, cosine IS the dot product, so the
# normalisation drops out of the hot loop and the search is one matmul.
unit = docs / np.linalg.norm(docs, axis=1, keepdims=True)
scores = unit @ unit[0]        # similarity of every doc to doc 0`,
  },
  realWorld: [
    "RAG pipelines embed every chunk once at ingest, then embed only the question at query time.",
    "Recommendation systems embed users and items into one space, so 'what should this person see' is a nearest-neighbour query.",
    "Deduplication and near-duplicate detection: cluster by cosine rather than by hash, because a hash cannot see 'almost the same'.",
  ],
  pitfalls: [
    "Comparing vectors from two different models. The dimensions are unrelated, so the numbers still compute and the ranking is noise.",
    "Reading cosine as a probability. 0.82 is only meaningful relative to the other scores in the same result set; absolute thresholds tuned on one corpus rarely transfer.",
    "Assuming similar means equivalent. Antonyms and negations are famously close, so 'is safe' can retrieve 'is not safe'.",
    "Embedding a whole document as one vector. The average of many topics points somewhere in between and matches none of them — which is why chunking exists.",
  ],
  usedBy: [
    {
      company: "OpenAI",
      product: "text-embedding-3",
      usage:
        "Returns unit-length vectors and supports truncating dimensions, trading a little accuracy for a smaller index.",
      href: "https://platform.openai.com/docs/guides/embeddings",
    },
    {
      company: "Spotify",
      product: "Annoy",
      usage:
        "Built to serve music recommendations as nearest-neighbour lookups over item embeddings.",
      href: "https://github.com/spotify/annoy",
    },
    {
      company: "Cohere",
      product: "Embed",
      usage:
        "Ships separate query and document embedding modes, because the two sides of a search are not symmetric.",
      href: "https://docs.cohere.com/docs/embeddings",
    },
  ],
  references: [
    {
      label: "OpenAI — Embeddings guide",
      href: "https://platform.openai.com/docs/guides/embeddings",
    },
    {
      label: "Google — Machine Learning Crash Course: Embeddings",
      href: "https://developers.google.com/machine-learning/crash-course/embeddings",
    },
  ],
  challenge: {
    prompt:
      "Implement the search at the bottom of every RAG pipeline: rank documents against a query by cosine similarity and return the ids of the best k, most similar first. Cosine is the dot product over the product of the lengths — so a document pointing the same way wins regardless of how long its vector is. Break ties by lower id, and treat a zero vector as similar to nothing.",
    entry: "topK",
    starter: `/**
 * @param {number[]} query
 * @param {Array<{id: number, vec: number[]}>} docs
 * @param {number} k
 * @returns {number[]} ids of the k most similar docs, most similar first.
 */
function topK(query, docs, k) {
  // cosine(a, b) = dot(a, b) / (norm(a) * norm(b)).
  // A zero vector has no direction -- score it 0 rather than dividing by zero.
}
`,
    tests: [
      {
        name: "picks the document pointing the same way",
        body: `var docs = [
  { id: 1, vec: [0, 1] },
  { id: 2, vec: [1, 0] },
];
assertEquals(solution([1, 0], docs, 1), [2]);`,
      },
      {
        name: "length is divided out — a long vector does not beat a better-aligned short one",
        body: `// doc 1 points exactly at the query but is tiny; doc 2 is enormous and 45 degrees off.
var docs = [
  { id: 1, vec: [0.001, 0] },
  { id: 2, vec: [500, 500] },
];
assertEquals(solution([1, 0], docs, 1), [1]);`,
      },
      {
        name: "orders every result, most similar first",
        body: `var docs = [
  { id: 1, vec: [0, 1] },
  { id: 2, vec: [1, 1] },
  { id: 3, vec: [1, 0] },
];
assertEquals(solution([1, 0], docs, 3), [3, 2, 1]);`,
      },
      {
        name: "ties break by lower id",
        body: `var docs = [
  { id: 7, vec: [2, 0] },
  { id: 3, vec: [9, 0] },
];
assertEquals(solution([1, 0], docs, 1), [3]);`,
      },
      {
        name: "a zero vector matches nothing",
        body: `var docs = [
  { id: 1, vec: [0, 0] },
  { id: 2, vec: [0, 1] },
];
// Orthogonal scores 0 too, so the tie falls to the lower id -- but neither
// may blow up on the division.
assertEquals(solution([1, 0], docs, 2), [1, 2]);`,
      },
      {
        name: "opposite direction ranks below unrelated",
        body: `var docs = [
  { id: 1, vec: [-1, 0] },
  { id: 2, vec: [0, 1] },
];
assertEquals(solution([1, 0], docs, 2), [2, 1]);`,
      },
      {
        name: "k larger than the corpus returns everything",
        body: `assertEquals(solution([1, 0], [{ id: 4, vec: [1, 0] }], 10), [4]);`,
      },
      { name: "empty corpus", body: `assertEquals(solution([1, 0], [], 3), []);` },
      {
        name: "k of zero returns nothing",
        body: `assertEquals(solution([1, 0], [{ id: 1, vec: [1, 0] }], 0), []);`,
      },
      {
        name: "works in higher dimensions",
        body: `var q = [];
for (var i = 0; i < 256; i++) q.push(i % 7);
var docs = [
  { id: 1, vec: q.map(function (v) { return v * 3; }) },   // same direction, 3x length
  { id: 2, vec: q.map(function (v) { return 7 - v; }) },
];
assertEquals(solution(q, docs, 1), [1]);`,
      },
    ],
    hints: [
      "Write cosine first: dot product of the two arrays, divided by the product of their Euclidean norms.",
      "Guard the division — if either norm is 0 there is no angle, so return 0 instead of NaN.",
      "Sort by score descending, and when two scores are equal fall back to the lower id, then slice to k.",
    ],
    reference: `function topK(query, docs, k) {
  function cosine(a, b) {
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    // No direction, so no angle -- 0 rather than NaN.
    return denom === 0 ? 0 : dot / denom;
  }

  return docs
    .map((d) => ({ id: d.id, score: cosine(query, d.vec) }))
    // Descending score; equal scores fall back to id so the ranking is stable
    // across engines rather than depending on sort implementation.
    .sort((a, b) => b.score - a.score || a.id - b.id)
    .slice(0, k)
    .map((d) => d.id);
}
`,
  },
};
