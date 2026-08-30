import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "merkle-tree",
  title: "Merkle Tree",
  category: "Data Structures",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Data integrity via cryptographic hashes.",
  caption:
    "Mutate a data block (leaf node) to see its hash change. Watch how the invalidation bubbles up the tree, changing the Root Hash. Used in Git, Blockchain, and DynamoDB.",
  skillTags: ["System Design", "Security"],
  bridgesFrom: [
    {
      slug: "binary-tree",
      sameness:
        "It IS a binary tree. Leaves hold data, internal nodes hold a value derived from their two children, and you walk root-to-leaf exactly as before.",
      delta:
        "The derived value is a cryptographic hash of the children, which makes every node a fingerprint of its whole subtree. Comparing two large datasets collapses to comparing two roots, and when they differ you descend only into the mismatched side, so finding the changed block costs O(log n) hashes instead of a full scan. The property is one-directional: the tree proves a leaf belongs to a root, but it can never tell you what a leaf contains.",
    },
  ],
  concept:
    "A Merkle tree is a binary tree where each leaf is the hash of a data block, and each internal node is the hash of the concatenation of its children's hashes. The single root hash uniquely fingerprints the entire dataset.\n\nThe magic: to prove a single block is part of the dataset, you only need O(log n) sibling hashes — a Merkle proof. To detect any tampering, you re-hash the changed block; the change cascades up to a different root.\n\nThis enables efficient verification in adversarial settings (blockchains, content-addressed storage) and efficient sync in distributed systems (compare roots; if they differ, descend into the differing subtree to find the diverging block).",
  complexity: [
    { operation: "Build", time: "O(n)", space: "O(n)" },
    { operation: "Membership proof", time: "O(log n)", space: "O(log n)" },
    { operation: "Update one leaf", time: "O(log n)", space: "O(1)" },
  ],
  realWorld: [
    "Git — every commit/tree/blob is content-addressed by SHA-1/SHA-256 hash.",
    "Bitcoin / Ethereum — every block header contains a Merkle root over its transactions.",
    "DynamoDB / Cassandra — Merkle trees for anti-entropy: detect divergent replicas with O(log n) comparisons.",
    "IPFS, BitTorrent v2 — content addressing and partial verification.",
  ],
  references: [
    {
      label: "Ralph Merkle — original 1979 paper",
      href: "https://www.merkle.com/papers/Thesis1979.pdf",
    },
  ],
  codeSnippet: {
    language: "ts",
    code: `// Hash pairs upward; the root commits to every leaf.
import { createHash } from "node:crypto";
const h = (s: string) => createHash("sha256").update(s).digest("hex");

export function merkleRoot(leaves: string[]): string {
  let level = leaves.map(h);
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(h(level[i] + (level[i + 1] ?? level[i]))); // duplicate odd tail
    }
    level = next;
  }
  return level[0] ?? h("");
}

// A proof is the sibling hash per level: O(log n) data verifies one leaf.
export function verify(leaf: string, proof: { hash: string; right: boolean }[], root: string) {
  return proof.reduce((acc, p) => h(p.right ? acc + p.hash : p.hash + acc), h(leaf)) === root;
}`,
  },
  pitfalls: [
    "Duplicating an odd trailing leaf (the Bitcoin CVE-2012-2459 pattern) can let two different leaf sets produce the same root — domain-separate leaf and internal hashes.",
    "A root only proves inclusion, never absence; you need a sorted/sparse Merkle variant for non-membership proofs.",
    "Verifying a proof without pinning the expected root against a trusted source proves nothing.",
    "Rebuilding the whole tree on every write is O(n); production stores keep incremental subtree hashes.",
  ],
  usedBy: [
    {
      company: "Git / Linux Foundation",
      product: "Commit & tree objects",
      usage:
        "Every commit hash covers the whole tree of contents, which is why a rewritten history changes every downstream hash.",
      href: "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects",
    },
    {
      company: "Apache Cassandra / Amazon DynamoDB",
      product: "Anti-entropy repair",
      usage:
        "Replicas exchange Merkle trees to find the few diverging ranges instead of streaming entire partitions.",
      href: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
    },
    {
      company: "Google",
      product: "Certificate Transparency logs",
      usage:
        "Append-only Merkle logs let anyone verify a certificate was logged and that the log was never rewritten.",
      href: "https://certificate.transparency.dev/howctworks/",
    },
    {
      company: "Bitcoin / Ethereum",
      product: "Block transaction roots",
      usage:
        "Light clients verify a transaction is in a block with a logarithmic proof instead of downloading the block.",
      href: "https://developer.bitcoin.org/reference/block_chain.html",
    },
  ],
  challenge: {
    prompt:
      "Compute a Merkle root from a list of leaves. Hash pairwise up the tree, duplicating the last node when a level has an odd count. One root hash certifies a whole dataset, which is how you verify that the model weights you downloaded are the ones that were published.",
    entry: "merkleRoot",
    starter: `/**
 * @param {string[]} leaves - already-hashed leaves.
 * @param {(a: string, b: string) => string} hash - combines two hashes into one.
 * @returns {string|null} the root, or null when there are no leaves.
 */
function merkleRoot(leaves, hash) {
  // Combine the level pairwise until one node remains. An odd level pairs its
  // last node with itself.
}
`,
    tests: [
      {
        name: "two leaves make one root",
        body: `var h = function (a, b) { return '(' + a + b + ')'; };
assertEquals(solution(['a', 'b'], h), '(ab)');`,
      },
      {
        name: "four leaves build two levels",
        body: `var h = function (a, b) { return '(' + a + b + ')'; };
assertEquals(solution(['a', 'b', 'c', 'd'], h), '((ab)(cd))');`,
      },
      {
        name: "an odd level duplicates its last node",
        body: `var h = function (a, b) { return '(' + a + b + ')'; };
assertEquals(solution(['a', 'b', 'c'], h), '((ab)(cc))');`,
      },
      {
        name: "a single leaf is its own root",
        body: `var h = function (a, b) { return '(' + a + b + ')'; };
assertEquals(solution(['a'], h), 'a');`,
      },
      {
        name: "no leaves means no root",
        body: `var h = function (a, b) { return a + b; };
assertEquals(solution([], h), null);`,
      },
      {
        name: "changing one leaf changes the root",
        body: `var h = function (a, b) { return '(' + a + b + ')'; };
assert(solution(['a', 'b', 'c', 'd'], h) !== solution(['a', 'b', 'c', 'x'], h), 'root did not change');`,
      },
      {
        name: "order matters",
        body: `var h = function (a, b) { return '(' + a + b + ')'; };
assert(solution(['a', 'b'], h) !== solution(['b', 'a'], h), 'root ignored ordering');`,
      },
      {
        name: "handles a large power-of-two tree",
        body: `var h = function (a, b) { return String((a.length + b.length) % 97) + 'x'; };
var leaves = [];
for (var i = 0; i < 1024; i++) leaves.push('leaf' + i);
assert(typeof solution(leaves, h) === 'string', 'expected a string root');`,
      },
    ],
    hints: [
      "Return early for the empty case, and note that one leaf is already the root.",
      "Each pass over a level halves it: step through in twos and hash each pair.",
      "When the level has an odd length the last node has no partner, so hash it with itself.",
    ],
    reference: `function merkleRoot(leaves, hash) {
  if (leaves.length === 0) return null;
  let level = leaves.slice();
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      // An unpaired last node is hashed with itself, so the level always halves.
      const right = i + 1 < level.length ? level[i + 1] : level[i];
      next.push(hash(level[i], right));
    }
    level = next;
  }
  return level[0];
}
`,
  },
};
