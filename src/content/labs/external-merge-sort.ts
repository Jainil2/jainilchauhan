import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "external-merge-sort",
  title: "External Merge Sort",
  category: "Algorithms",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Sort datasets larger than memory with run generation and k-way merge.",
  caption:
    "Create sorted disk runs, then merge them. External sorting optimizes I/O instead of CPU comparisons.",
  skillTags: ["DSA", "Databases", "Big Data"],
  concept:
    "External merge sort handles data too large to fit in memory. It reads memory-sized chunks, sorts each chunk into a run on disk, then performs a k-way merge using buffers and a priority queue.\n\nThe key cost is I/O. Good implementations choose run size, merge fan-in, compression, and sequential access patterns to minimize disk passes.",
  complexity: [
    { operation: "Run generation", time: "O(n log m)", space: "O(m)" },
    { operation: "K-way merge", time: "O(n log k)", space: "O(k)" },
  ],
  realWorld: [
    "Database ORDER BY, data warehouses, search indexing, log processing, and ETL pipelines.",
  ],
  pitfalls: [
    "Random I/O destroys performance.",
    "Too many merge passes increase disk reads/writes.",
    "Temporary storage must be sized for run files.",
  ],
  codeSnippet: {
    language: "py",
    code: `import heapq, tempfile

# Phase 1: sort chunks that fit in RAM, spill each to disk.
def spill_sorted_runs(rows, chunk=1_000_000):
    runs, buf = [], []
    for row in rows:
        buf.append(row)
        if len(buf) >= chunk:
            runs.append(_write(sorted(buf))); buf = []
    if buf:
        runs.append(_write(sorted(buf)))
    return runs

# Phase 2: k-way merge the runs with a heap — one buffered read per run.
def merge_runs(runs):
    files = [open(r) for r in runs]
    yield from heapq.merge(*files)

def _write(sorted_rows):
    f = tempfile.NamedTemporaryFile("w", delete=False)
    f.writelines(sorted_rows); f.close()
    return f.name`,
  },
  usedBy: [
    {
      company: "PostgreSQL",
      product: "Disk-based sorts (work_mem spill)",
      usage:
        'When a sort exceeds work_mem, Postgres writes sorted runs to temp files and merges them — visible as "external merge" in EXPLAIN.',
      href: "https://www.postgresql.org/docs/current/runtime-config-resource.html",
    },
    {
      company: "Databricks",
      product: "Spark spill-to-disk shuffles",
      usage:
        "Sort-based shuffle spills sorted partitions and merges them, which is why shuffle disk IO dominates big jobs.",
      href: "https://spark.apache.org/docs/latest/tuning.html",
    },
    {
      company: "Google",
      product: "MapReduce sort phase",
      usage:
        "The shuffle stage merges sorted spill files per reducer — external merge sort at cluster scale.",
      href: "https://research.google/pubs/pub62/",
    },
  ],
  references: [
    {
      label: "PostgreSQL — work_mem and external sorts",
      href: "https://www.postgresql.org/docs/current/runtime-config-resource.html",
    },
    {
      label: "MapReduce — simplified data processing on large clusters",
      href: "https://research.google/pubs/pub62/",
    },
  ],
};
