import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "oidc-flow",
  title: "OAuth 2.0 / OIDC Flow",
  category: "Security",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "Authz-code + PKCE, replay attack, tampered verifier — step by step.",
  caption:
    "Animate the OIDC dance between a browser, client app, authz server (Ory Hydra-style), and resource server. Swap scenarios to see why PKCE matters and how a replayed code gets rejected.",
  whereUsed: { label: "Auth stack at Tech Holding", href: "/#experience" },
  skillTags: ["Security", "System Design"],
  concept:
    "OAuth 2.0 grants delegated access to resources; OIDC layers identity (who is the user) on top via the id_token. The Authorization Code flow is the recommended grant for both web and SPAs — combined with PKCE (Proof Key for Code Exchange) for public clients that can't keep a secret.\n\nPKCE works by having the client generate a random code_verifier, hashing it (S256) into a code_challenge sent to the authz server. When exchanging the auth code for tokens, the client must present the original verifier. An attacker who intercepts the auth code can't redeem it without the verifier — even if they capture the redirect.\n\nOther safeguards: state parameter (CSRF), nonce (id_token replay), short-lived access tokens, refresh-token rotation, audience binding, JWKS-based signature validation.",
  realWorld: [
    "Google, Microsoft, Apple, Okta, Auth0, Ory Hydra — all standard OIDC providers.",
    "All major browsers' WebAuthn/passkey flows ride on top of OIDC.",
    "Most B2B SaaS uses OIDC for SSO instead of legacy SAML.",
  ],
  pitfalls: [
    "Implicit flow is deprecated — never use it for new code.",
    "Validating the id_token signature is non-optional; never trust the JSON without verifying with the JWKS.",
    "Refresh tokens stored in localStorage are XSS-exposed — use httpOnly cookies or BFF pattern.",
  ],
  references: [
    { label: "RFC 6749 — OAuth 2.0", href: "https://datatracker.ietf.org/doc/html/rfc6749" },
    { label: "RFC 7636 — PKCE", href: "https://datatracker.ietf.org/doc/html/rfc7636" },
    {
      label: "OpenID Connect Core 1.0",
      href: "https://openid.net/specs/openid-connect-core-1_0.html",
    },
  ],
  codeSnippet: {
    language: "ts",
    code: `// Authorization Code + PKCE — the only browser-safe OAuth flow today.
const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
const challenge = base64url(await crypto.subtle.digest("SHA-256", enc(verifier)));
sessionStorage.setItem("pkce_verifier", verifier);

location.href = \`\${issuer}/authorize?\` + new URLSearchParams({
  response_type: "code",
  client_id: clientId,
  redirect_uri: redirectUri,
  scope: "openid profile email",
  state: crypto.randomUUID(),        // CSRF binding, verify on return
  nonce: crypto.randomUUID(),        // replay binding, must match the id_token
  code_challenge: challenge,
  code_challenge_method: "S256",
});

// On the callback: exchange the one-time code for tokens with the verifier.
await fetch(\`\${issuer}/token\`, {
  method: "POST",
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code, redirect_uri: redirectUri, client_id: clientId,
    code_verifier: sessionStorage.getItem("pkce_verifier")!,
  }),
});`,
  },
  usedBy: [
    {
      company: "Google",
      product: "Sign in with Google",
      usage:
        "Google's identity platform is an OIDC provider; the id_token is a signed JWT verified against its published JWKS.",
      href: "https://developers.google.com/identity/openid-connect/openid-connect",
    },
    {
      company: "Okta / Auth0",
      product: "Enterprise SSO",
      usage:
        "Auth0 and Okta ship Authorization Code + PKCE as the default for SPAs and native apps, with the implicit flow deprecated.",
      href: "https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce",
    },
    {
      company: "Microsoft",
      product: "Entra ID (Azure AD)",
      usage:
        "Microsoft 365 sign-in issues OIDC id_tokens plus scoped access tokens for Graph API calls.",
      href: "https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc",
    },
    {
      company: "GitHub",
      product: "Actions OIDC to cloud providers",
      usage:
        "Workflows exchange a short-lived OIDC token for cloud credentials, removing long-lived secrets from CI.",
      href: "https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect",
    },
  ],
};
