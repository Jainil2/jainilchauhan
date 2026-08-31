import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "kv-cache",
  title: "KV Cache",
  category: "AI Systems",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "The LRU cache that decides which conversations stay on the GPU.",
  caption:
    "Add requests and shrink the VRAM budget. Sequences fall out of cache least-recently-used first — exactly the policy you already know, with tokens as the unit and GPU memory as the ceiling.",
  skillTags: ["AI Systems", "Caching", "System Design"],
  bridgesFrom: [
    {
      slug: "lru-cache",
      sameness:
        "It IS an LRU cache. Keys are sequences, values are their attention tensors, and the eviction policy is the same recency ordering you implemented — the least recently touched conversation is the one that goes.",
      delta:
        "The budget is GPU memory rather than entry count, so entries have wildly different sizes. And an eviction is not a miss you refetch — it is a recompute of every token in that sequence, which is why it shows up as a latency spike rather than an error.",
    },
  ],
  concept:
    "A transformer generating token n needs the key and value tensors for tokens 1 through n-1. Recomputing them every step would make generation quadratic, so they are cached — that cache is the KV cache, and it is the single largest consumer of GPU memory during inference.\n\nIts size is roughly 2 * layers * heads * headDim * bytes * tokens, per sequence. For a 70B model that is on the order of hundreds of kilobytes per token, so a handful of long conversations can exhaust an 80GB card. When they do, the server must decide which sequences to keep.\n\nThat decision is ordinary cache eviction. Most servers evict least-recently-used, because a conversation nobody has spoken to in thirty seconds is the cheapest one to lose. The wrinkle is that entries have very different sizes, so the accounting is in tokens rather than entries, and a wrong choice costs a full prefill rather than a cache miss.\n\nPagedAttention, the idea behind vLLM, goes further: it stores the cache in fixed-size blocks like operating-system pages, so memory fragments far less and blocks can be shared between sequences that start with the same prompt.",
  complexity: [
    { operation: "Attention with cache", time: "O(n) per token", space: "O(n) per sequence" },
    { operation: "Attention without cache", time: "O(n²) per token", space: "O(1)" },
    { operation: "Eviction decision", time: "O(1) amortised", space: "O(sequences)" },
  ],
  codeSnippet: {
    language: "py",
    code: `# Per-token KV cache footprint for one sequence.
def kv_bytes_per_token(layers, kv_heads, head_dim, dtype_bytes=2):
    # 2 = one tensor for keys, one for values
    return 2 * layers * kv_heads * head_dim * dtype_bytes

# Llama-3-70B: 80 layers, 8 KV heads (grouped-query), 128 head dim, bf16
per_token = kv_bytes_per_token(80, 8, 128, 2)   # 327,680 bytes ~= 320 KB
seq_8k    = per_token * 8192                    # ~2.5 GB for ONE 8k conversation

# An 80GB card therefore holds ~30 such sequences, cache alone, before weights.
# That is why the eviction policy is a capacity planning decision, not a detail.`,
  },
  realWorld: [
    "vLLM's PagedAttention stores the cache in fixed-size blocks so fragmentation does not strand memory.",
    "Prefix caching lets many requests sharing a system prompt reuse one copy of its KV blocks.",
    "Providers price cached input tokens far below fresh ones, because a cache hit skips the prefill entirely.",
  ],
  pitfalls: [
    "Sizing a deployment on model weights alone. The cache often needs more memory than the weights do.",
    "Treating eviction as free. Evicting mid-conversation forces a full prefill on the next token, which users experience as a sudden stall.",
    "Assuming longer context is free once it fits. Cache cost grows linearly with every token in the window, for every concurrent user.",
  ],
  usedBy: [
    {
      company: "vLLM",
      product: "PagedAttention",
      usage:
        "Splits the KV cache into fixed-size pages so sequences can grow without contiguous allocation, and identical prefixes can share blocks outright.",
      href: "https://blog.vllm.ai/2023/06/20/vllm.html",
    },
    {
      company: "Anthropic",
      product: "Prompt caching",
      usage:
        "Caches the KV state of a long prompt prefix so repeated calls skip prefill, billed at a fraction of the uncached rate.",
      href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
    },
    {
      company: "NVIDIA",
      product: "TensorRT-LLM",
      usage:
        "Offers paged and quantised KV cache modes, and evicts by recency when the configured memory pool fills.",
      href: "https://nvidia.github.io/TensorRT-LLM/",
    },
  ],
  references: [
    {
      label: "vLLM — Efficient memory management with PagedAttention",
      href: "https://blog.vllm.ai/2023/06/20/vllm.html",
    },
    {
      label: "Anthropic — Prompt caching",
      href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
    },
  ],
  challenge: {
    prompt:
      "Decide which sequences keep their KV cache when GPU memory runs short. Given each sequence's token count and when it was last touched, plus a memory budget, return the surviving sequence ids in ascending order. Same eviction policy as the LRU cache you already built — the unit is tokens, not entries.",
    entry: "evictSequences",
    starter: `/**
 * @param {Array<{id: number, tokens: number, lastTouched: number}>} sequences
 * @param {number} budget - total tokens of KV cache that fit in memory.
 * @returns {number[]} ids that stay resident, ascending.
 */
function evictSequences(sequences, budget) {
  // Most recently touched wins. Entries have different sizes, so this is a
  // token budget rather than a count -- keep taking while the next one fits.
}
`,
    tests: [
      {
        name: "everything fits",
        body: `assertEquals(solution([{ id: 1, tokens: 4, lastTouched: 1 }], 10), [1]);`,
      },
      {
        name: "drops the least recently touched",
        body: `var s = [
  { id: 1, tokens: 6, lastTouched: 1 },
  { id: 2, tokens: 6, lastTouched: 5 },
];
assertEquals(solution(s, 6), [2]);`,
      },
      {
        name: "returns survivors in id order, not recency order",
        body: `var s = [
  { id: 1, tokens: 2, lastTouched: 9 },
  { id: 2, tokens: 2, lastTouched: 1 },
  { id: 3, tokens: 2, lastTouched: 5 },
];
assertEquals(solution(s, 4), [1, 3]);`,
      },
      {
        name: "a sequence too large for the budget never fits",
        body: `assertEquals(solution([{ id: 1, tokens: 100, lastTouched: 9 }], 10), []);`,
      },
      {
        name: "a smaller older sequence can survive when a newer one does not fit",
        body: `// Budget accounting is per token, so a huge recent sequence does not
// automatically displace everything smaller.
var s = [
  { id: 1, tokens: 3, lastTouched: 1 },
  { id: 2, tokens: 50, lastTouched: 9 },
];
assertEquals(solution(s, 5), [1]);`,
      },
      {
        name: "zero budget evicts everything",
        body: `assertEquals(solution([{ id: 1, tokens: 1, lastTouched: 1 }], 0), []);`,
      },
      { name: "no sequences", body: `assertEquals(solution([], 10), []);` },
      {
        name: "handles many sequences",
        body: `var s = [];
for (var i = 1; i <= 5000; i++) s.push({ id: i, tokens: 10, lastTouched: i });
var out = solution(s, 100);
assertEquals(out.length, 10);
assertEquals(out[9], 5000);`,
      },
    ],
    hints: [
      "Sort by lastTouched descending first — that is the recency order eviction uses.",
      "Walk that order accumulating tokens, keeping a sequence only while it still fits the budget.",
      "Do not stop at the first sequence that does not fit; a later, smaller one may still fit the remaining room.",
    ],
    reference: `function evictSequences(sequences, budget) {
  // Most recently touched first: the conversation nobody has spoken to is the
  // cheapest one to lose.
  const byRecency = sequences.slice().sort((a, b) => b.lastTouched - a.lastTouched);

  const kept = [];
  let used = 0;
  for (const seq of byRecency) {
    // Keep scanning rather than breaking: entries have very different sizes,
    // so a smaller one further down the list may still fit.
    if (used + seq.tokens > budget) continue;
    used += seq.tokens;
    kept.push(seq.id);
  }
  return kept.sort((a, b) => a - b);
}
`,
  },
};
