import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "deque",
  title: "Deque",
  category: "Data Structures",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Double-ended queue for front and back operations.",
  caption:
    "Push and pop from either side. Deques combine stack-like and queue-like behavior without shifting the whole collection.",
  skillTags: ["DSA", "Algorithms"],
  concept:
    "A deque, or double-ended queue, supports insertion and removal at both front and back. Implementations usually use a linked block list or circular array so both ends are O(1).\n\nDeques are useful when algorithms need both ends: sliding-window maximum keeps candidate values in monotonic order, work-stealing schedulers pop local work from one end and steal from the other, and editors use deques for history buffers.",
  complexity: [
    { operation: "Push/pop front", time: "O(1)", space: "O(1)" },
    { operation: "Push/pop back", time: "O(1)", space: "O(1)" },
    { operation: "Search", time: "O(n)", space: "O(1)" },
  ],
  realWorld: ["Sliding-window algorithms, job schedulers, undo/redo buffers, and browser history."],
  pitfalls: [
    "Random access is not always O(1), depending on implementation.",
    "Concurrency at both ends requires careful locking or lock-free design.",
    "A deque is not a priority queue; it preserves end order, not priority.",
  ],
  codeSnippet: {
    language: "py",
    code: `from collections import deque

# Sliding-window maximum in O(n): the deque holds indexes of
# candidates in decreasing value order.
def window_max(xs, w):
    dq, out = deque(), []
    for i, x in enumerate(xs):
        while dq and xs[dq[-1]] <= x:
            dq.pop()            # dominated candidates leave the back
        dq.append(i)
        if dq[0] <= i - w:
            dq.popleft()        # window moved past the front
        if i >= w - 1:
            out.append(xs[dq[0]])
    return out`,
  },
  usedBy: [
    {
      company: "Python Software Foundation",
      product: "collections.deque",
      usage:
        "A doubly linked list of fixed-size blocks giving O(1) appends and pops at both ends, plus bounded `maxlen` ring behaviour.",
      href: "https://docs.python.org/3/library/collections.html#collections.deque",
    },
    {
      company: "Oracle",
      product: "Java ForkJoinPool work stealing",
      usage:
        "Each worker owns a deque: it pushes/pops its own tasks at one end while idle threads steal from the other end.",
      href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ForkJoinPool.html",
    },
    {
      company: "Datadog",
      product: "Agent metric buffers",
      usage:
        "Bounded deques keep the newest N samples per metric and drop the oldest when the flush interval slips.",
    },
  ],
  references: [
    {
      label: "Python docs — collections.deque",
      href: "https://docs.python.org/3/library/collections.html#collections.deque",
    },
    {
      label: "Java — ForkJoinPool (work-stealing deques)",
      href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ForkJoinPool.html",
    },
  ],
};
