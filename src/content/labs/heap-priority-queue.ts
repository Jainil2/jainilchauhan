import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "heap-priority-queue",
  title: "Heap / Priority Queue",
  category: "Data Structures",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Tree-backed structure for repeatedly extracting min or max.",
  caption:
    "Push and pop the minimum value. The root is always the next highest-priority item while the full array remains only partially ordered.",
  skillTags: ["DSA", "Algorithms"],
  concept:
    "A binary heap is a complete binary tree usually stored in an array. In a min-heap, every parent is less than or equal to its children, so the minimum is always at the root. Push bubbles a value up; pop swaps root with the last item and bubbles down.\n\nA priority queue exposes this behavior as insert plus extract-min/extract-max. It is central to scheduling, Dijkstra, A*, event simulation, and top-k problems.",
  complexity: [
    { operation: "Peek", time: "O(1)", space: "O(1)" },
    { operation: "Push/pop", time: "O(log n)", space: "O(1)" },
    { operation: "Build heap", time: "O(n)", space: "O(1)" },
  ],
  realWorld: ["Job schedulers, timers, Dijkstra/A*, top-k analytics, and merge-k-sorted-lists."],
  pitfalls: [
    "A heap is not globally sorted.",
    "Removing arbitrary items needs extra indexing.",
    "Priority ties require deterministic tie-breaking when order matters.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Array-backed binary min-heap: parent (i-1)>>1, children 2i+1 / 2i+2.
export class MinHeap<T> {
  private a: { p: number; v: T }[] = [];
  push(p: number, v: T) {
    this.a.push({ p, v });
    let i = this.a.length - 1;
    while (i > 0) {
      const par = (i - 1) >> 1;
      if (this.a[par].p <= this.a[i].p) break;
      [this.a[par], this.a[i]] = [this.a[i], this.a[par]];
      i = par;
    }
  }
  pop(): T | undefined {
    const top = this.a[0];
    const last = this.a.pop();
    if (this.a.length && last) {
      this.a[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < this.a.length && this.a[l].p < this.a[m].p) m = l;
        if (r < this.a.length && this.a[r].p < this.a[m].p) m = r;
        if (m === i) break;
        [this.a[m], this.a[i]] = [this.a[i], this.a[m]];
        i = m;
      }
    }
    return top?.v;
  }
}`,
  },
  usedBy: [
    {
      company: "Linux kernel",
      product: "Timer wheels & I/O deadlines",
      usage:
        "Earliest-deadline-first structures pop the next expiring timer in O(log n) instead of scanning every pending timer.",
    },
    {
      company: "Kubernetes / CNCF",
      product: "kube-scheduler priority queue",
      usage:
        "Pending pods sit in an active priority queue ordered by pod priority and timestamp, so the highest-priority pod is scheduled next.",
      href: "https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/",
    },
    {
      company: "Uber",
      product: "Dispatch & ETA search",
      usage:
        "Route search over the road graph pops the lowest-cost frontier node from a heap on every Dijkstra/A* expansion.",
    },
  ],
  references: [
    {
      label: "Kubernetes — pod priority and preemption",
      href: "https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/",
    },
    {
      label: "Python docs — heapq (binary heap API)",
      href: "https://docs.python.org/3/library/heapq.html",
    },
  ],
  challenge: {
    prompt:
      "Return the k largest values, ascending, keeping only k items in memory at a time. A bounded min-heap is how a reranker keeps the best k candidates while streaming through far more than it could hold.",
    entry: "topK",
    starter: `/**
 * @param {number[]} values - the stream. May be much larger than k.
 * @param {number} k - how many to keep.
 * @returns {number[]} the k largest, ascending. Fewer if the input is smaller.
 */
function topK(values, k) {
  // Keep a min-heap of size k. The smallest of your keepers sits at the root,
  // so it is the one to evict when something better arrives.
}
`,
    tests: [
      {
        name: "top three",
        body: `assertEquals(solution([5, 1, 9, 3, 7], 3), [5, 7, 9]);`,
      },
      {
        name: "k larger than the input returns everything sorted",
        body: `assertEquals(solution([2, 1], 5), [1, 2]);`,
      },
      {
        name: "k of zero returns nothing",
        body: `assertEquals(solution([3, 1], 0), []);`,
      },
      {
        name: "empty input",
        body: `assertEquals(solution([], 3), []);`,
      },
      {
        name: "keeps duplicates",
        body: `assertEquals(solution([4, 4, 1], 2), [4, 4]);`,
      },
      {
        name: "handles negatives",
        body: `assertEquals(solution([-5, -1, -9], 2), [-5, -1]);`,
      },
      {
        name: "already ascending input",
        body: `assertEquals(solution([1, 2, 3, 4], 2), [3, 4]);`,
      },
      {
        name: "streams a large input without sorting all of it",
        body: `var vs = [];
for (var i = 0; i < 200000; i++) vs.push((i * 7919) % 100000);
var out = solution(vs, 5);
assertEquals(out.length, 5);
assertEquals(out[4], 99999);`,
      },
    ],
    hints: [
      "Push until you hold k items. After that, only consider a value larger than the current minimum.",
      "A binary heap in an array: children of i are 2i+1 and 2i+2, the parent is (i-1)>>1.",
      "Sift up after a push, sift down after replacing the root; sort the k keepers once at the end.",
    ],
    reference: `function topK(values, k) {
  if (k <= 0) return [];
  const heap = []; // min-heap: heap[0] is the weakest keeper

  const up = (i) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p] <= heap[i]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const down = (i) => {
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let small = i;
      if (l < heap.length && heap[l] < heap[small]) small = l;
      if (r < heap.length && heap[r] < heap[small]) small = r;
      if (small === i) break;
      [heap[small], heap[i]] = [heap[i], heap[small]];
      i = small;
    }
  };

  for (const v of values) {
    if (heap.length < k) {
      heap.push(v);
      up(heap.length - 1);
    } else if (v > heap[0]) {
      // Beating the weakest keeper is the only reason to touch the heap.
      heap[0] = v;
      down(0);
    }
  }
  return heap.sort((a, b) => a - b);
}
`,
  },
};
