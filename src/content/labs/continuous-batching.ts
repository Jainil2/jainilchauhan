import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "continuous-batching",
  title: "Continuous Batching",
  category: "AI Systems",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "A work queue with a scheduler, where the workers are GPU batch slots.",
  caption:
    "Toggle between static and continuous batching over the same arrivals. The grey gaps are a GPU that is powered on and idle — static batching creates them every time one long request holds the batch open.",
  skillTags: ["AI Systems", "Scheduling", "Distributed Systems"],
  bridgesFrom: [
    {
      slug: "message-queue",
      sameness:
        "It IS a work queue with a fixed pool of workers. Requests arrive, wait for a slot, occupy it for a while, and free it. The batch slots are the consumers and the scheduler decides who gets one next.",
      delta:
        "A slot is not held for one message but for hundreds of sequential decode steps, and every occupied slot advances by one token in lockstep each step. So the unit of work is a step across the whole batch, not a message.",
    },
    {
      slug: "backpressure",
      sameness:
        "The admission decision is the same one you implemented: a bounded pool, an arrival rate that may exceed it, and a policy for what happens to the excess.",
      delta:
        "Rejecting is rarely acceptable here, so the excess queues and the pressure surfaces as time-to-first-token instead of dropped work. KV cache memory, not slot count, is usually the real bound.",
    },
  ],
  concept:
    "Naive batching collects N requests, runs them together, and returns when the slowest finishes. Because generation lengths vary wildly — one request wants 20 tokens, another wants 2000 — most of the batch sits finished and idle while the longest one drains. GPU utilisation collapses.\n\nContinuous batching, sometimes called in-flight or rolling batching, refills a slot the moment its occupant finishes rather than waiting for the batch boundary. Each decode step operates on whatever set of sequences is currently resident, and that set changes every step.\n\nThe scheduler then has real decisions to make. Admitting a new request requires prefilling its prompt, which is compute-heavy and briefly stalls decoding for everyone else; some servers interleave prefill and decode, others use chunked prefill to bound the stall. And admission is ultimately gated by KV cache memory rather than by slot count, so the scheduler is really allocating VRAM.",
  complexity: [
    { operation: "Decode step", time: "O(batch × 1 token)", space: "O(batch × context)" },
    { operation: "Admit a request", time: "O(prompt length)", space: "O(prompt length)" },
  ],
  codeSnippet: {
    language: "py",
    code: `# The scheduling loop, stripped to its essentials.
running = []          # sequences currently decoding
waiting = deque()     # admitted but not yet started

while running or waiting:
    # Refill freed slots immediately -- this line is the whole difference
    # between static and continuous batching.
    while waiting and len(running) < max_slots and kv_has_room(waiting[0]):
        running.append(prefill(waiting.popleft()))

    # One step advances EVERY resident sequence by exactly one token.
    for seq in decode_step(running):
        if seq.finished:
            free_kv_blocks(seq)

    running = [s for s in running if not s.finished]`,
  },
  realWorld: [
    "vLLM, TGI and TensorRT-LLM all schedule continuously; static batching survives mainly in offline batch jobs.",
    "Chunked prefill splits a long prompt across several steps so admitting it does not stall every other user's decoding.",
    "Time-to-first-token and inter-token latency are tracked separately because the scheduler affects them in opposite directions.",
  ],
  pitfalls: [
    "Raising max batch size until throughput peaks, then discovering per-user latency became unacceptable somewhere before that.",
    "Ignoring prefill cost. A single 100k-token prompt admitted carelessly stalls decoding for everyone in the batch.",
    "Sizing the slot count rather than the KV memory. Slots are not the binding constraint; cache is.",
  ],
  usedBy: [
    {
      company: "vLLM",
      product: "Continuous batching scheduler",
      usage:
        "Refills batch slots every decode step and admits new sequences only when KV blocks are available for them.",
      href: "https://blog.vllm.ai/2023/06/20/vllm.html",
    },
    {
      company: "Hugging Face",
      product: "Text Generation Inference",
      usage:
        "Runs continuous batching with configurable limits on total batched tokens rather than request count.",
      href: "https://huggingface.co/docs/text-generation-inference/index",
    },
  ],
  references: [
    {
      label: "Anyscale — How continuous batching enables 23x throughput",
      href: "https://www.anyscale.com/blog/continuous-batching-llm-inference",
    },
    {
      label: "vLLM — PagedAttention and scheduling",
      href: "https://blog.vllm.ai/2023/06/20/vllm.html",
    },
  ],
  challenge: {
    prompt:
      "Simulate a continuous-batching scheduler and report GPU utilisation. Slots refill the instant they free, requests are admitted in arrival order, and each occupies its slot for a fixed number of steps. Compare the number against static batching and the gap is the reason nobody ships static any more.",
    entry: "utilisation",
    starter: `/**
 * @param {number} slots - batch slots available.
 * @param {number[]} lengths - decode steps each queued request needs, in order.
 * @param {number} steps - how many steps to simulate.
 * @returns {number} fraction of slot-steps that were busy, 0 to 1.
 */
function utilisation(slots, lengths, steps) {
  // Each step: every occupied slot advances one token. A slot that finishes is
  // refilled in the SAME step if anything is still waiting.
}
`,
    tests: [
      {
        name: "a full batch stays busy",
        body: `assertEquals(solution(2, [10, 10], 5), 1);`,
      },
      {
        name: "idle slots lower utilisation",
        body: `// One request, two slots, so half the capacity is wasted.
assertEquals(solution(2, [10], 4), 0.5);`,
      },
      {
        name: "a freed slot is refilled immediately",
        body: `// Two 2-step requests through one slot fills all 4 steps.
assertEquals(solution(1, [2, 2], 4), 1);`,
      },
      {
        name: "running out of work leaves slots idle",
        body: `assertEquals(solution(1, [2], 4), 0.5);`,
      },
      { name: "no requests means nothing is busy", body: `assertEquals(solution(2, [], 5), 0);` },
      { name: "zero steps", body: `assertEquals(solution(2, [5], 0), 0);` },
      {
        name: "more requests than slots still saturates",
        body: `assertEquals(solution(2, [1, 1, 1, 1, 1, 1], 3), 1);`,
      },
      {
        name: "handles a long simulation",
        body: `var lengths = [];
for (var i = 0; i < 500; i++) lengths.push(3);
var u = solution(4, lengths, 200);
assert(u > 0.99, 'expected near-full utilisation, got ' + u);`,
      },
    ],
    hints: [
      "Track remaining steps per slot, using 0 to mean free.",
      "At each step, first refill any free slot from the queue, then decrement every occupied slot.",
      "Count a slot as busy for a step if it held work during that step; utilisation is busy divided by slots times steps.",
    ],
    reference: `function utilisation(slots, lengths, steps) {
  if (steps === 0 || slots === 0) return 0;
  const remaining = new Array(slots).fill(0);
  const queue = lengths.slice();
  let busy = 0;

  for (let t = 0; t < steps; t++) {
    for (let s = 0; s < slots; s++) {
      // Refill before decoding, so a slot freed last step is not idle this one.
      // That single ordering choice is what "continuous" means.
      if (remaining[s] === 0 && queue.length) remaining[s] = queue.shift();
      if (remaining[s] > 0) {
        remaining[s]--;
        busy++;
      }
    }
  }
  return busy / (slots * steps);
}
`,
  },
};
