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
};
