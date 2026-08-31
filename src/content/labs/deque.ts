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
  bridgesFrom: [
    {
      slug: "queue",
      sameness:
        "It IS a queue. Push at one end, pop from the other, FIFO — use only pushBack and popFront and a deque is indistinguishable from the queue you already have.",
      delta:
        "Both ends now accept both operations, which costs nothing asymptotically but rules out the simplest implementations: a singly linked list cannot pop from the tail in O(1), so a deque needs a doubly linked list or a ring buffer underneath. In exchange you get sliding-window algorithms, where the ability to discard from the back is what keeps the window monotonic and the whole scan O(n).",
    },
    {
      slug: "stack",
      sameness:
        "It IS also a stack. Restrict yourself to pushBack and popBack and you have LIFO with the same semantics as the stack you already built.",
      delta:
        "Being both at once is the point: one structure can back a stack, a queue, or a work-stealing scheduler where the owner pops one end and thieves steal from the other. That flexibility removes the type-level guarantee — a stack cannot be accidentally read FIFO, a deque can, so the discipline moves from the structure into your code.",
    },
  ],
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
  challenge: {
    prompt:
      "Return the maximum of every sliding window of width w, in O(n). The trick is a double-ended queue holding indices in decreasing value order. Sliding-window attention scores the same shape of problem over a context window.",
    entry: "windowMax",
    starter: `/**
 * @param {number[]} xs - the values.
 * @param {number} w - window width, at least 1.
 * @returns {number[]} the maximum of each window, left to right.
 */
function windowMax(xs, w) {
  // Keep a deque of INDICES whose values decrease from front to back.
  // The front is always the maximum of the current window.
}
`,
    tests: [
      {
        name: "classic example",
        body: `assertEquals(solution([1, 3, -1, -3, 5, 3, 6, 7], 3), [3, 3, 5, 5, 6, 7]);`,
      },
      {
        name: "window of one returns the input",
        body: `assertEquals(solution([4, 2, 9], 1), [4, 2, 9]);`,
      },
      {
        name: "window covering everything",
        body: `assertEquals(solution([4, 2, 9], 3), [9]);`,
      },
      {
        name: "monotonically decreasing input",
        body: `assertEquals(solution([5, 4, 3, 2], 2), [5, 4, 3]);`,
      },
      {
        name: "handles negatives",
        body: `assertEquals(solution([-5, -2, -8, -1], 2), [-2, -2, -1]);`,
      },
      {
        name: "empty input",
        body: `assertEquals(solution([], 3), []);`,
      },
      {
        name: "linear, not quadratic",
        body: `var xs = [];
for (var i = 0; i < 60000; i++) xs.push((i * 7919) % 1000);
var out = solution(xs, 500);
assertEquals(out.length, 60000 - 500 + 1);`,
      },
    ],
    hints: [
      "Store indices rather than values, so you can tell when the front has slid out of the window.",
      "Before pushing index i, pop from the back while the value there is less than or equal to xs[i] — those can never be a future maximum.",
      "Drop the front when it is older than i - w + 1, then read the front once the first full window exists.",
    ],
    reference: `function windowMax(xs, w) {
  const out = [];
  const deque = []; // indices, values decreasing front -> back
  for (let i = 0; i < xs.length; i++) {
    // Anything smaller than the incoming value is now unreachable as a max.
    while (deque.length && xs[deque[deque.length - 1]] <= xs[i]) deque.pop();
    deque.push(i);
    if (deque[0] <= i - w) deque.shift(); // front slid out of the window
    if (i >= w - 1) out.push(xs[deque[0]]);
  }
  return out;
}
`,
  },
};
