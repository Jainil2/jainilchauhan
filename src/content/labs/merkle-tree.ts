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
};
