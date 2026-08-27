import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "rabin-karp",
  title: "Rabin-Karp",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Rolling hash string search.",
  caption:
    "Search for a needle in a haystack using math. Watch the rolling hash window slide across the text, updating its value in O(1) time. Efficiently detect pattern matches and potential collisions with cryptographic-like hashing.",
  skillTags: ["Algorithms", "Strings", "Hashing"],
  concept:
    "Rabin-Karp is a string-searching algorithm that uses hashing to find any one of a set of pattern strings in a text. \n\nInstead of checking every character at every position (O(N*M)), it calculates a hash for the pattern and compares it to the hash of the current window in the text. To make this efficient, it uses a **Rolling Hash**: when the window slides, the new hash is calculated from the old hash in O(1) time by 'removing' the character that left and 'adding' the one that entered.\n\nIf the hashes match, the algorithm performs a character-by-character check to handle potential collisions.",
  complexity: [
    { operation: "Search", time: "O(N + M) average", space: "O(1)" },
    { operation: "Search (Worst)", time: "O(N * M)", space: "O(1)" },
  ],
  realWorld: [
    "Plagiarism Detection: finding identical passages across multiple documents.",
    "Intrusion Detection: searching network packets for multiple known malware signatures.",
    "Bioinformatics: finding specific gene sequences in a genome.",
  ],
  pitfalls: [
    "Hash Collisions: a bad hash function can lead to many 'spurious hits' where hashes match but strings don't, degrading performance to O(N*M).",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Rolling hash: slide the window in O(1) per step, verify only on hash hits.
export function rabinKarp(text: string, pattern: string): number[] {
  const B = 256n, M = 1_000_000_007n;
  const m = pattern.length;
  if (m === 0 || m > text.length) return [];
  let power = 1n;
  for (let i = 1; i < m; i++) power = (power * B) % M;
  const hash = (s: string, from: number) => {
    let h = 0n;
    for (let i = from; i < from + m; i++) h = (h * B + BigInt(s.charCodeAt(i))) % M;
    return h;
  };
  const target = hash(pattern, 0);
  let rolling = hash(text, 0);
  const hits: number[] = [];
  for (let i = 0; ; i++) {
    if (rolling === target && text.startsWith(pattern, i)) hits.push(i); // verify
    if (i + m >= text.length) break;
    rolling = ((rolling - BigInt(text.charCodeAt(i)) * power % M + M) % M * B + BigInt(text.charCodeAt(i + m))) % M;
  }
  return hits;
}`,
  },
  usedBy: [
    {
      company: "Dropbox",
      product: "Delta sync / block deduplication",
      usage:
        "Content-defined chunking with rolling hashes finds shifted duplicate blocks so only changed chunks upload.",
      href: "https://dropbox.tech/infrastructure/streaming-file-synchronization",
    },
    {
      company: "rsync / Samba team",
      product: "rsync delta transfer",
      usage:
        "A weak rolling checksum scans the file byte-by-byte and only strong-hashes on a match — Rabin-Karp's verify pattern.",
      href: "https://rsync.samba.org/tech_report/",
    },
    {
      company: "Turnitin / plagiarism tooling",
      product: "Document fingerprinting (winnowing)",
      usage:
        "Overlapping k-gram hashes fingerprint documents so near-duplicate passages surface without pairwise comparison.",
    },
  ],
  references: [
    {
      label: "rsync — technical report (rolling checksum)",
      href: "https://rsync.samba.org/tech_report/",
    },
    {
      label: "CP-Algorithms — string hashing / Rabin-Karp",
      href: "https://cp-algorithms.com/string/string-hashing.html",
    },
  ],
};
