import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "blue-green-canary",
  title: "Blue-Green & Canary",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "A canary that sees too little traffic cannot fail. It can only fail to notice.",
  caption:
    "A canary taking 1% of traffic for a two-minute bake. In the default state the new version really is worse, the observed error counts differ, and the difference is smaller than the sampling noise — so the automated verdict is a green promote based on eleven requests.",
  skillTags: ["System Design", "Release Engineering", "Statistics"],
  bridgesFrom: [
    {
      slug: "circuit-breaker",
      sameness:
        "Canary analysis IS a circuit breaker, and the thing it is wrapped around is your own new version. Count outcomes over a window, compare the failure rate against a threshold, trip when it is exceeded. Same state machine: closed is baking, open is rolled back, and the small slice of traffic on the canary is the half-open probe.",
      delta:
        "The window is now a statistical sample rather than a stream of facts, and a small sample cannot tell a regression from noise. A breaker with five failures out of five is certain; a canary with five errors out of eleven requests is not evidence of anything. So the verdict has three values, not two — promote, roll back, and 'you did not collect enough data', and treating the third as the first is how bad releases get promoted automatically.",
    },
  ],
  concept:
    "Blue-green and canary answer the same question with opposite shapes. Blue-green runs two complete environments and flips all traffic at once: the cutover is instant, the rollback is instant, and you needed twice the fleet for the duration. Canary sends a small slice of traffic to the new version, watches, and widens if the numbers hold: cheap, gradual, and slow, with the new version and the old one live at the same time — which means the database schema, the message formats and the caches must be compatible with both.\n\nThe hard part of a canary is not the traffic splitting; it is the verdict. You are comparing two samples and deciding whether a difference is real. That comparison has a floor set by sample size: with 1% of 2,000 requests per second for two minutes, the canary handles about 2,400 requests, and if the baseline error rate is 0.5% you expect twelve errors. A regression that doubles the error rate produces twenty-four. Twelve extra errors against a Poisson standard deviation of roughly three and a half is detectable; a regression that adds 0.1 percentage points is not, at any bake time you are willing to wait. Before you build a canary, work out what size of regression it can actually see — most cannot see the ones that matter.\n\nThat arithmetic drives the design. Comparing the canary against the currently-deployed baseline rather than against yesterday's dashboard removes time-of-day effects. Routing a fixed set of users rather than random requests keeps sessions coherent. And the canary must carry a representative slice: if your load balancer sends it the requests with the lowest latency, or a single region, or only the cheap endpoints, you have measured something other than production.\n\nThe verdict must also be automated, because a human watching a dashboard for ten minutes will promote a marginal release. Netflix's Kayenta compares canary and baseline across many metrics and returns a score; the important design choice is that the score has three outcomes. Pass, fail, and inconclusive — where inconclusive means not enough signal — and inconclusive must not silently mean pass. It usually means extend the bake or widen the slice.\n\nWhat neither strategy solves is the irreversible part. A rollback restores the binary, not the data: rows written by the new version in a new format stay written, messages published in a new schema stay consumed, and a cache poisoned with the new representation stays poisoned. This is why deploys and migrations are separated, why expand/contract exists, and why 'we can always roll back' is true of code and false of state.",
  complexity: [
    { operation: "Blue-green cutover", time: "seconds", space: "2x fleet for the window" },
    { operation: "Canary bake", time: "minutes to hours", space: "1x fleet + a slice" },
    { operation: "Detectable regression", time: "∝ 1/√(canary requests)", space: "—" },
    { operation: "Rollback", time: "code: seconds", space: "data: not at all" },
  ],
  codeSnippet: {
    language: "py",
    code: `from math import sqrt

def canary_verdict(base_n, base_err, can_n, can_err, budget, min_samples):
    if can_n < min_samples:
        # NOT a pass. "We did not collect enough data" is its own answer,
        # and auto-promoting on it is how bad releases ship green.
        return "inconclusive"

    base_rate = base_err / base_n
    can_rate  = can_err / can_n
    delta     = can_rate - base_rate
    if delta <= budget:
        return "promote"

    # Pooled standard error: how much two samples of these sizes differ by
    # luck alone. Two of them is roughly a 95% band.
    p     = (base_err + can_err) / (base_n + can_n)
    noise = 2 * sqrt(p * (1 - p) / can_n)
    return "rollback" if delta > noise else "inconclusive"

# 1% of 2000 rps for 2 minutes = 2400 canary requests.
# At a 0.5% baseline the noise floor is ~0.29 percentage points -- so this
# canary cannot see a regression smaller than that, no matter the threshold.
print(canary_verdict(240_000, 1_200, 2_400, 19, 0.001, 1_000))  # inconclusive`,
  },
  realWorld: [
    "Netflix's Kayenta scores a canary against a concurrently-running baseline across many metrics, rather than against historical dashboards.",
    "Google's SRE workbook describes canarying as a hypothesis test with an explicit decision on how much traffic and how long, chosen from the effect size you need to detect.",
    "AWS CodeDeploy and ALB weighted target groups implement both shapes — all-at-once blue/green traffic shifting and linear or canary percentage steps.",
  ],
  pitfalls: [
    "Treating 'no signal' as 'no problem'. A canary with 200 requests cannot detect anything; promoting on it is promoting untested code with extra steps.",
    "Comparing the canary against yesterday's baseline. Time-of-day and traffic-mix differences swamp the effect you are looking for.",
    "Sending the canary unrepresentative traffic — one region, one client version, only cached endpoints — and concluding the release is safe.",
    "Believing rollback is total. It restores the binary; the rows, messages and cache entries the new version wrote in a new shape stay exactly where they are.",
  ],
  usedBy: [
    {
      company: "Netflix",
      product: "Kayenta / Spinnaker automated canary analysis",
      usage:
        "Runs baseline and canary side by side, scores them across metric groups, and gates promotion on the score rather than on a human reading a dashboard.",
      href: "https://netflixtechblog.com/automated-canary-analysis-at-netflix-with-kayenta-3260bc7acc69",
    },
    {
      company: "Google",
      product: "SRE Workbook — Canarying releases",
      usage:
        "Frames a canary as an experiment with a chosen population size and duration, derived from the size of the regression you need to catch.",
      href: "https://sre.google/workbook/canarying-releases/",
    },
    {
      company: "AWS",
      product: "CodeDeploy blue/green and canary traffic shifting",
      usage:
        "Shifts traffic between target groups all-at-once, linearly, or in canary steps, with CloudWatch alarms as the automatic rollback trigger.",
      href: "https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html",
    },
  ],
  references: [
    {
      label: "Google SRE Workbook — Canarying releases",
      href: "https://sre.google/workbook/canarying-releases/",
    },
    {
      label: "Martin Fowler — BlueGreenDeployment",
      href: "https://martinfowler.com/bliki/BlueGreenDeployment.html",
    },
  ],
  challenge: {
    prompt:
      "Write the automated verdict for a canary. Return 'promote', 'rollback', or 'inconclusive'. Below the minimum sample size the answer is inconclusive and nothing else — that is the rule that stops a green light being issued on eleven requests. Above it, compare the canary's error rate against the baseline's: within the budget is a promote, and beyond the budget is a rollback only when the difference also clears the noise floor, two pooled standard errors. A regression you cannot distinguish from luck is not a rollback, it is a request for more data.",
    entry: "canaryVerdict",
    starter: `/**
 * @param {{baselineRequests: number, baselineErrors: number,
 *          canaryRequests: number, canaryErrors: number,
 *          minSamples: number, maxErrorRateDelta: number}} input
 * @returns {"promote"|"rollback"|"inconclusive"}
 *   Throws when there is no baseline to compare against.
 *   Noise floor: 2 * sqrt(p * (1 - p) / canaryRequests), where p is the
 *   pooled error rate across both populations.
 */
function canaryVerdict(input) {
  // sample size -> budget -> noise floor, in that order.
}
`,
    tests: [
      {
        name: "a clean canary with plenty of traffic is promoted",
        body: `assertEquals(solution({
  baselineRequests: 100000, baselineErrors: 500,
  canaryRequests: 20000, canaryErrors: 100,
  minSamples: 1000, maxErrorRateDelta: 0.002,
}), "promote");`,
      },
      {
        name: "a large regression with plenty of traffic is rolled back",
        body: `assertEquals(solution({
  baselineRequests: 100000, baselineErrors: 500,
  canaryRequests: 20000, canaryErrors: 2000,
  minSamples: 1000, maxErrorRateDelta: 0.002,
}), "rollback");`,
      },
      {
        name: "the same regression on a tiny sample is inconclusive, not a pass",
        body: `// 10% errors on 40 requests. The new version really is worse and the
// canary cannot say so. This must not read as "promote".
assertEquals(solution({
  baselineRequests: 100000, baselineErrors: 500,
  canaryRequests: 40, canaryErrors: 4,
  minSamples: 1000, maxErrorRateDelta: 0.002,
}), "inconclusive");`,
      },
      {
        name: "exactly the minimum sample size is evaluated, not short-circuited",
        body: `assertEquals(solution({
  baselineRequests: 100000, baselineErrors: 500,
  canaryRequests: 1000, canaryErrors: 100,
  minSamples: 1000, maxErrorRateDelta: 0.002,
}), "rollback");`,
      },
      {
        name: "a canary better than the baseline is promoted",
        body: `assertEquals(solution({
  baselineRequests: 100000, baselineErrors: 2000,
  canaryRequests: 20000, canaryErrors: 40,
  minSamples: 1000, maxErrorRateDelta: 0.002,
}), "promote");`,
      },
      {
        name: "a delta exactly on the budget is still a promote",
        body: `assertEquals(solution({
  baselineRequests: 100000, baselineErrors: 1000,
  canaryRequests: 10000, canaryErrors: 120,
  minSamples: 1000, maxErrorRateDelta: 0.002,
}), "promote");`,
      },
      {
        name: "over budget but inside the noise floor is inconclusive",
        body: `// 1.1% against 1.0% on 2000 requests: over a very tight budget, and
// well inside what two samples of that size differ by from luck alone.
assertEquals(solution({
  baselineRequests: 100000, baselineErrors: 1000,
  canaryRequests: 2000, canaryErrors: 22,
  minSamples: 1000, maxErrorRateDelta: 0.0001,
}), "inconclusive");`,
      },
      {
        name: "a canary with no traffic at all",
        body: `assertEquals(solution({
  baselineRequests: 100000, baselineErrors: 500,
  canaryRequests: 0, canaryErrors: 0,
  minSamples: 0, maxErrorRateDelta: 0.002,
}), "inconclusive");`,
      },
      {
        name: "a flawless baseline still promotes a canary inside budget",
        body: `assertEquals(solution({
  baselineRequests: 50000, baselineErrors: 0,
  canaryRequests: 10000, canaryErrors: 5,
  minSamples: 1000, maxErrorRateDelta: 0.001,
}), "promote");`,
      },
      {
        name: "no baseline means there is nothing to compare against",
        body: `assertThrows(function () {
  solution({
    baselineRequests: 0, baselineErrors: 0,
    canaryRequests: 10000, canaryErrors: 5,
    minSamples: 100, maxErrorRateDelta: 0.001,
  });
}, "an empty baseline must throw");`,
      },
      {
        name: "at production volume the noise floor stops hiding small regressions",
        body: `// 0.2 percentage points is invisible on 2000 requests and unmissable
// on a million. Same code, same threshold, different sample size.
var input = {
  baselineRequests: 5000000, baselineErrors: 50000,
  canaryRequests: 1000000, canaryErrors: 12000,
  minSamples: 10000, maxErrorRateDelta: 0.001,
};
for (var i = 0; i < 5000; i++) assertEquals(solution(input), "rollback");`,
      },
    ],
    hints: [
      "Check the three gates in order and return early from each: too few samples, then inside the error budget, then the noise comparison.",
      "The pooled rate is (baselineErrors + canaryErrors) / (baselineRequests + canaryRequests) — one rate estimated from both populations, which is what makes the noise floor meaningful when the baseline has zero errors.",
      "A canary with zero requests must return inconclusive before any division happens, otherwise the rate is NaN and every comparison against it is false.",
    ],
    reference: `function canaryVerdict(input) {
  const {
    baselineRequests,
    baselineErrors,
    canaryRequests,
    canaryErrors,
    minSamples,
    maxErrorRateDelta,
  } = input;

  if (!(baselineRequests > 0)) {
    throw new Error("no baseline to compare against");
  }

  // Gate 1: sample size. This is the gate that matters, and the one that gets
  // collapsed into "promote" by implementations that only have two answers.
  if (canaryRequests <= 0 || canaryRequests < minSamples) return "inconclusive";

  const baselineRate = baselineErrors / baselineRequests;
  const canaryRate = canaryErrors / canaryRequests;
  const delta = canaryRate - baselineRate;

  // Gate 2: the error budget. Negative deltas land here too -- a canary that
  // is better than the baseline is a promote, not a suspicious result.
  if (delta <= maxErrorRateDelta) return "promote";

  // Gate 3: is the difference bigger than luck? Pooled rate, because the
  // baseline alone can be zero and a zero noise floor would make every
  // one-error blip a rollback.
  const pooled = (baselineErrors + canaryErrors) / (baselineRequests + canaryRequests);
  const noise = 2 * Math.sqrt((pooled * (1 - pooled)) / canaryRequests);

  return delta > noise ? "rollback" : "inconclusive";
}
`,
  },
};
