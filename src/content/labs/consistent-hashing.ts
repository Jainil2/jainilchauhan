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
  challenge: {
    prompt:
      "Route keys around a hash ring with virtual nodes. Each key walks clockwise to the first node it meets. Adding a node moves only the keys in its arc rather than remapping everything, which is what makes rebalancing survivable.",
    entry: "route",
    starter: `/**
 * @param {string[]} nodes - node names.
 * @param {number} vnodes - replicas per node on the ring.
 * @param {string[]} keys
 * @param {(s: string) => number} hash - returns a ring position.
 * @returns {string[]} the owning node per key.
 *   A vnode's ring label is the node name plus '#' plus its replica index.
 */
function route(nodes, vnodes, keys, hash) {
  // Build the ring, sort by position, then for each key take the first vnode
  // at or after it -- wrapping to the first vnode when you run off the end.
}
`,
    tests: [
      {
        name: "a single node owns everything",
        body: `var h = function (s) { return s.length; };
assertEquals(solution(['a'], 1, ['x', 'yy'], h), ['a', 'a']);`,
      },
      {
        name: "a key walks clockwise to the next vnode",
        body: `var pos = { 'a#0': 10, 'b#0': 20, k: 15 };
var h = function (s) { return pos[s]; };
assertEquals(solution(['a', 'b'], 1, ['k'], h), ['b']);`,
      },
      {
        name: "a key past the last vnode wraps around",
        body: `var pos = { 'a#0': 10, 'b#0': 20, k: 99 };
var h = function (s) { return pos[s]; };
assertEquals(solution(['a', 'b'], 1, ['k'], h), ['a']);`,
      },
      {
        name: "an exact position match owns the key",
        body: `var pos = { 'a#0': 10, 'b#0': 20, k: 20 };
var h = function (s) { return pos[s]; };
assertEquals(solution(['a', 'b'], 1, ['k'], h), ['b']);`,
      },
      {
        name: "no nodes owns nothing",
        body: `var h = function (s) { return s.length; };
assertEquals(solution([], 1, ['k'], h), [null]);`,
      },
      {
        name: "virtual nodes spread ownership",
        body: `var h = function (s) { var n = 0; for (var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 1000; return n; };
var keys = [];
for (var i = 0; i < 300; i++) keys.push('key' + i);
var owners = solution(['a', 'b', 'c'], 50, keys, h);
var seen = {};
for (var j = 0; j < owners.length; j++) seen[owners[j]] = true;
assertEquals(Object.keys(seen).length, 3);`,
      },
    ],
    hints: [
      "Build the ring as [position, nodeName] pairs and sort it by position.",
      "For each key, scan or binary search for the first ring position greater than or equal to the key's.",
      "Falling off the end means wrapping to index 0 — the ring has no end.",
    ],
    reference: `function route(nodes, vnodes, keys, hash) {
  const ring = [];
  for (const node of nodes) {
    for (let i = 0; i < vnodes; i++) ring.push([hash(node + '#' + i), node]);
  }
  ring.sort((a, b) => a[0] - b[0]);

  return keys.map((key) => {
    if (ring.length === 0) return null;
    const p = hash(key);
    // First vnode at or after the key.
    let lo = 0;
    let hi = ring.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (ring[mid][0] < p) lo = mid + 1;
      else hi = mid;
    }
    // Past the last vnode? Wrap: the ring has no end.
    return ring[lo === ring.length ? 0 : lo][1];
  });
}
`,
  },
};
