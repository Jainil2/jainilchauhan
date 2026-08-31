import type { Track } from "./types";

/**
 * Guided routes through the catalogue.
 *
 * A track is an ordering, nothing more — the labs own all their own content, so
 * a track can never drift from what it points at. `scripts/generate-content.mjs`
 * fails the build if a step names a lab that does not exist.
 *
 * Ordering rule: a lab should not appear before something it bridges from.
 * Otherwise the "you already know this" card at the top of it is a lie for
 * anyone following the track in order.
 */
export const tracks: Track[] = [
  {
    slug: "foundations",
    title: "Data structures, end to end",
    blurb:
      "The structures everything else is built out of, in the order that each one explains the next.",
    outcome:
      "You can pick the right structure for a problem and say what it costs, rather than reaching for a hash map every time.",
    steps: [
      "array",
      "dynamic-array",
      "linked-list",
      "stack",
      "queue",
      "hash-table",
      "binary-tree",
      "binary-search-tree",
      "heap-priority-queue",
      "trie",
      "lru-cache",
    ],
  },
  {
    slug: "algorithms",
    title: "The algorithms that keep showing up",
    blurb:
      "For anyone who can code but freezes at 'what algorithm is this' — search and sort first, then graphs, then the two ways of not recomputing.",
    outcome:
      "You can recognise a problem as a search, a sort, a graph walk or an overlapping-subproblem recurrence, and reach for the right one without looking it up.",
    steps: [
      "binary-search",
      "sorting-race",
      "merge-sort-recursion",
      "quickselect",
      "heap-sort",
      "graph-representations",
      "graph-traversal",
      "topological-sort",
      "dijkstra",
      "fibonacci-memoization",
      "knapsack",
      "huffman-coding",
    ],
  },
  {
    slug: "distributed",
    title: "One machine to many",
    blurb:
      "For someone who has shipped a service and is now being asked to run several — starts at a single node under load and ends at agreement between nodes that cannot trust each other.",
    outcome:
      "You can say where a design loses consistency, what it does when a dependency is slow rather than down, and why a system needs consensus at all.",
    steps: [
      "load-balancer",
      "rate-limiter",
      "backpressure",
      "circuit-breaker",
      "message-queue",
      "consistent-hashing",
      "sharding-replication",
      "snowflake-id",
      "cap-theorem",
      "vector-clocks",
      "crdt-counter",
      "raft-election",
      "distributed-tx",
    ],
  },
  {
    slug: "ai-systems",
    title: "Inside an LLM system",
    blurb:
      "For an engineer who uses model APIs and wants to know what is happening behind them — from the tokenizer through retrieval and serving to the failure modes nobody logs.",
    outcome:
      "You can reason about an LLM feature the way you reason about any other system: where the latency is, where the memory goes, what the bill scales with, and which layer is lying to you when the answer is wrong.",
    steps: [
      "tokenization",
      "embeddings",
      "attention",
      "kv-cache",
      "vector-index",
      "ann-search",
      "reranking",
      "rag-pipeline",
      "semantic-cache",
      "continuous-batching",
      "quantization",
      "inference-cost",
      "agent-loop",
      "prompt-injection",
    ],
  },
  {
    slug: "the-spine",
    title: "The spine",
    blurb:
      "The argument of this whole site in one ordering: seven things you probably already know, then the seven AI systems that turn out to be those same things wearing different words.",
    outcome:
      "You can open any paper or vendor page about LLM infrastructure and name the data structure underneath it — and say precisely where the analogy stops holding, which is the part that actually costs you.",
    /**
     * Every step in the back half bridges from a step in the front half, and
     * from one that comes strictly earlier. Read in order, no lab's "you
     * already know this" card is claiming something the reader has not done:
     *
     *   trie              → tokenization
     *   hash-table        → embeddings, attention
     *   sparse-matrix     → embeddings, attention
     *   btree-index       → vector-index
     *   lru-cache         → kv-cache, semantic-cache
     *   consistent-hashing → semantic-cache
     *   rate-limiter      → inference-cost
     */
    steps: [
      "hash-table",
      "lru-cache",
      "trie",
      "sparse-matrix",
      "btree-index",
      "consistent-hashing",
      "rate-limiter",
      "tokenization",
      "embeddings",
      "attention",
      "vector-index",
      "kv-cache",
      "semantic-cache",
      "inference-cost",
    ],
  },
];
