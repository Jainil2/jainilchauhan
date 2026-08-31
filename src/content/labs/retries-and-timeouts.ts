import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "retries-and-timeouts",
  title: "Retries & Timeouts",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "Retries add load exactly when the dependency has none to spare.",
  caption:
    "One dependency, a thousand clients, three retries each. The demo opens with a fixed backoff and no jitter — the configuration in most default HTTP clients — so every client retries in lockstep and the traffic arriving at a struggling service is four synchronised spikes rather than one smooth curve.",
  skillTags: ["System Design", "Reliability", "Resilience", "Distributed Systems"],
  bridgesFrom: [
    {
      slug: "circuit-breaker",
      sameness:
        "This is the inner loop of the breaker you built. Both count failures against a dependency and both decide whether to send the next request; the breaker is that decision remembered across calls, and a retry is the same decision made inside one.",
      delta:
        "A retry acts on no memory, so it optimistically adds load precisely when the dependency is failing — three retries per client is a 4× traffic multiplier arriving at a service that is already down. That is why the two are always deployed together: the retry handles the unlucky request, and the breaker is the thing that notices the dependency is not unlucky, it is broken.",
    },
    {
      slug: "rate-limiter",
      sameness:
        "A retry budget IS your token bucket, pointed at your own outbound traffic. Successful calls deposit tokens, every retry spends one, and when the bucket is empty the retry is refused. gRPC and Google's SRE guidance both specify it exactly that way: retries capped at roughly 10% of the request rate.",
      delta:
        "The thing being limited is your own client, and the trigger for spending is failure rather than arrival. That inverts the feedback: a normal limiter sees more traffic when things are healthy, while a retry budget drains fastest during an outage — which is why a fixed 'max 3 retries' per call is not a limit at all. It bounds one request while the fleet-wide retry rate is unbounded.",
    },
  ],
  concept:
    "A retry is a bet that the failure was transient. It is often a good bet — a dropped packet, a rolling deploy, one unlucky node — and it is the cheapest availability improvement available. It is also the mechanism by which a small outage becomes a large one.\n\nThe timeout comes first, because a retry without one is meaningless: if the call never returns, there is nothing to retry, and the caller's threads or connections pile up until it fails too. Timeouts should come from measured latency, typically somewhere around p99.9, not from a round number. And they need to be a budget that propagates: if a user-facing request has 3 seconds, the service it calls should get less than that, and pass along less again, so a deep call chain cannot spend the caller's deadline several times over. This is what gRPC deadlines and Go's `context.WithTimeout` are for.\n\nBackoff is the second half. Retrying immediately means retrying while the dependency is still overloaded, so delays grow exponentially: 100 ms, 200 ms, 400 ms, capped somewhere sane. Then jitter, which is the part people skip and the part that matters most. Without it, a thousand clients that failed at the same instant retry at the same instant, and the dependency receives a synchronised spike each round. AWS's analysis of full jitter — sleeping a random time in [0, delay] rather than exactly delay — shows it dramatically cuts both contention and total work. Capped exponential backoff with full jitter is the default you want.\n\nThe failure mode to keep in mind is amplification. Three layers each retrying three times is 27 requests for one user action. The dependency at the bottom sees an order of magnitude more traffic in an outage than in normal operation, which is how a partial failure becomes total and stays total after the original cause is gone — a metastable failure that survives the fix. Two things prevent it: retry only at one layer of the stack, and cap retries fleet-wide with a budget rather than per call. A token bucket that lets retries be at most ~10% of requests bounds the amplification no matter how many clients are failing at once.\n\nLast, retry only what is safe and worth retrying. A 400 will be a 400 next time. A 429 or a 503 with `Retry-After` is telling you exactly when to come back, and ignoring it is worse than not retrying at all. And any non-idempotent write behind a retry needs an idempotency key, or the retry that fixes your availability quietly damages your data.",
  complexity: [
    { operation: "Attempt n delay", time: "min(cap, base·2^(n-1))", space: "O(1)" },
    { operation: "Worst-case latency", time: "attempts × timeout + Σ delays", space: "O(1)" },
    { operation: "Load multiplier", time: "O(attempts^layers)", space: "—" },
    { operation: "Retry budget check", time: "O(1)", space: "O(1) per dependency" },
  ],
  codeSnippet: {
    language: "go",
    code: `// Capped exponential backoff with full jitter, a hard deadline, and a
// fleet-wide retry budget. Each piece exists because of a specific outage.
func Call(ctx context.Context, req Request) (Response, error) {
    // The deadline is the real limit. maxAttempts alone lets a slow
    // dependency spend a multiple of the caller's patience.
    ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
    defer cancel()

    var lastErr error
    for attempt := 0; attempt < maxAttempts; attempt++ {
        if attempt > 0 {
            // Retries are capped fleet-wide at ~10% of the request rate.
            // Without this, "3 retries" is a per-call bound and no bound at
            // all on the traffic the dependency actually receives.
            if !retryBudget.Allow() {
                return Response{}, lastErr
            }
            delay := min(capDelay, base<<(attempt-1))
            // Full jitter. Without it a thousand clients that failed together
            // retry together, and the dependency gets a synchronised spike.
            jittered := time.Duration(rand.Int63n(int64(delay)))
            select {
            case <-time.After(jittered):
            case <-ctx.Done():
                return Response{}, ctx.Err()   // out of budget, stop trying
            }
        }

        resp, err := send(ctx, req)
        if err == nil {
            retryBudget.Deposit()               // success funds future retries
            return resp, nil
        }
        // A 400 will still be a 400. Only retry what can change.
        if !isRetryable(err) {
            return Response{}, err
        }
        lastErr = err
    }
    return Response{}, lastErr
}`,
  },
  realWorld: [
    "AWS's builders' library recommends capped exponential backoff with full jitter and shows it reduces both retry contention and total work versus plain exponential backoff.",
    "gRPC's retry design specifies a token-bucket retry throttle per server, so a failing backend cannot be retried into the ground by its own clients.",
    "Google's SRE book describes retry amplification across service layers as a primary cause of cascading failure, and recommends retrying at a single layer.",
  ],
  pitfalls: [
    "Backoff without jitter. Clients that fail together retry together, and the dependency sees a sharp spike each round instead of spread-out load.",
    "Retrying at every layer. Three layers of three attempts is 27 requests for one user action, which is how an overload survives the fix that should have ended it.",
    "Retrying non-idempotent writes without a key. The retry restores availability and duplicates the order.",
    "A max-attempts count with no deadline. Six attempts against a dependency that hangs for its full 10-second timeout is a minute of a user's life spent on a request nobody is waiting for any more.",
  ],
  usedBy: [
    {
      company: "AWS",
      product: "Builders' Library",
      usage:
        "Documents timeouts, capped exponential backoff, full jitter and retry budgets as the standard client-side pattern across AWS SDKs.",
      href: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
    },
    {
      company: "gRPC",
      product: "Client retries (proposal A6)",
      usage:
        "Per-method retry policies with exponential backoff and a token-bucket throttle that disables retries to a server that is failing broadly.",
      href: "https://github.com/grpc/proposal/blob/master/A6-client-retries.md",
    },
    {
      company: "Google",
      product: "SRE Book — Handling overload",
      usage:
        "Describes per-request and per-client retry budgets, and why retries at multiple layers multiply into cascading failure.",
      href: "https://sre.google/sre-book/handling-overload/",
    },
  ],
  references: [
    {
      label: "AWS — Timeouts, retries and backoff with jitter",
      href: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
    },
    {
      label: "AWS Architecture Blog — Exponential backoff and jitter",
      href: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/",
    },
  ],
  challenge: {
    prompt:
      "Compute a retry schedule bounded by a deadline. The first attempt starts immediately and costs attemptCostMs. Before retry number n (counting from 1) the client waits min(capMs, baseMs * 2^(n-1)). A retry is only made if the wait plus another attempt still finishes within deadlineMs of the start; otherwise the schedule ends there. There are at most maxAttempts attempts in total, including the first one. Return the array of delays actually used — empty when no retry fits, or when there was never room for the first attempt at all. This is the deterministic schedule; a real client samples a jittered value in [0, delay].",
    entry: "retryPlan",
    starter: `/**
 * @param {number} baseMs - the first backoff delay.
 * @param {number} capMs - the maximum any single delay may reach.
 * @param {number} maxAttempts - total attempts allowed, first one included.
 * @param {number} deadlineMs - total time budget from the start of attempt 1.
 * @param {number} attemptCostMs - how long each attempt itself takes.
 * @returns {number[]} the delays used, in order.
 */
function retryPlan(baseMs, capMs, maxAttempts, deadlineMs, attemptCostMs) {
  // Exponential, capped, and cut short by the deadline -- the budget, not the
  // attempt count, is what usually ends the schedule.
}
`,
    tests: [
      {
        name: "plain exponential backoff when nothing binds",
        body: `assertEquals(solution(100, 10000, 4, 1000000, 1000), [100, 200, 400]);`,
      },
      {
        name: "the cap flattens the curve",
        body: `assertEquals(solution(100, 250, 5, 1000000, 0), [100, 200, 250, 250]);`,
      },
      {
        name: "a cap below the base applies from the first delay",
        body: `assertEquals(solution(1000, 100, 3, 1000000, 0), [100, 100]);`,
      },
      {
        name: "the deadline ends the schedule before maxAttempts does",
        body: `// 1s attempts, 5s budget: the first retry fits at 3s total, the second
// would land at 6s, so ten allowed attempts turn into one retry.
assertEquals(solution(1000, 1000000, 10, 5000, 1000), [1000]);`,
      },
      {
        name: "a single allowed attempt means no retries",
        body: `assertEquals(solution(100, 1000, 1, 1000000, 10), []);`,
      },
      {
        name: "a budget that fits exactly one retry, to the millisecond",
        body: `// cost 10 + delay 100 + cost 10 = 120.
assertEquals(solution(100, 100, 5, 120, 10), [100]);
assertEquals(solution(100, 100, 5, 119, 10), []);`,
      },
      {
        name: "no room for even the first attempt",
        body: `assertEquals(solution(100, 1000, 5, 500, 1000), []);`,
      },
      {
        name: "a zero base still respects the attempt count",
        body: `// Immediate retries: the delays are all 0, so only maxAttempts stops it.
assertEquals(solution(0, 100, 3, 10, 1), [0, 0]);`,
      },
      {
        name: "the attempt cost is charged against the budget too",
        body: `// Same delays, but slow attempts eat the deadline: with 100ms attempts
// there is room for two retries, with 2000ms attempts there is room for none.
assertEquals(solution(100, 100, 5, 500, 100), [100, 100]);
assertEquals(solution(100, 100, 5, 500, 2000), []);`,
      },
      {
        name: "a long schedule stays capped and does not overflow",
        body: `// 200 attempts: the exponent runs past 2^190, so anything using a 32-bit
// shift instead of a real power will fall apart here.
var out = solution(10, 30000, 200, 1000000000, 100);
assertEquals(out.length, 199);
assertEquals(out[0], 10);
assertEquals(out[198], 30000);
var total = 0;
for (var i = 0; i < out.length; i++) total += out[i];
assert(total < 1000000000, "the schedule must stay inside the deadline");`,
      },
    ],
    hints: [
      "Track elapsed time starting at attemptCostMs — the first attempt has already happened before any retry is considered.",
      "Delay n is Math.min(capMs, baseMs * Math.pow(2, n - 1)). Use Math.pow, not a bit shift: the exponent goes past 31 on long schedules.",
      "Check the budget before committing to the retry: stop when elapsed + delay + attemptCostMs would exceed deadlineMs, and add both the delay and the attempt cost to elapsed when it does fit.",
    ],
    reference: `function retryPlan(baseMs, capMs, maxAttempts, deadlineMs, attemptCostMs) {
  const delays = [];

  // If the first attempt does not fit, nothing does.
  if (maxAttempts < 1 || attemptCostMs > deadlineMs) return delays;

  // The first attempt has already been spent before any retry is considered.
  let elapsed = attemptCostMs;

  for (let n = 1; n <= maxAttempts - 1; n++) {
    // Math.pow rather than a shift: << is 32-bit and wraps around on long
    // schedules, producing negative delays instead of the cap.
    const delay = Math.min(capMs, baseMs * Math.pow(2, n - 1));

    // The deadline is the real bound. Committing to a retry that cannot
    // finish inside the budget just burns the caller's remaining time.
    if (elapsed + delay + attemptCostMs > deadlineMs) break;

    delays.push(delay);
    elapsed += delay + attemptCostMs;
  }

  return delays;
}
`,
  },
};
