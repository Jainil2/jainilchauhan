import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "lsm-tree",
  title: "LSM Tree",
  category: "Data Structures",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "Write-optimized storage engine.",
  caption:
    "Experience the high-throughput engine behind NoSQL. Watch as writes are buffered in a MemTable, flushed to immutable SSTables, and eventually merged through background compaction. Fast writes, at the cost of background I/O.",
  skillTags: ["DSA", "System Design", "Databases"],
  bridgesFrom: [
    {
      slug: "external-merge-sort",
      sameness:
        "Compaction IS external merge sort. Sorted runs too large for memory, merged k at a time into bigger sorted runs by taking the smallest head element — the same algorithm, running forever instead of once.",
      delta:
        "The sort is never finished, which is the entire design. Writes land in a memory buffer that is flushed as a new small sorted run, so a write costs a sequential append rather than a random in-place update, and the merge runs in the background to keep the number of runs bounded. That moves the cost to reads, which may have to check several runs, and creates the trade every LSM engine tunes: compact aggressively for read speed and pay write amplification, or compact lazily and let reads fan out.",
    },
  ],
  concept:
    "Log-Structured Merge-Trees (LSM Trees) are the data structure of choice for write-heavy workloads. Unlike B-Trees, which perform random-access updates, LSM Trees turn all writes into sequential I/O.\n\n1. Writes hit an in-memory **MemTable** (usually a Skip List).\n2. When full, the MemTable is flushed to disk as an immutable **SSTable** (Sorted String Table).\n3. Over time, many SSTables accumulate. A background **Compaction** process merges them, removing deleted or overwritten keys and keeping the total number of files manageable.\n\nThis architecture provides massive write throughput but introduces 'Read Amplification' (checking multiple files) and 'Write Amplification' (re-writing data during compaction).",
  complexity: [
    { operation: "Write", time: "O(1) amortized", space: "Sequential I/O" },
    { operation: "Read", time: "O(log N * #files)", space: "Random I/O" },
  ],
  realWorld: [
    "RocksDB: the engine inside TiDB, CockroachDB, and MyRocks.",
    "Apache Cassandra: uses LSM for high-availability writes.",
    "Bigtable: Google's original wide-column store.",
    "InfluxDB: uses a variant (TSM) for time-series data.",
  ],
  pitfalls: [
    "Write Stalls: if compaction can't keep up with the write rate, the system will eventually block writes to catch up.",
    "Space Amplification: deleted data isn't actually removed until the next compaction cycle.",
  ],
  references: [
    {
      label: "The Log-Structured Merge-Tree (LSM-Tree) — O'Neil et al.",
      href: "https://www.cs.umb.edu/~poneil/lsmtree.pdf",
    },
  ],
  codeSnippet: {
    language: "ts",
    code: `// Write path: WAL -> memtable -> immutable SSTable; reads check newest first.
class LSM {
  private memtable = new Map<string, string>(); // sorted structure in real engines
  private sstables: Map<string, string>[] = []; // newest first
  put(k: string, v: string) {
    appendToWAL(k, v);              // durability before acknowledging
    this.memtable.set(k, v);        // sequential write, no in-place update
    if (this.memtable.size > 10_000) this.flush();
  }
  private flush() {
    this.sstables.unshift(new Map(this.memtable)); // immutable on disk
    this.memtable.clear();
    // background compaction merges SSTables and drops shadowed/tombstoned keys
  }
  get(k: string): string | undefined {
    if (this.memtable.has(k)) return this.memtable.get(k);
    for (const t of this.sstables) if (t.has(k)) return t.get(k); // Bloom filter per table
    return undefined;
  }
}`,
  },
  usedBy: [
    {
      company: "Meta",
      product: "RocksDB",
      usage:
        "RocksDB is the LSM engine behind MySQL/MyRocks, Kafka Streams state stores, CockroachDB (historically) and countless services.",
      href: "https://github.com/facebook/rocksdb/wiki/RocksDB-Overview",
    },
    {
      company: "Google",
      product: "Bigtable / LevelDB",
      usage:
        "The memtable + SSTable + compaction design comes from Bigtable and was open-sourced as LevelDB.",
      href: "https://research.google/pubs/pub27898/",
    },
    {
      company: "Apache Cassandra",
      product: "Write path & compaction strategies",
      usage:
        "Cassandra's commit log, memtable and size-tiered/leveled compaction are a direct LSM implementation.",
      href: "https://cassandra.apache.org/doc/latest/cassandra/architecture/storage_engine.html",
    },
    {
      company: "ScyllaDB / CockroachDB",
      product: "Pebble & Scylla storage engines",
      usage:
        "Modern distributed SQL/NoSQL engines keep LSM storage because write amplification beats random-write B-trees on SSDs.",
      href: "https://github.com/cockroachdb/pebble",
    },
  ],
  challenge: {
    prompt:
      "Implement the LSM read path. Check the memtable first, then the SSTables from newest to oldest, and stop at the first hit — even when that hit is a tombstone marking a delete. Writes are cheap because nothing is ever updated in place; reads pay for that by searching layers.",
    entry: "lsmGet",
    starter: `/**
 * A tombstone is the exact string '__deleted__' and means the key was removed.
 *
 * @param {Record<string, any>} memtable - newest writes, still in memory.
 * @param {Array<Record<string, any>>} sstables - flushed levels, NEWEST FIRST.
 * @param {string} key
 * @returns {any} the value, or null when the key is absent or deleted.
 */
function lsmGet(memtable, sstables, key) {
  // Newest layer wins. The search stops at the first layer that mentions the
  // key at all -- an older value underneath a tombstone is not a hit.
}
`,
    tests: [
      {
        name: "reads from the memtable",
        body: `assertEquals(solution({ a: 1 }, [], 'a'), 1);`,
      },
      {
        name: "falls through to an sstable",
        body: `assertEquals(solution({}, [{ a: 2 }], 'a'), 2);`,
      },
      {
        name: "the memtable shadows older layers",
        body: `assertEquals(solution({ a: 1 }, [{ a: 2 }], 'a'), 1);`,
      },
      {
        name: "newer sstables win over older ones",
        body: `assertEquals(solution({}, [{ a: 2 }, { a: 3 }], 'a'), 2);`,
      },
      {
        name: "a tombstone hides an older value",
        body: `assertEquals(solution({ a: '__deleted__' }, [{ a: 5 }], 'a'), null);`,
      },
      {
        name: "a tombstone in an sstable also hides older values",
        body: `assertEquals(solution({}, [{ a: '__deleted__' }, { a: 5 }], 'a'), null);`,
      },
      {
        name: "a rewrite after a delete is visible again",
        body: `assertEquals(solution({ a: 9 }, [{ a: '__deleted__' }, { a: 5 }], 'a'), 9);`,
      },
      {
        name: "an unknown key is absent",
        body: `assertEquals(solution({ a: 1 }, [{ b: 2 }], 'zzz'), null);`,
      },
      {
        name: "falsy values are real values",
        body: `assertEquals(solution({ a: 0 }, [{ a: 5 }], 'a'), 0);`,
      },
    ],
    hints: [
      "Test for the key with a presence check, not by looking at the value — a stored 0 or empty string is still a hit.",
      "Handle the memtable exactly like an sstable, just first in the order.",
      "As soon as a layer contains the key, you are done: return null if it is a tombstone, otherwise the value.",
    ],
    reference: `function lsmGet(memtable, sstables, key) {
  const TOMBSTONE = '__deleted__';
  // Newest first: the memtable, then each flushed level in order.
  const layers = [memtable, ...sstables];
  for (const layer of layers) {
    // Presence, not truthiness: 0 and '' are legitimate stored values.
    if (!Object.prototype.hasOwnProperty.call(layer, key)) continue;
    const value = layer[key];
    // The first mention wins, even when it is a delete marker.
    return value === TOMBSTONE ? null : value;
  }
  return null;
}
`,
  },
};
