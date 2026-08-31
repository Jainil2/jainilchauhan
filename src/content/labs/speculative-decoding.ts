import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "speculative-decoding",
  title: "Speculative Decoding",
  category: "AI Systems",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Guess ahead cheaply, verify in bulk, keep the prefix that survives.",
  caption:
    "Raise the draft length and the agreement rate and watch the speedup move. Long drafts win big when the draft model agrees and waste compute when it does not.",
  skillTags: ["AI Systems", "Algorithms", "Performance"],
  bridgesFrom: [
    {
      slug: "branch-and-bound",
      sameness:
        "It is the same speculate-then-prune shape you implemented: explore a candidate path cheaply, evaluate it against something authoritative, and discard everything after the point it stops holding up.",
      delta:
        "The cheap explorer is a small language model rather than a bound function, and verification is exact rather than a heuristic — a rejected token costs wasted GPU time but never a wrong answer.",
    },
  ],
  concept:
    "Generating a token requires a full forward pass through the model, and that pass is memory-bandwidth bound: the GPU spends most of its time moving weights, not multiplying. Verifying several tokens costs barely more than verifying one, because the weights move exactly once either way.\n\nSpeculative decoding exploits that asymmetry. A small draft model proposes k tokens sequentially, the large model verifies all k in a single pass, and every token up to the first disagreement is kept. The large model then produces one token itself, so even a completely rejected draft still makes progress.\n\nThe crucial property is that output quality is unchanged. The verification step uses a rejection-sampling rule that preserves the large model's exact output distribution, so this is a pure latency optimisation rather than a quality trade. Speedups of two to three times are typical when the draft agrees often.\n\nTuning k is a real decision. Too small and you barely save a pass; too large and you burn draft compute on tokens nobody keeps. Some systems adapt k based on the recent acceptance rate.",
  complexity: [
    { operation: "Tokens per verify pass", time: "1 + accepted", space: "O(k × context)" },
    { operation: "Draft cost", time: "k × small forward passes", space: "O(k)" },
  ],
  codeSnippet: {
    language: "py",
    code: `def speculative_step(target, draft, prefix, k):
    # 1. Draft k tokens sequentially -- cheap, because the model is small.
    proposals = []
    ctx = list(prefix)
    for _ in range(k):
        tok = draft.sample(ctx)
        proposals.append(tok)
        ctx.append(tok)

    # 2. ONE pass of the big model verifies all k positions at once.
    #    The weights move through memory once, not k times -- that is the win.
    target_probs = target.forward(prefix + proposals)

    # 3. Keep the prefix that survives; stop at the first rejection.
    accepted = []
    for i, tok in enumerate(proposals):
        if not accept(target_probs[i], tok):   # rejection sampling
            break
        accepted.append(tok)

    # 4. The target always contributes one token, so progress is never zero.
    return accepted + [target.sample(prefix + accepted)]`,
  },
  realWorld: [
    "Medusa and EAGLE replace the separate draft model with extra prediction heads on the target model itself.",
    "Prompt lookup decoding drafts by copying n-grams straight out of the prompt, which works remarkably well for summarisation and editing.",
    "Draft models are usually the same family, 10 to 20 times smaller, so their tokenizer and distribution already match.",
  ],
  pitfalls: [
    "Assuming quality changes. Correct rejection sampling leaves the output distribution identical to the target model's.",
    "Raising k without watching acceptance. Past the point where drafts stop being accepted, larger k costs throughput.",
    "Picking a draft model that disagrees often. A mismatched draft can leave you slower than plain decoding.",
  ],
  usedBy: [
    {
      company: "Google DeepMind",
      product: "Speculative sampling",
      usage:
        "Introduced the rejection-sampling scheme that keeps the target model's output distribution exactly intact.",
      href: "https://arxiv.org/abs/2302.01318",
    },
    {
      company: "vLLM",
      product: "Speculative decoding support",
      usage:
        "Supports draft models, n-gram prompt lookup and Medusa-style heads behind one scheduler.",
      href: "https://docs.vllm.ai/en/latest/features/spec_decode.html",
    },
  ],
  references: [
    {
      label: "Leviathan et al. — Fast inference via speculative decoding",
      href: "https://arxiv.org/abs/2211.17192",
    },
    {
      label: "Chen et al. — Accelerating LLM decoding with speculative sampling",
      href: "https://arxiv.org/abs/2302.01318",
    },
  ],
  challenge: {
    prompt:
      "Count the tokens speculative decoding produces. For each verification pass you get the draft's accepted prefix — everything up to the first rejection — plus one token the target model always produces itself. That last part is why a fully rejected draft still makes progress.",
    entry: "tokensProduced",
    starter: `/**
 * @param {boolean[][]} drafts - one array per verify pass; true means the target
 *   model accepted that drafted token.
 * @returns {number} total tokens emitted across all passes.
 */
function tokensProduced(drafts) {
  // Accept the prefix only. A true AFTER a false is not reachable -- the pass
  // stopped at the first rejection.
}
`,
    tests: [
      {
        name: "a fully accepted draft",
        body: `assertEquals(solution([[true, true, true]]), 4);`,
      },
      {
        name: "a fully rejected draft still makes progress",
        body: `assertEquals(solution([[false, false]]), 1);`,
      },
      {
        name: "stops at the first rejection",
        body: `// The trailing true is unreachable: verification already stopped.
assertEquals(solution([[true, false, true]]), 2);`,
      },
      {
        name: "sums across passes",
        body: `assertEquals(solution([[true], [false], [true, true]]), 2 + 1 + 3);`,
      },
      {
        name: "an empty draft is just the target's token",
        body: `assertEquals(solution([[]]), 1);`,
      },
      { name: "no passes", body: `assertEquals(solution([]), 0);` },
      {
        name: "progress is never zero on a pass",
        body: `var drafts = [];
for (var i = 0; i < 50; i++) drafts.push([false, false, false]);
assertEquals(solution(drafts), 50);`,
      },
      {
        name: "handles many passes",
        body: `var drafts = [];
for (var i = 0; i < 10000; i++) drafts.push([true, true]);
assertEquals(solution(drafts), 30000);`,
      },
    ],
    hints: [
      "Per pass, count leading trues and stop at the first false.",
      "Add one for the token the target model emits regardless of the draft's fate.",
      "indexOf(false) gives the accepted count directly, with -1 meaning the whole draft was accepted.",
    ],
    reference: `function tokensProduced(drafts) {
  let total = 0;
  for (const draft of drafts) {
    const firstReject = draft.indexOf(false);
    const accepted = firstReject === -1 ? draft.length : firstReject;
    // +1 for the token the target model produces itself, which is what makes
    // even a fully rejected draft move forward rather than stall.
    total += accepted + 1;
  }
  return total;
}
`,
  },
};
