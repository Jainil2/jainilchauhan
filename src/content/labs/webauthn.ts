import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "webauthn",
  title: "WebAuthn / Passkeys",
  category: "Security",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "The end of the password.",
  caption:
    "Step into the future of authentication. Simulate a hardware-backed registration and login flow. See how public-key cryptography and biometrics replace vulnerable passwords with unphishable Passkeys.",
  skillTags: ["Security", "Auth", "Passkeys"],
  concept:
    "WebAuthn (Web Authentication) is a web standard that allows users to log in to websites using secure, hardware-backed credentials like biometrics (TouchID/FaceID) or USB security keys (YubiKeys).\n\nUnlike passwords, which are sent to a server and can be stolen, WebAuthn uses **Public Key Cryptography**:\n1. The user's device creates a unique key pair for the site.\n2. The device sends the **Public Key** to the server.\n3. To log in, the server sends a 'challenge'. The device signs it with the **Private Key** (after biometric verification) and sends it back.\n\nThis is 'unphishable' because the device only signs challenges for the specific domain it was registered with.",
  realWorld: [
    "Google Passkeys: the default login method for Google Accounts.",
    "Apple iCloud Keychain: syncing passkeys across devices.",
    "GitHub: supports WebAuthn for 2FA and passwordless login.",
  ],
  pitfalls: [
    "Recovery: If a user loses their only hardware key, they are locked out. Always encourage multiple keys or secondary recovery methods.",
    "Browser Support: While broad, some older browsers or enterprise environments still lack full WebAuthn support.",
  ],
  references: [
    { label: "W3C Web Authentication Working Group", href: "https://www.w3.org/TR/webauthn-2/" },
    { label: "FIDO Alliance — How it works", href: "https://fidoalliance.org/how-fido-works/" },
  ],
  codeSnippet: {
    language: "ts",
    code: `// Registration: the authenticator keeps the private key; the server stores a public key.
const cred = (await navigator.credentials.create({
  publicKey: {
    challenge: serverChallenge,               // random, single use, server-generated
    rp: { id: "example.com", name: "Example" }, // origin binding kills phishing
    user: { id: userIdBytes, name: email, displayName: name },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],   // ES256
    authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
    usedBy: [
      {
        company: "Apple",
        product: "iCloud Keychain passkeys",
        usage: "Passkeys sync across devices and replace passwords with Face ID / Touch ID-gated WebAuthn credentials.",
        href: "https://developer.apple.com/passkeys/",
      },
      {
        company: "Google",
        product: "Passkeys for Google Accounts",
        usage: "Google made passkeys the default sign-in option and reports faster, phishing-resistant authentication.",
        href: "https://blog.google/technology/safety-security/the-beginning-of-the-end-of-the-password/",
      },
      {
        company: "GitHub",
        product: "Security keys & passkeys for 2FA",
        usage: "GitHub supports WebAuthn security keys and passkeys, including for sudo-mode reauthentication.",
        href: "https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication",
      },
      {
        company: "Cloudflare",
        product: "Company-wide hardware keys",
        usage: "Cloudflare credits mandatory hardware security keys with blocking a targeted phishing campaign that hit other companies.",
        href: "https://blog.cloudflare.com/2022-07-sms-phishing-attacks/",
      },
    ],
  },
})) as PublicKeyCredential;

// Login: sign the challenge; the server verifies with the stored public key
// and checks the signature counter / origin. No shared secret ever leaves the device.
await navigator.credentials.get({ publicKey: { challenge, rpId: "example.com" } });`,
  },
  usedBy: [
    {
      company: "Apple",
      product: "iCloud Keychain passkeys",
      usage:
        "Passkeys sync across devices and replace passwords with Face ID / Touch ID-gated WebAuthn credentials.",
      href: "https://developer.apple.com/passkeys/",
    },
    {
      company: "Google",
      product: "Passkeys for Google Accounts",
      usage:
        "Google made passkeys the default sign-in option and reports faster, phishing-resistant authentication.",
      href: "https://blog.google/technology/safety-security/the-beginning-of-the-end-of-the-password/",
    },
    {
      company: "GitHub",
      product: "Security keys & passkeys for 2FA",
      usage:
        "GitHub supports WebAuthn security keys and passkeys, including for sudo-mode reauthentication.",
      href: "https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication",
    },
    {
      company: "Cloudflare",
      product: "Company-wide hardware keys",
      usage:
        "Cloudflare credits mandatory hardware security keys with blocking a targeted phishing campaign that hit other companies.",
      href: "https://blog.cloudflare.com/2022-07-sms-phishing-attacks/",
    },
  ],
  challenge: {
    prompt:
      "Verify the clientDataJSON of a WebAuthn assertion. The origin check is the part that makes passkeys phishing-resistant: the browser reports where the ceremony really happened, so a credential simply will not work on a lookalike domain.",
    entry: "verifyClientData",
    starter: `/**
 * @param {{type: string, challenge: string, origin: string, crossOrigin: boolean}} clientData
 * @param {{type: string, challenge: string, origin: string}} expected
 * @returns {string[]} problems, ascending alphabetically. Empty when valid.
 *   Use 'type', 'challenge', 'origin' and 'crossOrigin'.
 */
function verifyClientData(clientData, expected) {
  // Compare the challenge exactly -- it is the replay defence, and accepting a
  // stale one throws that away.
}
`,
    tests: [
      {
        name: "a valid assertion",
        body: `assertEquals(solution({ type: 'webauthn.get', challenge: 'abc', origin: 'https://a.com', crossOrigin: false }, { type: 'webauthn.get', challenge: 'abc', origin: 'https://a.com' }), []);`,
      },
      {
        name: "detects a wrong ceremony type",
        body: `assertEquals(solution({ type: 'webauthn.create', challenge: 'abc', origin: 'https://a.com', crossOrigin: false }, { type: 'webauthn.get', challenge: 'abc', origin: 'https://a.com' }), ['type']);`,
      },
      {
        name: "detects a replayed challenge",
        body: `assertEquals(solution({ type: 'webauthn.get', challenge: 'old', origin: 'https://a.com', crossOrigin: false }, { type: 'webauthn.get', challenge: 'abc', origin: 'https://a.com' }), ['challenge']);`,
      },
      {
        name: "rejects a lookalike origin",
        body: `assertEquals(solution({ type: 'webauthn.get', challenge: 'abc', origin: 'https://a.com.evil.com', crossOrigin: false }, { type: 'webauthn.get', challenge: 'abc', origin: 'https://a.com' }), ['origin']);`,
      },
      {
        name: "rejects a cross-origin ceremony",
        body: `assertEquals(solution({ type: 'webauthn.get', challenge: 'abc', origin: 'https://a.com', crossOrigin: true }, { type: 'webauthn.get', challenge: 'abc', origin: 'https://a.com' }), ['crossOrigin']);`,
      },
      {
        name: "http is not https",
        body: `assertEquals(solution({ type: 'webauthn.get', challenge: 'abc', origin: 'http://a.com', crossOrigin: false }, { type: 'webauthn.get', challenge: 'abc', origin: 'https://a.com' }), ['origin']);`,
      },
      {
        name: "reports every problem, sorted",
        body: `assertEquals(solution({ type: 'x', challenge: 'y', origin: 'z', crossOrigin: true }, { type: 'webauthn.get', challenge: 'abc', origin: 'https://a.com' }), ['challenge', 'crossOrigin', 'origin', 'type']);`,
      },
    ],
    hints: [
      "Collect problems rather than returning at the first one.",
      "Origin must match exactly — no prefix or suffix matching, which is the whole anti-phishing property.",
      "Sort before returning so the output does not depend on your check order.",
    ],
    reference: `function verifyClientData(clientData, expected) {
  const problems = [];
  if (clientData.type !== expected.type) problems.push('type');
  // Exact match: the challenge is the replay defence.
  if (clientData.challenge !== expected.challenge) problems.push('challenge');
  // Exact match again. Any fuzzy comparison here reintroduces phishing --
  // https://a.com.evil.com must not satisfy https://a.com.
  if (clientData.origin !== expected.origin) problems.push('origin');
  if (clientData.crossOrigin) problems.push('crossOrigin');
  return problems.sort();
}
`,
  },
};
