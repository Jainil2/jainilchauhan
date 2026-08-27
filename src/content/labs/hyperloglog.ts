import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "hyperloglog",
  title: "HyperLogLog",
  category: "Data Structures",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Probabilistic cardinality estimation.",
  caption:
    "Count 10 million unique items using only 1.5KB of memory. Watch the 'buckets' record the maximum number of leading zeros in hashed values to estimate cardinality with a ~1% error rate. Space-efficiency at its peak.",
  skillTags: ["DSA", "System Design", "Big Data"],
  concept:
    "HyperLogLog (HLL) is a probabilistic algorithm used to estimate the number of unique elements (cardinality) in a set. While a Set would require memory proportional to the number of elements, HLL can estimate a cardinality of billions using less than 2KB of memory.\n\nIt works by hashing every incoming item and looking at the number of leading zeros in the binary hash. If you see a hash with 10 leading zeros, it's statistically likely that you've seen ~2^10 items. HLL averages these observations across thousands of 'buckets' to produce a highly accurate estimate.\n\nThe trade-off is a small, predictable error rate (usually 0.81% for 16,384 buckets).",
  complexity: [
    { operation: "Add", time: "O(1)", space: "O(log log N) bits" },
    { operation: "Merge", time: "O(M) where M = buckets", space: "O(1)" },
  ],
  realWorld: [
    "Redis: the `PFADD` and `PFCOUNT` commands are HLL implementations.",
    "Google BigQuery: used for rapid `COUNT(DISTINCT)` over petabytes.",
    "Facebook: counts unique daily active users (DAU) across various dimensions efficiently.",
  ],
  pitfalls: [
    "It is a 'maybe' count. Never use HLL for billing or tasks where 100% precision is required.",
    "Small sets: HLL is less accurate for small sets; most implementations use a 'Linear Counting' fallback for low cardinalities.",
  ],
  references: [
    {
      label: "HyperLogLog: the analysis of a near-optimal cardinality estimation algorithm",
      href: "http://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf",
    },
  ],
  codeSnippet: {
    language: "ts",
    code: `// Cardinality from leading-zero statistics: ~1.6 KB for ~0.8% error.
const P = 12, M = 1 << P; // 4096 registers
const registers = new Uint8Array(M);

export function add(hash: number) {
  const idx = hash >>> (32 - P);              // which register
  const rest = (hash << P) | (1 << (P - 1));  // remaining bits
  const rank = Math.clz32(rest) + 1;          // position of first 1-bit
  registers[idx] = Math.max(registers[idx], rank);
}

export function estimate() {
  let sum = 0, zeros = 0;
  for (const r of registers) { sum += 2 ** -r; if (r === 0) zeros++; }
  const alpha = 0.7213 / (1 + 1.079 / M);
  const raw = (alpha * M * M) / sum;
  return zeros > 0 && raw < 2.5 * M ? M * Math.log(M / zeros) : raw; // small-range correction
}
// Registers merge with max() -> unions across shards are exact, no re-scan.`,
  },
  usedBy: [
    {
      company: "Redis",
      product: "PFADD / PFCOUNT",
      usage:
        "Redis HyperLogLog counts unique visitors in ~12 KB per key with 0.81% standard error, and PFMERGE unions them.",
      href: "https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/",
    },
    {
      company: "Google",
      product: "BigQuery APPROX_COUNT_DISTINCT / HLL++",
      usage:
        "Google published HyperLogLog++ and exposes sketches as a SQL type so distinct counts merge across partitions.",
      href: "https://research.google/pubs/pub40671/",
    },
    {
      company: "Reddit",
      product: "Unique pageview counters",
      usage:
        "Per-post unique view counts are tracked with HLL because exact sets per post would be prohibitively large.",
      href: "https://www.redditinc.com/blog/view-counting-at-reddit",
    },
    {
      company: "Elastic",
      product: "cardinality aggregation",
      usage:
        "Elasticsearch's cardinality agg is HLL++-based with a tunable precision threshold trading memory for accuracy.",
      href: "https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-cardinality-aggregation.html",
    },
  ],
  challenge: {
    prompt:
      "Build the register array a HyperLogLog keeps. The leading bits of each hash pick a bucket; the rest gives a rank, the position of its first 1 bit. Each bucket stores the largest rank it has seen. A few kilobytes of registers then estimates the cardinality of a stream far too large to store.",
    entry: "registers",
    starter: `/**
 * @param {number[]} hashes - unsigned 32-bit hash values.
 * @param {number} bits - how many leading bits select the bucket.
 * @returns {number[]} the register array, length 2**bits, zero where unseen.
 *   A register holds the largest rank observed: the 1-based position of the
 *   first 1 bit in the remaining 32 - bits bits.
 */
function registers(hashes, bits) {
  // Take the bucket from the top bits, then find the first set bit in what is
  // left. Keep only the maximum rank per bucket.
}
`,
    tests: [
      {
        name: "an empty stream leaves every register at zero",
        body: `assertEquals(solution([], 2), [0, 0, 0, 0]);`,
      },
      {
        name: "register array has the right size",
        body: `assertEquals(solution([], 3).length, 8);`,
      },
      {
        name: "top bits choose the bucket",
        body: `var h = (1 << 30) >>> 0;
var out = solution([h], 2);
assertEquals(out[1] > 0, true);
assertEquals(out[0], 0);`,
      },
      {
        name: "a leading 1 in the remainder gives rank 1",
        body: `var h = ((1 << 29) >>> 0);
assertEquals(solution([h], 2)[0], 1);`,
      },
      {
        name: "more leading zeros give a higher rank",
        body: `var h = ((1 << 28) >>> 0);
assertEquals(solution([h], 2)[0], 2);`,
      },
      {
        name: "keeps the maximum, not the latest",
        body: `var high = ((1 << 28) >>> 0);
var low = ((1 << 29) >>> 0);
assertEquals(solution([high, low], 2)[0], 2);`,
      },
      {
        name: "duplicates do not change the registers",
        body: `var h = ((1 << 28) >>> 0);
assertEquals(solution([h, h, h], 2), solution([h], 2));`,
      },
      {
        name: "an all-zero remainder gets the maximum rank",
        body: `// 2 bucket bits leave a 30-bit remainder, so the largest possible rank is 30.
assertEquals(solution([0], 2)[0], 30);
assertEquals(solution([0], 4)[0], 28);`,
      },
    ],
    hints: [
      "The bucket is the value shifted right by 32 - bits, using the unsigned shift operator.",
      "Mask off the top bits to get the remainder, then scan from its most significant bit downwards for the first 1.",
      "When the remainder is entirely zero there is no set bit, so the rank is the full width of the remainder.",
    ],
    reference: `function registers(hashes, bits) {
  const size = 1 << bits;
  const out = new Array(size).fill(0);
  const width = 32 - bits; // bits left over for the rank

  for (const hash of hashes) {
    const h = hash >>> 0;
    const bucket = h >>> width;
    // Drop the bucket bits; what remains is the rank material.
    const rest = width === 32 ? h : h & ((1 << width) - 1);
    let rank = width; // all zeros: the rank is the whole remaining width
    for (let i = width - 1; i >= 0; i--) {
      if ((rest >>> i) & 1) {
        rank = width - i;
        break;
      }
    }
    if (rank > out[bucket]) out[bucket] = rank;
  }
  return out;
}
`,
  },
};
