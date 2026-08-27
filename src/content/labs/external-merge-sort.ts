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
  challenge: {
    prompt:
      "Merge many sorted runs into one sorted stream, the way an external sort combines chunks that never fit in memory together. Take the smallest head across all runs, repeatedly. A heap makes that step log k instead of k.",
    entry: "mergeRuns",
    starter: `/**
 * @param {number[][]} runs - each already sorted ascending.
 * @returns {number[]} every value, ascending.
 */
function mergeRuns(runs) {
  // Only the head of each run is ever a candidate. Take the smallest head,
  // advance that run, repeat. Concatenating and sorting defeats the purpose.
}
`,
    tests: [
      {
        name: "merges two runs",
        body: `assertEquals(solution([[1, 3], [2, 4]]), [1, 2, 3, 4]);`,
      },
      {
        name: "merges three runs",
        body: `assertEquals(solution([[1, 9], [2, 5], [3]]), [1, 2, 3, 5, 9]);`,
      },
      {
        name: "a single run passes through",
        body: `assertEquals(solution([[1, 2]]), [1, 2]);`,
      },
      {
        name: "no runs",
        body: `assertEquals(solution([]), []);`,
      },
      {
        name: "empty runs are skipped",
        body: `assertEquals(solution([[], [1], []]), [1]);`,
      },
      {
        name: "keeps duplicates across runs",
        body: `assertEquals(solution([[1, 1], [1]]), [1, 1, 1]);`,
      },
      {
        name: "handles runs of very different lengths",
        body: `assertEquals(solution([[1, 2, 3, 4, 5], [0]]), [0, 1, 2, 3, 4, 5]);`,
      },
      {
        name: "negatives",
        body: `assertEquals(solution([[-5, 0], [-9, 2]]), [-9, -5, 0, 2]);`,
      },
      {
        name: "handles many runs efficiently",
        body: `var runs = [];
for (var r = 0; r < 500; r++) { var run = []; for (var i = 0; i < 200; i++) run.push(r + i * 500); runs.push(run); }
var out = solution(runs);
assertEquals(out.length, 100000);
for (var j = 1; j < out.length; j++) if (out[j - 1] > out[j]) throw new Error('not sorted at ' + j);`,
      },
    ],
    hints: [
      "Keep a cursor per run, and consider only the value each cursor points at.",
      "A min-heap of [value, runIndex] gives the smallest head in log k rather than scanning all k.",
      "After taking a value, advance that run's cursor and push its new head if the run is not exhausted.",
    ],
    reference: `function mergeRuns(runs) {
  const heap = []; // [value, runIndex, position]
  const up = (i) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const down = (i) => {
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let small = i;
      if (l < heap.length && heap[l][0] < heap[small][0]) small = l;
      if (r < heap.length && heap[r][0] < heap[small][0]) small = r;
      if (small === i) break;
      [heap[small], heap[i]] = [heap[i], heap[small]];
      i = small;
    }
  };
  const push = (item) => {
    heap.push(item);
    up(heap.length - 1);
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      down(0);
    }
    return top;
  };

  // Seed with the head of every non-empty run.
  runs.forEach((run, i) => {
    if (run.length) push([run[0], i, 0]);
  });

  const out = [];
  while (heap.length) {
    const [value, runIndex, pos] = pop();
    out.push(value);
    const next = pos + 1;
    if (next < runs[runIndex].length) push([runs[runIndex][next], runIndex, next]);
  }
  return out;
}
`,
  },
};
