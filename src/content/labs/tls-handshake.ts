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
};
