import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "snowflake-id",
  title: "Snowflake IDs",
  category: "Distributed Systems",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "K-ordered unique IDs at scale.",
  caption:
    "Generate IDs that are unique across thousands of machines without a central database. Deconstruct the 64-bit ID into its components: Timestamp, Worker ID, and Sequence number. Fast, sorted, and collision-free.",
  skillTags: ["Distributed Systems", "System Design"],
  concept:
    "Snowflake is a distributed ID generation service used when you need unique, roughly time-sorted (k-ordered) 64-bit integers across a massive cluster without the bottleneck of a central auto-incrementing database.\n\nThe 64 bits are typically divided: 1 bit (unused), 41 bits (milliseconds since epoch), 10 bits (machine/worker ID), and 12 bits (sequence number). This allows for 4,096 IDs per millisecond per worker, for ~69 years.\n\nBecause the timestamp is the most significant part, IDs are naturally sorted by time, which is highly beneficial for database indexing (keeping B-Tree inserts sequential).",
  complexity: [
    { operation: "Generate", time: "O(1)", space: "8 bytes" },
    { operation: "Throughput", time: "4,096 IDs / ms / node", space: "—" },
  ],
  realWorld: [
    "Twitter: the original creator of the Snowflake algorithm.",
    "Discord: uses snowflakes for every message, user, and server ID.",
    "Instagram: uses a similar ShardingID approach in Postgres.",
    "Sony: uses snowflakes for PlayStation Network activity IDs.",
  ],
  pitfalls: [
    "Clock skew is the enemy: if a machine's clock moves backwards, it might generate duplicate IDs. Servers must wait or error out.",
    "Machine ID management: you need a way (Zookeeper/etcd) to assign unique 10-bit IDs to workers.",
  ],
  references: [
    {
      label: "Twitter Snowflake original source",
      href: "https://github.com/twitter-archive/snowflake/tree/snowflake-2010",
    },
  ],
  codeSnippet: {
    language: "ts",
    code: `// 64-bit id: 1 unused | 41 bits ms since epoch | 10 bits node | 12 bits sequence
const EPOCH = 1_609_459_200_000n; // 2021-01-01
let lastMs = 0n, seq = 0n;

export function nextId(nodeId: bigint): bigint {
  let now = BigInt(Date.now());
  if (now === lastMs) {
    seq = (seq + 1n) & 0xfffn;      // 4096 ids per node per ms
    if (seq === 0n) while ((now = BigInt(Date.now())) <= lastMs) {} // spin to next ms
  } else if (now < lastMs) {
    throw new Error("clock moved backwards"); // never mint duplicates
  } else {
    seq = 0n;
  }
  lastMs = now;
  return ((now - EPOCH) << 22n) | (nodeId << 12n) | seq; // k-sorted by time
}`,
  },
  usedBy: [
    {
      company: "Twitter / X",
      product: "Snowflake tweet ids",
      usage:
        "Twitter created the format so ids are unique across shards and roughly time-ordered without a central sequence server.",
      href: "https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake",
    },
    {
      company: "Discord",
      product: "Snowflake ids in the public API",
      usage:
        "Every message, channel and user id is a snowflake; clients extract the creation timestamp from the id itself.",
      href: "https://discord.com/developers/docs/reference#snowflakes",
    },
    {
      company: "Instagram / Meta",
      product: "Sharded id generation",
      usage:
        "Instagram generates 64-bit ids in Postgres with a time prefix, shard id and per-shard sequence.",
      href: "https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c",
    },
    {
      company: "Sony",
      product: "Sonyflake",
      usage:
        "A Snowflake variant trading id-per-ms rate for a longer lifetime, showing how the bit budget is a design dial.",
      href: "https://github.com/sony/sonyflake",
    },
  ],
  challenge: {
    prompt:
      "Unpack a Snowflake ID into its timestamp, node and sequence. The catch is that JavaScript's bitwise operators truncate to 32 bits, so the shifts every other language uses silently corrupt these IDs — you have to use arithmetic instead.",
    entry: "decode",
    starter: `/**
 * Layout: timestamp * 2**22 + node * 2**12 + sequence.
 * 12 bits of sequence, 10 bits of node.
 *
 * @param {number} id
 * @returns {{timestamp: number, node: number, sequence: number}}
 */
function decode(id) {
  // Do NOT use >> or &. They coerce to 32 bits, and these IDs are larger.
  // Division and remainder are the only safe tools here.
}
`,
    tests: [
      {
        name: "decodes a small id",
        body: `assertEquals(solution(0), { timestamp: 0, node: 0, sequence: 0 });`,
      },
      {
        name: "reads the sequence",
        body: `assertEquals(solution(7), { timestamp: 0, node: 0, sequence: 7 });`,
      },
      {
        name: "reads the node",
        body: `assertEquals(solution(5 * 4096), { timestamp: 0, node: 5, sequence: 0 });`,
      },
      {
        name: "reads a timestamp beyond 32 bits",
        body: `assertEquals(solution(1000 * 4194304 + 5 * 4096 + 7), { timestamp: 1000, node: 5, sequence: 7 });`,
      },
      {
        name: "a large id does not overflow",
        body: `var id = 1700000 * 4194304 + 900 * 4096 + 4000;
assertEquals(solution(id), { timestamp: 1700000, node: 900, sequence: 4000 });`,
      },
      {
        name: "sequence wraps within its 12 bits",
        body: `assertEquals(solution(4095).sequence, 4095);
assertEquals(solution(4096).sequence, 0);`,
      },
      {
        name: "node stays within its 10 bits",
        body: `assertEquals(solution(1023 * 4096).node, 1023);
assertEquals(solution(1024 * 4096).node, 0);`,
      },
    ],
    hints: [
      "Sequence is the remainder after dividing by 4096.",
      "Node is the whole part of id divided by 4096, then taken modulo 1024.",
      "Timestamp is the whole part of id divided by 4194304, which is 2 to the 22nd.",
    ],
    reference: `function decode(id) {
  const SEQUENCE_BITS = 4096; // 2**12
  const NODE_BITS = 1024; // 2**10
  const TIMESTAMP_SHIFT = 4194304; // 2**22

  // Arithmetic, not bit twiddling: >> and & coerce their operands to 32-bit
  // integers, which silently destroys any id above about 4.29 billion.
  return {
    timestamp: Math.floor(id / TIMESTAMP_SHIFT),
    node: Math.floor(id / SEQUENCE_BITS) % NODE_BITS,
    sequence: id % SEQUENCE_BITS,
  };
}
`,
  },
};
