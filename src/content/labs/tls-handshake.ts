import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "tls-handshake",
  title: "TLS Handshake",
  category: "Security",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "The foundation of HTTPS.",
  caption:
    "Watch the 5-step dance that secures the internet. Animate the exchange of certificates, the Diffie-Hellman key agreement, and the transition from slow asymmetric encryption to fast, shared symmetric keys.",
  skillTags: ["Security", "Networking", "HTTPS"],
  concept:
    "Transport Layer Security (TLS) is the protocol that provides privacy and data integrity between two communicating applications. It is the 'S' in HTTPS.\n\nThe 'Handshake' is the initial negotiation where the client and server:\n1. Agree on the TLS version and cipher suites.\n2. Authenticate the server via its Certificate (and optionally the client).\n3. Establish a **Shared Session Key** using asymmetric encryption (RSA or Diffie-Hellman).\n\nOnce the handshake is complete, all further communication is encrypted using fast **Symmetric Encryption** (like AES) with the shared key established during the handshake.",
  realWorld: [
    "Every HTTPS website you visit.",
    "Secure Email (IMAPS, SMTPS).",
    "VPNs (OpenVPN, WireGuard).",
    "Database connections (SQL over TLS).",
  ],
  pitfalls: [
    "Certificate Pinning: can be brittle and break if certificates are rotated unexpectedly.",
    "Downgrade Attacks: attackers might try to force the connection to an older, insecure version like TLS 1.0 or SSL 3.0.",
  ],
  references: [
    {
      label: "RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3",
      href: "https://datatracker.ietf.org/doc/html/rfc8446",
    },
  ],
  codeSnippet: {
    language: "go",
    code: `// TLS 1.3: one round trip. ClientHello already carries a key share.
cfg := &tls.Config{
    MinVersion: tls.VersionTLS13,      // no downgrade to legacy suites
    ServerName: "api.example.com",     // SNI + certificate hostname check
    CurvePreferences: []tls.CurveID{tls.X25519},
}
conn, err := tls.Dial("tcp", "api.example.com:443", cfg)
// state.HandshakeComplete, state.CipherSuite, state.PeerCertificates[0]
state := conn.ConnectionState()

// Flow: ClientHello(key_share) -> ServerHello(key_share) + EncryptedExtensions
//       + Certificate + CertificateVerify + Finished -> Finished.
// Forward secrecy comes from the ephemeral ECDHE key, not the certificate.`,
  },
  usedBy: [
    {
      company: "Cloudflare",
      product: "TLS 1.3 & Encrypted Client Hello at the edge",
      usage:
        "Cloudflare drove TLS 1.3 deployment and publishes measurements of handshake latency and 0-RTT tradeoffs.",
      href: "https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/",
    },
    {
      company: "Google",
      product: "Chrome / QUIC & HTTP/3",
      usage:
        "QUIC embeds the TLS 1.3 handshake into the transport, so connection setup and encryption complete together.",
      href: "https://datatracker.ietf.org/doc/html/rfc9001",
    },
    {
      company: "Let's Encrypt / ISRG",
      product: "ACME certificate issuance",
      usage:
        "Automated 90-day certificates are what made universal HTTPS (and the certificate chain in every handshake) practical.",
      href: "https://letsencrypt.org/how-it-works/",
    },
    {
      company: "Apple",
      product: "App Transport Security",
      usage:
        "iOS requires TLS with modern ciphers by default, forcing app backends onto forward-secret suites.",
      href: "https://developer.apple.com/documentation/security/preventing-insecure-network-connections",
    },
  ],
  challenge: {
    prompt:
      "Negotiate a TLS cipher suite. The server picks from its own ordered preferences among what the client offered, and refuses anything below the minimum version. Letting the client choose is how downgrade attacks happen.",
    entry: "negotiate",
    starter: `/**
 * @param {string[]} clientOffers - suites the client supports.
 * @param {Array<{name: string, version: number, weak: boolean}>} serverSuites
 *   in the SERVER's preference order.
 * @param {number} minVersion
 * @returns {string|null} the chosen suite name, or null when none qualifies.
 *   A suite qualifies when the client offered it, its version is at least
 *   minVersion, and it is not weak.
 */
function negotiate(clientOffers, serverSuites, minVersion) {
  // Walk the SERVER's order, not the client's. The first qualifying suite wins.
}
`,
    tests: [
      {
        name: "picks the server's first acceptable suite",
        body: `var s = [{ name: 'A', version: 3, weak: false }, { name: 'B', version: 3, weak: false }];
assertEquals(solution(['A', 'B'], s, 3), 'A');`,
      },
      {
        name: "server preference beats client order",
        body: `var s = [{ name: 'A', version: 3, weak: false }, { name: 'B', version: 3, weak: false }];
assertEquals(solution(['B', 'A'], s, 3), 'A');`,
      },
      {
        name: "skips suites the client did not offer",
        body: `var s = [{ name: 'A', version: 3, weak: false }, { name: 'B', version: 3, weak: false }];
assertEquals(solution(['B'], s, 3), 'B');`,
      },
      {
        name: "rejects a version below the minimum",
        body: `var s = [{ name: 'OLD', version: 1, weak: false }, { name: 'NEW', version: 3, weak: false }];
assertEquals(solution(['OLD', 'NEW'], s, 3), 'NEW');`,
      },
      {
        name: "skips weak suites",
        body: `var s = [{ name: 'RC4', version: 3, weak: true }, { name: 'AES', version: 3, weak: false }];
assertEquals(solution(['RC4', 'AES'], s, 3), 'AES');`,
      },
      {
        name: "no overlap means no handshake",
        body: `var s = [{ name: 'A', version: 3, weak: false }];
assertEquals(solution(['Z'], s, 3), null);`,
      },
      {
        name: "everything too old means no handshake",
        body: `var s = [{ name: 'A', version: 1, weak: false }];
assertEquals(solution(['A'], s, 3), null);`,
      },
      {
        name: "no offers at all",
        body: `var s = [{ name: 'A', version: 3, weak: false }];
assertEquals(solution([], s, 3), null);`,
      },
    ],
    hints: [
      "Iterate the server list, since that is the preference order that matters.",
      "A suite qualifies only if the client offered it, its version reaches the minimum, and it is not weak.",
      "Return the first qualifying suite; return null if the loop finishes.",
    ],
    reference: `function negotiate(clientOffers, serverSuites, minVersion) {
  const offered = new Set(clientOffers);
  // Server order, deliberately: honouring the client's preference is how a
  // downgrade attack talks a server into its weakest option.
  for (const suite of serverSuites) {
    if (!offered.has(suite.name)) continue;
    if (suite.version < minVersion) continue;
    if (suite.weak) continue;
    return suite.name;
  }
  return null;
}
`,
  },
};
