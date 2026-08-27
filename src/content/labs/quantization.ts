import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "quantization",
  title: "Quantization",
  category: "AI Systems",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Packing weights into fewer bits, the way a bitset packs flags.",
  caption:
    "Drag the bit width down and watch memory fall while error rises. Down to about 8 bits the quantised weight is hard to distinguish from the original; below 4 the model starts forgetting things.",
  skillTags: ["AI Systems", "Memory", "Performance"],
  bridgesFrom: [
    {
      slug: "bitset",
      sameness:
        "It is the same packing you implemented: values that do not need a full machine word share one, and reading a value means an offset plus a mask. Memory falls geometrically with the bits per value.",
      delta:
        "The packed values are approximations rather than exact booleans, so packing now costs accuracy. You also need a scale factor per group to map the small integer range back onto real weights.",
    },
    {
      slug: "huffman-coding",
      sameness:
        "Both spend bits in proportion to how much they matter. Huffman gives frequent symbols shorter codes; quantisation gives each weight group only as many levels as its range justifies.",
      delta:
        "Quantisation is lossy and fixed-width, so it is chosen for predictable memory and fast decode rather than for optimal compression.",
    },
  ],
  concept:
    "A 70B-parameter model in fp16 needs about 140GB of memory just for weights. In int4 it needs roughly 35GB, which is the difference between four data-centre GPUs and one. Since decode is memory-bandwidth-bound, moving fewer bytes per weight also makes generation faster — quantisation buys speed as well as capacity.\n\nThe basic scheme is affine: pick a scale and a zero point that map a group of real weights onto a small integer range, store the integers, and reconstruct with a multiply and an add. Group size matters enormously. One scale for an entire tensor is cheap but crude; a scale per 64 or 128 weights costs a little metadata and preserves far more accuracy, because outliers no longer stretch the range for everyone else.\n\nOutliers are in fact the whole difficulty. Activation distributions in large models contain rare, very large values, and naive quantisation sacrifices precision across all the ordinary weights to accommodate them. GPTQ, AWQ and SmoothQuant each attack that problem differently — by calibrating on real data, by protecting the weights that matter most, or by shifting difficulty from activations into weights.\n\nWeights and activations are usually treated separately. Weight-only quantisation is common and nearly free in quality; quantising activations too gains more speed and is much harder to do without damage.",
  complexity: [
    { operation: "Memory per weight", time: "—", space: "bits ÷ 8 bytes" },
    { operation: "Dequantise", time: "O(1) per weight", space: "O(1)" },
    { operation: "Scale metadata", time: "—", space: "O(weights ÷ groupSize)" },
  ],
  codeSnippet: {
    language: "py",
    code: `def quantize_group(weights, bits=4):
    # Symmetric affine quantisation over one group of weights.
    levels = 2 ** (bits - 1) - 1          # int4 -> 7 usable levels each way
    scale = max(abs(w) for w in weights) / levels

    # A SINGLE outlier stretches this scale for the whole group, which is why
    # group size is the parameter that actually decides quality.
    packed = [round(w / scale) for w in weights]
    return packed, scale

def dequantize(packed, scale):
    return [q * scale for q in packed]

# Group of 128 in int4: 128 * 4 bits of data + one fp16 scale
#   = 64 bytes + 2 bytes, versus 256 bytes in fp16. ~3.9x smaller.`,
  },
  realWorld: [
    "GPTQ quantises layer by layer against calibration data, correcting error as it goes rather than rounding blindly.",
    "AWQ identifies the small fraction of weights that matter most for output quality and keeps them at higher precision.",
    "llama.cpp's k-quant formats mix bit widths within a model, spending more bits on the layers that are most sensitive.",
  ],
  pitfalls: [
    "Quantising to 4 bits and evaluating on perplexity alone. Damage often appears first in long-context and instruction-following behaviour.",
    "Using one scale per tensor. A single outlier then costs precision for every ordinary weight in it.",
    "Expecting proportional speedup. Below the point where the workload stops being memory-bound, fewer bits stop buying time.",
  ],
  usedBy: [
    {
      company: "Meta",
      product: "llama.cpp k-quants",
      usage:
        "Ships mixed-precision formats that assign more bits to sensitive layers, making large models runnable on consumer hardware.",
      href: "https://github.com/ggerganov/llama.cpp",
    },
    {
      company: "MIT Han Lab",
      product: "AWQ",
      usage:
        "Protects the salient weight channels identified from activation statistics, keeping int4 quality close to fp16.",
      href: "https://arxiv.org/abs/2306.00978",
    },
    {
      company: "NVIDIA",
      product: "TensorRT-LLM / FP8",
      usage:
        "Uses hardware fp8 formats on Hopper and later so quantised matmuls run natively rather than being dequantised first.",
      href: "https://nvidia.github.io/TensorRT-LLM/",
    },
  ],
  references: [
    { label: "Frantar et al. — GPTQ", href: "https://arxiv.org/abs/2210.17323" },
    {
      label: "Lin et al. — AWQ: activation-aware weight quantization",
      href: "https://arxiv.org/abs/2306.00978",
    },
  ],
  challenge: {
    prompt:
      "Quantise a group of weights symmetrically and report the worst error. Pick a scale from the group's largest magnitude, round each weight to the nearest level, and reconstruct. Watch what one outlier does to everyone else's precision — that is why group size is the parameter that matters.",
    entry: "quantize",
    starter: `/**
 * @param {number[]} weights
 * @param {number} bits - 2 or more.
 * @returns {{scale: number, reconstructed: number[], maxError: number}}
 *   Symmetric: levels = 2**(bits-1) - 1, scale = maxAbs / levels.
 *   An all-zero group has scale 0 and reconstructs to zeros.
 */
function quantize(weights, bits) {
  // Round to the nearest level, then multiply back by the scale.
}
`,
    tests: [
      {
        name: "the largest weight survives exactly",
        body: `var r = solution([1, 0.5], 8);
assertEquals(r.reconstructed[0], 1);`,
      },
      {
        name: "scale comes from the largest magnitude",
        body: `var r = solution([2, 1], 2);
// bits 2 -> levels = 1, so scale = 2
assertEquals(r.scale, 2);`,
      },
      {
        name: "more bits means less error",
        body: `var w = [0.82, -0.41, 0.13, 0.97];
assert(solution(w, 8).maxError < solution(w, 3).maxError, 'more bits should reduce error');`,
      },
      {
        name: "negative weights are handled symmetrically",
        body: `var r = solution([-1, 1], 8);
assertEquals(r.reconstructed[0], -1);
assertEquals(r.reconstructed[1], 1);`,
      },
      {
        name: "an outlier costs everyone else precision",
        body: `// The same small weight, quantised in a group with and without an outlier.
var tight = solution([0.5, 0.4], 3);
var withOutlier = solution([0.5, 0.4, 100], 3);
assert(withOutlier.maxError > tight.maxError, 'outlier should widen the step');`,
      },
      {
        name: "an all-zero group is a no-op",
        body: `var r = solution([0, 0], 8);
assertEquals(r.scale, 0);
assertEquals(r.reconstructed, [0, 0]);
assertEquals(r.maxError, 0);`,
      },
      {
        name: "an empty group",
        body: `var r = solution([], 8);
assertEquals(r.reconstructed, []);
assertEquals(r.maxError, 0);`,
      },
      {
        name: "error never exceeds half a step",
        body: `var w = [0.82, -0.41, 0.13, 0.97, -0.68, 0.35];
var r = solution(w, 5);
assert(r.maxError <= r.scale / 2 + 1e-9, 'rounding error should be within half a step');`,
      },
    ],
    hints: [
      "levels is 2**(bits-1) - 1, and the scale is the largest absolute weight divided by that.",
      "Reconstruct with Math.round(w / scale) * scale.",
      "Guard the all-zero case before dividing, or every weight becomes NaN.",
    ],
    reference: `function quantize(weights, bits) {
  if (weights.length === 0) return { scale: 0, reconstructed: [], maxError: 0 };

  const levels = Math.pow(2, bits - 1) - 1;
  const maxAbs = Math.max(...weights.map(Math.abs));

  // An all-zero group has no range to map; dividing by it yields NaN.
  if (maxAbs === 0) {
    return { scale: 0, reconstructed: weights.map(() => 0), maxError: 0 };
  }

  // One scale for the whole group, so a single outlier stretches the step for
  // every ordinary weight in it. Smaller groups are the standard fix.
  const scale = maxAbs / levels;
  const reconstructed = weights.map((w) => Math.round(w / scale) * scale);
  const maxError = Math.max(...weights.map((w, i) => Math.abs(w - reconstructed[i])));

  return { scale, reconstructed, maxError };
}
`,
  },
};
