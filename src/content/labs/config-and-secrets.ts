import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "config-and-secrets",
  title: "Config & Secrets",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "Rotation without an overlap window is not rotation. It is a scheduled outage.",
  caption:
    "A signing key rotating on a schedule, with the deploy that distributes the new key arriving late. The demo opens on a plan whose windows do not overlap: for forty minutes no key is valid for signing and tokens issued just before the cut cannot be verified by anyone.",
  skillTags: ["System Design", "Security", "Operations"],
  bridgesFrom: [
    {
      slug: "jwt-anatomy",
      sameness:
        "This IS the `kid` header you already used. A token names the key that signed it so the verifier can hold several keys at once, and that ability to hold several is the entire mechanism behind rotating any shared secret — database passwords, webhook signatures, API keys — not just JWTs.",
      delta:
        "The interesting part moves from the token to the calendar. A key needs three timestamps, not one: when it becomes usable for signing, when it stops being used for signing, and when it stops being accepted for verification. The verification window must outlive the signing window by at least the lifetime of the longest-lived artefact signed with it, and getting that ordering wrong produces an outage whose cause is a config file nobody changed today.",
    },
  ],
  concept:
    "Configuration is everything that varies between deployments of the same build: endpoints, timeouts, pool sizes, feature switches, credentials. The twelve-factor rule is to keep it out of the image and read it from the environment, and the practical reason is rollback — if config lives in the artefact, changing a timeout requires a build, and reverting a bad config requires finding which build had the good one.\n\nConfig comes in layers with a precedence order: compiled-in defaults, then a file, then environment variables, then per-instance overrides. Two rules make that survivable. Validate everything at startup, all at once, and refuse to boot on a missing or malformed value — a service that starts happily and fails on the first request that touches an unset variable has converted a deploy-time error into a customer-facing one. And never let a default fill in for a secret; a blank password that silently becomes 'postgres' is how test credentials reach production.\n\nSecrets are config with two extra properties: they must never be logged, and they must be rotatable without downtime. The logging problem is mundane and constant — secrets leak through exception handlers that dump the environment, through debug endpoints, through CI logs, and through a config object someone JSON-serialised into a trace attribute. The defence is structural: hold secrets in a wrapper type whose toString is redacted, and scan for them in CI rather than trusting review.\n\nRotation is where the design actually lives, and it is the same shape for every kind of secret. At any moment you need one key being used to sign or authenticate, and a set of keys still accepted for verification, and the second set has to be strictly larger for the duration of the change. Each key therefore carries three instants: activation, retirement from signing, and expiry from verification. The overlap between retirement and expiry must exceed the lifetime of anything signed with that key — a JWT with a one-hour TTL needs at least an hour of overlap, plus the time it takes the new key to reach every instance. Cut the overlap to zero and you get the classic incident: rotation completes successfully, monitoring is green, and every token issued in the previous hour is suddenly rejected.\n\nEnvelope encryption is how this scales to data at rest. A data key encrypts the payload, a key-management key encrypts the data key, and the encrypted data key is stored next to the ciphertext. Rotating the KMS key then re-wraps data keys instead of re-encrypting terabytes, which is the difference between a rotation that happens quarterly and one that never happens at all.",
  complexity: [
    { operation: "Read config at startup", time: "O(keys), once", space: "O(keys)" },
    {
      operation: "Validate on boot",
      time: "O(schema)",
      space: "fails the deploy, not the request",
    },
    {
      operation: "Key rotation overlap",
      time: "≥ max artefact TTL + propagation",
      space: "2 keys live",
    },
    { operation: "Envelope re-wrap", time: "O(data keys)", space: "O(1) per object" },
  ],
  codeSnippet: {
    language: "ts",
    code: `// Every key carries three instants, not one. The gap between them is the
// whole design.
type SigningKey = {
  id: string;
  activatesAt: number;  // first moment it may sign
  retiresAt: number;    // stops signing; still verifies
  expiresAt: number;    // stops verifying -- irreversible
};

function keySet(keys: SigningKey[], now: number) {
  // Sign with the newest key whose signing window is open. If none is, the
  // correct behaviour is to fail loudly: silently signing with an expired
  // key produces artefacts nobody will accept an hour from now.
  const signers = keys.filter((k) => k.activatesAt <= now && now < k.retiresAt);
  const signWith = signers.sort((a, b) => b.activatesAt - a.activatesAt)[0] ?? null;

  // Verify with everything still inside its verification window -- including
  // keys already retired from signing. That set must stay a superset of the
  // signing set for longer than your longest-lived token.
  const verifyWith = keys.filter((k) => k.activatesAt <= now && now < k.expiresAt);

  return { signWith, verifyWith };
}

// The rule that prevents the 3am incident:
//   retiresAt + maxTokenTTL + deployPropagation <= expiresAt
// Violate it and rotation "succeeds" while every token issued in the last
// hour becomes unverifiable.`,
  },
  realWorld: [
    "AWS Secrets Manager's rotation model stages a new secret version as AWSPENDING and only promotes it to AWSCURRENT once it is verified, keeping the previous version usable.",
    "Cloud KMS rotates a key by adding a new primary version while old versions stay enabled for decryption, which is exactly the sign/verify overlap.",
    "OIDC providers publish a JWKS containing several keys at once, so relying parties can verify tokens signed before and after a rotation.",
  ],
  pitfalls: [
    "Rotating with no overlap. The new key works immediately and everything signed with the old one — sessions, download URLs, webhook signatures — breaks at once.",
    "Serialising a config object into a log line or a trace attribute. It is the single most common way secrets end up in a system that retains them for ninety days.",
    "Defaulting a secret. A blank password that quietly becomes a development default is a production incident waiting for the right deploy order.",
    "Validating config lazily. The service boots, passes its health check, and fails on the first request that reads the unset variable — long after the deploy looked successful.",
  ],
  usedBy: [
    {
      company: "AWS",
      product: "Secrets Manager rotation",
      usage:
        "Four-step rotation (create, set, test, finish) with staging labels, so the previous secret version stays valid until the new one is proven.",
      href: "https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html",
    },
    {
      company: "Google Cloud",
      product: "Cloud KMS key rotation",
      usage:
        "New key versions become primary for encryption while older enabled versions continue to decrypt, so rotation never invalidates existing ciphertext.",
      href: "https://cloud.google.com/kms/docs/key-rotation",
    },
    {
      company: "HashiCorp",
      product: "Vault dynamic secrets",
      usage:
        "Issues short-lived, per-client credentials with a lease and revokes them on expiry, turning rotation from an event into the default state.",
      href: "https://developer.hashicorp.com/vault/docs/secrets",
    },
  ],
  references: [
    { label: "The Twelve-Factor App — Config", href: "https://12factor.net/config" },
    {
      label: "AWS KMS — Envelope encryption",
      href: "https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#enveloping",
    },
  ],
  challenge: {
    prompt:
      "Resolve the key set for a given instant. A key may sign from its activation until its retirement, and may verify from its activation until its expiry — so retired-but-unexpired keys still belong in the verification set, which is what makes rotation invisible to clients. Return the id of the key to sign with (the most recently activated one whose signing window is open, or null when none is) and every id valid for verification, ascending. A null signer is not an edge case to paper over; it is the rotation gap, and the point of computing it is to see it.",
    entry: "keyRotation",
    starter: `/**
 * @param {Array<{id: number, activatesAt: number, retiresAt: number, expiresAt: number}>} keys
 * @param {number} now
 * @returns {{signWith: number|null, verifyWith: number[]}} verifyWith ascending.
 */
function keyRotation(keys, now) {
  // Signing window: activatesAt <= now < retiresAt, newest activation wins.
  // Verification window: activatesAt <= now < expiresAt.
}
`,
    tests: [
      {
        name: "one key in its window signs and verifies itself",
        body: `var k = [{ id: 1, activatesAt: 0, retiresAt: 100, expiresAt: 200 }];
assertEquals(solution(k, 50), { signWith: 1, verifyWith: [1] });`,
      },
      {
        name: "a retired key still verifies while the new one signs",
        body: `// This overlap is the entire point: tokens signed by key 1 an hour ago
// must still be accepted after key 2 takes over signing.
var k = [
  { id: 1, activatesAt: 0, retiresAt: 100, expiresAt: 300 },
  { id: 2, activatesAt: 90, retiresAt: 400, expiresAt: 600 },
];
assertEquals(solution(k, 150), { signWith: 2, verifyWith: [1, 2] });`,
      },
      {
        name: "a rotation gap leaves nothing able to sign",
        body: `// Key 1 retired at 100 and expired at 120; key 2 does not activate until
// 200. Between 120 and 200 the service can neither sign nor verify.
var k = [
  { id: 1, activatesAt: 0, retiresAt: 100, expiresAt: 120 },
  { id: 2, activatesAt: 200, retiresAt: 400, expiresAt: 600 },
];
assertEquals(solution(k, 150), { signWith: null, verifyWith: [] });`,
      },
      {
        name: "a key that has not activated yet is not trusted early",
        body: `var k = [{ id: 1, activatesAt: 500, retiresAt: 900, expiresAt: 1000 }];
assertEquals(solution(k, 100), { signWith: null, verifyWith: [] });`,
      },
      {
        name: "the newest active key signs when two windows overlap",
        body: `var k = [
  { id: 1, activatesAt: 0, retiresAt: 500, expiresAt: 900 },
  { id: 2, activatesAt: 100, retiresAt: 500, expiresAt: 900 },
  { id: 3, activatesAt: 50, retiresAt: 500, expiresAt: 900 },
];
assertEquals(solution(k, 200), { signWith: 2, verifyWith: [1, 2, 3] });`,
      },
      {
        name: "activation is inclusive and retirement is exclusive",
        body: `var k = [{ id: 1, activatesAt: 100, retiresAt: 200, expiresAt: 300 }];
assertEquals(solution(k, 100).signWith, 1);
assertEquals(solution(k, 200).signWith, null);
assertEquals(solution(k, 200).verifyWith, [1]);`,
      },
      {
        name: "expiry is exclusive too",
        body: `var k = [{ id: 1, activatesAt: 0, retiresAt: 100, expiresAt: 300 }];
assertEquals(solution(k, 300), { signWith: null, verifyWith: [] });`,
      },
      {
        name: "verification ids come back ascending whatever order they are stored in",
        body: `var k = [
  { id: 9, activatesAt: 0, retiresAt: 10, expiresAt: 900 },
  { id: 2, activatesAt: 0, retiresAt: 10, expiresAt: 900 },
  { id: 5, activatesAt: 0, retiresAt: 10, expiresAt: 900 },
];
assertEquals(solution(k, 50).verifyWith, [2, 5, 9]);`,
      },
      {
        name: "no keys configured at all",
        body: `assertEquals(solution([], 100), { signWith: null, verifyWith: [] });`,
      },
      {
        name: "handles a long rotation history",
        body: `// One key per day for 5000 days, each verifying for three days.
var k = [];
for (var i = 0; i < 5000; i++) k.push({ id: i, activatesAt: i * 100, retiresAt: i * 100 + 100, expiresAt: i * 100 + 300 });
var out = solution(k, 400050);
assertEquals(out.signWith, 4000);
assertEquals(out.verifyWith, [3998, 3999, 4000]);`,
      },
    ],
    hints: [
      "Two independent filters over the same list: the signing window is activatesAt <= now < retiresAt, the verification window is activatesAt <= now < expiresAt.",
      "Among the keys that can sign, pick the one with the largest activatesAt — the newest one. Do not assume the array is stored in rotation order.",
      "Return null rather than falling back to a retired key. A signature made with a key nobody will accept in an hour is worse than a loud failure now.",
    ],
    reference: `function keyRotation(keys, now) {
  let signWith = null;
  let signerActivatedAt = -Infinity;
  const verifyWith = [];

  for (const key of keys) {
    // Nothing is trusted before it activates -- not for signing, and not for
    // verification either.
    if (key.activatesAt > now) continue;

    // Retired but unexpired keys stay here. This superset is what makes a
    // rotation invisible to clients holding older tokens.
    if (now < key.expiresAt) verifyWith.push(key.id);

    if (now < key.retiresAt && key.activatesAt > signerActivatedAt) {
      signerActivatedAt = key.activatesAt;
      signWith = key.id;
    }
  }

  return { signWith, verifyWith: verifyWith.sort((a, b) => a - b) };
}
`,
  },
};
