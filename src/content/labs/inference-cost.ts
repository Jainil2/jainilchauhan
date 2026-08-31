import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "inference-cost",
  title: "Inference Cost & Latency Budgets",
  category: "AI Systems",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "A token bucket where the tokens cost money and the refill is a GPU.",
  caption:
    "Move the token counts and the concurrency. Output tokens dominate both cost and latency because they are generated one at a time — trimming a prompt feels productive, capping the response usually is.",
  skillTags: ["AI Systems", "Cost", "System Design"],
  bridgesFrom: [
    {
      slug: "rate-limiter",
      sameness:
        "It is the token bucket you implemented, with the units changed. A budget refills over time, each request draws from it, and exceeding the rate means queueing or rejection.",
      delta:
        "The tokens are literally the model's tokens, priced differently for input and output, so the bucket is denominated in money as well as in requests per second.",
    },
    {
      slug: "load-balancer",
      sameness:
        "Capacity planning is the same arithmetic: concurrency divided by service time gives throughput, and offered load above that queues.",
      delta:
        "Service time is not roughly constant. It scales with the number of output tokens, so two requests to the same endpoint can differ by a factor of fifty and capacity is a moving target.",
    },
  ],
  concept:
    "Serving a language model has two cost centres that behave completely differently. Prefill processes the whole prompt in parallel and is compute-bound; decode produces one token at a time and is memory-bandwidth-bound. Prefill is cheap per token and fast; decode is expensive per token and sets the latency.\n\nThat asymmetry is why providers price output tokens several times higher than input, and why latency tracks output length almost linearly while barely responding to prompt size. A 20,000-token prompt with a 50-token answer returns quickly. A 200-token prompt with a 2,000-token answer does not.\n\nCapacity follows from the same fact. With C concurrent slots and a service time of roughly outputTokens × msPerToken, throughput is C divided by that service time. Offered load above it does not degrade gracefully — requests queue, queueing raises latency, and latency lowers throughput further. A rate limiter in front is what stops that from becoming a timeout cascade.\n\nThe practical levers, in rough order of effect: cap output length, cache prompt prefixes, route easy requests to a smaller model, and only then negotiate on price.",
  complexity: [
    { operation: "Prefill", time: "O(prompt) parallel", space: "O(prompt) KV" },
    { operation: "Decode", time: "O(output) serial", space: "O(prompt + output) KV" },
    { operation: "Capacity", time: "concurrency ÷ service time", space: "—" },
  ],
  codeSnippet: {
    language: "ts",
    code: `const IN_PER_M = 3;    // dollars per million input tokens
const OUT_PER_M = 15;  // output is ~5x, because it is generated serially

function costPerCall(inputTokens: number, outputTokens: number) {
  return (inputTokens / 1e6) * IN_PER_M + (outputTokens / 1e6) * OUT_PER_M;
}

// A 20k-token prompt with a 50-token answer costs LESS than a 200-token
// prompt with a 2k answer, and returns far sooner. Prompt size is rarely
// the thing worth optimising first.
costPerCall(20_000, 50);   // $0.06075
costPerCall(200, 2_000);   // $0.03060  <- cheaper, but ~40x the latency

// Capacity is concurrency over service time, and service time is set by
// output length -- so capacity moves whenever your traffic mix moves.
const serviceSeconds = (outputTokens: number) => (outputTokens * 12) / 1000;
const capacityRps = (concurrency: number, outputTokens: number) =>
  concurrency / serviceSeconds(outputTokens);`,
  },
  realWorld: [
    "Prompt caching bills a repeated prefix at a fraction of the uncached rate, because a cache hit skips prefill entirely.",
    "Batch APIs trade latency for roughly half price, since offline work can fill slots that interactive traffic leaves idle.",
    "Model routing sends easy requests to a small model and escalates only the hard ones, often the single largest saving available.",
  ],
  pitfalls: [
    "Optimising prompt length while ignoring output length, which usually dominates both bills and latency.",
    "Planning capacity from average output length. The tail sets the queue, and the tail is long.",
    "Retrying timeouts without a circuit breaker, which converts an overloaded service into a self-sustaining outage.",
  ],
  usedBy: [
    {
      company: "Anthropic",
      product: "Prompt caching and batch API",
      usage:
        "Cached prefixes are billed well below fresh input, and the batch API halves cost in exchange for relaxed latency.",
      href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
    },
    {
      company: "OpenAI",
      product: "Tiered token pricing",
      usage:
        "Publishes separate input and output prices per model, with output consistently the higher of the two.",
      href: "https://openai.com/api/pricing/",
    },
  ],
  references: [
    {
      label: "Anthropic — Prompt caching",
      href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
    },
    {
      label: "Anyscale — Continuous batching and throughput",
      href: "https://www.anyscale.com/blog/continuous-batching-llm-inference",
    },
  ],
  challenge: {
    prompt:
      "Plan capacity for an inference endpoint. Given per-call token counts, prices, concurrency and offered load, return the cost per call, the service time, the sustainable throughput, and whether the offered load exceeds it. Output tokens set the service time because they are produced one at a time.",
    entry: "plan",
    starter: `/**
 * @param {{inputTokens: number, outputTokens: number, inPerM: number,
 *          outPerM: number, msPerOutputToken: number, concurrency: number,
 *          offeredRps: number}} spec
 * @returns {{costPerCall: number, serviceSeconds: number, capacityRps: number,
 *            overloaded: boolean}}
 *   capacityRps is concurrency / serviceSeconds, floored to a whole request.
 */
function plan(spec) {
  // Prices are per MILLION tokens. Service time is driven by output only --
  // prefill processes the prompt in parallel and barely moves the clock.
}
`,
    tests: [
      {
        name: "computes cost from both token kinds",
        body: `var r = solution({ inputTokens: 1000000, outputTokens: 0, inPerM: 3, outPerM: 15, msPerOutputToken: 10, concurrency: 1, offeredRps: 0 });
assertEquals(r.costPerCall, 3);`,
      },
      {
        name: "output tokens are priced higher",
        body: `var r = solution({ inputTokens: 0, outputTokens: 1000000, inPerM: 3, outPerM: 15, msPerOutputToken: 10, concurrency: 1, offeredRps: 0 });
assertEquals(r.costPerCall, 15);`,
      },
      {
        name: "service time follows output length only",
        body: `var r = solution({ inputTokens: 99999, outputTokens: 100, inPerM: 3, outPerM: 15, msPerOutputToken: 10, concurrency: 1, offeredRps: 0 });
assertEquals(r.serviceSeconds, 1);`,
      },
      {
        name: "capacity is concurrency over service time",
        body: `var r = solution({ inputTokens: 0, outputTokens: 100, inPerM: 3, outPerM: 15, msPerOutputToken: 10, concurrency: 8, offeredRps: 0 });
assertEquals(r.capacityRps, 8);`,
      },
      {
        name: "capacity floors to whole requests",
        body: `var r = solution({ inputTokens: 0, outputTokens: 300, inPerM: 3, outPerM: 15, msPerOutputToken: 10, concurrency: 8, offeredRps: 0 });
assertEquals(r.capacityRps, 2);`,
      },
      {
        name: "detects overload",
        body: `var r = solution({ inputTokens: 0, outputTokens: 100, inPerM: 3, outPerM: 15, msPerOutputToken: 10, concurrency: 2, offeredRps: 5 });
assertEquals(r.overloaded, true);`,
      },
      {
        name: "load exactly at capacity is not overload",
        body: `var r = solution({ inputTokens: 0, outputTokens: 100, inPerM: 3, outPerM: 15, msPerOutputToken: 10, concurrency: 4, offeredRps: 4 });
assertEquals(r.overloaded, false);`,
      },
      {
        name: "a long answer costs more and returns slower than a long prompt",
        body: `var base = { inPerM: 3, outPerM: 15, msPerOutputToken: 12, concurrency: 4, offeredRps: 1 };
var longPrompt = solution(Object.assign({}, base, { inputTokens: 20000, outputTokens: 50 }));
var longAnswer = solution(Object.assign({}, base, { inputTokens: 200, outputTokens: 2000 }));
assert(longAnswer.serviceSeconds > longPrompt.serviceSeconds * 10, 'output should dominate latency');`,
      },
    ],
    hints: [
      "Divide token counts by 1e6 before multiplying by the per-million price.",
      "Service time is outputTokens * msPerOutputToken, converted to seconds.",
      "Floor the capacity with Math.floor, and treat overload as strictly greater than capacity.",
    ],
    reference: `function plan(spec) {
  const costPerCall =
    (spec.inputTokens / 1e6) * spec.inPerM + (spec.outputTokens / 1e6) * spec.outPerM;

  // Prefill runs the whole prompt in parallel; decode emits one token at a
  // time. Only the second one shows up in wall-clock latency.
  const serviceSeconds = (spec.outputTokens * spec.msPerOutputToken) / 1000;

  const capacityRps =
    serviceSeconds === 0 ? Infinity : Math.floor(spec.concurrency / serviceSeconds);

  return {
    costPerCall,
    serviceSeconds,
    capacityRps,
    overloaded: spec.offeredRps > capacityRps,
  };
}
`,
  },
};
