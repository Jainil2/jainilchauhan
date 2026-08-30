import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "attention",
  title: "Attention as a Lookup Table",
  category: "AI Systems",
  difficulty: "Advanced",
  readingTimeMin: 7,
  blurb: "Query, key, value — a hash table where every key matches a little.",
  caption:
    "Move the query and watch the weights redistribute. Nothing is ever missing and nothing is ever exact: every key gets a share, and the answer is the blend.",
  skillTags: ["AI Systems", "Transformers", "Linear Algebra"],
  bridgesFrom: [
    {
      slug: "hash-table",
      sameness:
        "The vocabulary is not a metaphor. Attention has queries, keys and values, and it does the same thing your hash table did: present a query, find the keys it matches, return the associated values.",
      delta:
        "The match is soft. Instead of one bucket, every key gets a weight from the softmax and the result is the weighted sum of all values — so there is no miss, no collision, and no 'not found'. That is also the cost: a lookup is O(n) in the number of keys, not O(1), and with n keys per query the whole layer is O(n²).",
    },
    {
      slug: "sparse-matrix",
      sameness:
        "The attention matrix is n×n and, in a decoder, structurally half empty — no position may attend to a future one, so everything above the diagonal is masked out. You already know how to represent and skip that triangle.",
      delta:
        "Those zeros are a rule rather than absent data, so they cannot be dropped from the layout: the mask is applied before the softmax, as -∞, because a zero score is still a real weight after exponentiating. And the dense half is what hurts — it grows quadratically with context length, which is why FlashAttention tiles the computation instead of ever materialising the matrix.",
    },
  ],
  concept:
    "Every token in a sequence produces three vectors by linear projection: a query (what am I looking for), a key (what do I offer), and a value (what I hand over if chosen). Attention scores each query against every key with a dot product, turns those scores into weights with a softmax, and returns the weighted sum of the values.\n\nThe dot products are divided by the square root of the head dimension first. Without it, scores in a 128-dimensional head grow large enough that the softmax saturates — one weight goes to 1, the rest to 0 — and gradients vanish. That single √d is the difference between a distribution and an argmax.\n\nThe softmax itself is always computed by subtracting the row maximum before exponentiating. It changes nothing mathematically, since the constant cancels between numerator and denominator, and it is the only thing standing between a large score and an overflow to Infinity, which becomes NaN the moment it is divided.\n\nDecoders add a causal mask: position i may attend to positions ≤ i only. It is applied as -∞ on the scores rather than zero on the weights, because zero is a perfectly ordinary score and would still receive weight after exponentiation.\n\nWhat makes this expensive is the shape. Every query touches every key, so time and memory grow with the square of the sequence length. FlashAttention makes it fast by never storing the n×n matrix — it tiles the computation and keeps a running softmax — and grouped-query attention makes it cheaper by sharing keys and values across several query heads, which is also what shrinks the KV cache.",
  complexity: [
    { operation: "One query against n keys", time: "O(n · d)", space: "O(n)" },
    { operation: "Full self-attention", time: "O(n² · d)", space: "O(n²) naive, O(n) tiled" },
    { operation: "Softmax over a row", time: "O(n)", space: "O(1) streaming" },
    { operation: "KV cache per sequence", time: "—", space: "O(n · d) per layer" },
  ],
  codeSnippet: {
    language: "py",
    code: `import numpy as np

def attend(q, K, V, mask=None):
    scores = K @ q / np.sqrt(q.shape[-1])   # sqrt(d) or the softmax saturates
    if mask is not None:
        scores = np.where(mask, scores, -np.inf)   # -inf, not 0: 0 is a real score
    scores = scores - scores.max()          # cancels out; prevents overflow
    w = np.exp(scores)
    w /= w.sum()
    return w @ V                            # every key contributes something

# The shape is the cost. n=4k, d=128, one head:
#   scores matrix = 4096 * 4096 * 4 bytes = 64 MB -- per head, per layer.
# FlashAttention's trick is never allocating it.`,
  },
  realWorld: [
    "FlashAttention tiles the computation with a running softmax, so the n×n matrix is never materialised in HBM.",
    "Grouped-query attention shares K and V across query heads, cutting KV cache size several-fold at nearly equal quality.",
    "Sliding-window and sparse attention variants cap the quadratic term by restricting which keys each query may see.",
  ],
  pitfalls: [
    "Dropping the √d scaling. Training still runs, but the softmax saturates and the model learns badly — a bug with no stack trace.",
    "Masking with zero instead of -∞. A zero score exponentiates to 1, so the masked position keeps a share of the weight.",
    "Exponentiating raw scores. Without subtracting the row max, a large logit overflows to Infinity and the whole row becomes NaN.",
    "Budgeting context length linearly. Doubling the window roughly quadruples attention cost, even when the KV cache grows only twice.",
  ],
  usedBy: [
    {
      company: "Princeton / Stanford",
      product: "FlashAttention",
      usage:
        "IO-aware attention that tiles the computation and keeps a running softmax, avoiding the n×n allocation entirely.",
      href: "https://arxiv.org/abs/2205.14135",
    },
    {
      company: "Google",
      product: "Multi-query / grouped-query attention",
      usage: "Shares key and value heads across query heads, shrinking the KV cache at inference.",
      href: "https://arxiv.org/abs/2305.13245",
    },
    {
      company: "PyTorch",
      product: "scaled_dot_product_attention",
      usage:
        "One call that dispatches to a fused kernel and applies the causal mask without building the matrix.",
      href: "https://pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html",
    },
  ],
  references: [
    {
      label: "Vaswani et al. — Attention Is All You Need",
      href: "https://arxiv.org/abs/1706.03762",
    },
    { label: "Dao et al. — FlashAttention", href: "https://arxiv.org/abs/2205.14135" },
  ],
  challenge: {
    prompt:
      "Implement one attention head's lookup. Score the query against every key with a dot product divided by √d where d is the query's length, turn those scores into weights with a softmax, and return the weighted sum of the values. Two details that are not decoration: the √d, without which the softmax saturates, and subtracting the largest score before exponentiating, without which a large score overflows to Infinity and the row becomes NaN.",
    entry: "attend",
    starter: `/**
 * @param {number[]} query
 * @param {number[][]} keys
 * @param {number[][]} values - one value vector per key.
 * @returns {number[]} the weighted sum of the values.
 */
function attend(query, keys, values) {
  // score_i = dot(query, keys[i]) / sqrt(query.length)
  // weights = softmax(scores), computed after subtracting the max score
  // output  = sum_i weights[i] * values[i]
}
`,
    tests: [
      {
        name: "a single key returns its value unchanged",
        body: `var out = solution([1, 0], [[1, 0]], [[5, 7]]);
assert(Math.abs(out[0] - 5) < 1e-9, "expected 5, got " + out[0]);
assert(Math.abs(out[1] - 7) < 1e-9, "expected 7, got " + out[1]);`,
      },
      {
        name: "identical keys split the weight evenly",
        body: `var out = solution([1, 0], [[1, 0], [1, 0]], [[2], [4]]);
assert(Math.abs(out[0] - 3) < 1e-9, "expected the average, got " + out[0]);`,
      },
      {
        name: "every key contributes — there is no miss",
        body: `// The second key points the wrong way, but a soft lookup still gives it
// weight, so the answer cannot be exactly the first value.
var out = solution([1, 0], [[1, 0], [-1, 0]], [[0], [10]]);
assert(out[0] > 0, "a mismatched key must still carry weight, got " + out[0]);
assert(out[0] < 10, "the matching key must dominate, got " + out[0]);`,
      },
      {
        name: "scores are divided by sqrt(d)",
        body: `// d = 4, so the score is 4/2 = 2, not 4. softmax([2, 0])[0] = 0.880797...
// Skipping the scaling gives 0.982014, which this tolerance rejects.
var out = solution([1, 1, 1, 1], [[1, 1, 1, 1], [0, 0, 0, 0]], [[1], [0]]);
assert(Math.abs(out[0] - 0.8807970779778823) < 1e-6, "got " + out[0]);`,
      },
      {
        name: "the weights form a convex combination",
        body: `var out = solution([1, 2], [[3, 1], [0, 2]], [[10], [20]]);
assert(out[0] > 10 && out[0] < 20, "output must lie between the values, got " + out[0]);`,
      },
      {
        name: "huge scores do not overflow to NaN",
        body: `// Without subtracting the max, exp(707106) is Infinity and the row is NaN.
var out = solution([1000, 0], [[1000, 0], [0, 1000]], [[1], [9]]);
assert(Number.isFinite(out[0]), "overflowed: got " + out[0]);
assert(Math.abs(out[0] - 1) < 1e-6, "the dominant key should win outright, got " + out[0]);`,
      },
      {
        name: "very negative scores do not underflow the denominator",
        body: `var out = solution([-1000, 0], [[1000, 0], [-1000, 0]], [[1], [9]]);
assert(Number.isFinite(out[0]), "got " + out[0]);
assert(Math.abs(out[0] - 9) < 1e-6, "got " + out[0]);`,
      },
      {
        name: "handles multi-dimensional values",
        body: `var out = solution([1, 0], [[1, 0], [1, 0]], [[0, 2, 4], [2, 4, 6]]);
assertEquals(out.length, 3);
assert(Math.abs(out[0] - 1) < 1e-9, "got " + out[0]);
assert(Math.abs(out[2] - 5) < 1e-9, "got " + out[2]);`,
      },
      {
        name: "no keys returns nothing to attend to",
        body: `assertEquals(solution([1, 0], [], []), []);`,
      },
      {
        name: "scales to a realistic context length",
        body: `var keys = [];
var values = [];
for (var i = 0; i < 4096; i++) {
  keys.push([i === 4095 ? 40 : 0, 1]);
  values.push([i === 4095 ? 100 : 0]);
}
var out = solution([1, 0], keys, values);
assert(Number.isFinite(out[0]), "got " + out[0]);
assert(out[0] > 99, "the one matching key should dominate 4095 others, got " + out[0]);`,
      },
    ],
    hints: [
      "Compute every score first: dot(query, keys[i]) / Math.sqrt(query.length). Keep them in an array — you need the maximum before you can exponentiate any of them.",
      "Softmax: subtract the max score from each, exponentiate, then divide each by the sum. The subtraction cancels mathematically and is the only thing preventing Infinity / Infinity = NaN.",
      "Accumulate the output as a zero vector the width of a value, then add weights[i] * values[i][j] into it.",
    ],
    reference: `function attend(query, keys, values) {
  if (keys.length === 0) return [];

  const scale = Math.sqrt(query.length);
  const scores = keys.map((key) => {
    let dot = 0;
    for (let i = 0; i < query.length; i++) dot += query[i] * key[i];
    // Without the sqrt(d) the softmax saturates into an argmax.
    return dot / scale;
  });

  // Subtracting the max cancels out of the ratio, and is what keeps exp()
  // from overflowing to Infinity on a large score.
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const total = exps.reduce((a, b) => a + b, 0);

  const width = values[0].length;
  const out = new Array(width).fill(0);
  for (let i = 0; i < values.length; i++) {
    const w = exps[i] / total;
    for (let j = 0; j < width; j++) out[j] += w * values[i][j];
  }
  return out;
}
`,
  },
};
