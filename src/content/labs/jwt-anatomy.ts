import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "jwt-anatomy",
  title: "JWT Anatomy",
  category: "Security",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Stateless auth and tampered tokens.",
  caption:
    "Deconstruct a JSON Web Token. Edit the payload and watch the signature turn red. Learn why JWTs are 'signed, not encrypted' and how to safely store user claims without a database round-trip.",
  skillTags: ["Security", "Auth", "Backend"],
  concept:
    "A JSON Web Token (JWT) is a compact, URL-safe way to represent claims between two parties. It consists of three parts separated by dots: **Header**, **Payload**, and **Signature**.\n\n- **Header**: Contains the algorithm (e.g., HS256) and token type.\n- **Payload**: Contains the actual data (claims) like user ID or expiration time.\n- **Signature**: Used to verify that the sender is who they say they are and that the message wasn't tampered with.\n\nJWTs are usually signed with a secret (HMAC) or a public/private key pair (RSA/ECDSA). Crucially, the payload is only Base64-encoded, NOT encrypted — anyone with the token can read the data, but only those with the key can modify it without breaking the signature.",
  realWorld: [
    "Microservices: passing user identity between services without hitting a central session DB.",
    "Single Sign-On (SSO): OIDC uses JWTs as ID Tokens.",
    "Stateless Sessions: reducing DB load in high-traffic applications.",
  ],
  pitfalls: [
    "Sensitive Data: NEVER put passwords or credit card numbers in a JWT payload.",
    "The 'alg: none' attack: older libraries allowed tokens with no signature; always validate the algorithm on the server.",
    "Expiration: Stateless tokens can't be easily revoked. Use short-lived JWTs with long-lived Refresh Tokens.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Verification is the whole security model — decoding is not verifying.
import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(new URL(\`\${issuer}/.well-known/jwks.json\`));

const { payload } = await jwtVerify(token, jwks, {
  issuer,                       // iss must match your IdP
  audience: clientId,           // aud must be *your* app
  algorithms: ["RS256"],        // pin algs: never accept "none" or alg confusion
  clockTolerance: "5s",
});

// payload.exp / nbf are checked by the library; revocation is not —
// short TTLs plus a refresh token (or a deny-list) are how you log someone out.`,
  },
  usedBy: [
    {
      company: "Auth0 / Okta",
      product: "Access & id tokens",
      usage:
        "Tokens are RS256-signed JWTs verified against a rotating JWKS endpoint rather than a shared secret.",
      href: "https://auth0.com/docs/secure/tokens/json-web-tokens",
    },
    {
      company: "Supabase / Firebase",
      product: "Row-level security claims",
      usage:
        "The JWT's claims are passed into database policies, so authorization is enforced in Postgres rather than app code.",
      href: "https://supabase.com/docs/guides/database/postgres/row-level-security",
    },
    {
      company: "CNCF",
      product: "Kubernetes service account tokens",
      usage:
        "Projected service-account tokens are audience-scoped, time-bound JWTs validated by the API server.",
      href: "https://kubernetes.io/docs/concepts/security/service-accounts/",
    },
    {
      company: "Stripe",
      product: "Connect / embedded session tokens",
      usage:
        "Short-lived signed tokens scope a client session to specific accounts and permissions.",
      href: "https://docs.stripe.com/connect",
    },
  ],
  references: [
    { label: "RFC 7519 — JSON Web Token", href: "https://datatracker.ietf.org/doc/html/rfc7519" },
    {
      label: "RFC 8725 — JWT best current practices (alg confusion, none)",
      href: "https://datatracker.ietf.org/doc/html/rfc8725",
    },
  ],
  challenge: {
    prompt:
      "Validate the claims of a decoded JWT and list everything wrong with it. Note what is missing here: the signature. A token whose claims all look right is still worthless until the signature is checked, and 'alg: none' exists to make you forget that.",
    entry: "validateClaims",
    starter: `/**
 * @param {{alg: string, iss: string, aud: string, exp: number, nbf: number}} token
 * @param {{now: number, issuer: string, audience: string}} expected
 * @returns {string[]} problems, ascending alphabetically. Empty when valid.
 *   Use: 'alg' when the algorithm is 'none', 'aud', 'exp' when expired (exp is
 *   exclusive), 'iss', and 'nbf' when used too early.
 */
function validateClaims(token, expected) {
  // Every failing check contributes, so a caller sees all of them at once.
}
`,
    tests: [
      {
        name: "a valid token has no problems",
        body: `assertEquals(solution({ alg: 'HS256', iss: 'me', aud: 'you', exp: 100, nbf: 0 }, { now: 50, issuer: 'me', audience: 'you' }), []);`,
      },
      {
        name: "rejects alg none",
        body: `assertEquals(solution({ alg: 'none', iss: 'me', aud: 'you', exp: 100, nbf: 0 }, { now: 50, issuer: 'me', audience: 'you' }), ['alg']);`,
      },
      {
        name: "detects an expired token",
        body: `assertEquals(solution({ alg: 'HS256', iss: 'me', aud: 'you', exp: 10, nbf: 0 }, { now: 50, issuer: 'me', audience: 'you' }), ['exp']);`,
      },
      {
        name: "expiry is exclusive",
        body: `assertEquals(solution({ alg: 'HS256', iss: 'me', aud: 'you', exp: 50, nbf: 0 }, { now: 50, issuer: 'me', audience: 'you' }), ['exp']);`,
      },
      {
        name: "detects a wrong issuer and audience",
        body: `assertEquals(solution({ alg: 'HS256', iss: 'them', aud: 'other', exp: 100, nbf: 0 }, { now: 50, issuer: 'me', audience: 'you' }), ['aud', 'iss']);`,
      },
      {
        name: "detects a token used too early",
        body: `assertEquals(solution({ alg: 'HS256', iss: 'me', aud: 'you', exp: 100, nbf: 90 }, { now: 50, issuer: 'me', audience: 'you' }), ['nbf']);`,
      },
      {
        name: "reports every problem at once",
        body: `var out = solution({ alg: 'none', iss: 'x', aud: 'y', exp: 1, nbf: 99 }, { now: 50, issuer: 'me', audience: 'you' });
assertEquals(out, ['alg', 'aud', 'exp', 'iss', 'nbf']);`,
      },
    ],
    hints: [
      "Collect problems into an array rather than returning at the first failure.",
      "Expiry is exclusive, so now equal to exp is already expired; nbf is inclusive.",
      "Sort the array before returning so the order does not depend on your check order.",
    ],
    reference: `function validateClaims(token, expected) {
  const problems = [];
  // 'none' means the signature is skipped entirely -- always reject it.
  if (token.alg === 'none') problems.push('alg');
  if (token.iss !== expected.issuer) problems.push('iss');
  if (token.aud !== expected.audience) problems.push('aud');
  if (expected.now >= token.exp) problems.push('exp'); // exclusive
  if (expected.now < token.nbf) problems.push('nbf'); // inclusive
  return problems.sort();
}
`,
  },
};
