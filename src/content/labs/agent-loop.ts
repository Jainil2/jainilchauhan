import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "agent-loop",
  title: "Agent Loop & Tool Use",
  category: "AI Systems",
  difficulty: "Advanced",
  readingTimeMin: 7,
  blurb: "A dependency graph executed in order — discovered one node at a time.",
  caption:
    "Run the loop against a plan with a broken tool. Dependents never become runnable, the goal is never reached, and the loop stops on a bookkeeping condition rather than on an answer. Clear the failure and lower the budget to see the other exit.",
  skillTags: ["AI Systems", "Agents", "Reliability"],
  bridgesFrom: [
    {
      slug: "topological-sort",
      sameness:
        "Tool calls form a dependency graph and run in dependency order: a step whose inputs are not ready cannot execute, and a step whose inputs failed never becomes ready. That is the ordering you already implemented.",
      delta:
        "The graph does not exist yet. The model emits one call at a time and decides the next after seeing the result, so there is no whole graph to sort and no way to detect a cycle in advance — a loop only shows up as the same call repeating. Kahn's algorithm terminates because the graph is finite; this terminates because you gave it a step budget.",
    },
    {
      slug: "circuit-breaker",
      sameness:
        "Same containment around an unreliable dependency: watch failures, stop calling something that keeps failing, and fail the operation rather than hanging on it forever.",
      delta:
        "The dependency is non-deterministic, so 'failing' now includes succeeding with a plausible wrong answer. No error rate detects that, which is why the budget is the primary guard rather than the error threshold — the loop is bounded by steps and tokens spent, not only by exceptions raised.",
    },
  ],
  concept:
    "An agent is a loop: send the conversation to the model, receive either a final answer or a tool call, execute the call, append its result, repeat. Everything interesting is in the exit conditions.\n\nStructurally it is dependency-ordered execution. A step that needs a file read cannot run before the read succeeds; a step whose input failed never becomes runnable. The difference from a topological sort is that nothing sees the graph in advance — it is revealed one node at a time, so the classic termination argument does not apply. Two calls can also be independent, which is what makes parallel tool calls possible and is worth exploiting, since latency is dominated by round trips.\n\nSo the loop needs limits it can enforce without understanding the task: a maximum number of steps, a token budget, a wall-clock timeout, and a rule against repeating an identical failing call. Without them a model that misreads a tool error will retry it until something else runs out, and the failure mode is a bill rather than an exception.\n\nThe harder problem is that success is not observable. A tool call can return exactly what it was asked for while the plan built on it is wrong, and the loop has no oracle. Production systems therefore constrain what tools can do — read-only by default, writes behind confirmation, destructive operations behind a human — because the loop cannot be trusted to notice it is going wrong, only to stop when it has gone on too long.",
  complexity: [
    { operation: "Per step", time: "1 model call + 1 tool call", space: "O(history)" },
    { operation: "Whole loop", time: "O(budget) round trips", space: "O(budget · tokens)" },
    { operation: "Finding runnable steps", time: "O(steps) per round", space: "O(steps)" },
    { operation: "Context growth", time: "—", space: "grows with every result appended" },
  ],
  codeSnippet: {
    language: "py",
    code: `def run(task, tools, max_steps=25, max_tokens=200_000):
    messages, spent = [user(task)], 0
    for step in range(max_steps):          # the only guaranteed terminator
        reply = model(messages, tools)
        spent += reply.usage.total_tokens
        if spent > max_tokens:
            return stop("token budget")
        if not reply.tool_calls:
            return reply.text              # the intended exit
        for call in reply.tool_calls:      # independent calls can go in parallel
            messages.append(execute(call))
    return stop("step budget")             # the exit that actually fires

# A topological sort ends when the graph is exhausted. This one ends when
# YOU say so -- the graph is discovered a node at a time and may not be acyclic.`,
  },
  realWorld: [
    "Anthropic's tool-use loop is exactly this shape: call, execute, append result, repeat until the model stops asking.",
    "Coding agents cap steps and tokens per task, and surface the cap as a visible stop reason rather than a silent truncation.",
    "Production agents gate write and destructive tools behind confirmation, since the loop cannot verify its own plan.",
  ],
  pitfalls: [
    "Shipping without a step budget. The terminating condition is 'the model decides to stop', which is not a guarantee.",
    "Retrying an identical failing call. The model often cannot tell a permanent error from a transient one, so the same call repeats until a budget stops it.",
    "Running independent calls sequentially. Latency is round trips; three unrelated lookups should be one round trip, not three.",
    "Giving an agent write access by default. There is no oracle for 'the plan was correct', so the blast radius has to be bounded by permissions instead.",
  ],
  usedBy: [
    {
      company: "Anthropic",
      product: "Tool use",
      usage:
        "The model returns tool_use blocks, the caller executes and returns tool_result blocks, and the loop continues until it stops asking.",
      href: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
    },
    {
      company: "Anthropic",
      product: "Model Context Protocol",
      usage:
        "Standardises how tools are described and invoked, so the loop is the same regardless of which tools are attached.",
      href: "https://modelcontextprotocol.io/",
    },
    {
      company: "LangGraph",
      product: "Graph runtime",
      usage:
        "Models the loop explicitly as a state graph with recursion limits, making the step budget a first-class setting.",
      href: "https://langchain-ai.github.io/langgraph/",
    },
  ],
  references: [
    {
      label: "Anthropic — Tool use with Claude",
      href: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
    },
    {
      label: "Anthropic — Building effective agents",
      href: "https://www.anthropic.com/engineering/building-effective-agents",
    },
  ],
  challenge: {
    prompt:
      "Run the loop. Each step declares the steps it needs and whether its tool call will succeed. Execute any step whose needs have all succeeded, lowest id first, one per iteration, spending one unit of budget each time. A step whose need failed never becomes runnable, and a failed step is never retried. Return the ids in execution order. Stop when the budget runs out or when nothing is runnable — that second condition is what keeps a cyclic plan from hanging, and the plan is allowed to be cyclic because nobody ever saw the whole graph.",
    entry: "runLoop",
    starter: `/**
 * @param {Array<{id: number, needs: number[], ok: boolean}>} steps
 * @param {number} budget - maximum number of steps to execute.
 * @returns {number[]} ids in execution order.
 */
function runLoop(steps, budget) {
  // Each round: collect the steps whose needs have all SUCCEEDED, take the
  // lowest id, spend one budget unit, and record whether it succeeded.
}
`,
    tests: [
      {
        name: "runs a chain in dependency order",
        body: `var steps = [
  { id: 3, needs: [2], ok: true },
  { id: 1, needs: [], ok: true },
  { id: 2, needs: [1], ok: true },
];
assertEquals(solution(steps, 10), [1, 2, 3]);`,
      },
      {
        name: "independent steps run lowest id first",
        body: `var steps = [
  { id: 5, needs: [], ok: true },
  { id: 2, needs: [], ok: true },
  { id: 9, needs: [], ok: true },
];
assertEquals(solution(steps, 10), [2, 5, 9]);`,
      },
      {
        name: "a failed step blocks its dependents but not the rest",
        body: `var steps = [
  { id: 1, needs: [], ok: false },
  { id: 2, needs: [1], ok: true },
  { id: 3, needs: [], ok: true },
];
assertEquals(solution(steps, 10), [1, 3]);`,
      },
      {
        name: "a failed step is never retried",
        body: `var steps = [{ id: 1, needs: [], ok: false }];
// Budget of 50 and nothing else to do -- it must still run exactly once.
assertEquals(solution(steps, 50), [1]);`,
      },
      {
        name: "the budget stops the loop mid-plan",
        body: `var steps = [
  { id: 1, needs: [], ok: true },
  { id: 2, needs: [1], ok: true },
  { id: 3, needs: [2], ok: true },
  { id: 4, needs: [3], ok: true },
];
assertEquals(solution(steps, 2), [1, 2]);`,
      },
      {
        name: "a cyclic plan halts instead of hanging",
        body: `var steps = [
  { id: 1, needs: [2], ok: true },
  { id: 2, needs: [1], ok: true },
];
assertEquals(solution(steps, 100), []);`,
      },
      {
        name: "a step needing something that does not exist never runs",
        body: `var steps = [
  { id: 1, needs: [99], ok: true },
  { id: 2, needs: [], ok: true },
];
assertEquals(solution(steps, 10), [2]);`,
      },
      {
        name: "a step with several needs waits for all of them",
        body: `var steps = [
  { id: 1, needs: [], ok: true },
  { id: 2, needs: [], ok: false },
  { id: 3, needs: [1, 2], ok: true },
];
assertEquals(solution(steps, 10), [1, 2]);`,
      },
      {
        name: "a budget of zero executes nothing",
        body: `assertEquals(solution([{ id: 1, needs: [], ok: true }], 0), []);`,
      },
      { name: "an empty plan", body: `assertEquals(solution([], 10), []);` },
      {
        name: "handles a long plan without quadratic blowup showing up as a timeout",
        body: `var steps = [];
for (var i = 1; i <= 400; i++) steps.push({ id: i, needs: i === 1 ? [] : [i - 1], ok: true });
var out = solution(steps, 1000);
assertEquals(out.length, 400);
assertEquals(out[399], 400);`,
      },
    ],
    hints: [
      "Track two sets: ids that succeeded and ids that failed. A step is runnable when it is in neither and every id in needs is in the succeeded set.",
      "One execution per iteration, and decrement the budget on every execution — including one that fails, because a failed tool call costs exactly as much as a successful one.",
      "When no step is runnable, return what you have. That is the branch that saves you from a cycle: with the graph revealed one node at a time, you cannot detect one in advance.",
    ],
    reference: `function runLoop(steps, budget) {
  const succeeded = new Set();
  const failed = new Set();
  const executed = [];

  while (executed.length < budget) {
    let next = null;
    for (const step of steps) {
      if (succeeded.has(step.id) || failed.has(step.id)) continue;
      // A need that failed is never satisfied, so its dependents are dead --
      // no retry, no partial credit.
      if (!step.needs.every((n) => succeeded.has(n))) continue;
      if (next === null || step.id < next.id) next = step;
    }

    // Nothing runnable: either the plan is finished, or it is cyclic and
    // never will be. Both mean stop, and this is the only reason a cycle
    // does not hang the loop.
    if (next === null) break;

    executed.push(next.id);
    (next.ok ? succeeded : failed).add(next.id);
  }

  return executed;
}
`,
  },
};
