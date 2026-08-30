import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "rag-pipeline",
  title: "RAG Retrieval Pipeline",
  category: "AI Systems",
  difficulty: "Advanced",
  readingTimeMin: 7,
  blurb: "Three labs you already finished, in a row — where the recalls multiply.",
  caption:
    "Set each stage's recall and watch the end-to-end number fall out. Three respectable stages compose into a mediocre pipeline, and the model answers confidently from whatever survived.",
  skillTags: ["AI Systems", "Retrieval", "System Design"],
  bridgesFrom: [
    {
      slug: "embeddings",
      sameness:
        "Stage zero is the lab you just did. Chunks are embedded once at ingest, the question is embedded at query time, and relevance is the cosine between them.",
      delta:
        "The two sides are no longer symmetric. A question and the passage answering it rarely look alike — 'why did the deploy fail' and a log excerpt share almost no vocabulary — so query and document are often embedded by different modes of the same model, and pure similarity retrieves things about the topic rather than things that answer it.",
    },
    {
      slug: "ann-search",
      sameness:
        "Stage one is the approximate search you built, with the same recall you already learned to measure against a brute-force baseline.",
      delta:
        "Its misses now arrive somewhere new. A neighbour the graph never visited is not a slightly worse search result any more — it is a passage the model never sees, so the answer comes out fluent, confident and unsupported. Retrieval failures surface as hallucinations, which is why they get blamed on the model.",
    },
    {
      slug: "reranking",
      sameness:
        "Stage two is the two-stage ranker, unchanged: a cheap shortlist, an expensive cross-encoder, the same ceiling set by first-stage recall.",
      delta:
        "There is now a third cut after it that has nothing to do with relevance. The context window is finite, so the best passages are packed until the budget runs out and the rest are dropped — a document can be ranked first by every scorer in the pipeline and still not make it into the prompt.",
    },
  ],
  concept:
    "Retrieval-augmented generation is the three retrieval labs composed, plus one step none of them covers: chunking. Documents are split into passages, each passage is embedded and indexed, a question retrieves candidates, a reranker orders them, and the top few are pasted into the prompt.\n\nThe arithmetic of composition is what surprises people. Each stage has its own recall, and they multiply. A chunker that splits a fact across two passages (0.95), an ANN index at 0.95, a shortlist that captures the right document 0.9 of the time, and a context budget that drops the tail 0.95 of the time compose to about 0.77 — the model sees the supporting passage roughly three times in four, and confidently invents the fourth.\n\nChunking is the least glamorous stage and the most common cause of failure. Too small and a passage loses the context that made it meaningful; too large and one embedding averages several topics and matches none of them. Overlapping windows are the standard mitigation: consecutive chunks repeat their boundary tokens so a sentence straddling a split still appears whole somewhere.\n\nThe framing that keeps a pipeline debuggable is to measure each stage separately against a labelled set. End-to-end answer quality is a single number that tells you nothing about which of four stages lost the passage, and the fix differs completely: rechunk, widen the search, buy a better reranker, or spend more of the window.",
  complexity: [
    { operation: "Ingest (per document)", time: "O(tokens) + embed calls", space: "O(chunks · d)" },
    { operation: "Query", time: "embed + ANN + s reranks", space: "O(s)" },
    { operation: "End-to-end recall", time: "—", space: "product of stage recalls" },
    { operation: "Context assembly", time: "O(s log s)", space: "O(budget)" },
  ],
  codeSnippet: {
    language: "py",
    code: `def answer(question, index, reranker, llm, budget=4000):
    q          = embed(question)
    candidates = index.search(q, k=100)          # ANN recall ~0.95
    ranked     = reranker.rank(question, candidates)   # ceiling set by the above
    context, used = [], 0
    for passage in ranked:                        # relevance order, budget cut
        if used + passage.tokens > budget:
            continue                              # a top-ranked passage can die here
        context.append(passage)
        used += passage.tokens
    return llm(prompt(question, context))

# Measure the stages separately, or you cannot act on the number:
#   chunk 0.95 * ann 0.95 * rerank 0.90 * budget 0.95 = 0.77 end-to-end
# "The model hallucinated" is usually one of those four, not the model.`,
  },
  realWorld: [
    "LangChain and LlamaIndex ship recursive character splitters with overlap because fixed splits break passages mid-fact.",
    "Hybrid retrieval runs BM25 alongside the vector search, since exact identifiers, error codes and names are what embeddings are worst at.",
    "Evaluation suites (RAGAS and similar) score retrieval and generation separately, precisely because the composed number is unactionable.",
  ],
  pitfalls: [
    "Debugging the prompt when retrieval is the problem. If the passage never reached the context, no instruction fixes the answer.",
    "Chunking by character count without overlap. A fact split across a boundary is retrievable from neither half.",
    "Embedding whole documents. One vector averaging five topics matches none of them well.",
    "Assuming a bigger context window ends the problem. More room raises the budget stage's recall and does nothing for the three before it — and cost still scales with what you paste in.",
  ],
  usedBy: [
    {
      company: "LlamaIndex",
      product: "Ingestion pipeline",
      usage:
        "Node parsers with configurable chunk size and overlap, then an index and a postprocessor stage — the same four steps, named.",
      href: "https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/",
    },
    {
      company: "Anthropic",
      product: "Contextual Retrieval",
      usage:
        "Prepends a short generated summary of the surrounding document to each chunk before embedding, which repairs much of what chunking destroys.",
      href: "https://www.anthropic.com/news/contextual-retrieval",
    },
    {
      company: "Elastic",
      product: "Hybrid search (RRF)",
      usage:
        "Fuses BM25 and vector rankings, covering the exact-match queries dense retrieval misses.",
      href: "https://www.elastic.co/search-labs/blog/hybrid-search-elasticsearch",
    },
  ],
  references: [
    {
      label: "Lewis et al. — Retrieval-Augmented Generation",
      href: "https://arxiv.org/abs/2005.11401",
    },
    {
      label: "Anthropic — Introducing Contextual Retrieval",
      href: "https://www.anthropic.com/news/contextual-retrieval",
    },
  ],
  challenge: {
    prompt:
      "Implement the one stage the three source labs do not cover: chunking. Split a token list into overlapping windows of a fixed size, where consecutive windows repeat `overlap` tokens so a fact straddling a boundary still appears whole in one of them. The final window may be short. Reject an overlap that is not smaller than the size — that configuration steps forward by zero or fewer tokens and never terminates, which is a real bug people ship.",
    entry: "chunk",
    starter: `/**
 * @param {string[]} tokens
 * @param {number} size - tokens per chunk.
 * @param {number} overlap - tokens each chunk repeats from the previous one.
 * @returns {string[][]} chunks, in order.
 * @throws if size is not positive, or overlap is not smaller than size.
 */
function chunk(tokens, size, overlap) {
  // The step between chunk starts is size - overlap. If that is not
  // positive there is no valid chunking -- throw rather than loop.
}
`,
    tests: [
      {
        name: "splits evenly with no overlap",
        body: `assertEquals(solution(["a", "b", "c", "d"], 2, 0), [["a", "b"], ["c", "d"]]);`,
      },
      {
        name: "the last chunk may be short",
        body: `assertEquals(solution(["a", "b", "c"], 2, 0), [["a", "b"], ["c"]]);`,
      },
      {
        name: "consecutive chunks repeat the overlap",
        body: `assertEquals(solution(["a", "b", "c", "d", "e"], 3, 1), [
  ["a", "b", "c"],
  ["c", "d", "e"],
]);`,
      },
      {
        name: "a fact spanning a boundary survives in one chunk",
        body: `// Split at size 2 with no overlap, "c d" is torn apart. With overlap 1 it
// appears intact in the second chunk -- the entire reason overlap exists.
var out = solution(["a", "b", "c", "d", "e"], 2, 1);
var joined = out.map(function (c) { return c.join(" "); });
assert(joined.indexOf("c d") !== -1, "expected an intact 'c d' chunk, got " + joined.join(" | "));`,
      },
      {
        name: "a chunk larger than the input yields one chunk",
        body: `assertEquals(solution(["a", "b"], 10, 2), [["a", "b"]]);`,
      },
      {
        name: "does not emit a trailing chunk of pure overlap",
        body: `// step 2 over 4 tokens: starts at 0 and 2. A start at 4 would be empty.
assertEquals(solution(["a", "b", "c", "d"], 3, 1), [["a", "b", "c"], ["c", "d"]]);`,
      },
      { name: "no tokens", body: `assertEquals(solution([], 4, 1), []);` },
      {
        name: "overlap equal to size is rejected",
        body: `assertThrows(function () { solution(["a", "b"], 2, 2); });`,
      },
      {
        name: "overlap larger than size is rejected",
        body: `assertThrows(function () { solution(["a", "b"], 2, 5); });`,
      },
      {
        name: "a non-positive size is rejected",
        body: `assertThrows(function () { solution(["a", "b"], 0, 0); });`,
      },
      {
        name: "chunks a realistic document without stalling",
        body: `var tokens = [];
for (var i = 0; i < 10000; i++) tokens.push("t" + i);
var out = solution(tokens, 512, 64);
// step = 448, so ceil((10000 - 512) / 448) + 1 = 23 chunks.
assertEquals(out.length, 23);
assertEquals(out[0].length, 512);
assertEquals(out[1][0], "t448");`,
      },
    ],
    hints: [
      "step = size - overlap. Validate it before looping: a step of zero or less means the same window forever.",
      "Walk the start index forward by step, slicing size tokens each time. Array.slice already clamps at the end, so the short final chunk needs no special case.",
      "Stop once a chunk reaches the end of the input, or the next start will produce a window made entirely of repeated tokens.",
    ],
    reference: `function chunk(tokens, size, overlap) {
  if (size <= 0) throw new Error("size must be positive");
  // A step of zero or less repeats the same window forever. Throwing beats
  // hanging the tab, and this configuration is a common config-file typo.
  if (overlap >= size) throw new Error("overlap must be smaller than size");

  const step = size - overlap;
  const chunks = [];
  for (let i = 0; i < tokens.length; i += step) {
    chunks.push(tokens.slice(i, i + size));
    // Once a window reaches the end, another start would only re-emit
    // tokens already covered by the overlap.
    if (i + size >= tokens.length) break;
  }
  return chunks;
}
`,
  },
};
