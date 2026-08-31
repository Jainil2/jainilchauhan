import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "feature-flags",
  title: "Feature Flags",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "A percentage rollout is a hash ring with two nodes, and the salt decides who gets hurt.",
  caption:
    "Twenty users bucketed into two independent 25% rollouts. The demo opens with a shared salt, so both flags select exactly the same five users — the correlated-exposure bug that makes one unlucky cohort the test subject for every experiment you run.",
  skillTags: ["System Design", "Release Engineering", "Hashing"],
  bridgesFrom: [
    {
      slug: "consistent-hashing",
      sameness:
        "A percentage rollout IS the hash ring. You hash a key, look at where it lands in a fixed 0–99 space, and a range of that space owns it. Stickiness — the same user seeing the same variant on every request, from every server, with no shared state — is the identical property that lets any node in a cluster agree on placement without coordinating.",
      delta:
        "The ring's monotonicity now protects a person rather than a cache. Growing a rollout from 5% to 25% must only add users, never swap them, because a user who sees a feature and then loses it files a bug — so the mapping has to be a widening prefix of the space, not a re-partition. And the salt moves from a nicety to a requirement: hash the user id alone and every flag picks the same cohort, so your riskiest ten features all land on the same unlucky 5% of customers.",
    },
  ],
  concept:
    "A feature flag decouples deploy from release. The code ships dark, dozens of times a day, and a separate configuration decision — flipped in seconds, without a build — decides who executes it. That decoupling is what makes trunk-based development and continuous deployment survivable: a bad release is a config change to revert, not a rollback of a binary.\n\nEvaluation must be deterministic and local. A flag SDK pulls the whole ruleset into memory and evaluates it in microseconds with no network call, because a flag check sits in a hot path and cannot introduce a dependency that can fail. Determinism comes from hashing: bucket = hash(flagKey + ':' + userId) % 100, and the user is in the rollout when bucket < percentage. Every server computes the same answer independently, so a user's experience is stable across requests, sessions and machines without anything being stored.\n\nThe salt is what most homegrown implementations get wrong. Hash the user id alone and the bucket is a property of the user rather than of the flag, so every 10% rollout in the system selects the same 10% of users. That cohort receives every risky change first and experiences the product as constantly broken, while your aggregate error rate looks fine because it is concentrated. Mixing the flag key into the hash makes the cohorts independent, which is also what makes an A/B test's control group honest.\n\nThe ordering of the rules matters more than it looks. The kill switch must beat everything, including allow lists — during an incident, 'disable this flag' has to mean disabled, not 'disabled except for the seventeen internal accounts someone added last quarter'. Deny beats allow. Only then does the percentage apply. Getting that order wrong is discovered at the worst moment, because the moment you reach for the kill switch is by definition the moment something is on fire.\n\nThe cost of flags is flags. Each one doubles the number of code paths, and the interaction of ten flags is a thousand configurations you have never tested. Mature teams treat a permanent flag as a defect: temporary release flags get an owner and an expiry date, and there is a scheduled job that lists flags older than sixty days. Long-lived flags — kill switches for expensive dependencies, per-plan entitlements — are a different category and should be named differently, because they are configuration, not an unfinished release.",
  complexity: [
    { operation: "Evaluate a flag", time: "O(1), sub-microsecond", space: "O(rules) in memory" },
    { operation: "Ruleset refresh", time: "streamed, ~seconds to propagate", space: "O(flags)" },
    {
      operation: "Widen a rollout",
      time: "O(1) config change",
      space: "blast radius: the added slice",
    },
    { operation: "Kill switch", time: "seconds, no deploy", space: "blast radius: everyone" },
  ],
  codeSnippet: {
    language: "ts",
    code: `// 32-bit FNV-1a. Any stable hash works; what matters is that every server
// computes the same value with no shared state.
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function isEnabled(flag: Flag, userId: string): boolean {
  // 1. Kill switch wins over everything, including the allow list. During an
  //    incident "off" has to mean off.
  if (!flag.enabled) return false;
  if (flag.deny.includes(userId)) return false;
  if (flag.allow.includes(userId)) return true;

  // 2. The flag key is the salt. Without it the bucket is a property of the
  //    user, so every rollout in the system picks the same cohort and one
  //    unlucky slice of customers beta-tests everything you ship.
  const bucket = fnv1a(flag.key + ":" + userId) % 100;

  // 3. Strictly less-than keeps the rollout monotonic: widening 5% -> 25%
  //    only ever adds users. Nobody loses a feature they already saw.
  return bucket < flag.rolloutPercent;
}`,
  },
  realWorld: [
    "Netflix's experimentation platform allocates users to test cells deterministically so allocation survives restarts and is consistent across services.",
    "Uber's experimentation platform runs flags and experiments on the same bucketing substrate, with per-experiment salts keeping cohorts independent.",
    "OpenFeature standardises the evaluation API — targeting keys, rules, and default values — so flag logic is portable across vendors.",
  ],
  pitfalls: [
    "Hashing the user id without the flag key. Every rollout then selects the same users, and one cohort experiences every regression you ship.",
    "Evaluating flags with a network call in the request path. You have added a hard dependency to every code path the flag guards, including the ones that exist to survive outages.",
    "Letting the allow list outrank the kill switch. The switch is only ever reached during an incident, which is exactly when the exception list should not apply.",
    "Never deleting flags. Ten live flags is a thousand possible configurations, and your test suite covers one of them.",
  ],
  usedBy: [
    {
      company: "Netflix",
      product: "Experimentation platform",
      usage:
        "Deterministic allocation of members to test cells, evaluated locally so every service agrees on a member's variant without coordination.",
      href: "https://netflixtechblog.com/its-all-a-bout-testing-the-netflix-experimentation-platform-4e1ca458c15",
    },
    {
      company: "Uber",
      product: "XP experimentation platform",
      usage:
        "Runs feature rollouts and A/B tests on one bucketing system, with per-experiment hashing so overlapping tests do not share cohorts.",
      href: "https://www.uber.com/en-US/blog/xp/",
    },
    {
      company: "OpenFeature",
      product: "Flag evaluation specification",
      usage:
        "A CNCF specification for flag evaluation — targeting key, rules, variants, defaults — implemented by multiple vendors and SDKs.",
      href: "https://openfeature.dev/specification/",
    },
  ],
  references: [
    {
      label: "Martin Fowler — Feature Toggles",
      href: "https://martinfowler.com/articles/feature-toggles.html",
    },
    { label: "OpenFeature specification", href: "https://openfeature.dev/specification/" },
  ],
  challenge: {
    prompt:
      "Implement flag evaluation. The rule order is fixed and it matters: a disabled flag is off for everyone including allow-listed users, deny beats allow, and only then does the percentage bucket apply. Bucket with the FNV-1a hash already provided, over flag.key + ':' + userId, modulo 100, and include a user when their bucket is strictly below the rollout percentage. That last detail is what makes widening a rollout add users instead of reshuffling them.",
    entry: "evaluate",
    starter: `/** 32-bit FNV-1a. Already written — use it, do not change it. */
function fnv1a(str) {
  var h = 0x811c9dc5;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * @param {{key: string, enabled: boolean, rolloutPercent: number, allow?: string[], deny?: string[]}} flag
 * @param {string} userId
 * @returns {boolean}
 */
function evaluate(flag, userId) {
  // Kill switch, then deny, then allow, then the bucket.
}
`,
    tests: [
      {
        name: "a disabled flag is off even for an allow-listed user",
        body: `var f = { key: "checkout-v2", enabled: false, rolloutPercent: 100, allow: ["u1"], deny: [] };
assertEquals(solution(f, "u1"), false);`,
      },
      {
        name: "deny beats allow",
        body: `var f = { key: "checkout-v2", enabled: true, rolloutPercent: 100, allow: ["u1"], deny: ["u1"] };
assertEquals(solution(f, "u1"), false);`,
      },
      {
        name: "an allow-listed user is in at zero percent",
        body: `var f = { key: "checkout-v2", enabled: true, rolloutPercent: 0, allow: ["u1"], deny: [] };
assertEquals(solution(f, "u1"), true);
assertEquals(solution(f, "u2"), false);`,
      },
      {
        name: "a hundred percent includes everyone",
        body: `var f = { key: "checkout-v2", enabled: true, rolloutPercent: 100, allow: [], deny: [] };
for (var i = 0; i < 500; i++) assert(solution(f, "user-" + i), "user-" + i + " should be in");`,
      },
      {
        name: "zero percent includes nobody",
        body: `var f = { key: "checkout-v2", enabled: true, rolloutPercent: 0, allow: [], deny: [] };
for (var i = 0; i < 500; i++) assert(!solution(f, "user-" + i), "user-" + i + " should be out");`,
      },
      {
        name: "evaluation is deterministic across calls",
        body: `var f = { key: "search-rerank", enabled: true, rolloutPercent: 37, allow: [], deny: [] };
for (var i = 0; i < 200; i++) {
  var u = "u" + i;
  assertEquals(solution(f, u), solution(f, u));
}`,
      },
      {
        name: "missing allow and deny arrays are treated as empty",
        body: `var f = { key: "checkout-v2", enabled: true, rolloutPercent: 100 };
assertEquals(solution(f, "u1"), true);`,
      },
      {
        name: "widening a rollout only ever adds users",
        body: `// The monotonicity property: nobody loses a feature they already saw.
var small = { key: "nav-redesign", enabled: true, rolloutPercent: 20, allow: [], deny: [] };
var big = { key: "nav-redesign", enabled: true, rolloutPercent: 50, allow: [], deny: [] };
for (var i = 0; i < 2000; i++) {
  var u = "member-" + i;
  if (solution(small, u)) assert(solution(big, u), u + " lost the feature when the rollout grew");
}`,
      },
      {
        name: "two flags at the same percentage pick different cohorts",
        body: `// If these sets match, the flag key is not in the hash and one unlucky
// cohort is beta-testing everything you ship.
var a = { key: "flag-a", enabled: true, rolloutPercent: 10, allow: [], deny: [] };
var b = { key: "flag-b", enabled: true, rolloutPercent: 10, allow: [], deny: [] };
var inA = 0, inB = 0, both = 0;
for (var i = 0; i < 2000; i++) {
  var u = "member-" + i;
  var ra = solution(a, u), rb = solution(b, u);
  if (ra) inA++;
  if (rb) inB++;
  if (ra && rb) both++;
}
assert(inA > 0 && inB > 0, "both flags should include someone");
assert(both < inA, "the cohorts must not be identical");`,
      },
      {
        name: "buckets spread evenly enough to trust the percentage",
        body: `var f = { key: "pricing-experiment", enabled: true, rolloutPercent: 30, allow: [], deny: [] };
var n = 10000, hits = 0;
for (var i = 0; i < n; i++) if (solution(f, "member-" + i)) hits++;
assert(Math.abs(hits / n - 0.3) < 0.03, "expected ~30%, got " + (hits / n));`,
      },
    ],
    hints: [
      "Write the four rules in order and return early from each one. The order is the answer: enabled, deny, allow, bucket.",
      "The salt is flag.key + ':' + userId. Hashing the user id alone passes most tests and fails the one about two flags picking different cohorts.",
      "Use `bucket < rolloutPercent`, not `<=`. With `<=` a 0% rollout still includes bucket 0, and the rollout is off by one user in a hundred at every step.",
    ],
    reference: `function fnv1a(str) {
  var h = 0x811c9dc5;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function evaluate(flag, userId) {
  // 1. The kill switch outranks everything. The moment you reach for it is
  //    the moment an exception list must not apply.
  if (!flag.enabled) return false;

  const deny = flag.deny || [];
  if (deny.indexOf(userId) !== -1) return false;

  const allow = flag.allow || [];
  if (allow.indexOf(userId) !== -1) return true;

  // 2. The flag key salts the hash, so cohorts across flags are independent.
  const bucket = fnv1a(flag.key + ":" + userId) % 100;

  // 3. Strictly less-than. Widening the rollout extends the range upward,
  //    so the set of included users only ever grows.
  return bucket < flag.rolloutPercent;
}
`,
  },
};
