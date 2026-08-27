import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "consistent-hashing",
  title: "Consistent Hashing",
  category: "Distributed Systems",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "Add/remove nodes and remap only ~K/N keys.",
  caption:
    "Toggle nodes on/off and watch how consistent hashing remaps only a small fraction of keys, while naive `hash % N` would remap nearly everything — the difference between a graceful degradation and a cache stampede.",
  whereUsed: { label: "Cache & sharding work", href: "/#projects" },
  skillTags: ["Distributed Systems", "System Design", "Redis"],
  concept:
    "Consistent hashing solves a sharding problem: when you add or remove a node, how do you avoid remapping every key? With naive `hash(key) % N`, a single node change shuffles ~all keys. With consistent hashing, a key remapping is bounded to ~K/N keys.\n\nThe trick: hash both keys and nodes onto a circular ring (typically 0 to 2^32). A key is owned by the next node clockwise. Adding a node steals only the slice between it and the previous node; removing a node hands its slice to the next clockwise node.\n\nReal implementations use 'virtual nodes' (each physical node owns hundreds of points on the ring) to smooth out load and reduce variance. Without vnodes, a single hot node can dominate.",
  complexity: [
    { operation: "Lookup", time: "O(log V)", space: "O(V)" },
    { operation: "Add/remove node", time: "O(K/N) keys remapped", space: "O(V/N)" },
  ],
  codeSnippet: {
    language: "ts",
    code: `class ConsistentHash {
  private ring: { angle: number; node: string }[] = [];
  constructor(nodes: string[], private vnodes = 100) {
    for (const n of nodes) this.addNode(n);
  }
  addNode(n: string) {
    for (let v = 0; v < this.vnodes; v++) {
      this.ring.push({ angle: hash(\`\${n}#\${v}\`), node: n });
    }
    this.ring.sort((a, b) => a.angle - b.angle);
  }
  lookup(key: string): string {
    const a = hash(key);
    // binary search for first angle >= a, wrap around if needed
    for (const v of this.ring) if (v.angle >= a) return v.node;
    return this.ring[0].node;
  }
}`,
  },
  realWorld: [
    "Amazon DynamoDB — ring-based partitioning across nodes.",
    "Apache Cassandra — Murmur3-partitioner on a 64-bit token ring.",
    "Memcached client libraries (ketama).",
    "Akka Cluster Sharding.",
  ],
  pitfalls: [
    "Skip vnodes and you'll get hot spots — load variance scales as 1/√V.",
    "Don't use a weak hash like simple modulo of node names — clustering wrecks load balance.",
    "Re-balancing requires moving data — plan for the I/O burst when scaling.",
  ],
  references: [
    {
      label: "Karger et al. — Consistent Hashing (1997)",
      href: "https://dl.acm.org/doi/10.1145/258533.258660",
    },
    {
      label: "DynamoDB paper",
      href: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
    },
  ],
  usedBy: [
    {
      company: "Amazon",
      product: "DynamoDB / Dynamo partitioning",
      usage:
        "The original Dynamo paper introduced virtual nodes on a hash ring so adding a node moves only its share of keys.",
      href: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
    },
    {
      company: "Discord",
      product: "Gateway / guild sharding",
      usage:
        "Consistent hashing routes each guild to a node so a deploy or scale-up doesn't reshuffle every live connection.",
      href: "https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users",
    },
    {
      company: "Cloudflare",
      product: "Load balancing to origins & cache tiers",
      usage:
        "Ring hashing keeps a given cache key pinned to the same edge server so hit rates survive membership changes.",
      href: "https://blog.cloudflare.com/improving-origin-performance-for-everyone-with-orpheus-and-tiered-cache/",
    },
    {
      company: "Apache Cassandra",
      product: "Token ring placement",
      usage:
        "Each node owns token ranges on a ring; replicas are the next N nodes clockwise from the key's token.",
      href: "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html",
    },
  ],
};
