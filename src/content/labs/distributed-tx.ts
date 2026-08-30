import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "distributed-tx",
  title: "Saga vs 2PC",
  category: "Distributed Systems",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "2-Phase Commit vs Eventual Sagas.",
  caption:
    "Simulate a cross-service purchase. Compare the rigid lock-step of 2PC (Two-Phase Commit) with the flexible, compensating-transaction model of Sagas. Inject failures and watch how each system recovers — or fails.",
  skillTags: ["Distributed Systems", "Microservices"],
  bridgesFrom: [
    {
      slug: "n-queens",
      sameness:
        "A saga IS backtracking. Commit one step, move to the next, and when a step fails, walk back through the steps you already took applying their inverse until the state is clean — the same undo-on-failure unwind you wrote to take a queen back off the board.",
      delta:
        "The undo is neither free nor exact. Lifting a queen restores the board perfectly; refunding a charge is a new transaction the customer already saw, and the compensation can itself fail, so every one of them has to be retryable and idempotent. Backtracking explores states nobody observed; a saga commits states other users can read halfway through, which is the atomicity you are trading away for the locks you refuse to hold.",
    },
    {
      slug: "raft-election",
      sameness:
        "The prepare phase IS a vote round: a coordinator asks every participant, counts the replies, and only then announces the decision — the same collect-then-decide shape as an election.",
      delta:
        "The threshold is unanimity rather than a majority, so there is no quorum to route around a node that went quiet, and one slow participant blocks everyone. Worse, a coordinator that dies after collecting votes leaves participants holding locks with no way to learn the outcome and no timeout that can safely resolve it — where a Raft follower simply times out and starts a new term. That gap is why 2PC is called blocking and consensus is not.",
    },
  ],
  concept:
    "Atomic transactions are easy in a single database, but across microservices, you must choose between Strong Consistency (2PC) and Eventual Consistency (Saga).\n\n2PC (Two-Phase Commit) uses a coordinator to ask all participants to 'prepare' (lock resources), then 'commit'. It guarantees atomicity but is blocking and fragile: if the coordinator or a node fails during the lock phase, the system stalls.\n\nSagas break a transaction into a sequence of local transactions. Each step has a corresponding 'compensating transaction' (undo). If step 3 fails, the Saga runs the undo actions for steps 2 and 1. It scales better and doesn't hold locks, but allows 'interleaving' where other users might see partially complete state.",
  complexity: [
    { operation: "2PC Latency", time: "2 RTTs + Locks", space: "O(N) locks" },
    { operation: "Saga Latency", time: "N local TXs", space: "O(N) log storage" },
  ],
  realWorld: [
    "Bank Transfers: legacy systems often use 2PC/XA for strong atomicity.",
    "Uber/Lyft: Sagas manage the ride-request → payment → driver-dispatch flow.",
    "Booking.com: Sagas handle flight + hotel + car rental bundles.",
    "Temporal / Zeebe: Workflow engines designed specifically to manage long-running Sagas.",
  ],
  pitfalls: [
    "Saga steps must be idempotent because undos/retries will happen.",
    "2PC scales poorly beyond a few nodes due to the blocking 'prepare' phase.",
    "Lack of isolation in Sagas means you need 'semantic locks' or careful business logic to handle concurrent updates.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Saga: local transactions + compensations instead of a global lock.
const steps = [
  { do: reserveInventory, undo: releaseInventory },
  { do: chargeCard,       undo: refundCard },
  { do: createShipment,   undo: cancelShipment },
];

async function runSaga(order: Order) {
  const done: typeof steps = [];
  try {
    for (const step of steps) {
      await step.do(order); // each step commits locally and is idempotent
      done.push(step);
    }
  } catch (err) {
    for (const step of done.reverse()) await step.undo(order); // compensate backwards
    throw err;
  }
}
// 2PC gives atomicity but blocks on coordinator failure; sagas stay available
// and pay for it with temporary, visible inconsistency.`,
  },
  usedBy: [
    {
      company: "Uber",
      product: "Cadence / Temporal workflows",
      usage:
        "Long-running business transactions are expressed as durable workflows with explicit compensation activities.",
      href: "https://www.uber.com/blog/cadence-multi-tenant-workflow-sys/",
    },
    {
      company: "Amazon",
      product: "AWS Step Functions saga pattern",
      usage:
        "AWS documents the saga pattern with Step Functions for order/booking flows spanning multiple services.",
      href: "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html",
    },
    {
      company: "Stripe",
      product: "Idempotent payment operations",
      usage:
        "Idempotency keys make each step in a payment flow safely retryable, which is what makes compensation-based flows workable.",
      href: "https://docs.stripe.com/api/idempotent_requests",
    },
    {
      company: "Google",
      product: "Spanner distributed commits",
      usage:
        "Spanner does run two-phase commit across Paxos groups — with TrueTime bounding the uncertainty window.",
      href: "https://research.google/pubs/pub39966/",
    },
  ],
  references: [
    {
      label: "Gray & Lamport — Consensus on transaction commit (Paxos Commit)",
      href: "https://www.microsoft.com/en-us/research/publication/consensus-on-transaction-commit/",
    },
    {
      label: "Temporal — durable execution as an alternative to 2PC",
      href: "https://docs.temporal.io/temporal",
    },
    {
      label: "Microsoft — Saga distributed transactions pattern",
      href: "https://learn.microsoft.com/en-us/azure/architecture/patterns/saga",
    },
  ],
  challenge: {
    prompt:
      "Work out which compensations a saga must run when a step fails. A saga cannot roll back like a database, so it undoes completed steps in reverse order — and a step that never ran must not be compensated.",
    entry: "compensations",
    starter: `/**
 * @param {string[]} steps - step names, executed in order.
 * @param {number} failAt - index of the step that failed, or -1 when all succeed.
 * @returns {string[]} compensations to run, in the order they should run.
 *   The failing step itself did not complete, so it is not compensated.
 */
function compensations(steps, failAt) {
  // Undo the steps that actually completed, most recent first.
}
`,
    tests: [
      {
        name: "all steps succeed",
        body: `assertEquals(solution(['a', 'b', 'c'], -1), []);`,
      },
      {
        name: "undoes completed steps in reverse",
        body: `assertEquals(solution(['a', 'b', 'c'], 2), ['b', 'a']);`,
      },
      {
        name: "the failing step is not compensated",
        body: `assertEquals(solution(['a', 'b'], 1), ['a']);`,
      },
      {
        name: "failing on the first step undoes nothing",
        body: `assertEquals(solution(['a', 'b'], 0), []);`,
      },
      {
        name: "no steps",
        body: `assertEquals(solution([], -1), []);`,
      },
      {
        name: "a long saga unwinds fully",
        body: `assertEquals(solution(['a', 'b', 'c', 'd'], 3), ['c', 'b', 'a']);`,
      },
    ],
    hints: [
      "When failAt is -1 nothing needs undoing.",
      "The completed steps are the ones strictly before failAt.",
      "Reverse them: the most recent side effect must be undone first.",
    ],
    reference: `function compensations(steps, failAt) {
  if (failAt < 0) return []; // everything committed
  // Strictly before failAt: the failing step never completed, so there is
  // nothing of its to undo.
  return steps.slice(0, failAt).reverse();
}
`,
  },
};
