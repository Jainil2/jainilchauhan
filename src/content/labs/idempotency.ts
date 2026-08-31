import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "idempotency",
  title: "Idempotency",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb:
    "The network already delivered your payment twice. The only question is whether you noticed.",
  caption:
    "A checkout request whose response is lost to a timeout, and the client retry that follows. The demo opens with no idempotency key — the default for a hand-rolled POST — so the ledger shows two charges for one purchase, and both the client and the server believe they behaved correctly.",
  skillTags: ["System Design", "API Design", "Reliability", "Distributed Systems"],
  bridgesFrom: [
    {
      slug: "hash-table",
      sameness:
        "An idempotency layer IS a hash table with one operation: insert-if-absent. Key in, existing value out if it is there, execute and store if it is not. Stripe's implementation, your framework's middleware and the four lines you would write yourself are all that map.",
      delta:
        "The map has to be shared across every process and survive a crash, so it is a unique index in a database rather than an object in memory — and the interesting part is the gap between claiming the key and finishing the work. A crash in that gap leaves a key that is taken but has no result, which is a state a hash table has never had and which decides whether the retry is safe or stuck.",
    },
    {
      slug: "distributed-tx",
      sameness:
        "This is the property the saga silently assumed. Every step in that lab is retried on failure and every compensation may run more than once, so the whole pattern is only correct if each step is idempotent. This lab is that assumption pulled out and implemented.",
      delta:
        "Here the requirement is on a single request rather than a workflow, and the enforcement is a key the caller supplies rather than a coordinator's log. That flips who is responsible: the client picks the identity of the operation, and the server's job is only to honour it — which is why 'generate the key once, before the first attempt' is the rule everything else depends on.",
    },
  ],
  concept:
    "Any network call that times out has three possible outcomes, and the caller cannot tell them apart: the request never arrived, it arrived and failed, or it arrived and succeeded but the response was lost. Retrying is the right thing to do and it is also how you charge a card twice. Duplicate delivery is not an edge case; it is the normal behaviour of at-least-once systems, and every queue consumer, webhook receiver and mobile client is one.\n\nIdempotency makes the duplicate harmless. The client generates a key — a UUID, once, before the first attempt — and sends it with every retry of that same logical operation. The server records the key, performs the work once, stores the response, and returns the stored response to every later request carrying that key. From the client's side, a retry is indistinguishable from a slow success, which is exactly the property that makes retries safe.\n\nThe correctness lives in the database, not the application. Checking 'has this key been seen?' and then inserting it is a race two concurrent retries will lose: both check, both see nothing, both charge. The enforcement has to be a unique constraint on the key column, with the insert and the work in one transaction — let the second one fail on the constraint and serve the stored result. Any check-then-act version of this works in testing and breaks under the double-click that produced it.\n\nThen there is the gap. A request that claims a key and crashes before completing leaves a record in flight. Return the stored response and you are lying; re-execute and you may double-charge. The standard answer is to record the key as in-progress and return 409 Conflict to a concurrent retry, with a recovery process that resolves stuck records against the downstream system. The related rule is that a key is bound to its request payload: if the same key arrives with different parameters, that is a client bug and must be rejected, not silently served the old answer.\n\nFinally, prefer designs that do not need any of this. `PUT /users/42` with a full body is naturally idempotent; `POST /users` is not. A state transition written as 'set status to shipped' is idempotent; 'increment attempts' is not. Where the operation can be expressed as setting a value rather than applying a delta, the retry problem disappears without any bookkeeping at all.",
  complexity: [
    { operation: "First request (key insert)", time: "O(1) index write", space: "O(keys)" },
    { operation: "Duplicate request", time: "O(1) index read", space: "O(1)" },
    { operation: "Concurrent duplicate", time: "O(1), fails the constraint", space: "O(1)" },
    { operation: "Key retention", time: "—", space: "O(requests × TTL)" },
  ],
  codeSnippet: {
    language: "sql",
    code: `-- The unique constraint IS the implementation. Everything above it is
-- convenience; this is the line that makes concurrent retries safe.
CREATE TABLE idempotency_keys (
  key           text        NOT NULL,
  account_id    bigint      NOT NULL,
  endpoint      text        NOT NULL,
  request_hash  text        NOT NULL,   -- same key + different body = client bug
  state         text        NOT NULL,   -- 'in_progress' | 'done'
  response_code int,
  response_body jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  -- Scoped per account and endpoint: one tenant's key must never collide
  -- with another's, and reusing a key across endpoints is meaningless.
  PRIMARY KEY (account_id, endpoint, key)
);

-- Claim the key and do the work in ONE transaction. The second concurrent
-- retry loses the insert instead of racing past a SELECT that found nothing.
BEGIN;
  INSERT INTO idempotency_keys (key, account_id, endpoint, request_hash, state)
  VALUES ('a1b2...', 42, 'POST /charges', 'sha256:...', 'in_progress')
  ON CONFLICT (account_id, endpoint, key) DO NOTHING;
  -- 0 rows inserted -> a duplicate. Read the stored response, or return 409
  -- if the original attempt is still in_progress.

  INSERT INTO charges (account_id, amount_cents) VALUES (42, 4999);

  UPDATE idempotency_keys
     SET state = 'done', response_code = 201, response_body = '{"id":"ch_1"}'
   WHERE account_id = 42 AND endpoint = 'POST /charges' AND key = 'a1b2...';
COMMIT;

-- Keys expire; 24 hours is the common window, and it must outlive the
-- longest retry schedule any client of yours implements.
DELETE FROM idempotency_keys WHERE created_at < now() - interval '24 hours';`,
  },
  realWorld: [
    "Stripe accepts an Idempotency-Key header on every POST, stores the resulting response for 24 hours, and returns it verbatim to any retry carrying that key.",
    "AWS API actions that create resources take a client token so a retried RunInstances does not launch a second fleet.",
    "Kafka producers use a producer id and sequence number so a broker can drop a duplicate batch caused by a retried send, giving exactly-once semantics on top of at-least-once delivery.",
  ],
  pitfalls: [
    "Generating the key inside the retry loop. A new key per attempt makes every retry a new operation, which is the bug the header was added to prevent.",
    "SELECT then INSERT instead of a unique constraint. Two concurrent retries both see no row, both proceed, and the double charge only appears under the double-click that caused it.",
    "Storing only that the key was used, not the response. The duplicate then gets a 200 with an empty body or a fresh 500, and the client retries again.",
    "Ignoring the in-flight state. A request that crashed mid-work leaves a claimed key, and both possible answers — replay the stored response or re-execute — are wrong without a reconciliation step.",
  ],
  usedBy: [
    {
      company: "Stripe",
      product: "Idempotent requests",
      usage:
        "Idempotency-Key header on all POSTs, with the response saved and replayed for 24 hours and a stored request fingerprint to reject key reuse.",
      href: "https://docs.stripe.com/api/idempotent_requests",
    },
    {
      company: "Stripe",
      product: "Engineering blog — idempotency",
      usage:
        "The design writeup: keys plus atomic phases so a crashed request can be resumed rather than replayed blindly.",
      href: "https://stripe.com/blog/idempotency",
    },
    {
      company: "AWS",
      product: "EC2 client tokens",
      usage:
        "RunInstances takes a client token so a retried launch request returns the original reservation instead of starting more instances.",
      href: "https://docs.aws.amazon.com/AWSEC2/latest/APIReference/Run_Instance_Idempotency.html",
    },
  ],
  references: [
    {
      label: "Stripe — Idempotent requests",
      href: "https://docs.stripe.com/api/idempotent_requests",
    },
    {
      label: "IETF — The Idempotency-Key HTTP header field",
      href: "https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/",
    },
  ],
  challenge: {
    prompt:
      "Implement an idempotent payment handler. Requests arrive in order, each with an idempotency key and an amount. The first request for a key executes: it is assigned the next transaction id, starting at 1, and its amount is charged. Any later request with the same key returns the stored transaction id and charges nothing. A repeat of a key with a different amount is a client bug — throw an Error rather than serving the stored result. Return an object with `charged` (the total actually moved) and `results` (the transaction id for each request, in order).",
    entry: "applyPayments",
    starter: `/**
 * @param {Array<{key: string, amount: number}>} requests - in arrival order.
 * @returns {{charged: number, results: number[]}}
 * @throws {Error} when a key is reused with a different amount.
 */
function applyPayments(requests) {
  // First time a key is seen: execute, assign the next id, charge it.
  // Every later time: return the stored id and charge nothing.
}
`,
    tests: [
      {
        name: "a single payment is charged once",
        body: `var out = solution([{ key: "k1", amount: 100 }]);
assertEquals(out.charged, 100);
assertEquals(out.results, [1]);`,
      },
      {
        name: "a retry with the same key charges nothing extra",
        body: `// The timeout-then-retry case this whole lab exists for.
var out = solution([
  { key: "k1", amount: 4999 },
  { key: "k1", amount: 4999 },
]);
assertEquals(out.charged, 4999);
assertEquals(out.results, [1, 1]);`,
      },
      {
        name: "distinct keys are distinct operations",
        body: `var out = solution([
  { key: "k1", amount: 100 },
  { key: "k2", amount: 100 },
]);
assertEquals(out.charged, 200);
assertEquals(out.results, [1, 2]);`,
      },
      {
        name: "ids are assigned only to work that actually ran",
        body: `// The duplicate must not consume an id, or the next real payment is
// numbered as if a charge happened that never did.
var out = solution([
  { key: "k1", amount: 10 },
  { key: "k1", amount: 10 },
  { key: "k2", amount: 20 },
]);
assertEquals(out.charged, 30);
assertEquals(out.results, [1, 1, 2]);`,
      },
      {
        name: "duplicates can arrive long after the original",
        body: `var out = solution([
  { key: "k1", amount: 5 },
  { key: "k2", amount: 5 },
  { key: "k3", amount: 5 },
  { key: "k1", amount: 5 },
]);
assertEquals(out.charged, 15);
assertEquals(out.results, [1, 2, 3, 1]);`,
      },
      {
        name: "reusing a key with a different amount is rejected",
        body: `assertThrows(function () {
  solution([
    { key: "k1", amount: 100 },
    { key: "k1", amount: 900 },
  ]);
}, "a key bound to one payload must not serve another");`,
      },
      {
        name: "a zero-amount operation is still an operation",
        body: `// The falsy-value trap: 0 is a real recorded charge, not a missing one.
var out = solution([
  { key: "k1", amount: 0 },
  { key: "k1", amount: 0 },
  { key: "k2", amount: 7 },
]);
assertEquals(out.charged, 7);
assertEquals(out.results, [1, 1, 2]);`,
      },
      {
        name: "no requests",
        body: `var out = solution([]);
assertEquals(out.charged, 0);
assertEquals(out.results, []);`,
      },
      {
        name: "equal amounts under different keys are two real payments",
        body: `// Deduplicating on the payload instead of the key would collapse these,
// and two identical purchases a minute apart are legitimate.
var out = solution([
  { key: "k1", amount: 1200 },
  { key: "k2", amount: 1200 },
  { key: "k1", amount: 1200 },
]);
assertEquals(out.charged, 2400);
assertEquals(out.results, [1, 2, 1]);`,
      },
      {
        name: "handles a retry-heavy stream",
        body: `// 100k requests over 1000 keys: 1000 real charges, 99k replays.
var reqs = [];
for (var i = 0; i < 100000; i++) reqs.push({ key: "k" + (i % 1000), amount: 3 });
var out = solution(reqs);
assertEquals(out.charged, 3000);
assertEquals(out.results.length, 100000);
assertEquals(out.results[0], 1);
assertEquals(out.results[999], 1000);
assertEquals(out.results[99999], 1000);`,
      },
    ],
    hints: [
      "One Map from key to the record you stored: the transaction id and the amount it was charged with.",
      "Check for the key with an explicit undefined comparison, not truthiness — a stored record for a zero-amount charge is still a record.",
      "Compare the incoming amount with the stored one before returning anything; a key that means two different things is a client bug you must surface, not absorb.",
    ],
    reference: `function applyPayments(requests) {
  // The in-memory stand-in for a unique index on the key column. In
  // production this map is the database, and the atomicity of the insert is
  // what makes two concurrent retries safe.
  const seen = new Map();

  let charged = 0;
  let nextId = 1;
  const results = [];

  for (const req of requests) {
    const prior = seen.get(req.key);

    if (prior !== undefined) {
      // A key is bound to the request that created it. Same key, different
      // payload, means the client is reusing keys -- surface it.
      if (prior.amount !== req.amount) {
        throw new Error("idempotency key reused with a different amount: " + req.key);
      }
      // Replay the stored result. No new id, no new charge.
      results.push(prior.id);
      continue;
    }

    const id = nextId;
    nextId += 1;
    seen.set(req.key, { id, amount: req.amount });
    charged += req.amount;
    results.push(id);
  }

  return { charged, results };
}
`,
  },
};
