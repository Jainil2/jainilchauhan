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
};
