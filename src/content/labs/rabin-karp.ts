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
  challenge: {
    prompt:
      "Compute the rolling hash of every window of a string. The point is the update step: sliding one character forward costs a constant amount of work, instead of rehashing the whole window. Content-defined chunking in dedupe and RAG pipelines runs the same trick.",
    entry: "windowHashes",
    starter: `/**
 * Hash of a window is sum(code(c_i) * base**(k-1-i)) mod mod.
 *
 * @param {string} s
 * @param {number} k - window width.
 * @param {number} base
 * @param {number} mod
 * @returns {number[]} one hash per window, left to right. Empty when k > s.length.
 */
function windowHashes(s, k, base, mod) {
  // Compute the first window directly. After that, remove the outgoing
  // character's contribution, shift, and add the incoming one.
}
`,
    tests: [
      {
        name: "single window equals the direct hash",
        body: `assertEquals(solution('ab', 2, 256, 101), [(97 * 256 + 98) % 101]);`,
      },
      {
        name: "produces one hash per window",
        body: `assertEquals(solution('abcd', 2, 256, 101).length, 3);`,
      },
      {
        name: "identical windows hash identically",
        body: `var h = solution('abab', 2, 256, 101);
assertEquals(h[0], h[2]);`,
      },
      {
        name: "different windows usually differ",
        body: `var h = solution('abcd', 2, 256, 1000003);
assert(h[0] !== h[1], 'expected different hashes');`,
      },
      {
        name: "window wider than the string yields nothing",
        body: `assertEquals(solution('ab', 5, 256, 101), []);`,
      },
      {
        name: "window equal to the string yields one hash",
        body: `assertEquals(solution('abc', 3, 256, 101).length, 1);`,
      },
      {
        name: "results stay inside the modulus",
        body: `var h = solution('hello world', 3, 256, 101);
for (var i = 0; i < h.length; i++) assert(h[i] >= 0 && h[i] < 101, 'hash out of range: ' + h[i]);`,
      },
      {
        name: "rolling, not rehashing, on a long string",
        body: `var s = '';
for (var i = 0; i < 60000; i++) s += String.fromCharCode(97 + (i % 26));
var h = solution(s, 1000, 256, 1000003);
assertEquals(h.length, 60000 - 1000 + 1);`,
      },
    ],
    hints: [
      "Precompute base to the power k-1, taken modulo mod, and keep it for the removal step.",
      "To roll: subtract outgoing * that power, multiply by base, then add the incoming character.",
      "Modular subtraction can go negative in JavaScript, so add mod back before taking the remainder again.",
    ],
    reference: `function windowHashes(s, k, base, mod) {
  const out = [];
  if (k <= 0 || k > s.length) return out;

  // base**(k-1) mod mod -- the weight of the character leaving the window.
  let high = 1;
  for (let i = 0; i < k - 1; i++) high = (high * base) % mod;

  let hash = 0;
  for (let i = 0; i < k; i++) hash = (hash * base + s.charCodeAt(i)) % mod;
  out.push(hash);

  for (let i = k; i < s.length; i++) {
    // Drop the outgoing character, shift left, add the incoming one.
    hash = (hash - s.charCodeAt(i - k) * high) % mod;
    // A negative remainder is legal in JS but not what we want here.
    if (hash < 0) hash += mod;
    hash = (hash * base + s.charCodeAt(i)) % mod;
    out.push(hash);
  }
  return out;
}
`,
  },
};
