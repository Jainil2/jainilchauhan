import type { ComponentType } from "react";
import { BloomFilter } from "@/components/system-design/BloomFilter";
import { LRUCache } from "@/components/system-design/LRUCache";
import { RaftCluster } from "@/components/system-design/RaftCluster";
import { SortingRace } from "@/components/system-design/SortingRace";
import { DijkstraGrid } from "@/components/system-design/DijkstraGrid";
import { OIDCFlow } from "@/components/system-design/OIDCFlow";
import { MessageQueue } from "@/components/system-design/MessageQueue";
import { MerkleTree } from "@/components/system-design/MerkleTree";
import { ConsistentHashLab } from "@/components/system-design/ConsistentHashLab";
import { RateLimiterLab } from "@/components/system-design/RateLimiterLab";
import { BTreeIndexLab } from "@/components/system-design/BTreeIndexLab";
import { GraphTraversalLab } from "@/components/system-design/GraphTraversalLab";
import { CapTheoremLab } from "@/components/system-design/CapTheoremLab";
import { DeadlockLab } from "@/components/system-design/DeadlockLab";
import { GossipProtocol } from "@/components/system-design/GossipProtocol";
import { DistributedTx } from "@/components/system-design/DistributedTx";
import { SnowflakeId } from "@/components/system-design/SnowflakeId";
import { VectorClocks } from "@/components/system-design/VectorClocks";
import { LSMTree } from "@/components/system-design/LSMTree";
import { HyperLogLog } from "@/components/system-design/HyperLogLog";
import { QuadTreeLab } from "@/components/system-design/QuadTreeLab";
import { SkipList } from "@/components/system-design/SkipList";
import { TrieLab } from "@/components/system-design/TrieLab";
import { AStarSearch } from "@/components/system-design/AStarSearch";
import { PageRankLab } from "@/components/system-design/PageRankLab";
import { LevenshteinLab } from "@/components/system-design/LevenshteinLab";
import { RabinKarp } from "@/components/system-design/RabinKarp";
import { JWTAnatomy } from "@/components/system-design/JWTAnatomy";
import { TLSHandshake } from "@/components/system-design/TLSHandshake";
import { CORSLab } from "@/components/system-design/CORSLab";
import { WebAuthnLab } from "@/components/system-design/WebAuthnLab";
import {
  BackpressureLab,
  CRDTLab,
  CircuitBreakerLab,
  LoadBalancerLab,
  ShardingReplicationLab,
  TopologicalSortLab,
} from "@/components/system-design/AdvancedSystemLabs";
import {
  ArrayLab,
  BitsetLab,
  CircularBufferLab,
  DequeLab,
  DynamicArrayLab,
  HashTableLab,
  LinkedListLab,
  QueueLab,
  SparseMatrixLab,
  StackLab,
} from "@/components/system-design/CoreDataStructureLabs";
import {
  BipartiteCheckLab,
  ConnectedComponentsLab,
  CycleDetectionLab,
  GraphRepresentationLab,
  GraphUnionFindLab,
  StronglyConnectedComponentsLab,
} from "@/components/system-design/CoreGraphLabs";
import {
  BellmanFordLab,
  BipartiteMatchingLab,
  EdmondsKarpLab,
  FloydWarshallLab,
  KruskalLab,
  MaxFlowLab,
  MinCutLab,
  PrimLab,
} from "@/components/system-design/GraphOptimizationLabs";
import {
  CoinChangeLab,
  FibonacciMemoLab,
  GridDPLab,
  KnapsackLab,
  LCSLab,
  LISLab,
  MatrixChainLab,
  TreeDPLab,
} from "@/components/system-design/DynamicProgrammingLabs";
import {
  ActivitySelectionLab,
  BranchAndBoundLab,
  HuffmanCodingLab,
  IntervalSchedulingLab,
  MergeSortRecursionLab,
  NQueensLab,
  PermutationsSubsetsLab,
} from "@/components/system-design/GreedyBacktrackingLabs";
import {
  BinarySearchLab,
  BucketSortLab,
  CountingSortLab,
  ExternalMergeSortLab,
  HeapSortLab,
  QuickselectLab,
  RadixSortLab,
  TimSortLab,
} from "@/components/system-design/SearchSortLabs";
import {
  AVLTreeLab,
  BPlusTreeLab,
  BSTLab,
  BinaryTreeLab,
  DisjointSetLab,
  FenwickTreeLab,
  HeapLab,
  RedBlackTreeLab,
  SegmentTreeLab,
} from "@/components/system-design/CoreTreeLabs";

export type LabCategory = "Distributed Systems" | "Data Structures" | "Algorithms" | "Security";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface LabEntry {
  slug: string;
  title: string;
  category: LabCategory;
  difficulty: Difficulty;
  readingTimeMin: number;
  blurb: string;
  caption: string;
  whereUsed?: { label: string; href: string };
  component: ComponentType;
  /** Skill names this lab demonstrates — used to render "▸ try it" chips on Skills cards. */
  skillTags: string[];
  /** Long-form explanation, shown in the "Concept" section. */
  concept: string;
  complexity?: { operation: string; time: string; space?: string }[];
  codeSnippet?: { language: "ts" | "py" | "go" | "sql"; code: string };
  realWorld?: string[];
  pitfalls?: string[];
  references?: { label: string; href: string }[];
  /**
   * Named companies/products that run on this concept, shown as chips in the
   * "Used in production" section. `href` points at a public source (engineering
   * blog, paper, docs); entries without one render as "commonly used in".
   */
  usedBy?: { company: string; product: string; usage: string; href?: string }[];
}

export const labRegistry: LabEntry[] = [
  {
    slug: "array",
    title: "Array",
    category: "Data Structures",
    difficulty: "Beginner",
    readingTimeMin: 3,
    blurb: "Contiguous memory with constant-time indexed access.",
    caption:
      "Move the highlighted index and sliding window across contiguous cells. Arrays are fast because index lookup is address arithmetic, not traversal.",
    component: ArrayLab,
    skillTags: ["DSA", "Memory"],
    concept:
      "An array stores equal-sized elements in contiguous memory. If the base address and element size are known, the address of index i is base + i * elementSize, which gives O(1) random access.\n\nThat contiguity is also cache-friendly: scanning adjacent elements tends to use CPU cache lines efficiently. The tradeoff is that inserting or deleting in the middle requires shifting elements, and fixed-size arrays cannot grow without allocating new storage.",
    complexity: [
      { operation: "Access by index", time: "O(1)", space: "O(1)" },
      { operation: "Search unsorted", time: "O(n)", space: "O(1)" },
      { operation: "Insert/delete middle", time: "O(n)", space: "O(1)" },
    ],
    realWorld: [
      "Backing storage for vectors, strings, heaps, hash-table buckets, and database pages.",
      "Sliding-window algorithms over logs, metrics, and time-series samples.",
    ],
    pitfalls: [
      "Out-of-bounds access is unsafe in low-level languages.",
      "Middle insertions are expensive because data must shift.",
      "Sparse data wastes memory when represented as a dense array.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Fixed-size array: index math, not traversal.
const frames = new Float64Array(8); // contiguous, 8 bytes per slot
frames[3] = 16.7; // address = base + 3 * 8  -> O(1)

// Sliding window over contiguous samples (cache-friendly scan).
function maxWindow(xs: Float64Array, w: number): number[] {
  const out: number[] = [];
  let sum = 0;
  for (let i = 0; i < xs.length; i++) {
    sum += xs[i];
    if (i >= w) sum -= xs[i - w];
    if (i >= w - 1) out.push(sum / w);
  }
  return out;
}`,
    },
    usedBy: [
      {
        company: "Google",
        product: "Chrome / V8 engine",
        usage:
          'JavaScript arrays start life as contiguous "packed elements" backing stores so index access is pointer arithmetic; V8 deoptimises to a dictionary only when you create holes.',
        href: "https://v8.dev/blog/elements-kinds",
      },
      {
        company: "Meta",
        product: "React reconciler",
        usage:
          "Fiber children and hook state are kept in ordered arrays, which is why hooks must be called in the same order every render.",
        href: "https://react.dev/reference/rules/rules-of-hooks",
      },
      {
        company: "Netflix",
        product: "Playback telemetry",
        usage:
          "Ring/array buffers hold the last N bitrate and buffer-health samples so the ABR algorithm can scan a fixed window without allocating.",
      },
    ],
    references: [
      { label: "V8 — Elements kinds in V8", href: "https://v8.dev/blog/elements-kinds" },
      {
        label: "MDN — JavaScript typed arrays",
        href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays",
      },
    ],
  },
  {
    slug: "dynamic-array",
    title: "Dynamic Array",
    category: "Data Structures",
    difficulty: "Beginner",
    readingTimeMin: 4,
    blurb: "Growable array with amortized O(1) append.",
    caption:
      "Push elements until capacity doubles. Most pushes are O(1); the resize push copies old elements into a larger backing array.",
    component: DynamicArrayLab,
    skillTags: ["DSA", "Memory"],
    concept:
      "A dynamic array wraps a fixed array with a length and capacity. Appending is cheap while capacity remains. When the array fills, it allocates a larger backing store, commonly 2x capacity, copies existing elements, then writes the new value.\n\nA resize is O(n), but it happens rarely enough that append is amortized O(1). This is the structure behind JavaScript arrays, Python lists, Java ArrayList, C++ vector, and Go slices.",
    complexity: [
      { operation: "Access", time: "O(1)", space: "O(1)" },
      { operation: "Append", time: "O(1) amortized", space: "O(n)" },
      { operation: "Insert/delete middle", time: "O(n)", space: "O(1)" },
    ],
    realWorld: ["UI lists, request buffers, parser token streams, and in-memory result sets."],
    pitfalls: [
      "Holding references into a backing array can break after resize in low-level languages.",
      "Over-allocation trades memory for append performance.",
      "Repeated front insertion is a poor fit; use a deque.",
    ],
    codeSnippet: {
      language: "go",
      code: `// Go slices are the canonical dynamic array: len + cap over a backing array.
s := make([]int, 0, 4)
for i := 0; i < 9; i++ {
    s = append(s, i) // grows by ~2x when len == cap
    fmt.Println(len(s), cap(s)) // 1/4 2/4 3/4 4/4 5/8 ... 9/16
}

// The reallocation is why you must reassign: append may return a new array.
func push(dst []int, v int) []int {
    if len(dst) == cap(dst) {
        grown := make([]int, len(dst), max(1, 2*cap(dst)))
        copy(grown, dst)
        dst = grown
    }
    return append(dst, v)
}`,
    },
    usedBy: [
      {
        company: "Google",
        product: "Go standard library",
        usage:
          "Every `append` on a slice is amortised doubling; the growth rule is documented in the Go slice internals post.",
        href: "https://go.dev/blog/slices-intro",
      },
      {
        company: "Python Software Foundation",
        product: "CPython list",
        usage:
          "`list.append` over-allocates on a documented growth pattern so appends stay amortised O(1).",
        href: "https://docs.python.org/3/faq/design.html#how-are-lists-implemented-in-cpython",
      },
      {
        company: "Elastic",
        product: "Elasticsearch bulk indexing",
        usage:
          "Bulk request buffers grow geometrically until a flush threshold, trading memory headroom for fewer copies.",
      },
    ],
    references: [
      {
        label: "Go blog — Arrays, slices and the mechanics of append",
        href: "https://go.dev/blog/slices-intro",
      },
      {
        label: "CPython — how are lists implemented?",
        href: "https://docs.python.org/3/faq/design.html#how-are-lists-implemented-in-cpython",
      },
    ],
  },
  {
    slug: "linked-list",
    title: "Linked List",
    category: "Data Structures",
    difficulty: "Beginner",
    readingTimeMin: 4,
    blurb: "Pointer-linked nodes optimized for local insertion and deletion.",
    caption:
      "Insert at the head and traverse node by node. Linked lists avoid shifting but lose O(1) indexed access and cache locality.",
    component: LinkedListLab,
    skillTags: ["DSA", "Memory"],
    concept:
      "A linked list stores each value in a node that points to the next node. Singly linked lists support forward traversal; doubly linked lists also point backward. Inserting or deleting near a known node is O(1) because only pointers change.\n\nThe cost is lookup: finding index i requires walking from the head. Each node also carries pointer overhead and scattered allocation, which is less cache-friendly than arrays.",
    complexity: [
      { operation: "Insert/delete known node", time: "O(1)", space: "O(1)" },
      { operation: "Search/index lookup", time: "O(n)", space: "O(1)" },
      { operation: "Traversal", time: "O(n)", space: "O(1)" },
    ],
    realWorld: [
      "LRU cache recency chains, adjacency lists, memory allocators, and intrusive kernel lists.",
    ],
    pitfalls: [
      "Pointer bugs create cycles, leaks, or lost sublists.",
      "Poor cache locality can make lists slower than arrays despite better big-O for insertion.",
      "Deleting a node usually requires knowing its predecessor in a singly linked list.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Doubly linked list node — O(1) unlink/relink, the core of an LRU chain.
interface Node<T> { value: T; prev?: Node<T>; next?: Node<T> }

function unlink<T>(n: Node<T>) {
  if (n.prev) n.prev.next = n.next;
  if (n.next) n.next.prev = n.prev;
  n.prev = n.next = undefined;
}

function pushFront<T>(head: Node<T> | undefined, n: Node<T>): Node<T> {
  n.next = head;
  if (head) head.prev = n;
  return n; // new head
}`,
    },
    usedBy: [
      {
        company: "Redis",
        product: "Redis lists / LPUSH-RPUSH",
        usage:
          "Lists are stored as a quicklist — a linked list of compact listpack nodes — so pushes and pops at both ends stay O(1).",
        href: "https://redis.io/docs/latest/develop/data-types/lists/",
      },
      {
        company: "Linux kernel",
        product: "list_head intrusive lists",
        usage:
          "Task, timer and driver structures embed `struct list_head`, giving O(1) insert/remove with no allocation.",
        href: "https://www.kernel.org/doc/html/latest/core-api/kernel-api.html#list-management-functions",
      },
      {
        company: "Memcached",
        product: "Slab LRU chain",
        usage:
          "Each slab class keeps a doubly linked recency list so a hit only relinks pointers instead of shifting data.",
      },
    ],
    references: [
      {
        label: "Redis docs — Lists (quicklist encoding)",
        href: "https://redis.io/docs/latest/develop/data-types/lists/",
      },
      {
        label: "Linux kernel — list management API",
        href: "https://www.kernel.org/doc/html/latest/core-api/kernel-api.html#list-management-functions",
      },
    ],
  },
  {
    slug: "stack",
    title: "Stack",
    category: "Data Structures",
    difficulty: "Beginner",
    readingTimeMin: 3,
    blurb: "Last-in, first-out storage for nested work.",
    caption:
      "Push and pop call frames from the top. The newest item is always removed first, matching recursion and parser behavior.",
    component: StackLab,
    skillTags: ["DSA", "Algorithms"],
    concept:
      "A stack is a LIFO structure: push adds to the top, pop removes from the top, and peek reads the top without removing it. It can be implemented with an array or linked list.\n\nStacks model nested work. Function calls, expression parsing, undo history, DFS, browser navigation, and bracket matching all rely on the idea that the most recent unfinished item should be handled first.",
    complexity: [
      { operation: "Push", time: "O(1)", space: "O(1)" },
      { operation: "Pop/peek", time: "O(1)", space: "O(1)" },
    ],
    realWorld: [
      "Call stacks, DFS traversal, expression evaluators, undo stacks, and monotonic stacks.",
    ],
    pitfalls: [
      "Recursive algorithms can overflow the process call stack.",
      "Popping from an empty stack must be handled explicitly.",
      "A stack reverses order; this is useful but easy to misuse.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Bracket matching: the classic LIFO check behind every parser.
const PAIRS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

export function balanced(src: string): boolean {
  const stack: string[] = [];
  for (const ch of src) {
    if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
    else if (ch in PAIRS) {
      if (stack.pop() !== PAIRS[ch]) return false; // wrong closer
    }
  }
  return stack.length === 0; // nothing left unclosed
}`,
    },
    usedBy: [
      {
        company: "Google",
        product: "V8 call stack / Error.stack",
        usage:
          "Each JS call pushes a frame; the stack trace you read in DevTools is that stack unwound, and deep recursion pops out as RangeError.",
        href: "https://v8.dev/docs/stack-trace-api",
      },
      {
        company: "Mozilla",
        product: "WebAssembly value stack",
        usage:
          "Wasm is a stack machine: instructions push and pop operands, and validation checks the stack shape ahead of time.",
        href: "https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Understanding_the_text_format",
      },
      {
        company: "Figma",
        product: "Undo / redo history",
        usage:
          "Editing tools keep an undo stack of inverse operations, popping the most recent edit first.",
      },
    ],
    references: [
      { label: "V8 — Stack trace API", href: "https://v8.dev/docs/stack-trace-api" },
      {
        label: "MDN — Call stack",
        href: "https://developer.mozilla.org/en-US/docs/Glossary/Call_stack",
      },
    ],
  },
  {
    slug: "queue",
    title: "Queue",
    category: "Data Structures",
    difficulty: "Beginner",
    readingTimeMin: 3,
    blurb: "First-in, first-out ordering for fair processing.",
    caption:
      "Enqueue work at the back and dequeue from the front. Queue order preserves arrival order for BFS, jobs, and streams.",
    component: QueueLab,
    skillTags: ["DSA", "Backend"],
    concept:
      "A queue is a FIFO structure. Producers enqueue at the back; consumers dequeue from the front. This makes queues a natural fit for fair scheduling and breadth-first processing.\n\nQueues can be backed by linked lists, ring buffers, or broker logs. Production queues add persistence, acknowledgements, retries, visibility timeouts, dead-letter queues, and backpressure.",
    complexity: [
      { operation: "Enqueue", time: "O(1)", space: "O(1)" },
      { operation: "Dequeue/peek", time: "O(1)", space: "O(1)" },
    ],
    realWorld: [
      "BFS, worker queues, event loops, message brokers, print queues, and request buffers.",
    ],
    pitfalls: [
      "Unbounded queues hide overload as growing latency.",
      "Array-backed queues must avoid O(n) front shifts; use head/tail indexes.",
      "Distributed queues need idempotent consumers because retries happen.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// O(1) FIFO with head/tail indexes — no O(n) shift() on every dequeue.
export class Queue<T> {
  private items: (T | undefined)[] = [];
  private head = 0;

  enqueue(v: T) { this.items.push(v); }

  dequeue(): T | undefined {
    if (this.head >= this.items.length) return undefined;
    const v = this.items[this.head];
    this.items[this.head++] = undefined; // release reference
    if (this.head > 32 && this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head); // compact rarely
      this.head = 0;
    }
    return v;
  }
}`,
    },
    usedBy: [
      {
        company: "Amazon",
        product: "AWS SQS",
        usage:
          "Standard queues buffer work between producers and consumers with visibility timeouts and dead-letter queues for poison messages.",
        href: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-basic-architecture.html",
      },
      {
        company: "Shopify",
        product: "Sidekiq background jobs",
        usage:
          "Checkout side-effects (emails, webhooks, inventory sync) are enqueued so the request path stays fast and retries are automatic.",
      },
      {
        company: "Google",
        product: "Chrome task queues",
        usage:
          "The event loop drains macrotask and microtask queues in arrival order, which is why a long task delays every queued callback.",
        href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model",
      },
    ],
    references: [
      {
        label: "AWS — SQS basic architecture",
        href: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-basic-architecture.html",
      },
      {
        label: "MDN — JavaScript execution model (task queues)",
        href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model",
      },
    ],
  },
  {
    slug: "deque",
    title: "Deque",
    category: "Data Structures",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Double-ended queue for front and back operations.",
    caption:
      "Push and pop from either side. Deques combine stack-like and queue-like behavior without shifting the whole collection.",
    component: DequeLab,
    skillTags: ["DSA", "Algorithms"],
    concept:
      "A deque, or double-ended queue, supports insertion and removal at both front and back. Implementations usually use a linked block list or circular array so both ends are O(1).\n\nDeques are useful when algorithms need both ends: sliding-window maximum keeps candidate values in monotonic order, work-stealing schedulers pop local work from one end and steal from the other, and editors use deques for history buffers.",
    complexity: [
      { operation: "Push/pop front", time: "O(1)", space: "O(1)" },
      { operation: "Push/pop back", time: "O(1)", space: "O(1)" },
      { operation: "Search", time: "O(n)", space: "O(1)" },
    ],
    realWorld: [
      "Sliding-window algorithms, job schedulers, undo/redo buffers, and browser history.",
    ],
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
  },
  {
    slug: "circular-buffer",
    title: "Circular Buffer",
    category: "Data Structures",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Fixed-size ring storage with wrapping head and tail pointers.",
    caption:
      "Write and read through a fixed ring. Head and tail wrap with modulo arithmetic so no element shifting is required.",
    component: CircularBufferLab,
    skillTags: ["DSA", "Streaming", "Systems"],
    concept:
      "A circular buffer stores data in a fixed-size array with head and tail indexes that wrap around. Writing advances tail; reading advances head. When full, the buffer either rejects writes, blocks, or overwrites old data depending on policy.\n\nThis design gives predictable memory usage and O(1) operations, which is why it appears in audio pipelines, network drivers, log buffers, embedded systems, and streaming queues.",
    complexity: [
      { operation: "Read/write", time: "O(1)", space: "O(capacity)" },
      { operation: "Advance pointer", time: "O(1)", space: "O(1)" },
    ],
    realWorld: [
      "TCP buffers, audio/video streams, telemetry windows, kernel logs, and producer-consumer queues.",
    ],
    pitfalls: [
      "Full and empty states can look identical if only head and tail are tracked.",
      "Overwrite policy must be explicit.",
      "Multi-producer/multi-consumer rings require memory-ordering discipline.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Fixed-memory ring with an explicit overwrite policy.
export class RingBuffer<T> {
  private buf: (T | undefined)[];
  private head = 0; // read cursor
  private size = 0;
  constructor(readonly capacity: number) {
    this.buf = new Array(capacity);
  }
  write(v: T) {
    const tail = (this.head + this.size) % this.capacity;
    this.buf[tail] = v;
    if (this.size === this.capacity) this.head = (this.head + 1) % this.capacity; // drop oldest
    else this.size++;
  }
  read(): T | undefined {
    if (this.size === 0) return undefined; // size disambiguates full vs empty
    const v = this.buf[this.head];
    this.head = (this.head + 1) % this.capacity;
    this.size--;
    return v;
  }
}`,
    },
    usedBy: [
      {
        company: "LMAX",
        product: "Disruptor exchange core",
        usage:
          "A pre-allocated ring buffer with sequence counters lets the trading engine pass millions of events per second between threads without locks.",
        href: "https://lmax-exchange.github.io/disruptor/disruptor.html",
      },
      {
        company: "Linux kernel",
        product: "dmesg / printk log buffer",
        usage:
          "Kernel messages land in a fixed ring, so old lines are overwritten instead of exhausting memory.",
        href: "https://www.kernel.org/doc/html/latest/core-api/printk-basics.html",
      },
      {
        company: "Spotify",
        product: "Audio playback pipeline",
        usage:
          "Decoded PCM frames sit in a ring between the decoder and the audio device so jitter never blocks the decoder.",
      },
    ],
    references: [
      {
        label: "LMAX Disruptor — technical paper",
        href: "https://lmax-exchange.github.io/disruptor/disruptor.html",
      },
      {
        label: "Linux — printk ring buffer basics",
        href: "https://www.kernel.org/doc/html/latest/core-api/printk-basics.html",
      },
    ],
  },
  {
    slug: "hash-table",
    title: "Hash Table",
    category: "Data Structures",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "Map keys to buckets for average O(1) lookup.",
    caption:
      "Insert keys and watch them route to buckets. Collisions form chains, showing why load factor and hash quality matter.",
    component: HashTableLab,
    skillTags: ["DSA", "Backend"],
    concept:
      "A hash table stores key-value pairs by hashing each key to a bucket. A good hash function spreads keys evenly, giving O(1) average insert, lookup, and delete. Collisions are handled with chaining, open addressing, or hybrid schemes.\n\nHash tables power maps, sets, caches, indexes, joins, memoization, and deduplication. Performance depends on load factor, collision strategy, resizing policy, and hash quality.",
    complexity: [
      { operation: "Insert/lookup/delete", time: "O(1) average, O(n) worst", space: "O(n)" },
      { operation: "Resize", time: "O(n)", space: "O(n)" },
    ],
    realWorld: [
      "JavaScript Map/Object, Python dict, Redis dictionaries, compiler symbol tables, and hash joins.",
    ],
    pitfalls: [
      "Adversarial keys can force collisions unless hashing is hardened.",
      "Resizing can create latency spikes.",
      "Iteration order should not be relied on unless the implementation guarantees it.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Separate chaining with load-factor driven resize.
export class HashMap<V> {
  private buckets: [string, V][][] = Array.from({ length: 8 }, () => []);
  private count = 0;

  private idx(key: string, m = this.buckets.length) {
    let h = 2166136261; // FNV-1a
    for (let i = 0; i < key.length; i++) {
      h = (h ^ key.charCodeAt(i)) * 16777619;
    }
    return (h >>> 0) % m;
  }

  set(key: string, value: V) {
    const b = this.buckets[this.idx(key)];
    const hit = b.find((e) => e[0] === key);
    if (hit) { hit[1] = value; return; }
    b.push([key, value]);
    if (++this.count / this.buckets.length > 0.75) this.resize();
  }

  private resize() {
    const next: [string, V][][] = Array.from({ length: this.buckets.length * 2 }, () => []);
    for (const b of this.buckets) for (const e of b) next[this.idx(e[0], next.length)].push(e);
    this.buckets = next;
  }
}`,
    },
    usedBy: [
      {
        company: "Redis",
        product: "Keyspace / HSET",
        usage:
          "The main keyspace is a hash table that rehashes incrementally into a second table so a resize never stalls the single-threaded event loop.",
        href: "https://redis.io/docs/latest/develop/data-types/hashes/",
      },
      {
        company: "Cloudflare",
        product: "Edge routing tables",
        usage:
          "Hash maps resolve host/zone lookups per request; hash-collision (HashDoS) hardening uses randomised seeds.",
        href: "https://blog.cloudflare.com/why-i-started-contributing-to-swiss-tables/",
      },
      {
        company: "Google",
        product: "Abseil Swiss Tables",
        usage:
          "SIMD-scanned open-addressed control bytes make flat_hash_map lookups faster than node-based maps across Google's C++ code.",
        href: "https://abseil.io/about/design/swisstables",
      },
    ],
    references: [
      {
        label: "Abseil — Swiss Tables design notes",
        href: "https://abseil.io/about/design/swisstables",
      },
      {
        label: "Redis docs — Hashes",
        href: "https://redis.io/docs/latest/develop/data-types/hashes/",
      },
    ],
  },
  {
    slug: "bitset",
    title: "Bitset",
    category: "Data Structures",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Pack boolean flags into bits for memory-efficient sets.",
    caption:
      "Toggle individual bits and watch the byte value change. Bitsets compress booleans and enable fast set operations with bitwise logic.",
    component: BitsetLab,
    skillTags: ["DSA", "Systems"],
    concept:
      "A bitset stores boolean values as individual bits instead of full bytes or objects. This reduces memory by up to 8x or more and enables word-level operations: AND for intersection, OR for union, XOR for differences, and bit shifts for compact state transitions.\n\nBitsets are ideal when the universe of possible values is bounded and can be mapped to integer positions.",
    complexity: [
      { operation: "Set/clear/test bit", time: "O(1)", space: "O(n / wordSize)" },
      { operation: "Union/intersection", time: "O(n / wordSize)", space: "O(n / wordSize)" },
    ],
    realWorld: [
      "Permissions flags, bitmap indexes, Bloom filters, graph reachability, schedulers, and feature flags.",
    ],
    pitfalls: [
      "Requires a stable mapping from item to bit position.",
      "Sparse large universes may waste memory.",
      "Bit arithmetic is compact but can reduce readability if not wrapped well.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// One bit per id: 1M feature flags in 125 KB.
export class Bitset {
  private words: Uint32Array;
  constructor(bits: number) { this.words = new Uint32Array(Math.ceil(bits / 32)); }
  set(i: number) { this.words[i >>> 5] |= 1 << (i & 31); }
  has(i: number) { return (this.words[i >>> 5] & (1 << (i & 31))) !== 0; }
  // Intersect two cohorts with word-at-a-time AND.
  and(other: Bitset) {
    const out = new Bitset(this.words.length * 32);
    for (let w = 0; w < this.words.length; w++) out.words[w] = this.words[w] & other.words[w];
    return out;
  }
  popcount() {
    let n = 0;
    for (let w of this.words) { w = w - ((w >>> 1) & 0x55555555); w = (w & 0x33333333) + ((w >>> 2) & 0x33333333); n += (((w + (w >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24; }
    return n;
  }
}`,
    },
    usedBy: [
      {
        company: "Elastic",
        product: "Elasticsearch / Lucene filters",
        usage:
          "Filter clauses are cached as bitsets per segment so combining filters is a word-wise AND rather than a re-scan.",
        href: "https://www.elastic.co/blog/frame-of-reference-and-roaring-bitmaps",
      },
      {
        company: "Druid / Apache",
        product: "Roaring bitmap indexes",
        usage:
          "Compressed bitmaps store which rows match each dimension value, making high-cardinality filtering cheap.",
        href: "https://roaringbitmap.org/",
      },
      {
        company: "Redis",
        product: "Bitmaps (SETBIT) for DAU tracking",
        usage:
          "One bit per user id per day gives daily-active-user counts and retention set operations in a few hundred KB.",
        href: "https://redis.io/docs/latest/develop/data-types/bitmaps/",
      },
    ],
    references: [
      { label: "Roaring Bitmaps — compressed bitset format", href: "https://roaringbitmap.org/" },
      {
        label: "Redis docs — Bitmaps",
        href: "https://redis.io/docs/latest/develop/data-types/bitmaps/",
      },
    ],
  },
  {
    slug: "sparse-matrix",
    title: "Sparse Matrix",
    category: "Data Structures",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "Store only non-zero cells instead of the full grid.",
    caption:
      "Scan non-zero matrix cells and compare the dense grid to coordinate triples. Sparse storage saves memory when most entries are zero.",
    component: SparseMatrixLab,
    skillTags: ["DSA", "ML", "Databases"],
    concept:
      "A sparse matrix represents a grid where most values are zero or empty. Instead of storing every cell, formats like COO store triples (row, column, value), CSR groups values by row, and CSC groups by column.\n\nSparse matrices are fundamental in search, recommendation systems, graphs, scientific computing, machine learning, and analytics because real relationships are often sparse.",
    complexity: [
      { operation: "Dense storage", time: "O(rows * cols)", space: "O(rows * cols)" },
      { operation: "Sparse storage", time: "O(nonZero)", space: "O(nonZero)" },
      { operation: "Lookup", time: "O(1) to O(log n)", space: "depends on index" },
    ],
    realWorld: [
      "User-item recommendation matrices, graph adjacency matrices, inverted indexes, and ML feature vectors.",
    ],
    pitfalls: [
      "Random lookup can be slower unless an index is added.",
      "Wrong sparse format makes operations expensive.",
      "When density grows, dense arrays can become faster and simpler.",
    ],
    codeSnippet: {
      language: "py",
      code: `import numpy as np
from scipy.sparse import csr_matrix

# 3 users x 4 items, only 4 ratings stored instead of 12 cells.
rows = [0, 0, 1, 2]
cols = [1, 3, 0, 2]
vals = [5.0, 3.0, 4.0, 2.0]
R = csr_matrix((vals, (rows, cols)), shape=(3, 4))

R.data          # non-zero values, row-major
R.indices       # column index of each value
R.indptr        # where each row starts -> O(nnz per row) scans

similar = R @ R.T   # cosine-style neighbourhood, touches only non-zeros`,
    },
    usedBy: [
      {
        company: "Netflix",
        product: "Recommendation matrix factorisation",
        usage:
          "The user x title rating matrix is over 99% empty, so latent-factor models iterate only over observed cells.",
        href: "https://netflixtechblog.com/netflix-recommendations-beyond-the-5-stars-part-1-55838468f429",
      },
      {
        company: "Google",
        product: "PageRank web graph",
        usage:
          "The web link matrix is stored as sparse adjacency: each page links to a handful of pages, not billions.",
        href: "http://infolab.stanford.edu/~backrub/google.html",
      },
      {
        company: "Spotify",
        product: "Implicit-feedback collaborative filtering",
        usage: "Play counts form a sparse user x track matrix consumed by ALS-style factorisation.",
      },
    ],
    references: [
      {
        label: "SciPy — compressed sparse row (CSR) format",
        href: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.sparse.csr_matrix.html",
      },
      {
        label: "Netflix Tech Blog — recommendations beyond the 5 stars",
        href: "https://netflixtechblog.com/netflix-recommendations-beyond-the-5-stars-part-1-55838468f429",
      },
    ],
  },
  {
    slug: "binary-tree",
    title: "Binary Tree",
    category: "Data Structures",
    difficulty: "Beginner",
    readingTimeMin: 4,
    blurb: "Hierarchical nodes with at most two children.",
    caption:
      "Step through level-order traversal and observe array-style child indexing. Binary trees are the base shape behind heaps, search trees, and expression trees.",
    component: BinaryTreeLab,
    skillTags: ["DSA", "Trees"],
    concept:
      "A binary tree is a hierarchical structure where each node has at most a left and right child. It does not require ordering by itself; it is just a shape. Traversals define how you visit nodes: preorder for serialization, inorder for sorted output in BSTs, postorder for cleanup/evaluation, and level-order for breadth-first scans.\n\nComplete binary trees can be stored compactly in arrays: for node i, left child is 2i+1 and right child is 2i+2.",
    complexity: [
      { operation: "Traversal", time: "O(n)", space: "O(h)" },
      { operation: "Access child pointer", time: "O(1)", space: "O(1)" },
    ],
    realWorld: [
      "ASTs in compilers, expression evaluators, heaps, decision trees, and UI scene graphs.",
    ],
    pitfalls: [
      "A plain binary tree has no search guarantee.",
      "Recursive traversal can overflow on deep trees.",
      "Tree height controls performance for many derived structures.",
    ],
    codeSnippet: {
      language: "ts",
      code: `interface TreeNode { value: string; left?: TreeNode; right?: TreeNode }

// Depth-first: the shape of the tree drives the order.
function inorder(n: TreeNode | undefined, out: string[] = []) {
  if (!n) return out;
  inorder(n.left, out);
  out.push(n.value);
  inorder(n.right, out);
  return out;
}

// Breadth-first: level by level, the traversal UIs use for expand-all.
function levels(root: TreeNode) {
  const q = [root], out: string[][] = [];
  while (q.length) {
    const level = q.splice(0, q.length);
    out.push(level.map((n) => n.value));
    for (const n of level) { if (n.left) q.push(n.left); if (n.right) q.push(n.right); }
  }
  return out;
}`,
    },
    usedBy: [
      {
        company: "Meta",
        product: "React fiber tree",
        usage:
          "The UI is a tree of fiber nodes walked depth-first during render and commit; sibling/child pointers make the walk interruptible.",
        href: "https://react.dev/learn/preserving-and-resetting-state",
      },
      {
        company: "Google",
        product: "Chrome DOM & render tree",
        usage:
          "HTML parses into a DOM tree, which is walked to build the render tree and layout boxes on every frame.",
        href: "https://developer.chrome.com/docs/devtools/dom",
      },
      {
        company: "Git / Linux Foundation",
        product: "Git tree objects",
        usage:
          "A commit points at a tree object whose children are subtrees and blobs, so unchanged directories are shared between commits.",
        href: "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects",
      },
    ],
    references: [
      {
        label: "Git internals — tree objects",
        href: "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects",
      },
      {
        label: "MDN — Introduction to the DOM",
        href: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction",
      },
    ],
  },
  {
    slug: "binary-search-tree",
    title: "Binary Search Tree",
    category: "Data Structures",
    difficulty: "Beginner",
    readingTimeMin: 4,
    blurb: "Ordered tree where left is smaller and right is larger.",
    caption:
      "Search for values by branching left or right at each comparison. Balanced height gives logarithmic lookup.",
    component: BSTLab,
    skillTags: ["DSA", "Trees"],
    concept:
      "A binary search tree stores keys so every left subtree is smaller than the node and every right subtree is larger. This lets search, insert, and delete discard half-ish of the remaining tree at each step when the tree is balanced.\n\nThe weakness is shape. Inserting sorted data into a naive BST creates a linked list with O(n) operations. Balanced trees such as AVL and red-black trees add rotations to keep height logarithmic.",
    complexity: [
      { operation: "Search/insert/delete balanced", time: "O(log n)", space: "O(h)" },
      { operation: "Search/insert/delete worst", time: "O(n)", space: "O(h)" },
    ],
    realWorld: [
      "Ordered maps, range queries, symbol tables, and educational search-tree foundations.",
    ],
    pitfalls: [
      "Sorted inserts can degrade to a chain.",
      "Delete cases are easy to implement incorrectly.",
      "Duplicate-key policy must be explicit.",
    ],
    codeSnippet: {
      language: "ts",
      code: `interface BST { key: number; left?: BST; right?: BST }

function insert(node: BST | undefined, key: number): BST {
  if (!node) return { key };
  if (key < node.key) node.left = insert(node.left, key);
  else if (key > node.key) node.right = insert(node.right, key);
  return node;
}

// Ordered range scan: the property a hash map cannot give you.
function range(node: BST | undefined, lo: number, hi: number, out: number[] = []) {
  if (!node) return out;
  if (node.key > lo) range(node.left, lo, hi, out);
  if (node.key >= lo && node.key <= hi) out.push(node.key);
  if (node.key < hi) range(node.right, lo, hi, out);
  return out;
}`,
    },
    usedBy: [
      {
        company: "Oracle",
        product: "Java TreeMap / TreeSet",
        usage:
          "Sorted map APIs (headMap, tailMap, ceilingKey) are backed by a balanced search tree, giving ordered iteration a HashMap can't.",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html",
      },
      {
        company: "Google",
        product: "Abseil btree_map",
        usage:
          "Google replaced node-per-key trees with B-tree-shaped ordered containers for better cache behaviour at the same ordered-API surface.",
        href: "https://abseil.io/docs/cpp/guides/container",
      },
      {
        company: "SQLite",
        product: "In-memory ephemeral tables",
        usage:
          "Ordered lookups and range constraints inside query execution rely on search-tree structures rather than hashing.",
      },
    ],
    references: [
      {
        label: "Java — TreeMap (sorted map contract)",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html",
      },
      {
        label: "Abseil — ordered container guide",
        href: "https://abseil.io/docs/cpp/guides/container",
      },
    ],
  },
  {
    slug: "avl-tree",
    title: "AVL Tree",
    category: "Data Structures",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Self-balancing BST with strict height guarantees.",
    caption:
      "Insert a skewing value and rotate back into balance. AVL tracks balance factor and performs rotations when height differs too much.",
    component: AVLTreeLab,
    skillTags: ["DSA", "Trees"],
    concept:
      "An AVL tree is a self-balancing binary search tree. For every node, the height difference between left and right subtrees must be -1, 0, or 1. After insertion or deletion, the tree restores this invariant using single or double rotations.\n\nAVL trees are stricter than red-black trees, so lookups are very fast due to lower height. The cost is more frequent rotations on write-heavy workloads.",
    complexity: [
      { operation: "Search", time: "O(log n)", space: "O(1)" },
      { operation: "Insert/delete", time: "O(log n)", space: "O(1)" },
      { operation: "Rotation", time: "O(1)", space: "O(1)" },
    ],
    realWorld: [
      "Read-heavy in-memory indexes, language libraries, and schedulers needing ordered lookup.",
    ],
    pitfalls: [
      "Balance-factor updates are easy to get wrong.",
      "More rotations than red-black trees under frequent writes.",
      "Recursive implementations must handle height updates carefully.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// AVL keeps |height(left) - height(right)| <= 1 via rotations.
interface AVL { key: number; h: number; left?: AVL; right?: AVL }
const h = (n?: AVL) => n?.h ?? 0;
const fix = (n: AVL) => { n.h = 1 + Math.max(h(n.left), h(n.right)); return n; };

function rotateRight(y: AVL): AVL {
  const x = y.left!;
  y.left = x.right;
  x.right = fix(y);
  return fix(x);
}

function rebalance(n: AVL): AVL {
  const bf = h(n.left) - h(n.right);
  if (bf > 1) {
    if (h(n.left!.left) < h(n.left!.right)) n.left = rotateLeft(n.left!); // left-right case
    return rotateRight(n);
  }
  if (bf < -1) {
    if (h(n.right!.right) < h(n.right!.left)) n.right = rotateRight(n.right!);
    return rotateLeft(n);
  }
  return fix(n);
}`,
    },
    usedBy: [
      {
        company: "Oracle",
        product: "MySQL / InnoDB adaptive structures",
        usage:
          "Strictly height-balanced trees are chosen where reads dominate writes, because the tighter bound means fewer comparisons per lookup.",
      },
      {
        company: "Ethereum Foundation",
        product: "AVL+ trees in Merkle-authenticated stores",
        usage:
          "Authenticated dictionaries use AVL-style rebalancing so proof paths stay logarithmic and deterministic.",
        href: "https://eprint.iacr.org/2016/994",
      },
      {
        company: "Redis",
        product: "RedisAI / module indexes",
        usage:
          "Read-heavy in-memory indexes favour strict balancing so lookup latency has a tight upper bound.",
      },
    ],
    references: [
      {
        label: "Adelson-Velsky & Landis — original balancing paper (overview)",
        href: "https://en.wikipedia.org/wiki/AVL_tree",
      },
      {
        label: "Improving authenticated dynamic dictionaries (AVL+)",
        href: "https://eprint.iacr.org/2016/994",
      },
    ],
  },
  {
    slug: "red-black-tree",
    title: "Red-Black Tree",
    category: "Data Structures",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Balanced BST using color rules and rotations.",
    caption:
      "Toggle a violation fix to see recoloring and rotation. Red-black trees keep height bounded without being as strict as AVL.",
    component: RedBlackTreeLab,
    skillTags: ["DSA", "Trees"],
    concept:
      "A red-black tree is a balanced BST with color invariants: nodes are red or black, the root is black, red nodes cannot have red children, and every path to a null leaf has the same number of black nodes. These rules bound height to O(log n).\n\nCompared with AVL, red-black trees allow looser balance and typically perform fewer rotations on updates, which makes them popular for general-purpose ordered maps.",
    complexity: [
      { operation: "Search/insert/delete", time: "O(log n)", space: "O(1)" },
      { operation: "Recolor/rotation fix", time: "O(log n)", space: "O(1)" },
    ],
    realWorld: ["Java TreeMap, C++ std::map/std::set, Linux kernel rbtree, and epoll timers."],
    pitfalls: [
      "Color invariants are subtle to preserve.",
      "Implementation complexity is higher than AVL or treap.",
      "Not optimal for cache locality compared with B-trees.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Red-black invariants (relaxed balance -> fewer rotations than AVL):
// 1. every node is red or black; the root is black
// 2. a red node cannot have a red child
// 3. every root-to-leaf path has the same number of black nodes
// => longest path <= 2x shortest path, so height is O(log n)

type Color = "R" | "B";
interface RB { key: number; color: Color; left?: RB; right?: RB }

function insertFixup(n: RB, parent: RB, grandparent: RB, uncle?: RB): void {
  if (uncle?.color === "R") {
    parent.color = uncle.color = "B"; // recolor, push the problem up
    grandparent.color = "R";
    return;
  }
  // black/absent uncle -> single or double rotation at the grandparent
}`,
    },
    usedBy: [
      {
        company: "Linux kernel",
        product: "CFS scheduler & VMA lookup",
        usage:
          "Runnable tasks and virtual memory areas live in red-black trees; the leftmost node is the next task to run.",
        href: "https://www.kernel.org/doc/html/latest/core-api/rbtree.html",
      },
      {
        company: "Oracle",
        product: "Java TreeMap / HashMap treeified bins",
        usage:
          "TreeMap is a red-black tree, and HashMap converts a long collision chain into one when a bucket exceeds 8 entries.",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html",
      },
      {
        company: "GNU / C++ standard library",
        product: "std::map, std::set",
        usage:
          "Ordered associative containers are specified with logarithmic bounds that implementations meet with red-black trees.",
        href: "https://en.cppreference.com/w/cpp/container/map",
      },
    ],
    references: [
      {
        label: "Linux kernel — Red-black trees (rbtree)",
        href: "https://www.kernel.org/doc/html/latest/core-api/rbtree.html",
      },
      {
        label: "cppreference — std::map complexity guarantees",
        href: "https://en.cppreference.com/w/cpp/container/map",
      },
    ],
  },
  {
    slug: "heap-priority-queue",
    title: "Heap / Priority Queue",
    category: "Data Structures",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Tree-backed structure for repeatedly extracting min or max.",
    caption:
      "Push and pop the minimum value. The root is always the next highest-priority item while the full array remains only partially ordered.",
    component: HeapLab,
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
  },
  {
    slug: "segment-tree",
    title: "Segment Tree",
    category: "Data Structures",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Range queries and point updates in logarithmic time.",
    caption:
      "Select ranges and compute sums from covered intervals. Segment trees trade memory for fast range aggregation.",
    component: SegmentTreeLab,
    skillTags: ["DSA", "Algorithms"],
    concept:
      "A segment tree recursively partitions an array into intervals. Each tree node stores an aggregate for its interval, such as sum, min, max, gcd, or a custom merge value. Range queries combine only the nodes that fully cover the requested interval.\n\nPoint updates update one leaf and recompute ancestors. Lazy propagation extends the structure to range updates by deferring work until a child interval is needed.",
    complexity: [
      { operation: "Build", time: "O(n)", space: "O(n)" },
      { operation: "Range query", time: "O(log n)", space: "O(log n)" },
      { operation: "Point update", time: "O(log n)", space: "O(1)" },
    ],
    realWorld: [
      "Leaderboard intervals, time-series windows, computational geometry, and competitive programming range queries.",
    ],
    pitfalls: [
      "Uses more memory than a Fenwick tree.",
      "Lazy propagation bugs are common.",
      "The merge function must be associative.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Range sum with point update in O(log n) using an iterative segment tree.
export class SegmentTree {
  private t: number[];
  constructor(private xs: number[]) {
    const n = xs.length;
    this.t = new Array(2 * n).fill(0);
    for (let i = 0; i < n; i++) this.t[n + i] = xs[i];
    for (let i = n - 1; i > 0; i--) this.t[i] = this.t[2 * i] + this.t[2 * i + 1];
  }
  update(i: number, value: number) {
    const n = this.xs.length;
    for (this.t[(i += n)] = value; i > 1; i >>= 1) this.t[i >> 1] = this.t[i] + this.t[i ^ 1];
  }
  query(lo: number, hi: number) { // [lo, hi)
    const n = this.xs.length;
    let sum = 0;
    for (lo += n, hi += n; lo < hi; lo >>= 1, hi >>= 1) {
      if (lo & 1) sum += this.t[lo++];
      if (hi & 1) sum += this.t[--hi];
    }
    return sum;
  }
}`,
    },
    usedBy: [
      {
        company: "Google",
        product: "Monarch / time-series range rollups",
        usage:
          'Hierarchical range-aggregation trees answer "sum over this window" without rescanning every raw sample.',
        href: "https://research.google/pubs/pub50652/",
      },
      {
        company: "Figma",
        product: "Multiplayer text CRDT ranges",
        usage:
          "Interval/segment trees map document offsets to formatting spans so an edit updates ranges in logarithmic time.",
        href: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
      },
      {
        company: "Codeforces / ICPC",
        product: "Competitive programming toolbox",
        usage:
          "The default structure for mixed range-query + point-update workloads, including lazy-propagated range updates.",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — Segment tree",
        href: "https://cp-algorithms.com/data_structures/segment_tree.html",
      },
      {
        label: "Google — Monarch: planet-scale in-memory time series",
        href: "https://research.google/pubs/pub50652/",
      },
    ],
  },
  {
    slug: "fenwick-tree",
    title: "Fenwick Tree",
    category: "Data Structures",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Compact prefix sums with lowbit jumps.",
    caption:
      "Move the prefix endpoint and watch the query summarize values with lowbit jumps. Fenwick trees are smaller and simpler than segment trees for prefix-style operations.",
    component: FenwickTreeLab,
    skillTags: ["DSA", "Algorithms"],
    concept:
      "A Fenwick tree, or Binary Indexed Tree, stores partial sums in an array. The lowbit operation, i & -i, tells each index how large a range it summarizes. Prefix queries repeatedly subtract lowbit; point updates repeatedly add lowbit.\n\nFenwick trees are excellent for prefix sums, frequency tables, inversion counts, and dynamic cumulative distributions when the operation has an inverse.",
    complexity: [
      { operation: "Prefix query", time: "O(log n)", space: "O(1)" },
      { operation: "Point update", time: "O(log n)", space: "O(1)" },
      { operation: "Build", time: "O(n log n) or O(n)", space: "O(n)" },
    ],
    realWorld: [
      "Inversion counting, ranked leaderboards, cumulative frequencies, and online analytics buckets.",
    ],
    pitfalls: [
      "Indexing is usually 1-based, which causes off-by-one bugs.",
      "Less flexible than segment trees for arbitrary range operations.",
      "Requires invertible operations for easy range query conversion.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Binary Indexed Tree: prefix sums in O(log n) with one array and i & -i.
export class Fenwick {
  private t: number[];
  constructor(n: number) { this.t = new Array(n + 1).fill(0); }
  add(i: number, delta: number) {          // 1-based index
    for (; i < this.t.length; i += i & -i) this.t[i] += delta;
  }
  prefix(i: number) {
    let s = 0;
    for (; i > 0; i -= i & -i) s += this.t[i];
    return s;
  }
  range(lo: number, hi: number) { return this.prefix(hi) - this.prefix(lo - 1); }
}`,
    },
    usedBy: [
      {
        company: "Riot Games",
        product: "Leaderboard rank queries",
        usage:
          '"How many players scored above X" is a prefix-count over score buckets, updated as matches finish.',
      },
      {
        company: "Cloudflare",
        product: "Rolling analytics counters",
        usage:
          "Per-interval counters with cumulative queries let dashboards report windowed totals without scanning raw events.",
      },
      {
        company: "Codeforces / ICPC",
        product: "Inversion counting & order statistics",
        usage:
          "Counting inversions during a merge or answering k-th order statistics is the canonical Fenwick exercise.",
        href: "https://cp-algorithms.com/data_structures/fenwick.html",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — Fenwick tree",
        href: "https://cp-algorithms.com/data_structures/fenwick.html",
      },
      {
        label: "Fenwick (1994) — A new data structure for cumulative frequency tables",
        href: "https://doi.org/10.1002/spe.4380240306",
      },
    ],
  },
  {
    slug: "disjoint-set-union",
    title: "Disjoint Set Union",
    category: "Data Structures",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Track connected components with union-find.",
    caption:
      "Union sets and watch components merge. DSU answers whether two nodes belong to the same component almost instantly.",
    component: DisjointSetLab,
    skillTags: ["DSA", "Graphs"],
    concept:
      "Disjoint Set Union, also called union-find, maintains a partition of items into non-overlapping sets. Find returns a representative root; union merges two sets. Path compression flattens trees during find, and union by rank/size keeps them shallow.\n\nWith both optimizations, operations are effectively constant time: O(alpha(n)), where alpha is the inverse Ackermann function and grows so slowly it is below 5 for practical inputs.",
    complexity: [
      { operation: "Find/union optimized", time: "O(alpha(n))", space: "O(n)" },
      { operation: "Connected?", time: "O(alpha(n))", space: "O(1)" },
    ],
    realWorld: [
      "Kruskal MST, image segmentation, network connectivity, percolation, and account merging.",
    ],
    pitfalls: [
      "Naive union can create tall trees.",
      "Path compression mutates parent pointers during reads.",
      "DSU handles merges well but not arbitrary edge deletions.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Union-Find with path compression + union by size: near O(1) amortised.
export class DSU {
  private parent: number[];
  private size: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
  }
  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; // halve the path
      x = this.parent[x];
    }
    return x;
  }
  union(a: number, b: number): boolean {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false; // already connected -> would create a cycle
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    return true;
  }
}`,
    },
    usedBy: [
      {
        company: "Meta",
        product: "Friend / entity clustering",
        usage:
          "Merging duplicate entities and connected social components is a union-find over billions of pair decisions.",
      },
      {
        company: "Google",
        product: "Kruskal-based network planning",
        usage:
          "Minimum spanning tree construction uses union-find to reject edges that would close a cycle.",
        href: "https://cp-algorithms.com/data_structures/disjoint_set_union.html",
      },
      {
        company: "Percona / MySQL ecosystem",
        product: "Deduplication pipelines",
        usage:
          "Record-linkage jobs union candidate pairs into clusters and then pick a survivor per cluster.",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — Disjoint set union",
        href: "https://cp-algorithms.com/data_structures/disjoint_set_union.html",
      },
      {
        label: "Tarjan — Efficiency of a good but not linear set union algorithm",
        href: "https://dl.acm.org/doi/10.1145/321879.321884",
      },
    ],
  },
  {
    slug: "b-plus-tree",
    title: "B+ Tree",
    category: "Data Structures",
    difficulty: "Advanced",
    readingTimeMin: 6,
    blurb: "Disk-friendly ordered index with linked leaf pages.",
    caption:
      "Scan linked leaf pages under a small internal index. B+ trees optimize databases for range scans and block storage.",
    component: BPlusTreeLab,
    skillTags: ["DSA", "Databases", "System Design"],
    concept:
      "A B+ tree is a high-fanout balanced search tree used for storage indexes. Internal nodes store separator keys that guide search. Records live in leaf pages, and leaves are linked so range scans can proceed sequentially.\n\nHigh fanout keeps height small, often 3-4 levels for millions of keys. Because nodes align with disk or SSD pages, each search performs a small number of page reads instead of many pointer hops.",
    complexity: [
      { operation: "Search/insert/delete", time: "O(log_f n)", space: "O(n)" },
      { operation: "Range scan k records", time: "O(log_f n + k)", space: "O(1)" },
    ],
    realWorld: ["PostgreSQL, MySQL/InnoDB, SQLite, filesystems, and ordered key-value stores."],
    pitfalls: [
      "Page splits and merges must preserve balance.",
      "Random inserts fragment pages more than sequential keys.",
      "Concurrency requires latching or optimistic page protocols.",
    ],
    codeSnippet: {
      language: "sql",
      code: `-- A B+tree index only helps if the query can use a prefix of its key order.
CREATE INDEX idx_orders_customer_created
  ON orders (customer_id, created_at DESC);

-- Index range scan: seek to (42, max) then walk leaf pages backwards.
EXPLAIN ANALYZE
SELECT id, total
FROM orders
WHERE customer_id = 42
  AND created_at >= now() - interval '30 days'
ORDER BY created_at DESC
LIMIT 20;

-- Covering index: leaves carry \`total\`, so the heap is never touched.
CREATE INDEX idx_orders_covering
  ON orders (customer_id, created_at DESC) INCLUDE (total);`,
    },
    usedBy: [
      {
        company: "PostgreSQL",
        product: "Default btree indexes",
        usage:
          "Postgres implements Lehman & Yao high-concurrency B+trees; leaf pages are linked so range scans walk sideways.",
        href: "https://www.postgresql.org/docs/current/btree-implementation.html",
      },
      {
        company: "Oracle / MySQL",
        product: "InnoDB clustered index",
        usage:
          "Table rows are stored in the leaves of the primary-key B+tree, so secondary indexes store PKs and require a second lookup.",
        href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html",
      },
      {
        company: "MongoDB",
        product: "WiredTiger row-store indexes",
        usage: "Index B+trees with page-level compression back equality, range and sort pushdown.",
        href: "https://www.mongodb.com/docs/manual/indexes/",
      },
    ],
    references: [
      {
        label: "PostgreSQL — btree implementation notes",
        href: "https://www.postgresql.org/docs/current/btree-implementation.html",
      },
      {
        label: "MySQL — InnoDB index types (clustered vs secondary)",
        href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html",
      },
    ],
  },
  {
    slug: "bloom-filter",
    title: "Bloom Filter",
    category: "Data Structures",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Probabilistic set membership in O(k) bits.",
    caption:
      "Type a word — three hash functions flip three bits. Membership checks return 'maybe' or 'definitely not'. Watch the false-positive rate climb as the bit array fills.",
    whereUsed: { label: "Cache stack at Tech Holding", href: "/#projects" },
    component: BloomFilter,
    skillTags: ["DSA", "Redis"],
    concept:
      "A Bloom filter is a space-efficient probabilistic data structure that answers one question: 'have we seen this item before?' It can be wrong in one direction — it may say 'maybe yes' when the answer is no (false positive), but it will never say 'no' when the answer is yes.\n\nIt works by maintaining an array of m bits and k independent hash functions. Insert: hash the item k times, set those k bits. Lookup: hash again — if any of the k bits is 0, the item is definitely not in the set. If all k bits are 1, it might be in the set.\n\nThe false-positive rate grows as the bit array fills: roughly (1 − e^(−kn/m))^k. Tuning k and m for an expected n gives you a controllable error budget.",
    complexity: [
      { operation: "Insert", time: "O(k)", space: "O(m bits)" },
      { operation: "Lookup", time: "O(k)", space: "O(1)" },
      { operation: "Delete", time: "—", space: "(not supported; use Counting Bloom)" },
    ],
    codeSnippet: {
      language: "ts",
      code: `class BloomFilter {
  bits: Uint8Array;
  constructor(public m: number, public k: number) {
    this.bits = new Uint8Array(m);
  }
  private hash(seed: number, s: string) {
    let h = seed;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % this.m;
  }
  add(s: string) {
    for (let i = 0; i < this.k; i++) this.bits[this.hash(7 + i * 31, s)] = 1;
  }
  has(s: string): boolean {
    for (let i = 0; i < this.k; i++) {
      if (!this.bits[this.hash(7 + i * 31, s)]) return false;
    }
    return true; // maybe
  }
}`,
    },
    realWorld: [
      "Bigtable / Cassandra: per-SSTable Bloom filter avoids disk reads for keys that aren't there.",
      "Chrome: filters known-malicious URLs locally before hitting the Safe Browsing API.",
      "CDNs: skip a database round-trip on cache misses for keys that have never existed.",
      "Postgres: pg_bloom extension speeds up multi-column filters.",
    ],
    pitfalls: [
      "Standard Bloom filters can't delete — use a Counting Bloom Filter when removals matter.",
      "False-positive rate stacks across layers (filter → cache → DB) so size for the worst layer.",
      "Hash quality matters: weak hashes cause clustering and inflate the FP rate beyond the formula.",
    ],
    references: [
      {
        label: "Burton Bloom — Space/Time Trade-offs in Hash Coding (1970)",
        href: "https://dl.acm.org/doi/10.1145/362686.362692",
      },
      {
        label: "Cassandra docs — Bloom Filters",
        href: "https://cassandra.apache.org/doc/latest/cassandra/architecture/storage_engine.html",
      },
    ],
    usedBy: [
      {
        company: "Google",
        product: "Chrome Safe Browsing",
        usage:
          "The browser checks URLs against a local probabilistic filter of known-bad hosts and only calls the API on a possible hit.",
        href: "https://developers.google.com/safe-browsing/v4/update-api",
      },
      {
        company: "Apache Cassandra",
        product: "SSTable read path",
        usage:
          "Each SSTable carries a Bloom filter so a read can skip files that definitely do not contain the partition key.",
        href: "https://cassandra.apache.org/doc/latest/cassandra/managing/operating/bloomfilters.html",
      },
      {
        company: "Medium",
        product: '"Already read" article feed',
        usage:
          "Bloom filters cheaply exclude posts a reader has already seen before ranking recommendations.",
        href: "https://medium.com/the-story/what-are-bloom-filters-1ec2a50c68ff",
      },
      {
        company: "Bitcoin Core",
        product: "BIP-37 SPV wallet filters",
        usage:
          "Light clients ask peers for transactions matching a Bloom filter of their addresses instead of downloading every block in full.",
        href: "https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki",
      },
    ],
  },
  {
    slug: "graph-representations",
    title: "Graph Representations",
    category: "Algorithms",
    difficulty: "Beginner",
    readingTimeMin: 4,
    blurb: "Adjacency lists vs matrices for storing relationships.",
    caption:
      "Switch between adjacency list and matrix views. Sparse graphs favor lists; dense graphs and O(1) edge checks can favor matrices.",
    component: GraphRepresentationLab,
    skillTags: ["DSA", "Graphs"],
    concept:
      "A graph models entities as vertices and relationships as edges. The representation determines memory use and operation cost. An adjacency list stores neighbors per vertex, using O(V + E) space and working well for sparse graphs. An adjacency matrix stores every possible pair, using O(V^2) space but giving O(1) edge-existence checks.\n\nDirected graphs store edge direction; weighted graphs attach costs; multigraphs allow repeated edges. Choosing the representation is often the first performance decision in a graph problem.",
    complexity: [
      { operation: "Adjacency list space", time: "—", space: "O(V + E)" },
      { operation: "Adjacency matrix space", time: "—", space: "O(V^2)" },
      { operation: "Matrix edge check", time: "O(1)", space: "O(1)" },
    ],
    realWorld: [
      "Social graphs, dependency graphs, route maps, knowledge graphs, and network topologies.",
    ],
    pitfalls: [
      "A matrix is wasteful for sparse graphs.",
      "A list makes edge-existence checks O(degree) unless indexed.",
      "Directed vs undirected edge insertion must be explicit.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Adjacency list: O(V + E) memory, iterate neighbours fast.
const list = new Map<string, string[]>([
  ["api", ["auth", "db"]],
  ["auth", ["db"]],
  ["db", []],
]);
for (const dep of list.get("api") ?? []) console.log(dep);

// Adjacency matrix: O(V^2) memory, O(1) "is there an edge?"
const nodes = ["api", "auth", "db"];
const idx = new Map(nodes.map((n, i) => [n, i]));
const matrix = nodes.map(() => new Uint8Array(nodes.length));
matrix[idx.get("api")!][idx.get("db")!] = 1;
const connected = matrix[idx.get("api")!][idx.get("db")!] === 1;`,
    },
    usedBy: [
      {
        company: "Meta",
        product: "TAO social graph",
        usage:
          "Friend and interest edges are stored as adjacency lists behind a cache tier because the social graph is extremely sparse.",
        href: "https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/",
      },
      {
        company: "Google",
        product: "Web link graph / PageRank",
        usage:
          "Billions of pages with a handful of outlinks each are only tractable as sparse adjacency, never as a matrix.",
        href: "http://infolab.stanford.edu/~backrub/google.html",
      },
      {
        company: "Neo4j",
        product: "Native graph storage",
        usage:
          'Records store direct pointers to relationship chains ("index-free adjacency") so traversal cost is independent of total graph size.',
        href: "https://neo4j.com/docs/getting-started/get-started-with-neo4j/graph-database/",
      },
    ],
    references: [
      {
        label: "Meta Engineering — TAO: the power of the graph",
        href: "https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/",
      },
      {
        label: "Neo4j — index-free adjacency",
        href: "https://neo4j.com/docs/getting-started/get-started-with-neo4j/graph-database/",
      },
    ],
  },
  {
    slug: "connected-components",
    title: "Connected Components",
    category: "Algorithms",
    difficulty: "Beginner",
    readingTimeMin: 4,
    blurb: "Group reachable nodes in an undirected graph.",
    caption:
      "Highlight each component. DFS or BFS marks all nodes reachable from a start node before moving to the next unvisited node.",
    component: ConnectedComponentsLab,
    skillTags: ["DSA", "Graphs"],
    concept:
      "A connected component is a maximal group of nodes where every node can reach every other node through undirected edges. To find all components, iterate over vertices; whenever a vertex is unvisited, start DFS or BFS and mark the entire reachable group.\n\nConnected components answer whether a graph is split into islands. They are also the foundation for clustering, image regions, account merging, and graph cleanup.",
    complexity: [
      { operation: "Find all components", time: "O(V + E)", space: "O(V)" },
      { operation: "Single BFS/DFS", time: "O(component vertices + edges)", space: "O(V)" },
    ],
    realWorld: [
      "Network partition detection, image segmentation, social communities, and duplicate-account clusters.",
    ],
    pitfalls: [
      "Directed graphs need weak or strong component definitions.",
      "For huge graphs, recursion can overflow; use iterative traversal.",
      "Disconnected isolated nodes are components of size one.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Label every vertex with its component id via BFS flood fill.
function components(adj: Map<string, string[]>): Map<string, number> {
  const label = new Map<string, number>();
  let id = 0;
  for (const start of adj.keys()) {
    if (label.has(start)) continue;
    const q = [start];
    label.set(start, id);
    while (q.length) {
      const v = q.shift()!;
      for (const n of adj.get(v) ?? []) {
        if (!label.has(n)) { label.set(n, id); q.push(n); }
      }
    }
    id++;
  }
  return label; // id count = number of isolated islands
}`,
    },
    usedBy: [
      {
        company: "Meta",
        product: "Duplicate account / entity resolution",
        usage:
          "Match signals form a graph; each connected component becomes one merged identity cluster.",
      },
      {
        company: "Stripe",
        product: "Radar fraud rings",
        usage:
          "Shared cards, devices and IPs link accounts into components, and a whole ring can be actioned together.",
        href: "https://stripe.com/radar",
      },
      {
        company: "Google",
        product: "Photos face clustering",
        usage:
          "Similarity edges above a threshold are grouped into components so each cluster becomes one suggested person.",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — Search for connected components",
        href: "https://cp-algorithms.com/graph/search-for-connected-components.html",
      },
      { label: "Stripe Radar — network-level fraud signals", href: "https://stripe.com/radar" },
    ],
  },
  {
    slug: "cycle-detection",
    title: "Cycle Detection",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "Detect loops in directed and undirected graphs.",
    caption:
      "Add an edge to create a cycle. DFS detects back edges in directed graphs and non-parent visited edges in undirected graphs.",
    component: CycleDetectionLab,
    skillTags: ["DSA", "Graphs"],
    concept:
      "Cycle detection asks whether a path can return to a previously visited node. In directed graphs, DFS tracks three states: unvisited, visiting, and done. Seeing an edge to a visiting node means a back edge and therefore a cycle. In undirected graphs, seeing a visited neighbor that is not the parent indicates a cycle.\n\nCycle detection is essential for dependency validation, deadlock detection, scheduling, and graph sanity checks.",
    complexity: [
      { operation: "DFS cycle detection", time: "O(V + E)", space: "O(V)" },
      { operation: "Union-Find undirected cycle check", time: "O(E alpha(V))", space: "O(V)" },
    ],
    realWorld: [
      "Package managers, build systems, lock graphs, workflow engines, and schema dependency checks.",
    ],
    pitfalls: [
      "Directed and undirected cycle rules differ.",
      "A visited node is not always a cycle in directed DFS; it must be in the current recursion stack.",
      "Self-loops and parallel edges need explicit handling.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Directed cycle detection with white/grey/black colouring.
type Color = 0 | 1 | 2; // 0 unvisited, 1 in-stack, 2 done

function hasCycle(adj: Map<string, string[]>): string[] | null {
  const color = new Map<string, Color>();
  const stack: string[] = [];
  const dfs = (v: string): string[] | null => {
    color.set(v, 1);
    stack.push(v);
    for (const n of adj.get(v) ?? []) {
      if (color.get(n) === 1) return [...stack.slice(stack.indexOf(n)), n]; // back edge
      if (!color.get(n)) { const c = dfs(n); if (c) return c; }
    }
    color.set(v, 2);
    stack.pop();
    return null;
  };
  for (const v of adj.keys()) if (!color.get(v)) { const c = dfs(v); if (c) return c; }
  return null;
}`,
    },
    usedBy: [
      {
        company: "npm / GitHub",
        product: "Dependency resolution",
        usage:
          "Package managers and bundlers detect circular imports and cyclic peer requirements before install or build.",
        href: "https://docs.npmjs.com/cli/v10/configuring-npm/package-json",
      },
      {
        company: "Apache Airflow",
        product: "DAG validation",
        usage:
          "A pipeline must be acyclic; the scheduler rejects a DAG whose task dependencies close a loop.",
        href: "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html",
      },
      {
        company: "Oracle",
        product: "MySQL / InnoDB deadlock detector",
        usage:
          "The lock wait-for graph is scanned for cycles; the cheapest transaction in the cycle is rolled back.",
        href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlock-detection.html",
      },
    ],
    references: [
      {
        label: "Airflow — DAGs must be acyclic",
        href: "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html",
      },
      {
        label: "MySQL — InnoDB deadlock detection",
        href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlock-detection.html",
      },
    ],
  },
  {
    slug: "strongly-connected-components",
    title: "Strongly Connected Components",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 6,
    blurb: "Find maximal mutually reachable groups in directed graphs.",
    caption:
      "Step through SCC groups. Tarjan compresses cycles into components using discovery indexes and low-link values.",
    component: StronglyConnectedComponentsLab,
    skillTags: ["DSA", "Graphs"],
    concept:
      "A strongly connected component, or SCC, is a maximal set of directed graph nodes where every node can reach every other node. Tarjan's algorithm performs one DFS, assigns discovery indexes, maintains low-link values, and pops a component when a node is the root of an SCC.\n\nCollapsing SCCs turns a directed graph into a DAG, which is useful for dependency analysis, compiler optimization, deadlock reasoning, and graph simplification.",
    complexity: [
      { operation: "Tarjan SCC", time: "O(V + E)", space: "O(V)" },
      { operation: "Kosaraju SCC", time: "O(V + E)", space: "O(V + E)" },
    ],
    realWorld: [
      "Compiler control-flow analysis, dependency cycles, web link graphs, and service-call cycle detection.",
    ],
    pitfalls: [
      "Low-link updates must distinguish tree edges from back edges.",
      "SCCs apply to directed graphs; undirected components are simpler.",
      "Recursive Tarjan can overflow on very deep graphs.",
    ],
    codeSnippet: {
      language: "py",
      code: `# Tarjan's SCC: one DFS, low-link values, an explicit stack.
def tarjan(adj):
    index, low, on_stack, stack, out = {}, {}, set(), [], []
    counter = [0]

    def dfs(v):
        index[v] = low[v] = counter[0]; counter[0] += 1
        stack.append(v); on_stack.add(v)
        for w in adj.get(v, ()):
            if w not in index:
                dfs(w); low[v] = min(low[v], low[w])
            elif w in on_stack:
                low[v] = min(low[v], index[w])
        if low[v] == index[v]:               # v is an SCC root
            comp = []
            while True:
                w = stack.pop(); on_stack.discard(w); comp.append(w)
                if w == v: break
            out.append(comp)

    for v in list(adj):
        if v not in index: dfs(v)
    return out`,
    },
    usedBy: [
      {
        company: "Google",
        product: "Web spam / link-farm detection",
        usage:
          "Tightly interlinked page groups surface as strongly connected components in the link graph.",
        href: "http://infolab.stanford.edu/~backrub/google.html",
      },
      {
        company: "Uber",
        product: "Service dependency analysis",
        usage:
          "Cyclic call chains between microservices show up as SCCs and are the first thing to break when untangling a monolith.",
      },
      {
        company: "LLVM / Apple",
        product: "Compiler call-graph SCCs",
        usage:
          "The pass manager processes the call graph bottom-up by SCC so mutually recursive functions are optimised together.",
        href: "https://llvm.org/docs/Passes.html",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — Strongly connected components",
        href: "https://cp-algorithms.com/graph/strongly-connected-components.html",
      },
      { label: "LLVM — CallGraph SCC passes", href: "https://llvm.org/docs/Passes.html" },
    ],
  },
  {
    slug: "bipartite-check",
    title: "Bipartite Check",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Determine whether a graph can be colored with two sets.",
    caption:
      "Toggle a conflict and see two-coloring fail. A graph is bipartite when every edge connects opposite colors.",
    component: BipartiteCheckLab,
    skillTags: ["DSA", "Graphs"],
    concept:
      "A graph is bipartite if its vertices can be split into two sets such that every edge connects nodes from different sets. BFS or DFS can test this by assigning alternating colors. If an edge ever connects nodes with the same color, the graph is not bipartite.\n\nBipartite graphs are exactly graphs with no odd-length cycles. They are the structure behind matching problems, assignment systems, recommendations, and constraint checks.",
    complexity: [{ operation: "Two-color check", time: "O(V + E)", space: "O(V)" }],
    realWorld: [
      "Job-to-worker matching, user-item recommendation graphs, conflict constraints, and scheduling.",
    ],
    pitfalls: [
      "Disconnected graphs require starting BFS from every uncolored node.",
      "Self-loops immediately violate bipartiteness.",
      "Odd cycles are the reason two-coloring fails.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Two-colour the graph; a conflict proves an odd cycle exists.
function isBipartite(adj: Map<string, string[]>): boolean {
  const side = new Map<string, 0 | 1>();
  for (const start of adj.keys()) {
    if (side.has(start)) continue;
    side.set(start, 0);
    const q = [start];
    while (q.length) {
      const v = q.shift()!;
      for (const n of adj.get(v) ?? []) {
        if (!side.has(n)) { side.set(n, side.get(v)! === 0 ? 1 : 0); q.push(n); }
        else if (side.get(n) === side.get(v)) return false; // same side -> odd cycle
      }
    }
  }
  return true;
}`,
    },
    usedBy: [
      {
        company: "Uber",
        product: "Rider ↔ driver matching graph",
        usage:
          "Supply and demand are two disjoint sides; feasible pairings are edges, and dispatch is a matching over that bipartite graph.",
        href: "https://www.uber.com/blog/engineering/",
      },
      {
        company: "Amazon",
        product: "Order ↔ fulfilment centre assignment",
        usage:
          "Shipments and warehouses form a bipartite graph where edges encode cost and availability.",
      },
      {
        company: "Google",
        product: "Ad impression ↔ advertiser allocation",
        usage:
          "Online bipartite matching underpins allocating incoming impressions to budgeted advertisers.",
        href: "https://research.google/pubs/pub37409/",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — Bipartite graph check",
        href: "https://cp-algorithms.com/graph/bipartite-check.html",
      },
      {
        label: "Google Research — AdWords and generalized online matching",
        href: "https://research.google/pubs/pub37409/",
      },
    ],
  },
  {
    slug: "graph-union-find",
    title: "Graph Union-Find",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Answer dynamic connectivity in undirected graphs.",
    caption:
      "Union incoming edges and watch components merge. Union-Find is the graph connectivity workhorse behind Kruskal and online component tracking.",
    component: GraphUnionFindLab,
    skillTags: ["DSA", "Graphs"],
    concept:
      "Union-Find maintains connected components as edges arrive. Each node points to a parent representative. Find returns the root; union merges two roots. Path compression and union by size or rank make operations almost constant time.\n\nFor undirected graphs where edges are only added, Union-Find is usually faster and simpler than rerunning DFS after every edge.",
    complexity: [
      { operation: "Find/union", time: "O(alpha(V))", space: "O(V)" },
      { operation: "Process E edges", time: "O(E alpha(V))", space: "O(V)" },
    ],
    realWorld: [
      "Kruskal minimum spanning tree, network connectivity, account merge, percolation, and image regions.",
    ],
    pitfalls: [
      "Does not support arbitrary deletions cleanly.",
      "Works for undirected connectivity, not directed reachability.",
      "Without path compression/rank, trees can become tall.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Connectivity queries under a stream of merges — no re-traversal.
const parent = new Map<string, string>();
const find = (x: string): string => {
  const p = parent.get(x) ?? x;
  if (p === x) return x;
  const root = find(p);
  parent.set(x, root); // path compression
  return root;
};
const union = (a: string, b: string) => {
  const ra = find(a), rb = find(b);
  if (ra !== rb) parent.set(rb, ra);
};

union("user:1", "device:a");
union("device:a", "user:2");
find("user:1") === find("user:2"); // true -> same cluster`,
    },
    usedBy: [
      {
        company: "Stripe",
        product: "Linked-account clustering",
        usage:
          "Streaming signals union accounts into fraud clusters without recomputing components from scratch.",
        href: "https://stripe.com/radar",
      },
      {
        company: "Apache Spark",
        product: "GraphX connected components",
        usage: "Distributed union-find style label propagation groups vertices across partitions.",
        href: "https://spark.apache.org/docs/latest/graphx-programming-guide.html",
      },
      {
        company: "Google",
        product: "Percolation / image segmentation",
        usage:
          "Pixel similarity merges produce segments incrementally, which is exactly incremental connectivity.",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — DSU applications",
        href: "https://cp-algorithms.com/data_structures/disjoint_set_union.html",
      },
      {
        label: "Spark GraphX — connected components",
        href: "https://spark.apache.org/docs/latest/graphx-programming-guide.html",
      },
    ],
  },
  {
    slug: "lru-cache",
    title: "LRU Cache",
    category: "Data Structures",
    difficulty: "Beginner",
    readingTimeMin: 3,
    blurb: "Doubly-linked list + hash map = O(1) eviction.",
    caption:
      "Click any key to access it. Recent keys move to the head; the tail gets evicted when capacity is exceeded.",
    whereUsed: { label: "Session cache layer", href: "/#projects" },
    component: LRUCache,
    skillTags: ["DSA", "Redis", "System Design"],
    concept:
      "An LRU (Least-Recently-Used) cache evicts the entry that hasn't been touched for the longest time. The classic O(1) implementation pairs a hash map (key → list node) with a doubly-linked list (most-recent at head, least-recent at tail).\n\nGet: hash-lookup → unlink the node → push to head. Put: if key exists, update + push to head; if at capacity, evict the tail. Both are O(1) because every operation is a constant number of pointer rewires plus a hash op.\n\nLRU is the default eviction policy for most caches because it captures temporal locality cheaply. Variants like LRU-K, ARC, and 2Q add scan resistance for workloads where one-shot reads would otherwise pollute the cache.",
    complexity: [
      { operation: "Get", time: "O(1)", space: "O(capacity)" },
      { operation: "Put", time: "O(1)", space: "O(1) per entry" },
    ],
    codeSnippet: {
      language: "ts",
      code: `class LRU<K, V> {
  private map = new Map<K, V>();
  constructor(private capacity: number) {}
  get(k: K): V | undefined {
    if (!this.map.has(k)) return undefined;
    const v = this.map.get(k)!;
    this.map.delete(k); // re-insert to move to most-recent
    this.map.set(k, v);
    return v;
  }
  put(k: K, v: V) {
    if (this.map.has(k)) this.map.delete(k);
    else if (this.map.size >= this.capacity) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
    this.map.set(k, v);
  }
}`,
    },
    realWorld: [
      "Redis: maxmemory-policy allkeys-lru / volatile-lru.",
      "Linux page cache uses a 2-list LRU (active + inactive).",
      "Caffeine (JVM) uses Window-TinyLFU, an LRU evolution that beats LRU on most traces.",
      "Browser HTTP caches use LRU-style eviction inside the disk cache.",
    ],
    pitfalls: [
      "JS Map insertion order gives you LRU 'for free' — but only single-threaded; use a real lock for shared state.",
      "Pure LRU is fooled by sequential scans — one big read kicks out hot keys. Reach for ARC/SLRU/W-TinyLFU.",
      "Don't forget TTLs — LRU evicts by recency, not freshness; stale data lives until pushed out.",
    ],
    references: [
      { label: "LeetCode 146 — LRU Cache", href: "https://leetcode.com/problems/lru-cache/" },
    ],
    usedBy: [
      {
        company: "Redis",
        product: "maxmemory eviction policies",
        usage:
          "Redis approximates LRU with random sampling (and offers LFU) because exact recency ordering costs memory per key.",
        href: "https://redis.io/docs/latest/develop/reference/eviction/",
      },
      {
        company: "Cloudflare",
        product: "Edge cache tiers",
        usage:
          "Hot objects stay in memory/SSD at the PoP under recency-based eviction; cold objects fall through to origin.",
        href: "https://developers.cloudflare.com/cache/concepts/default-cache-behavior/",
      },
      {
        company: "Oracle / MySQL",
        product: "InnoDB buffer pool",
        usage:
          "A midpoint-insertion LRU list keeps hot pages resident and protects them from a full-table scan flushing the pool.",
        href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-buffer-pool.html",
      },
      {
        company: "Google",
        product: "Chrome HTTP disk cache",
        usage:
          "Cached responses are evicted in recency order once the disk cache hits its size budget.",
      },
    ],
  },
  {
    slug: "bellman-ford",
    title: "Bellman-Ford",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Shortest paths with negative edges and cycle detection.",
    caption:
      "Relax every edge pass by pass. Unlike Dijkstra, Bellman-Ford can handle negative weights and detect reachable negative cycles.",
    component: BellmanFordLab,
    skillTags: ["DSA", "Graphs"],
    concept:
      "Bellman-Ford computes shortest paths from one source by repeatedly relaxing every edge. After at most V-1 passes, every shortest path without cycles has been discovered. A final pass that can still improve a distance proves a reachable negative-weight cycle.\n\nIt is slower than Dijkstra but more general because edge weights may be negative. This matters in systems that model credits, arbitrage, penalties, or constraint differences.",
    complexity: [
      { operation: "Shortest paths", time: "O(VE)", space: "O(V)" },
      { operation: "Negative-cycle check", time: "O(E)", space: "O(1)" },
    ],
    realWorld: [
      "Currency arbitrage, routing with penalties, constraint systems, and graph sanity checks.",
    ],
    pitfalls: [
      "Negative cycles make shortest paths undefined.",
      "It is usually too slow for very large sparse graphs when weights are non-negative.",
      "Only cycles reachable from the source are detected in the standard version.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Handles negative weights and reports negative cycles. O(V*E).
type Edge = { from: number; to: number; w: number };

function bellmanFord(n: number, edges: Edge[], src: number) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let i = 0; i < n - 1; i++) {
    let changed = false;
    for (const e of edges) {
      if (dist[e.from] + e.w < dist[e.to]) { dist[e.to] = dist[e.from] + e.w; changed = true; }
    }
    if (!changed) break; // early exit when distances settle
  }
  for (const e of edges) {
    if (dist[e.from] + e.w < dist[e.to]) throw new Error("negative cycle reachable");
  }
  return dist;
}`,
    },
    usedBy: [
      {
        company: "Cisco",
        product: "RIP distance-vector routing",
        usage:
          "Routers exchange distance vectors and relax neighbour estimates — Bellman-Ford executed by the network itself.",
        href: "https://datatracker.ietf.org/doc/html/rfc2453",
      },
      {
        company: "Internet Engineering Task Force",
        product: "BGP path selection (path-vector)",
        usage:
          "BGP is a path-vector descendant of distance-vector routing, carrying AS paths to avoid the count-to-infinity loop problem.",
        href: "https://datatracker.ietf.org/doc/html/rfc4271",
      },
      {
        company: "Coinbase-style exchanges",
        product: "Currency arbitrage detection",
        usage:
          "Taking -log of exchange rates turns a profitable cycle into a negative cycle Bellman-Ford can flag.",
      },
    ],
    references: [
      {
        label: "RFC 2453 — RIP version 2 (distance vector)",
        href: "https://datatracker.ietf.org/doc/html/rfc2453",
      },
      {
        label: "CP-Algorithms — Bellman-Ford",
        href: "https://cp-algorithms.com/graph/bellman_ford.html",
      },
    ],
  },
  {
    slug: "floyd-warshall",
    title: "Floyd-Warshall",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "All-pairs shortest paths with dynamic programming.",
    caption:
      "Allow each intermediate node and update the distance matrix. Floyd-Warshall is compact and powerful for dense graphs.",
    component: FloydWarshallLab,
    skillTags: ["DSA", "Graphs", "Dynamic Programming"],
    concept:
      "Floyd-Warshall computes shortest paths between every pair of vertices. It uses dynamic programming over allowed intermediate nodes: when node k becomes available, every pair i,j checks whether going through k improves its distance.\n\nThe algorithm is simple and handles negative edges, but not negative cycles. Its O(V^3) runtime makes it best for small or dense graphs where all-pairs answers are needed.",
    complexity: [
      { operation: "All-pairs shortest paths", time: "O(V^3)", space: "O(V^2)" },
      { operation: "Path reconstruction", time: "O(path length)", space: "O(V^2)" },
    ],
    realWorld: [
      "Small network routing tables, game maps, transitive closure, and dependency distance analysis.",
    ],
    pitfalls: [
      "Too expensive for large sparse graphs.",
      "Negative cycles require separate detection.",
      "Path reconstruction needs a next-hop matrix, not just distances.",
    ],
    codeSnippet: {
      language: "py",
      code: `# All-pairs shortest paths in O(V^3) — dense graphs, small V.
def floyd_warshall(dist):
    n = len(dist)
    for k in range(n):              # allow k as an intermediate hop
        dk = dist[k]
        for i in range(n):
            dik = dist[i][k]
            if dik == float("inf"):
                continue
            row = dist[i]
            for j in range(n):
                if dik + dk[j] < row[j]:
                    row[j] = dik + dk[j]
    for i in range(n):
        if dist[i][i] < 0:
            raise ValueError("negative cycle")
    return dist`,
    },
    usedBy: [
      {
        company: "Uber",
        product: "Zone-to-zone travel-time matrices",
        usage:
          "Small aggregated region graphs are precomputed all-pairs so pricing and ETA services do table lookups, not searches.",
      },
      {
        company: "Amazon",
        product: "Warehouse network transfer costs",
        usage:
          "Inter-facility cost matrices are dense and modest in size — the exact case Floyd-Warshall wins.",
      },
      {
        company: "Google",
        product: "Transitive closure in static analysis",
        usage:
          "Reachability closure over dependency/type graphs is the boolean variant of the same triple loop.",
        href: "https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — Floyd-Warshall",
        href: "https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html",
      },
      {
        label: "Floyd (1962) — Algorithm 97: Shortest path",
        href: "https://dl.acm.org/doi/10.1145/367766.368168",
      },
    ],
  },
  {
    slug: "prim-mst",
    title: "Prim MST",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Grow a minimum spanning tree from one connected frontier.",
    caption:
      "Add the cheapest edge crossing from the visited set to the unvisited set. Prim keeps one growing connected tree.",
    component: PrimLab,
    skillTags: ["DSA", "Graphs"],
    concept:
      "Prim's algorithm finds a minimum spanning tree of a connected weighted undirected graph. It starts from any node, maintains a visited set, and repeatedly chooses the cheapest edge that connects visited to unvisited nodes.\n\nWith a priority queue, Prim is efficient on sparse graphs. It is a natural fit when the graph is already represented by adjacency lists and you want to grow from a known starting point.",
    complexity: [
      { operation: "With binary heap", time: "O(E log V)", space: "O(V + E)" },
      { operation: "Dense matrix version", time: "O(V^2)", space: "O(V)" },
    ],
    realWorld: ["Network cabling, cluster design, road planning, and approximation pipelines."],
    pitfalls: [
      "Requires undirected weighted graphs.",
      "Disconnected graphs produce a spanning forest, not one tree.",
      "MST minimizes total edge cost, not shortest paths from a source.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Grow one tree: always take the cheapest edge leaving the built set.
function prim(n: number, adj: [number, number][][]): number {
  const inTree = new Array(n).fill(false);
  const best = new Array(n).fill(Infinity);
  best[0] = 0;
  let total = 0;
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!inTree[v] && (u === -1 || best[v] < best[u])) u = v;
    inTree[u] = true;
    total += best[u];
    for (const [v, w] of adj[u]) if (!inTree[v] && w < best[v]) best[v] = w;
  }
  return total; // use a binary heap for O(E log V)
}`,
    },
    usedBy: [
      {
        company: "AT&T / telecom operators",
        product: "Fibre backbone planning",
        usage:
          "Connecting every site at minimum trench/fibre cost is the textbook minimum spanning tree problem.",
      },
      {
        company: "Meta",
        product: "Data-centre cable topology planning",
        usage:
          "Dense candidate-link graphs favour Prim's, which grows a single tree from a seed node.",
      },
      {
        company: "Esri",
        product: "Utility network design (GIS)",
        usage:
          "Water/power distribution layouts are generated as minimum-cost spanning structures over service points.",
        href: "https://cp-algorithms.com/graph/mst_prim.html",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — Prim's MST",
        href: "https://cp-algorithms.com/graph/mst_prim.html",
      },
      {
        label: "Prim (1957) — Shortest connection networks",
        href: "https://ieeexplore.ieee.org/document/6773228",
      },
    ],
  },
  {
    slug: "kruskal-mst",
    title: "Kruskal MST",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Build an MST by sorting edges and skipping cycles.",
    caption:
      "Consider edges in ascending weight order. Union-Find accepts edges that connect different components and rejects cycle-forming edges.",
    component: KruskalLab,
    skillTags: ["DSA", "Graphs"],
    concept:
      "Kruskal's algorithm sorts all edges by weight, then scans from cheapest to most expensive. An edge is accepted only if it connects two different components; otherwise it would create a cycle. Union-Find makes the component test fast.\n\nKruskal is especially clean when edges are already available as a list or when the graph is sparse.",
    complexity: [
      { operation: "Sort edges", time: "O(E log E)", space: "O(E)" },
      { operation: "Union-Find scan", time: "O(E alpha(V))", space: "O(V)" },
    ],
    realWorld: ["Clustering, network design, image segmentation, and offline graph optimization."],
    pitfalls: [
      "Parallel edges are allowed; choose the cheapest useful one.",
      "Disconnected input yields a minimum spanning forest.",
      "Sorting dominates runtime for most inputs.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Sort edges, add the cheapest that doesn't close a cycle (union-find).
function kruskal(n: number, edges: { a: number; b: number; w: number }[]) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const tree: typeof edges = [];
  for (const e of [...edges].sort((x, y) => x.w - y.w)) {
    const ra = find(e.a), rb = find(e.b);
    if (ra === rb) continue; // would create a cycle
    parent[rb] = ra;
    tree.push(e);
    if (tree.length === n - 1) break;
  }
  return tree;
}`,
    },
    usedBy: [
      {
        company: "Cloudflare / CDN operators",
        product: "Backbone link selection",
        usage:
          "Sparse candidate-link graphs are cheaper to solve edge-first, which is exactly Kruskal's ordering.",
      },
      {
        company: "Scikit-learn contributors",
        product: "Single-linkage clustering",
        usage:
          "Single-linkage hierarchical clustering is an MST computation; cutting the largest edges yields clusters.",
        href: "https://scikit-learn.org/stable/modules/clustering.html#hierarchical-clustering",
      },
      {
        company: "Autodesk",
        product: "Mesh simplification / segmentation",
        usage:
          "Minimum spanning forests over dual graphs drive region growing in geometry pipelines.",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — Kruskal with DSU",
        href: "https://cp-algorithms.com/graph/mst_kruskal_with_dsu.html",
      },
      {
        label: "scikit-learn — hierarchical (single linkage) clustering",
        href: "https://scikit-learn.org/stable/modules/clustering.html#hierarchical-clustering",
      },
    ],
  },
  {
    slug: "max-flow",
    title: "Max Flow",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 6,
    blurb: "Push as much flow as possible from source to sink.",
    caption:
      "Augment paths through a small network and watch capacities fill. Residual capacity determines where more flow can still move.",
    component: MaxFlowLab,
    skillTags: ["DSA", "Graphs", "Optimization"],
    concept:
      "Max flow asks for the largest amount that can be sent from a source to a sink through capacity-limited edges. Algorithms maintain a residual graph: unused forward capacity and backward edges that allow earlier choices to be revised.\n\nThe abstraction appears anywhere limited resources move through a network: bandwidth, assignments, traffic, supply chains, and matching problems.",
    complexity: [
      {
        operation: "Ford-Fulkerson",
        time: "O(E * maxFlow) for integer capacities",
        space: "O(V + E)",
      },
      { operation: "Residual update", time: "O(path length)", space: "O(E)" },
    ],
    realWorld: [
      "Bandwidth allocation, evacuation planning, supply chains, bipartite matching, and image segmentation.",
    ],
    pitfalls: [
      "Naive path choice can be slow.",
      "Irrational capacities can prevent Ford-Fulkerson termination in theory.",
      "Residual backward edges are essential, not optional.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Residual graph: pushing flow forward creates reverse capacity to undo it.
class FlowNetwork {
  cap = new Map<string, number>();
  key = (u: string, v: string) => \`\${u}->\${v}\`;
  addEdge(u: string, v: string, c: number) {
    this.cap.set(this.key(u, v), c);
    this.cap.set(this.key(v, u), this.cap.get(this.key(v, u)) ?? 0);
  }
  push(u: string, v: string, amount: number) {
    this.cap.set(this.key(u, v), this.cap.get(this.key(u, v))! - amount);
    this.cap.set(this.key(v, u), this.cap.get(this.key(v, u))! + amount); // undo path
  }
}
// Max-flow = repeatedly find an augmenting s->t path with residual capacity.`,
    },
    usedBy: [
      {
        company: "Google",
        product: "Ad allocation & budget pacing",
        usage:
          "Impressions to advertisers under budget caps is a flow problem with capacities on both sides.",
        href: "https://research.google/pubs/pub37409/",
      },
      {
        company: "Amazon",
        product: "Fulfilment network routing",
        usage:
          "Units flow from inventory nodes through capacity-limited lanes to destinations — a min-cost flow at scale.",
      },
      {
        company: "Airlines (Delta, United)",
        product: "Crew and aircraft rotation",
        usage:
          "Legal pairings are modelled as network flow with capacity constraints per crew and aircraft.",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — Maximum flow (Ford-Fulkerson / Edmonds-Karp)",
        href: "https://cp-algorithms.com/graph/edmonds_karp.html",
      },
      {
        label: "Ford & Fulkerson (1956) — Maximal flow through a network",
        href: "https://www.rand.org/pubs/papers/P605.html",
      },
    ],
  },
  {
    slug: "edmonds-karp",
    title: "Edmonds-Karp",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Max flow using BFS shortest augmenting paths.",
    caption:
      "Run BFS augmentations and track bottlenecks. Edmonds-Karp is slower than modern flow algorithms but easier to reason about.",
    component: EdmondsKarpLab,
    skillTags: ["DSA", "Graphs", "Optimization"],
    concept:
      "Edmonds-Karp is the Ford-Fulkerson method with one rule: choose augmenting paths using BFS in the residual graph. That shortest-path rule gives a polynomial O(VE^2) bound and avoids pathological path choices.\n\nIt is a practical teaching algorithm for residual graphs, bottlenecks, and flow conservation before moving to Dinic or Push-Relabel.",
    complexity: [
      { operation: "Max flow", time: "O(VE^2)", space: "O(V + E)" },
      { operation: "One BFS augmentation", time: "O(E)", space: "O(V)" },
    ],
    realWorld: [
      "Teaching max flow, small assignment systems, and correctness baselines for optimized solvers.",
    ],
    pitfalls: [
      "Too slow for very large flow networks.",
      "Must update reverse edges after every augmentation.",
      "BFS is over residual capacity, not original capacity.",
    ],
    codeSnippet: {
      language: "py",
      code: `from collections import deque

# Ford-Fulkerson with BFS augmenting paths => O(V * E^2), no bad orderings.
def edmonds_karp(cap, s, t):
    flow = 0
    while True:
        parent = {s: None}
        q = deque([s])
        while q and t not in parent:
            u = q.popleft()
            for v, c in cap[u].items():
                if c > 0 and v not in parent:
                    parent[v] = u
                    q.append(v)
        if t not in parent:
            return flow                     # no augmenting path left
        bottleneck, v = float("inf"), t
        while parent[v] is not None:
            u = parent[v]; bottleneck = min(bottleneck, cap[u][v]); v = u
        v = t
        while parent[v] is not None:
            u = parent[v]
            cap[u][v] -= bottleneck
            cap[v][u] = cap[v].get(u, 0) + bottleneck
            v = u
        flow += bottleneck`,
    },
    usedBy: [
      {
        company: "Kubernetes / CNCF",
        product: "Bin-packing & scheduling research",
        usage:
          "Flow formulations (e.g. Firmament-style schedulers) assign tasks to machines by solving min-cost flow.",
        href: "https://www.usenix.org/conference/osdi16/technical-sessions/presentation/gog",
      },
      {
        company: "Netflix",
        product: "Content delivery capacity planning",
        usage:
          "Deciding which Open Connect appliance serves which ISP under link capacity is a flow assignment.",
        href: "https://openconnect.netflix.com/en/",
      },
      {
        company: "Sports leagues (MLB, NFL)",
        product: "Playoff elimination proofs",
        usage:
          "The classic baseball-elimination problem is decided by a max-flow computation over remaining games.",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — Edmonds-Karp",
        href: "https://cp-algorithms.com/graph/edmonds_karp.html",
      },
      {
        label: "Firmament — fast, centralized cluster scheduling (OSDI '16)",
        href: "https://www.usenix.org/conference/osdi16/technical-sessions/presentation/gog",
      },
    ],
  },
  {
    slug: "min-cut",
    title: "Min Cut",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Find the smallest capacity separating source from sink.",
    caption:
      "Compare two cuts through the network. The best cut capacity equals the max-flow value.",
    component: MinCutLab,
    skillTags: ["DSA", "Graphs", "Optimization"],
    concept:
      "An s-t cut partitions vertices into a source side and a sink side. Its capacity is the sum of capacities on edges crossing from source side to sink side. The min-cut problem asks for the lowest such capacity.\n\nThe max-flow min-cut theorem states that the maximum source-to-sink flow equals the minimum cut capacity. After a max-flow run, nodes reachable from the source in the residual graph identify a minimum cut.",
    complexity: [
      { operation: "After max-flow", time: "O(V + E)", space: "O(V)" },
      { operation: "Via flow algorithm", time: "depends on max-flow", space: "O(V + E)" },
    ],
    realWorld: [
      "Image segmentation, network reliability, graph partitioning, and identifying bottleneck links.",
    ],
    pitfalls: [
      "Cut direction matters in directed graphs.",
      "A visually small cut is not always the minimum-capacity cut.",
      "Min cut depends on capacities, not just edge count.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Max-flow min-cut: after saturating flow, the cut is the reachable set.
function minCut(residual: Map<string, Map<string, number>>, s: string) {
  const seen = new Set([s]);
  const stack = [s];
  while (stack.length) {
    const u = stack.pop()!;
    for (const [v, c] of residual.get(u) ?? []) {
      if (c > 0 && !seen.has(v)) { seen.add(v); stack.push(v); }
    }
  }
  // Edges from \`seen\` to its complement are the bottleneck set.
  return seen;
}`,
    },
    usedBy: [
      {
        company: "Microsoft",
        product: "GrabCut image segmentation",
        usage:
          "Foreground/background separation is solved as a graph cut over pixel similarity, shipped in Office/Photos tooling.",
        href: "https://www.microsoft.com/en-us/research/publication/grabcut-interactive-foreground-extraction-using-iterated-graph-cuts/",
      },
      {
        company: "Cloudflare",
        product: "Network resilience analysis",
        usage:
          "The minimum cut identifies the smallest set of links whose failure would partition a region.",
      },
      {
        company: "Meta",
        product: "Community / cluster boundaries",
        usage: "Cut-based objectives separate weakly connected communities in large social graphs.",
      },
    ],
    references: [
      {
        label: "GrabCut — interactive foreground extraction using graph cuts",
        href: "https://www.microsoft.com/en-us/research/publication/grabcut-interactive-foreground-extraction-using-iterated-graph-cuts/",
      },
      {
        label: "CP-Algorithms — flow and cuts",
        href: "https://cp-algorithms.com/graph/edmonds_karp.html",
      },
    ],
  },
  {
    slug: "bipartite-matching",
    title: "Bipartite Matching",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Pair left and right sets with augmenting paths.",
    caption:
      "Augment the matching until no improving path remains. Matching powers assignment, scheduling, and recommendation constraints.",
    component: BipartiteMatchingLab,
    skillTags: ["DSA", "Graphs", "Optimization"],
    concept:
      "Bipartite matching pairs nodes from a left set to nodes in a right set so no node is used more than once. An augmenting path alternates between unmatched and matched edges; flipping that path increases the matching size by one.\n\nThe problem can be solved with DFS augmenting paths, Hopcroft-Karp for better asymptotics, or max-flow by connecting a source to left nodes and right nodes to a sink.",
    complexity: [
      { operation: "DFS augmenting paths", time: "O(VE)", space: "O(V + E)" },
      { operation: "Hopcroft-Karp", time: "O(E sqrt(V))", space: "O(V + E)" },
    ],
    realWorld: [
      "Job assignment, school admissions, ad allocation, dating/recommendation constraints, and resource scheduling.",
    ],
    pitfalls: [
      "Greedy matching can get stuck below optimal.",
      "Weighted matching is a different problem.",
      "The graph must be bipartite for these algorithms.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Kuhn's algorithm: try to find an augmenting path for each left vertex.
function maxMatching(left: number, adj: number[][]) {
  const matchRight = new Map<number, number>();
  const tryKuhn = (u: number, seen: Set<number>): boolean => {
    for (const v of adj[u]) {
      if (seen.has(v)) continue;
      seen.add(v);
      const cur = matchRight.get(v);
      if (cur === undefined || tryKuhn(cur, seen)) { // bump the current owner
        matchRight.set(v, u);
        return true;
      }
    }
    return false;
  };
  let size = 0;
  for (let u = 0; u < left; u++) if (tryKuhn(u, new Set())) size++;
  return { size, matchRight };
}`,
    },
    usedBy: [
      {
        company: "Uber",
        product: "Batched dispatch",
        usage:
          "Instead of greedy first-come matching, riders and drivers are matched in batches to maximise global assignment quality.",
        href: "https://www.uber.com/blog/engineering/",
      },
      {
        company: "National Resident Matching Program",
        product: "Medical residency match",
        usage:
          "Applicants and hospital programmes are matched by a stable-matching variant of bipartite assignment.",
        href: "https://www.nrmp.org/intro-to-the-match/how-matching-algorithm-works/",
      },
      {
        company: "Google",
        product: "Online ad slot assignment",
        usage:
          "Impressions arrive online and must be matched to advertisers with budget — online bipartite matching theory in production.",
        href: "https://research.google/pubs/pub37409/",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — Kuhn's algorithm for maximum matching",
        href: "https://cp-algorithms.com/graph/kuhn_maximum_bipartite_matching.html",
      },
      {
        label: "NRMP — how the matching algorithm works",
        href: "https://www.nrmp.org/intro-to-the-match/how-matching-algorithm-works/",
      },
    ],
  },
  {
    slug: "raft-election",
    title: "Raft Leader Election",
    category: "Distributed Systems",
    difficulty: "Advanced",
    readingTimeMin: 6,
    blurb: "5-node consensus with crash recovery.",
    caption:
      "Click the leader to crash it. Followers time out, vote, and elect a new leader with animated RequestVote RPCs.",
    whereUsed: { label: "Distributed coordination work", href: "/#experience" },
    component: RaftCluster,
    skillTags: ["Distributed Systems", "System Design"],
    concept:
      "Raft is a consensus algorithm designed to be understandable. A cluster of nodes elects exactly one leader; all writes flow through that leader and are replicated to followers via AppendEntries RPCs. If the leader fails, followers detect the missing heartbeat (election timeout, randomized 150–300ms), increment their term, and call RequestVote.\n\nA candidate wins if it collects votes from a majority — that's why odd cluster sizes are standard (3, 5, 7). Once elected, the leader pushes its log to followers; conflicting entries are overwritten. The 'commit' point is the highest log index replicated on a majority.\n\nRaft cleanly separates leader election, log replication, and safety, making it the consensus algorithm of choice for etcd, Consul, CockroachDB, and TiKV.",
    complexity: [
      { operation: "Election", time: "~1 RTT × log(N)", space: "O(N) RPCs" },
      { operation: "Replicate", time: "1 RTT to majority", space: "O(N)" },
    ],
    codeSnippet: {
      language: "go",
      code: `// Simplified Raft election loop
func (r *Raft) run() {
  for {
    switch r.state {
    case Follower:
      select {
      case <-r.heartbeat:        // got AppendEntries, stay follower
      case <-r.electionTimeout(): // 150-300ms randomized
        r.state = Candidate
      }
    case Candidate:
      r.term++
      r.votedFor = r.id
      votes := r.requestVotes()
      if votes > len(r.peers)/2 {
        r.state = Leader
      }
    case Leader:
      r.broadcastAppendEntries() // every 50ms
    }
  }
}`,
    },
    realWorld: [
      "etcd — Kubernetes' control-plane store runs Raft.",
      "Consul, Nomad — HashiCorp's coordination services.",
      "CockroachDB / TiKV — Raft per range/region for sharded SQL.",
      "MongoDB replica sets use a Raft-like protocol since 3.2.",
    ],
    pitfalls: [
      "Even cluster sizes (2, 4) are worse than odd — no majority advantage but more failure modes.",
      "Network partitions can elect two leaders briefly; Raft resolves on heal but writes during the split may be lost.",
      "Election storms: tune heartbeat / election timeouts so they don't overlap on flaky networks.",
    ],
    references: [
      { label: "Diego Ongaro — Raft paper (2014)", href: "https://raft.github.io/raft.pdf" },
      { label: "raft.github.io — visualizations", href: "https://raft.github.io/" },
    ],
    usedBy: [
      {
        company: "CNCF",
        product: "etcd (Kubernetes control plane store)",
        usage:
          "Every Kubernetes cluster's state lives in etcd, whose leader election and log replication are Raft.",
        href: "https://etcd.io/docs/latest/learning/design-learner/",
      },
      {
        company: "HashiCorp",
        product: "Consul & Nomad",
        usage:
          "Server clusters elect a leader via Raft; only the leader commits writes to the replicated state store.",
        href: "https://developer.hashicorp.com/consul/docs/architecture/consensus",
      },
      {
        company: "MongoDB",
        product: "Replica set elections",
        usage:
          "Replica sets use a Raft-derived protocol to elect a primary and roll back uncommitted writes after failover.",
        href: "https://www.mongodb.com/docs/manual/core/replica-set-elections/",
      },
      {
        company: "CockroachDB",
        product: "Per-range consensus groups",
        usage:
          "Each data range is its own Raft group, so leadership and replication are sharded across the cluster.",
        href: "https://www.cockroachlabs.com/docs/stable/architecture/replication-layer.html",
      },
    ],
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    category: "Algorithms",
    difficulty: "Beginner",
    readingTimeMin: 4,
    blurb: "Find a target in sorted data by halving the search space.",
    caption:
      "Step through lo, mid, and hi. Binary search is simple, but boundary handling is where most bugs live.",
    component: BinarySearchLab,
    skillTags: ["DSA", "Algorithms"],
    concept:
      "Binary search works on sorted monotonic data. It compares the target with the middle element, discards the half that cannot contain the answer, and repeats. The same idea applies to arrays, answer-space search, lower_bound/upper_bound, and monotonic predicates.\n\nThe key is maintaining an invariant: the answer is always inside the active range, or the active range represents the boundary being searched.",
    complexity: [
      { operation: "Search", time: "O(log n)", space: "O(1)" },
      { operation: "Recursive search", time: "O(log n)", space: "O(log n)" },
    ],
    realWorld: [
      "Database index lookup, sorted logs, feature thresholds, pagination cursors, and capacity planning search.",
    ],
    pitfalls: [
      "Off-by-one errors in lo/hi updates.",
      "Requires sorted or monotonic data.",
      "mid = (lo + hi) / 2 can overflow in low-level languages; use lo + (hi-lo)/2.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Overflow-safe lower bound: first index whose value is >= target.
export function lowerBound(xs: number[], target: number): number {
  let lo = 0, hi = xs.length; // invariant: answer in [lo, hi]
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1); // not (lo + hi) / 2
    if (xs[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// Binary search on the answer: smallest capacity that fits the SLA.
function minCapacity(canServe: (c: number) => boolean, hiBound: number) {
  let lo = 1, hi = hiBound;
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    canServe(mid) ? (hi = mid) : (lo = mid + 1);
  }
  return lo;
}`,
    },
    usedBy: [
      {
        company: "PostgreSQL",
        product: "Index page search",
        usage:
          "Locating a key inside a btree page is a binary search over the page's item pointers before descending a level.",
        href: "https://www.postgresql.org/docs/current/btree-implementation.html",
      },
      {
        company: "Google",
        product: "Chrome / V8 sorted lookups",
        usage:
          "Sorted-array lookups (source maps, ICU tables, timestamp ranges) resolve by binary search rather than linear scan.",
        href: "https://v8.dev/blog/array-sort",
      },
      {
        company: "Elastic",
        product: "Lucene term dictionary seeks",
        usage:
          "Block-based term dictionaries binary-search to a block before decoding it, keeping seek cost logarithmic.",
      },
    ],
    references: [
      {
        label: "Google Research blog — nearly all binary searches are broken (overflow)",
        href: "https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/",
      },
      {
        label: "CP-Algorithms — Binary search",
        href: "https://cp-algorithms.com/num_methods/binary_search.html",
      },
    ],
  },
  {
    slug: "quickselect",
    title: "Quickselect",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Find the kth smallest element without fully sorting.",
    caption:
      "Partition around a pivot and recurse only into the side containing rank k. Quickselect is selection, not sorting.",
    component: QuickselectLab,
    skillTags: ["DSA", "Algorithms"],
    concept:
      "Quickselect uses the same partitioning idea as quicksort, but after partitioning it only recurses into the side containing the desired rank. This gives O(n) average time for kth smallest/largest selection.\n\nIt is ideal when you need a median, percentile, or top-k threshold without paying O(n log n) to sort the full input.",
    complexity: [
      { operation: "Average selection", time: "O(n)", space: "O(1)" },
      { operation: "Worst case", time: "O(n^2)", space: "O(1)" },
    ],
    realWorld: [
      "Median latency, percentile dashboards, top-k filtering, and approximate ranking pipelines.",
    ],
    pitfalls: [
      "Bad pivots create quadratic behavior.",
      "It mutates the input unless copied.",
      "k indexing must be consistent: zero-based vs one-based.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// k-th smallest in O(n) average — partition, then recurse into one side only.
export function quickselect(xs: number[], k: number, lo = 0, hi = xs.length - 1): number {
  while (lo < hi) {
    const pivot = xs[lo + Math.floor(Math.random() * (hi - lo + 1))];
    let i = lo, j = hi;
    while (i <= j) {
      while (xs[i] < pivot) i++;
      while (xs[j] > pivot) j--;
      if (i <= j) { [xs[i], xs[j]] = [xs[j], xs[i]]; i++; j--; }
    }
    if (k <= j) hi = j;
    else if (k >= i) lo = i;
    else return xs[k];
  }
  return xs[k];
}

// p99 latency without a full sort:
// quickselect(samples, Math.floor(0.99 * samples.length))`,
    },
    usedBy: [
      {
        company: "Datadog",
        product: "Latency percentile computation",
        usage:
          "Exact percentiles over a batch of samples need only selection, not a full sort (sketches take over at streaming scale).",
        href: "https://www.datadoghq.com/blog/engineering/computing-accurate-percentiles-with-ddsketch/",
      },
      {
        company: "NumPy / scientific Python",
        product: "np.partition & median",
        usage:
          "`np.partition` exposes introselect so medians and quantiles avoid an O(n log n) sort.",
        href: "https://numpy.org/doc/stable/reference/generated/numpy.partition.html",
      },
      {
        company: "Elastic",
        product: "Top-k aggregation shortcuts",
        usage:
          '"Top N by score" only needs the boundary element, so selection beats sorting the whole candidate set.',
      },
    ],
    references: [
      {
        label: "NumPy — np.partition (introselect)",
        href: "https://numpy.org/doc/stable/reference/generated/numpy.partition.html",
      },
      {
        label: "Datadog — computing accurate percentiles",
        href: "https://www.datadoghq.com/blog/engineering/computing-accurate-percentiles-with-ddsketch/",
      },
    ],
  },
  {
    slug: "heap-sort",
    title: "Heap Sort",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Sort in-place using a binary heap.",
    caption:
      "Build a heap, extract the root into the sorted suffix, and heapify the remaining prefix.",
    component: HeapSortLab,
    skillTags: ["DSA", "Algorithms"],
    concept:
      "Heap sort first transforms the array into a max heap. The largest item is at the root, so it swaps the root with the end of the array, shrinks the heap, and heapifies the root again. Repeating this produces a sorted suffix.\n\nIt has guaranteed O(n log n) time and O(1) auxiliary space, but it is not stable and usually has worse cache behavior than quicksort or TimSort.",
    complexity: [
      { operation: "Build heap", time: "O(n)", space: "O(1)" },
      { operation: "Sort", time: "O(n log n)", space: "O(1)" },
    ],
    realWorld: ["In-place sorting under tight memory constraints and priority-queue fundamentals."],
    pitfalls: [
      "Not stable.",
      "Often slower in practice than optimized quicksort/TimSort.",
      "Heap index arithmetic is prone to off-by-one errors.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// In-place, O(1) extra memory, guaranteed O(n log n) — no quicksort worst case.
export function heapSort(a: number[]) {
  const sift = (i: number, n: number) => {
    while (true) {
      const l = 2 * i + 1, r = l + 1;
      let m = i;
      if (l < n && a[l] > a[m]) m = l;
      if (r < n && a[r] > a[m]) m = r;
      if (m === i) return;
      [a[i], a[m]] = [a[m], a[i]];
      i = m;
    }
  };
  for (let i = (a.length >> 1) - 1; i >= 0; i--) sift(i, a.length); // heapify O(n)
  for (let n = a.length - 1; n > 0; n--) {
    [a[0], a[n]] = [a[n], a[0]]; // max to the back
    sift(0, n);
  }
  return a;
}`,
    },
    usedBy: [
      {
        company: "LLVM / C++ standard library",
        product: "std::sort introsort fallback",
        usage:
          "Introsort starts with quicksort and switches to heapsort once recursion gets too deep, bounding the worst case at O(n log n).",
        href: "https://en.cppreference.com/w/cpp/algorithm/sort",
      },
      {
        company: "Linux kernel",
        product: "sort() in lib/sort.c",
        usage:
          "The kernel uses heapsort because it needs constant extra memory and no recursion on a small kernel stack.",
        href: "https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/lib/sort.c",
      },
      {
        company: "Embedded / real-time vendors",
        product: "Deterministic sorting paths",
        usage:
          "Predictable worst-case time and no allocation make heapsort the safe choice under hard deadlines.",
      },
    ],
    references: [
      {
        label: "Linux kernel — lib/sort.c (heapsort)",
        href: "https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/lib/sort.c",
      },
      {
        label: "cppreference — std::sort (introsort guarantees)",
        href: "https://en.cppreference.com/w/cpp/algorithm/sort",
      },
    ],
  },
  {
    slug: "counting-sort",
    title: "Counting Sort",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Linear-time sorting for small integer ranges.",
    caption:
      "Count each key, then rebuild output from frequencies. Counting sort wins when the value range is bounded.",
    component: CountingSortLab,
    skillTags: ["DSA", "Algorithms"],
    concept:
      "Counting sort avoids comparisons. It counts how many times each integer key appears, then emits keys in order. A stable variant uses prefix sums to place records in output while preserving equal-key order.\n\nThe runtime is O(n + k), where k is the key range. That is linear only when k is reasonably small.",
    complexity: [
      { operation: "Sort", time: "O(n + k)", space: "O(k)" },
      { operation: "Stable placement", time: "O(n + k)", space: "O(n + k)" },
    ],
    realWorld: [
      "Grades, small IDs, histogram sorting, radix sort subroutine, and frequency analytics.",
    ],
    pitfalls: [
      "Large key ranges waste memory.",
      "Negative keys need offset mapping.",
      "Plain count expansion is not stable unless prefix placement is used.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// O(n + k) for small integer keys, and stable if you walk input backwards.
export function countingSort(xs: number[], k: number): number[] {
  const counts = new Array(k + 1).fill(0);
  for (const x of xs) counts[x]++;
  for (let i = 1; i <= k; i++) counts[i] += counts[i - 1]; // prefix sums = end positions
  const out = new Array(xs.length);
  for (let i = xs.length - 1; i >= 0; i--) out[--counts[xs[i]]] = xs[i]; // stable
  return out;
}`,
    },
    usedBy: [
      {
        company: "Illumina / bioinformatics tooling",
        product: "Read bucketing by quality score",
        usage:
          "Scores live in a tiny fixed range, so counting them beats comparison sorting billions of reads.",
      },
      {
        company: "Elastic",
        product: "Histogram aggregations",
        usage:
          "Bucketed value counts are computed with counting-style passes over doc values rather than sorting.",
      },
      {
        company: "Apache Lucene",
        product: "Radix sort building blocks",
        usage:
          "Counting sort is the stable per-digit pass inside LSD radix sorting of doc ids and terms.",
        href: "https://lucene.apache.org/core/9_9_0/core/org/apache/lucene/util/RadixSelector.html",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — sorting by counting",
        href: "https://cp-algorithms.com/sequences/index.html",
      },
      {
        label: "Lucene — RadixSelector (counting passes)",
        href: "https://lucene.apache.org/core/9_9_0/core/org/apache/lucene/util/RadixSelector.html",
      },
    ],
  },
  {
    slug: "radix-sort",
    title: "Radix Sort",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Sort integers or strings digit by digit.",
    caption:
      "Bucket numbers by ones or tens digit. Stable passes from least-significant to most-significant digit produce sorted output.",
    component: RadixSortLab,
    skillTags: ["DSA", "Algorithms"],
    concept:
      "Radix sort processes keys by digits rather than comparing whole values. LSD radix sort starts with the least-significant digit and uses a stable sort, often counting sort, for each digit. MSD radix sort starts from the most-significant digit and recursively partitions.\n\nFor fixed-width integers or strings, radix sort can be linear in the number of digits times n.",
    complexity: [{ operation: "Sort", time: "O(d(n + b))", space: "O(n + b)" }],
    realWorld: [
      "Integer sorting, string sorting, network addresses, IDs, and high-performance analytics kernels.",
    ],
    pitfalls: [
      "Requires stable per-digit sorting for LSD radix.",
      "Variable-length keys need padding or careful ordering.",
      "Constants can beat comparison sorts only for suitable key types.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// LSD radix sort: stable counting pass per 8-bit digit, 4 passes for 32-bit keys.
export function radixSort(xs: Uint32Array): Uint32Array {
  let src = xs, dst = new Uint32Array(xs.length);
  for (let shift = 0; shift < 32; shift += 8) {
    const counts = new Uint32Array(256);
    for (const x of src) counts[(x >>> shift) & 255]++;
    let sum = 0;
    for (let i = 0; i < 256; i++) { const c = counts[i]; counts[i] = sum; sum += c; }
    for (const x of src) dst[counts[(x >>> shift) & 255]++] = x;
    [src, dst] = [dst, src];
  }
  return src;
}`,
    },
    usedBy: [
      {
        company: "NVIDIA",
        product: "CUB / Thrust GPU sort",
        usage:
          "GPU sorting primitives are radix-based because digit passes are embarrassingly parallel, unlike comparison sorts.",
        href: "https://nvidia.github.io/cccl/cub/",
      },
      {
        company: "Apache Software Foundation",
        product: "Lucene / Spark shuffle key sorting",
        usage:
          "Fixed-width binary keys (doc ids, prefixes) are radix-sorted to avoid comparator overhead.",
        href: "https://lucene.apache.org/core/9_9_0/core/org/apache/lucene/util/RadixSelector.html",
      },
      {
        company: "Databricks",
        product: "Tungsten sort-based shuffle",
        usage:
          "Records are sorted on packed prefix keys so most comparisons never touch the full row.",
      },
    ],
    references: [
      { label: "NVIDIA CUB — device-wide radix sort", href: "https://nvidia.github.io/cccl/cub/" },
      {
        label: "Lucene — radix-based selection/sorting utilities",
        href: "https://lucene.apache.org/core/9_9_0/core/org/apache/lucene/util/RadixSelector.html",
      },
    ],
  },
  {
    slug: "bucket-sort",
    title: "Bucket Sort",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Distribute values into buckets, sort locally, then concatenate.",
    caption:
      "Map normalized values into ranges. Bucket sort is powerful when input is roughly uniformly distributed.",
    component: BucketSortLab,
    skillTags: ["DSA", "Algorithms"],
    concept:
      "Bucket sort partitions input into value ranges, sorts each bucket, then concatenates buckets in order. If values are uniformly distributed and bucket counts stay small, the result is close to linear time.\n\nIt is a distribution sort: performance depends less on comparisons and more on how evenly the bucket function spreads data.",
    complexity: [
      { operation: "Average sort", time: "O(n + k)", space: "O(n + k)" },
      { operation: "Worst case", time: "O(n^2)", space: "O(n)" },
    ],
    realWorld: [
      "Floating-point ranges, histogram processing, distributed partitioning, and approximate ranking.",
    ],
    pitfalls: [
      "Skewed input overloads a bucket.",
      "Bucket boundaries must preserve global ordering.",
      "Needs a local sorting strategy inside each bucket.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Scatter into buckets by value range, sort each bucket, concatenate.
export function bucketSort(xs: number[], bucketCount = 16): number[] {
  if (xs.length === 0) return xs;
  const min = Math.min(...xs), max = Math.max(...xs);
  const span = (max - min) / bucketCount || 1;
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);
  for (const x of xs) {
    const i = Math.min(bucketCount - 1, Math.floor((x - min) / span));
    buckets[i].push(x); // skewed data -> one hot bucket -> O(n^2)
  }
  return buckets.flatMap((b) => b.sort((a, z) => a - z));
}`,
    },
    usedBy: [
      {
        company: "Apache Software Foundation",
        product: "Hadoop TeraSort range partitioner",
        usage:
          "Sampled key ranges assign records to reducers so each reducer sorts a bucket and output is globally ordered.",
        href: "https://hadoop.apache.org/docs/stable/api/org/apache/hadoop/examples/terasort/package-summary.html",
      },
      {
        company: "Databricks",
        product: "Spark range partitioning",
        usage:
          "`repartitionByRange` samples the key distribution to build balanced buckets before per-partition sorting.",
        href: "https://spark.apache.org/docs/latest/sql-performance-tuning.html",
      },
      {
        company: "Snowflake / analytics warehouses",
        product: "Histogram-based data skipping",
        usage: "Value-range buckets drive both partition pruning and parallel sort placement.",
      },
    ],
    references: [
      {
        label: "Hadoop TeraSort — range partitioning",
        href: "https://hadoop.apache.org/docs/stable/api/org/apache/hadoop/examples/terasort/package-summary.html",
      },
      {
        label: "Spark — performance tuning and partitioning",
        href: "https://spark.apache.org/docs/latest/sql-performance-tuning.html",
      },
    ],
  },
  {
    slug: "timsort",
    title: "TimSort",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Production hybrid sort optimized for real-world partially ordered data.",
    caption:
      "Identify natural sorted runs and merge them. TimSort powers Python and Java object sorting because real data is often already partly sorted.",
    component: TimSortLab,
    skillTags: ["DSA", "Algorithms"],
    concept:
      "TimSort is a hybrid stable sorting algorithm derived from merge sort and insertion sort. It scans for natural ordered runs already present in the input, extends small runs with insertion sort, and merges runs while maintaining stack invariants that keep merging balanced.\n\nIt performs especially well on real-world data because logs, UI lists, and database results are often partially sorted before sorting begins.",
    complexity: [
      { operation: "Best case", time: "O(n)", space: "O(n)" },
      { operation: "Worst case", time: "O(n log n)", space: "O(n)" },
    ],
    realWorld: [
      "Python list.sort/sorted, Java object arrays, Android, and production UI/data sorting.",
    ],
    pitfalls: [
      "Implementation is complex because run invariants matter.",
      "Needs extra memory for merges.",
      "Primitive-array sorts may use different algorithms.",
    ],
    codeSnippet: {
      language: "py",
      code: `# Timsort exploits existing order: find natural runs, extend to minrun, merge.
def find_run(a, lo):
    hi = lo + 1
    if hi == len(a):
        return hi, False
    if a[hi] < a[lo]:                  # strictly descending run
        while hi + 1 < len(a) and a[hi + 1] < a[hi]:
            hi += 1
        return hi + 1, True            # reverse it in place -> stable ascending run
    while hi + 1 < len(a) and a[hi + 1] >= a[hi]:
        hi += 1
    return hi + 1, False

# Already-sorted or reverse-sorted input costs O(n); merges obey stack invariants
# so run lengths stay balanced.`,
    },
    usedBy: [
      {
        company: "Python Software Foundation",
        product: "list.sort() / sorted()",
        usage:
          "Timsort was written for CPython and is the reason sorting near-ordered real-world data is close to linear.",
        href: "https://github.com/python/cpython/blob/main/Objects/listsort.txt",
      },
      {
        company: "Oracle / Android",
        product: "java.util.Arrays.sort for objects",
        usage:
          "Java uses Timsort for reference arrays because stability is required by the spec; Android inherits it.",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html",
      },
      {
        company: "Google",
        product: "V8 Array.prototype.sort",
        usage:
          "V8 replaced its old sort with TimSort in 2018, making JavaScript sorting stable across engines.",
        href: "https://v8.dev/blog/array-sort",
      },
    ],
    references: [
      {
        label: "CPython — listsort.txt (Timsort design notes)",
        href: "https://github.com/python/cpython/blob/main/Objects/listsort.txt",
      },
      {
        label: "V8 — getting things sorted (TimSort in V8)",
        href: "https://v8.dev/blog/array-sort",
      },
    ],
  },
  {
    slug: "external-merge-sort",
    title: "External Merge Sort",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Sort datasets larger than memory with run generation and k-way merge.",
    caption:
      "Create sorted disk runs, then merge them. External sorting optimizes I/O instead of CPU comparisons.",
    component: ExternalMergeSortLab,
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
  },
  {
    slug: "sorting-race",
    title: "Sorting Race",
    category: "Algorithms",
    difficulty: "Beginner",
    readingTimeMin: 3,
    blurb: "Bubble vs Quick vs Merge — same array, side by side.",
    caption:
      "Three algorithms sort identical inputs. Compare comparison counts and watch the bars settle in real time.",
    component: SortingRace,
    skillTags: ["DSA"],
    concept:
      "Sorting is the canonical algorithm comparison. Bubble sort is O(n²) and easy to write. Quicksort averages O(n log n) by partitioning around a pivot but degrades to O(n²) on adversarial inputs (sorted/reverse with bad pivot choice). Mergesort guarantees O(n log n) by recursively splitting and merging — at the cost of O(n) extra space.\n\nReal-world sort routines are hybrids: V8/CPython use Timsort (mergesort variant tuned for partially-sorted real data), C++ std::sort uses introsort (quicksort that falls back to heapsort if recursion gets too deep), Java Arrays.sort uses dual-pivot quicksort for primitives.",
    complexity: [
      { operation: "Bubble sort", time: "O(n²)", space: "O(1)" },
      { operation: "Quicksort", time: "O(n log n) avg, O(n²) worst", space: "O(log n)" },
      { operation: "Mergesort", time: "O(n log n)", space: "O(n)" },
    ],
    realWorld: [
      "V8 / CPython — Timsort (mergesort + insertion sort for small runs).",
      "C++ STL — introsort (quicksort + heapsort fallback).",
      "Java primitive arrays — dual-pivot quicksort.",
      "PostgreSQL — external mergesort for ORDER BY that exceeds work_mem.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Why engines pick different algorithms for the same call:
//   n < 22            -> insertion sort   (tiny, cache-resident, low overhead)
//   objects / stable  -> TimSort          (stability is required by the spec)
//   primitives        -> quicksort family (in-place, great constants)
//   adversarial depth -> heapsort         (introsort's O(n log n) safety net)

const byPrice = [...items].sort((a, b) => a.price - b.price); // stable since ES2019
// Comparator contract: consistent, transitive, returns 0 only for true ties.
// A comparator that returns a boolean (a > b) is the #1 real-world sorting bug.`,
    },
    pitfalls: [
      "Comparator bugs beat algorithm choice: `(a, b) => a > b` returns a boolean, not -1/0/1, and silently produces wrong order.",
      "Big-O hides constants — insertion sort wins below ~20 elements, which is why every real sort has a small-array cutoff.",
      "Quicksort's worst case is O(n^2) on adversarial input; production sorts randomise the pivot or fall back to heapsort.",
      "Stability matters when sorting by a second key; unstable sorts silently scramble previously applied ordering.",
    ],
    usedBy: [
      {
        company: "Google",
        product: "V8 Array.prototype.sort",
        usage:
          "V8 uses TimSort with an insertion-sort cutoff for small runs, and JavaScript sorting is now stable by specification.",
        href: "https://v8.dev/blog/array-sort",
      },
      {
        company: "Rust project",
        product: "slice::sort vs sort_unstable",
        usage:
          "Rust exposes the tradeoff directly: a stable merge-based sort with allocation, or an in-place pattern-defeating quicksort.",
        href: "https://doc.rust-lang.org/std/primitive.slice.html#method.sort_unstable",
      },
      {
        company: "Oracle",
        product: "Java dual-pivot quicksort for primitives",
        usage:
          "Primitives use dual-pivot quicksort (no stability requirement); objects use TimSort because stability is contractual.",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html",
      },
    ],
    references: [
      { label: "V8 — getting things sorted", href: "https://v8.dev/blog/array-sort" },
      {
        label: "Rust — sort vs sort_unstable tradeoffs",
        href: "https://doc.rust-lang.org/std/primitive.slice.html#method.sort_unstable",
      },
    ],
  },
  {
    slug: "fibonacci-memoization",
    title: "Fibonacci Memoization",
    category: "Algorithms",
    difficulty: "Beginner",
    readingTimeMin: 3,
    blurb: "Turn exponential recursion into linear work by caching subproblems.",
    caption:
      "Move n and watch solved Fibonacci values stay cached. Memoization is top-down dynamic programming.",
    component: FibonacciMemoLab,
    skillTags: ["DSA", "Dynamic Programming"],
    concept:
      "Naive Fibonacci recursion recomputes the same subproblems many times. Memoization stores each solved F(n), so later calls return immediately. This changes the runtime from exponential to linear.\n\nThis is the core dynamic programming move: identify overlapping subproblems, define a recurrence, cache results, and reuse them.",
    complexity: [
      { operation: "Naive recursion", time: "O(2^n)", space: "O(n)" },
      { operation: "Memoized DP", time: "O(n)", space: "O(n)" },
    ],
    realWorld: [
      "Recursive optimization, parsers, route planning, and expensive repeated computations.",
    ],
    pitfalls: [
      "Cache key must capture all state.",
      "Memoization can trade too much memory for speed.",
      "Cycles in recurrence need detection.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Memoization turns an exponential recursion tree into a linear walk.
const memo = new Map<number, number>();
function fib(n: number): number {
  if (n < 2) return n;
  const hit = memo.get(n);
  if (hit !== undefined) return hit; // overlapping subproblem, computed once
  const v = fib(n - 1) + fib(n - 2);
  memo.set(n, v);
  return v;
}

// The same shape as a request-level cache: pure function + stable key + store.
function memoize<A extends unknown[], R>(fn: (...a: A) => R, key: (...a: A) => string) {
  const cache = new Map<string, R>();
  return (...args: A): R => {
    const k = key(...args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k)!;
  };
}`,
    },
    usedBy: [
      {
        company: "Meta",
        product: "React useMemo / cache()",
        usage:
          "Component memoization skips recomputation when inputs are unchanged — the same overlapping-subproblem argument at UI scale.",
        href: "https://react.dev/reference/react/useMemo",
      },
      {
        company: "Vercel",
        product: "Next.js request-level deduplication",
        usage:
          "Identical fetches in one render pass are deduped from a per-request cache instead of hitting the origin repeatedly.",
        href: "https://nextjs.org/docs/app/building-your-application/caching",
      },
      {
        company: "Google",
        product: "Bazel action cache",
        usage:
          "Build actions are keyed by input hashes so an already-computed subgraph is fetched, not rebuilt.",
        href: "https://bazel.build/remote/caching",
      },
    ],
    references: [
      { label: "React — useMemo", href: "https://react.dev/reference/react/useMemo" },
      {
        label: "Bazel — remote caching of build actions",
        href: "https://bazel.build/remote/caching",
      },
    ],
  },
  {
    slug: "knapsack",
    title: "0/1 Knapsack",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "Choose items under capacity to maximize value.",
    caption:
      "Adjust capacity and compare item choices. Each item can be taken or skipped exactly once.",
    component: KnapsackLab,
    skillTags: ["DSA", "Dynamic Programming"],
    concept:
      "0/1 knapsack asks for the maximum value that fits within a weight capacity when each item can be chosen at most once. The recurrence compares skipping the item vs taking it and adding the best value for remaining capacity.\n\nIt is a canonical DP because the same subproblem appears repeatedly: best value using first i items and capacity w.",
    complexity: [
      { operation: "DP table", time: "O(nW)", space: "O(nW)" },
      { operation: "1D optimized", time: "O(nW)", space: "O(W)" },
    ],
    realWorld: [
      "Budget allocation, packing, feature selection, and constrained resource planning.",
    ],
    pitfalls: [
      "Pseudo-polynomial: W matters.",
      "Loop direction matters for 1D 0/1 DP.",
      "Fractional knapsack is a different greedy problem.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// 0/1 knapsack, 1-D rolling array. Iterate capacity downward so each item is used once.
export function knapsack(items: { w: number; v: number }[], cap: number): number {
  const dp = new Array(cap + 1).fill(0);
  for (const it of items) {
    for (let c = cap; c >= it.w; c--) {
      dp[c] = Math.max(dp[c], dp[c - it.w] + it.v);
    }
  }
  return dp[cap]; // pseudo-polynomial: O(n * cap), cap is a value not a size
}`,
    },
    usedBy: [
      {
        company: "Amazon",
        product: "Package / container loading",
        usage:
          "Choosing which units fill a box or truck under weight and volume caps is a multi-dimensional knapsack solved heuristically.",
      },
      {
        company: "Google",
        product: "Ad budget allocation",
        usage:
          "Selecting a set of candidate ads with the highest expected value under a budget cap is a knapsack formulation.",
        href: "https://research.google/pubs/pub37409/",
      },
      {
        company: "Kubernetes / CNCF",
        product: "Pod bin-packing on nodes",
        usage:
          "The MostAllocated / bin-packing scoring strategy chooses placements that pack requests tightly into node capacity.",
        href: "https://kubernetes.io/docs/reference/scheduling/config/",
      },
    ],
    references: [
      {
        label: "Kubernetes — scheduler scoring & bin packing config",
        href: "https://kubernetes.io/docs/reference/scheduling/config/",
      },
      {
        label: "CP-Algorithms — knapsack style DP",
        href: "https://cp-algorithms.com/dynamic_programming/knapsack.html",
      },
    ],
  },
  {
    slug: "coin-change",
    title: "Coin Change",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Compute minimum coins or number of ways for a target amount.",
    caption:
      "Change the amount and inspect the DP table. Each amount reuses smaller solved amounts.",
    component: CoinChangeLab,
    skillTags: ["DSA", "Dynamic Programming"],
    concept:
      "Coin change appears in two common forms: minimum coins to make an amount, or number of combinations. For minimum coins, dp[a] = min(dp[a], dp[a - coin] + 1). The table builds from amount 0 upward.\n\nThe exact loop order changes semantics. Iterating coins outside amounts counts combinations; iterating amount outside coins can count permutations.",
    complexity: [{ operation: "Min coins", time: "O(amount * coins)", space: "O(amount)" }],
    realWorld: ["Payment systems, resource bundles, dynamic pricing, and combinatorial counting."],
    pitfalls: [
      "Unreachable amounts need Infinity/sentinel handling.",
      "Combination vs permutation loop order is easy to mix up.",
      "Greedy only works for some coin systems.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Minimum coins for an amount — unbounded knapsack, ascending loop.
export function minCoins(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const c of coins) {
    for (let a = c; a <= amount; a++) {
      dp[a] = Math.min(dp[a], dp[a - c] + 1); // ascending -> coin reusable
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
// Greedy works for {1,5,10,25} but fails for e.g. {1,3,4} at amount 6.`,
    },
    usedBy: [
      {
        company: "NCR / vending & POS vendors",
        product: "Cash change dispensing",
        usage:
          "Dispensers minimise coin count subject to hopper stock, which greedy alone cannot guarantee.",
      },
      {
        company: "Stripe",
        product: "Payout batching & denomination splits",
        usage:
          "Splitting an amount across balances, rails or fee tiers is the same make-the-target-from-parts DP.",
        href: "https://docs.stripe.com/payouts",
      },
      {
        company: "Bitcoin Core",
        product: "UTXO coin selection",
        usage:
          "Wallets pick a subset of unspent outputs to cover a payment with minimal change and fees — branch-and-bound over the same problem.",
        href: "https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp",
      },
    ],
    references: [
      {
        label: "Bitcoin Core — coin selection implementation",
        href: "https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp",
      },
      {
        label: "CP-Algorithms — DP over coins",
        href: "https://cp-algorithms.com/dynamic_programming/knapsack.html",
      },
    ],
  },
  {
    slug: "longest-increasing-subsequence",
    title: "Longest Increasing Subsequence",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "Find the longest ordered subsequence without requiring contiguity.",
    caption: "Advance across values and track the best subsequence ending at each index.",
    component: LISLab,
    skillTags: ["DSA", "Dynamic Programming"],
    concept:
      "The O(n^2) LIS DP defines lis[i] as the longest increasing subsequence ending at i. It scans all earlier j where nums[j] < nums[i], then extends the best candidate. A faster O(n log n) method keeps tails: the smallest possible ending value for each length.\n\nLIS is useful for ordering, ranking, diffing, and reducing problems to monotonic subsequences.",
    complexity: [
      { operation: "Classic DP", time: "O(n^2)", space: "O(n)" },
      { operation: "Tails + binary search", time: "O(n log n)", space: "O(n)" },
    ],
    realWorld: ["Version diffing, ranking systems, envelope nesting, and sequence analysis."],
    pitfalls: [
      "Subsequence is not substring.",
      "Strict vs non-decreasing comparison changes answer.",
      "The O(n log n) tails array does not directly store the sequence without parent links.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// O(n log n): tails[i] = smallest possible tail of an increasing run of length i+1.
export function lisLength(xs: number[]): number {
  const tails: number[] = [];
  for (const x of xs) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      tails[mid] < x ? (lo = mid + 1) : (hi = mid);
    }
    tails[lo] = x; // extend or tighten
  }
  return tails.length; // tails is NOT the subsequence itself
}`,
    },
    usedBy: [
      {
        company: "Git / Linux Foundation",
        product: "Diff & patience diff",
        usage:
          "Patience diff computes a longest increasing subsequence over unique matching lines to anchor a readable diff.",
        href: "https://bramcohen.livejournal.com/73318.html",
      },
      {
        company: "Vue.js core team",
        product: "Keyed children DOM patching",
        usage:
          "The reconciler finds the longest increasing subsequence of stable indexes so only the remaining nodes are moved.",
        href: "https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts",
      },
      {
        company: "Bioinformatics tooling (BLAST-family)",
        product: "Seed chaining in sequence alignment",
        usage:
          "Chaining co-linear seed matches is an increasing-subsequence problem over match coordinates.",
      },
    ],
    references: [
      {
        label: "Patience diff — LIS over unique lines",
        href: "https://bramcohen.livejournal.com/73318.html",
      },
      {
        label: "CP-Algorithms — longest increasing subsequence",
        href: "https://cp-algorithms.com/sequences/longest_increasing_subsequence.html",
      },
    ],
  },
  {
    slug: "longest-common-subsequence",
    title: "Longest Common Subsequence",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "Find shared order between two sequences.",
    caption:
      "Fill the DP matrix row by row. Matching characters extend the diagonal; mismatches take the best neighbor.",
    component: LCSLab,
    skillTags: ["DSA", "Dynamic Programming"],
    concept:
      "LCS finds the longest sequence that appears in both inputs in the same order, not necessarily contiguously. If characters match, dp[i][j] = 1 + dp[i-1][j-1]. Otherwise it takes max(dp[i-1][j], dp[i][j-1]).\n\nIt is the foundation for diff tools and sequence similarity because it preserves relative ordering.",
    complexity: [
      { operation: "LCS length", time: "O(mn)", space: "O(mn)" },
      { operation: "Space optimized length", time: "O(mn)", space: "O(min(m,n))" },
    ],
    realWorld: ["Git diff, document comparison, DNA/protein sequence analysis, and merge tools."],
    pitfalls: [
      "LCS differs from longest common substring.",
      "Reconstructing the sequence needs backtracking or parent data.",
      "Large strings require memory optimization.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// LCS table — the core of line-based diffs.
export function lcs(a: string[], b: string[]): number[][] {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1              // matched line -> context
        : Math.max(dp[i - 1][j], dp[i][j - 1]); // deletion or insertion
    }
  }
  return dp; // backtrack from dp[a.length][b.length] to emit the patch
}`,
    },
    usedBy: [
      {
        company: "Git / Linux Foundation",
        product: "git diff (Myers algorithm)",
        usage:
          "Diff output is the complement of a longest common subsequence between the two file versions.",
        href: "https://git-scm.com/docs/git-diff",
      },
      {
        company: "GitHub",
        product: "Pull request diff views",
        usage:
          "Side-by-side and unified PR diffs render the LCS-derived edit script produced by the diff engine.",
        href: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-comparing-branches-in-pull-requests",
      },
      {
        company: "Google",
        product: "diff-match-patch (Docs revision history)",
        usage:
          "Character-level diffing for collaborative editing and revision playback is built on the same LCS/edit-script machinery.",
        href: "https://github.com/google/diff-match-patch",
      },
    ],
    references: [
      {
        label: "Myers — An O(ND) difference algorithm",
        href: "http://www.xmailserver.org/diff2.pdf",
      },
      { label: "Google — diff-match-patch", href: "https://github.com/google/diff-match-patch" },
    ],
  },
  {
    slug: "matrix-chain-multiplication",
    title: "Matrix Chain Multiplication",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Choose multiplication order that minimizes scalar operations.",
    caption: "Compare two parenthesizations with the same result but very different costs.",
    component: MatrixChainLab,
    skillTags: ["DSA", "Dynamic Programming"],
    concept:
      "Matrix multiplication is associative, so A(BC) and (AB)C produce the same final matrix, but the number of scalar operations can be wildly different. Matrix-chain DP tries every split k between i and j, combining the best left cost, best right cost, and multiplication cost.\n\nThis is interval DP: solve smaller ranges, then compose larger ranges.",
    complexity: [{ operation: "Optimal parenthesization", time: "O(n^3)", space: "O(n^2)" }],
    realWorld: ["Query planning, tensor algebra, compiler optimization, and scientific computing."],
    pitfalls: [
      "Only optimizes order, not mathematical result.",
      "Requires compatible dimensions.",
      "The split table is needed to reconstruct parentheses.",
    ],
    codeSnippet: {
      language: "py",
      code: `# Choose the parenthesisation with the fewest scalar multiplications.
def matrix_chain(dims):                 # dims[i-1] x dims[i] for matrix i
    n = len(dims) - 1
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            dp[i][j] = min(
                dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j]
                for k in range(i, j)
            )
    return dp[1][n]                     # O(n^3) planning, huge runtime savings`,
    },
    usedBy: [
      {
        company: "Google",
        product: "TensorFlow / XLA operator fusion",
        usage:
          "Compilers reorder and fuse tensor contractions; the multiplication order changes FLOP count by orders of magnitude.",
        href: "https://openxla.org/xla",
      },
      {
        company: "PostgreSQL",
        product: "Join order optimisation",
        usage:
          "Join ordering is the same interval DP — cost depends on the shape of the tree, not just the set of operands.",
        href: "https://www.postgresql.org/docs/current/planner-optimizer.html",
      },
      {
        company: "NVIDIA",
        product: "cuBLAS / einsum contraction paths",
        usage:
          "Optimal contraction ordering for einsum-style expressions is solved with the same dynamic program.",
        href: "https://numpy.org/doc/stable/reference/generated/numpy.einsum_path.html",
      },
    ],
    references: [
      {
        label: "PostgreSQL — planner and join ordering",
        href: "https://www.postgresql.org/docs/current/planner-optimizer.html",
      },
      {
        label: "NumPy — einsum_path (contraction ordering)",
        href: "https://numpy.org/doc/stable/reference/generated/numpy.einsum_path.html",
      },
    ],
  },
  {
    slug: "grid-dp",
    title: "Grid DP",
    category: "Algorithms",
    difficulty: "Beginner",
    readingTimeMin: 4,
    blurb: "Solve path/counting problems by combining neighboring cells.",
    caption:
      "Add an obstacle and watch path counts change. Each cell depends on previously solved adjacent cells.",
    component: GridDPLab,
    skillTags: ["DSA", "Dynamic Programming"],
    concept:
      "Grid DP appears when movement is constrained, often to right/down or four directions with acyclic ordering. For path counting, each cell combines top and left counts. For minimum path sum, each cell takes its cost plus min(top, left).\n\nThe trick is choosing an iteration order where dependencies are already solved.",
    complexity: [
      { operation: "m x n grid", time: "O(mn)", space: "O(mn)" },
      { operation: "Rolling row", time: "O(mn)", space: "O(n)" },
    ],
    realWorld: [
      "Robot paths, image processing, edit-distance grids, game maps, and spreadsheet-like propagation.",
    ],
    pitfalls: [
      "Obstacles need zero/blocked states.",
      "Movement cycles break simple row-order DP.",
      "Boundary initialization controls correctness.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Min-cost path on a grid: each cell depends only on up/left.
export function minPathCost(grid: number[][]): number {
  const rows = grid.length, cols = grid[0].length;
  const dp = new Array(cols).fill(Infinity);
  dp[0] = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const fromLeft = c > 0 ? dp[c - 1] : Infinity;
      dp[c] = (r === 0 && c === 0 ? 0 : Math.min(dp[c], fromLeft)) + grid[r][c];
    }
  }
  return dp[cols - 1]; // O(rows*cols) time, O(cols) memory
}`,
    },
    usedBy: [
      {
        company: "Adobe",
        product: "Content-aware resizing (seam carving)",
        usage:
          "Seam carving finds a minimum-energy path down an image grid with exactly this recurrence.",
        href: "https://dl.acm.org/doi/10.1145/1275808.1276390",
      },
      {
        company: "Blizzard / game studios",
        product: "Tile-based pathfinding costs",
        usage:
          "Terrain-cost grids are pre-solved with DP for flow fields when hundreds of units share a destination.",
      },
      {
        company: "Google",
        product: "Dynamic time warping in speech",
        usage:
          "Aligning two time series is a grid DP over an alignment matrix with the same up/left/diagonal transitions.",
      },
    ],
    references: [
      {
        label: "Avidan & Shamir — Seam carving for content-aware image resizing",
        href: "https://dl.acm.org/doi/10.1145/1275808.1276390",
      },
      {
        label: "CP-Algorithms — dynamic programming basics",
        href: "https://cp-algorithms.com/dynamic_programming/intro-to-dp.html",
      },
    ],
  },
  {
    slug: "tree-dp",
    title: "Tree DP",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Return multiple states per node and combine child answers.",
    caption:
      "Toggle include/exclude root. Tree DP often computes states like take-this-node vs skip-this-node.",
    component: TreeDPLab,
    skillTags: ["DSA", "Dynamic Programming", "Trees"],
    concept:
      "Tree DP solves recursive problems where each node combines answers from children. Many problems return multiple states per node. For example, maximum independent set returns include-node and exclude-node: including a node excludes children, while excluding it allows each child to choose its best state.\n\nBecause trees have no cycles, postorder traversal naturally solves children before parents.",
    complexity: [{ operation: "Postorder DP", time: "O(n)", space: "O(h)" }],
    realWorld: [
      "Org chart optimization, dependency trees, AST optimization, network design, and hierarchical permissions.",
    ],
    pitfalls: [
      "Root choice can matter for directed/parented states.",
      "Rerooting DP is needed when every node may be root.",
      "Recursive depth can overflow on skewed trees.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Post-order DP: combine children results into the parent's answer.
interface Node { id: string; children: Node[]; weight: number }

// Maximum-weight independent set on a tree ("no manager with their report").
function solve(n: Node): { take: number; skip: number } {
  let take = n.weight, skip = 0;
  for (const c of n.children) {
    const r = solve(c);
    take += r.skip;                 // taking n forbids taking a child
    skip += Math.max(r.take, r.skip);
  }
  return { take, skip };
}
const best = (root: Node) => Math.max(...Object.values(solve(root)));`,
    },
    usedBy: [
      {
        company: "Google",
        product: "Bazel build graph analysis",
        usage:
          "Aggregating cost, staleness and cache hits bottom-up over a dependency tree is post-order DP.",
        href: "https://bazel.build/remote/caching",
      },
      {
        company: "Meta",
        product: "React render cost aggregation",
        usage:
          "Profiler timings roll up child subtree costs into parent components in a post-order pass.",
        href: "https://react.dev/reference/react/Profiler",
      },
      {
        company: "Amazon",
        product: "Org / category hierarchy rollups",
        usage:
          "Catalog and org trees compute aggregates (inventory, spend, permissions) once per node instead of re-walking subtrees.",
      },
    ],
    references: [
      {
        label: "CP-Algorithms — DP on trees",
        href: "https://cp-algorithms.com/graph/rerooting.html",
      },
      {
        label: "React — Profiler (subtree cost aggregation)",
        href: "https://react.dev/reference/react/Profiler",
      },
    ],
  },
  {
    slug: "dijkstra",
    title: "Dijkstra Pathfinder",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Shortest path on a weighted grid.",
    caption:
      "Click cells to drop walls. Run Dijkstra and watch the visited frontier expand before the shortest path lights up.",
    component: DijkstraGrid,
    skillTags: ["DSA"],
    concept:
      "Dijkstra's algorithm finds the shortest path from a source to every other node in a graph with non-negative edge weights. It maintains a priority queue of (distance, node) and repeatedly pops the closest unvisited node, relaxing edges to its neighbors.\n\nWith a binary-heap priority queue: O((V + E) log V). With a Fibonacci heap: O(E + V log V), but constants make binary heaps faster in practice.\n\nFor maps and games where you have a heuristic (e.g. Euclidean distance to the goal), A* — Dijkstra plus an admissible heuristic — explores far fewer nodes. For negative edges, use Bellman-Ford. For all-pairs, use Floyd-Warshall.",
    complexity: [{ operation: "Single-source", time: "O((V + E) log V)", space: "O(V)" }],
    codeSnippet: {
      language: "ts",
      code: `function dijkstra(graph: Map<string, [string, number][]>, src: string) {
  const dist = new Map<string, number>();
  for (const v of graph.keys()) dist.set(v, Infinity);
  dist.set(src, 0);
  const pq: [number, string][] = [[0, src]]; // (dist, node)
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;
    if (d > dist.get(u)!) continue;
    for (const [v, w] of graph.get(u) ?? []) {
      if (d + w < dist.get(v)!) {
        dist.set(v, d + w);
        pq.push([d + w, v]);
      }
    }
  }
  return dist;
}`,
    },
    realWorld: [
      "Google Maps / OSRM — variants of Dijkstra (often A* with contraction hierarchies) for routing.",
      "OSPF / IS-IS — link-state routing protocols run Dijkstra over the network topology.",
      "Game pathfinding (often A* with grid heuristic).",
    ],
    pitfalls: [
      "Negative edge weights break it — use Bellman-Ford instead.",
      "Re-using a stale (distance, node) entry in the priority queue is the classic off-by-one bug — check if popped distance matches current best.",
    ],
    usedBy: [
      {
        company: "Google",
        product: "Maps routing",
        usage:
          "Production routing starts from Dijkstra/A* over the road graph and layers contraction hierarchies for continent-scale queries.",
        href: "https://research.google/pubs/pub41336/",
      },
      {
        company: "Uber",
        product: "ETA & dispatch routing",
        usage:
          "Shortest-path search over a live, traffic-weighted road graph drives both ETA and driver assignment.",
        href: "https://www.uber.com/blog/engineering/",
      },
      {
        company: "Internet Engineering Task Force",
        product: "OSPF link-state routing",
        usage:
          "Every OSPF router runs Dijkstra over the flooded link-state database to build its forwarding table.",
        href: "https://datatracker.ietf.org/doc/html/rfc2328",
      },
    ],
    references: [
      {
        label: "RFC 2328 — OSPF v2 (SPF calculation)",
        href: "https://datatracker.ietf.org/doc/html/rfc2328",
      },
      {
        label: "CP-Algorithms — Dijkstra with priority queue",
        href: "https://cp-algorithms.com/graph/dijkstra_sparse.html",
      },
    ],
  },
  {
    slug: "interval-scheduling",
    title: "Interval Scheduling",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Select the maximum number of non-overlapping intervals.",
    caption:
      "Pick intervals by earliest finish time. The local greedy choice leaves maximum room for future compatible intervals.",
    component: IntervalSchedulingLab,
    skillTags: ["DSA", "Greedy"],
    concept:
      "Interval scheduling asks for the largest set of non-overlapping intervals. The optimal greedy rule is to sort by finish time and repeatedly choose the first interval that starts after the last selected interval ends.\n\nThis works because the earliest-finishing compatible interval never leaves less room for future intervals than a later-finishing choice.",
    complexity: [{ operation: "Sort + select", time: "O(n log n)", space: "O(1) to O(n)" }],
    realWorld: [
      "Calendar booking, meeting room allocation, CPU job windows, and media ad slot planning.",
    ],
    pitfalls: [
      "Sorting by start time or shortest duration is not generally optimal.",
      "Weighted intervals need DP, not this greedy rule.",
      "Boundary rules for touching intervals must be defined.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Maximum non-overlapping intervals: sort by END time, then take greedily.
type Interval = { start: number; end: number; id: string };

export function schedule(intervals: Interval[]): Interval[] {
  const byEnd = [...intervals].sort((a, b) => a.end - b.end);
  const picked: Interval[] = [];
  let freeAt = -Infinity;
  for (const iv of byEnd) {
    if (iv.start >= freeAt) { picked.push(iv); freeAt = iv.end; }
  }
  return picked; // sorting by start or by duration is provably worse
}`,
    },
    usedBy: [
      {
        company: "Google",
        product: "Calendar room booking",
        usage:
          "Fitting the most meetings into a room, and detecting conflicts, is interval scheduling over booking requests.",
        href: "https://developers.google.com/workspace/calendar/api/guides/free-busy",
      },
      {
        company: "AWS",
        product: "EC2 / spot capacity reservation windows",
        usage:
          "Non-overlapping reservation windows are packed to maximise utilised capacity per host.",
      },
      {
        company: "Netflix",
        product: "Encoding job slotting",
        usage:
          "Transcoding tasks with fixed durations are packed onto workers by earliest-finish-first ordering.",
      },
    ],
    references: [
      {
        label: "Google Calendar API — free/busy and conflict detection",
        href: "https://developers.google.com/workspace/calendar/api/guides/free-busy",
      },
      {
        label: "Kleinberg & Tardos — interval scheduling (greedy stays ahead)",
        href: "https://www.cs.princeton.edu/~wayne/kleinberg-tardos/pdf/04GreedyAlgorithmsI.pdf",
      },
    ],
  },
  {
    slug: "activity-selection",
    title: "Activity Selection",
    category: "Algorithms",
    difficulty: "Beginner",
    readingTimeMin: 3,
    blurb: "Greedily choose compatible activities with equal value.",
    caption:
      "Activities with equal value reduce to interval scheduling. Pick the next activity that finishes earliest.",
    component: ActivitySelectionLab,
    skillTags: ["DSA", "Greedy"],
    concept:
      "Activity selection is the classic greedy scheduling problem: given start and finish times, choose the maximum number of mutually compatible activities. When every activity has equal value, earliest-finish-time greedy is optimal.\n\nThe problem teaches the exchange argument: replace the first activity in an optimal solution with the earliest finishing compatible one without making the solution worse.",
    complexity: [
      { operation: "After sorting", time: "O(n)", space: "O(1)" },
      { operation: "Including sort", time: "O(n log n)", space: "O(1) to O(n)" },
    ],
    realWorld: [
      "Single-machine scheduling, classroom planning, task windows, and interview scheduling.",
    ],
    pitfalls: [
      "Not suitable when activities have different profit.",
      "Requires known start/end times.",
      "Overlapping definition affects compatibility.",
    ],
    codeSnippet: {
      language: "py",
      code: `# Greedy "earliest finishing first" with an exchange-argument proof:
# any optimal solution can swap its first activity for ours without getting worse.
def select(activities):
    chosen, last_end = [], float("-inf")
    for a in sorted(activities, key=lambda a: a["end"]):
        if a["start"] >= last_end:
            chosen.append(a)
            last_end = a["end"]
    return chosen

# Weighted variant breaks the greedy proof -> needs DP with binary search.`,
    },
    usedBy: [
      {
        company: "Microsoft",
        product: "Outlook scheduling assistant",
        usage:
          "Suggested meeting slots are generated by scanning free/busy intervals and packing compatible ones.",
        href: "https://learn.microsoft.com/en-us/graph/api/user-findmeetingtimes",
      },
      {
        company: "Delta / airline operations",
        product: "Gate and runway slot assignment",
        usage:
          "Aircraft turns are assigned to gates by earliest-free ordering under fixed occupancy windows.",
      },
      {
        company: "Databricks",
        product: "Cluster job window packing",
        usage:
          "Scheduled jobs with known runtimes are packed into cluster uptime windows to reduce idle spin-up cost.",
      },
    ],
    references: [
      {
        label: "Microsoft Graph — findMeetingTimes",
        href: "https://learn.microsoft.com/en-us/graph/api/user-findmeetingtimes",
      },
      {
        label: "Greedy algorithms — exchange argument notes",
        href: "https://www.cs.princeton.edu/~wayne/kleinberg-tardos/pdf/04GreedyAlgorithmsI.pdf",
      },
    ],
  },
  {
    slug: "huffman-coding",
    title: "Huffman Coding",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "Build optimal prefix codes from character frequencies.",
    caption:
      "Merge the two lowest-frequency nodes repeatedly. Frequent symbols get shorter codes; rare symbols get longer codes.",
    component: HuffmanCodingLab,
    skillTags: ["DSA", "Compression", "Greedy"],
    concept:
      "Huffman coding constructs an optimal prefix-free binary code for known symbol frequencies. It repeatedly removes the two least frequent nodes from a priority queue, merges them, and pushes the combined node back.\n\nPrefix-free means no code is the prefix of another, so decoding is unambiguous. The greedy merge is optimal because the two least frequent symbols can safely be placed deepest as siblings.",
    complexity: [
      { operation: "Build tree", time: "O(n log n)", space: "O(n)" },
      { operation: "Encode/decode", time: "O(message bits)", space: "O(n)" },
    ],
    realWorld: ["DEFLATE/ZIP concepts, media codecs, column compression, and telemetry encoding."],
    pitfalls: [
      "Requires frequency model or two-pass input.",
      "Not adaptive unless rebuilt or updated.",
      "Arithmetic coding can compress closer to entropy.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Build the optimal prefix code: repeatedly merge the two rarest symbols.
type Node = { freq: number; sym?: string; left?: Node; right?: Node };

export function huffman(freqs: Record<string, number>): Map<string, string> {
  const heap: Node[] = Object.entries(freqs).map(([sym, freq]) => ({ sym, freq }));
  while (heap.length > 1) {
    heap.sort((a, b) => a.freq - b.freq); // a real impl uses a min-heap
    const [l, r] = heap.splice(0, 2);
    heap.push({ freq: l.freq + r.freq, left: l, right: r });
  }
  const codes = new Map<string, string>();
  const walk = (n: Node, path: string) => {
    if (n.sym !== undefined) return codes.set(n.sym, path || "0");
    walk(n.left!, path + "0");
    walk(n.right!, path + "1"); // prefix-free: symbols only live at leaves
  };
  if (heap[0]) walk(heap[0], "");
  return codes;
}`,
    },
    usedBy: [
      {
        company: "IETF / all major browsers",
        product: "HTTP/2 HPACK header compression",
        usage:
          "HPACK ships a static Huffman table for header strings, cutting request header bytes on every HTTP/2 request.",
        href: "https://datatracker.ietf.org/doc/html/rfc7541#appendix-B",
      },
      {
        company: "PNG / zlib (DEFLATE)",
        product: "gzip, PNG, ZIP",
        usage:
          "DEFLATE = LZ77 matching followed by Huffman coding of literals and lengths — the backbone of web compression.",
        href: "https://datatracker.ietf.org/doc/html/rfc1951",
      },
      {
        company: "Joint Photographic Experts Group",
        product: "JPEG entropy coding",
        usage:
          "Quantised DCT coefficients are entropy-coded with Huffman tables stored in the file header.",
        href: "https://www.w3.org/Graphics/JPEG/itu-t81.pdf",
      },
    ],
    references: [
      {
        label: "RFC 7541 — HPACK Huffman code table",
        href: "https://datatracker.ietf.org/doc/html/rfc7541#appendix-B",
      },
      {
        label: "RFC 1951 — DEFLATE compressed data format",
        href: "https://datatracker.ietf.org/doc/html/rfc1951",
      },
    ],
  },
  {
    slug: "n-queens",
    title: "N-Queens",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Backtrack through board placements with constraint pruning.",
    caption:
      "Place one queen per row and reject attacked columns or diagonals. Backtracking searches only valid partial states.",
    component: NQueensLab,
    skillTags: ["DSA", "Backtracking"],
    concept:
      "N-Queens asks for placing N queens on an N x N chessboard so no two attack each other. Backtracking places a queen row by row, maintaining used columns and diagonals. If a placement violates constraints, that branch is abandoned immediately.\n\nThe technique generalizes to constraint satisfaction: build partial solutions, prune invalid states, and backtrack when no option remains.",
    complexity: [{ operation: "Backtracking search", time: "O(N!) worst-ish", space: "O(N)" }],
    realWorld: ["Constraint solvers, scheduling, puzzle engines, and test-case generation."],
    pitfalls: [
      "Naive board scanning is slower than column/diagonal sets.",
      "Symmetric solutions can duplicate work.",
      "Backtracking still has exponential worst-case growth.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Backtracking with O(1) conflict checks via column/diagonal bitmasks.
export function countSolutions(n: number): number {
  const full = (1 << n) - 1;
  let count = 0;
  const place = (cols: number, d1: number, d2: number) => {
    if (cols === full) { count++; return; }
    let free = ~(cols | d1 | d2) & full; // candidate squares in this row
    while (free) {
      const bit = free & -free; // lowest set bit
      free ^= bit;
      place(cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1);
    }
  };
  place(0, 0, 0);
  return count; // prune early: never explore a partially invalid board
}`,
    },
    usedBy: [
      {
        company: "Google",
        product: "OR-Tools CP-SAT",
        usage:
          "N-Queens is the shipped teaching model for constraint propagation plus backtracking search in OR-Tools.",
        href: "https://developers.google.com/optimization/cp/queens",
      },
      {
        company: "Microsoft",
        product: "Z3 / SAT-style solvers",
        usage:
          "Conflict-driven search with backjumping generalises exactly this prune-on-conflict pattern.",
        href: "https://github.com/Z3Prover/z3",
      },
      {
        company: "IBM",
        product: "CPLEX CP optimizer benchmarks",
        usage:
          "Placement-under-constraints problems (VLSI, seating, timetabling) use the same feasibility search.",
      },
    ],
    references: [
      {
        label: "Google OR-Tools — the N-queens problem",
        href: "https://developers.google.com/optimization/cp/queens",
      },
      { label: "Z3 theorem prover", href: "https://github.com/Z3Prover/z3" },
    ],
  },
  {
    slug: "permutations-subsets",
    title: "Permutations & Subsets",
    category: "Algorithms",
    difficulty: "Beginner",
    readingTimeMin: 4,
    blurb: "Generate combinatorial search spaces with recursion.",
    caption:
      "Switch between include/exclude subsets and order-sensitive permutations. Both are core backtracking templates.",
    component: PermutationsSubsetsLab,
    skillTags: ["DSA", "Backtracking"],
    concept:
      "Subset generation branches on each item: include it or skip it. Permutation generation branches by choosing each remaining item for the next position. These templates are the basis for exhaustive search and many pruning algorithms.\n\nThe output size dominates runtime: there are 2^n subsets and n! permutations.",
    complexity: [
      { operation: "Generate subsets", time: "O(n 2^n)", space: "O(n)" },
      { operation: "Generate permutations", time: "O(n n!)", space: "O(n)" },
    ],
    realWorld: [
      "Feature combinations, brute-force search, puzzle solving, and small input optimization.",
    ],
    pitfalls: [
      "Output grows explosively.",
      "Duplicate input values need deduping rules.",
      "Mutable path arrays must be copied at output time.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Subsets via bitmask enumeration — 2^n combinations.
function subsets<T>(xs: T[]): T[][] {
  const out: T[][] = [];
  for (let mask = 0; mask < 1 << xs.length; mask++) {
    out.push(xs.filter((_, i) => mask & (1 << i)));
  }
  return out;
}

// Permutations via backtracking with an in-place swap.
function permute<T>(xs: T[], k = 0, out: T[][] = []): T[][] {
  if (k === xs.length) return (out.push([...xs]), out);
  for (let i = k; i < xs.length; i++) {
    [xs[k], xs[i]] = [xs[i], xs[k]];
    permute(xs, k + 1, out);
    [xs[k], xs[i]] = [xs[i], xs[k]]; // undo
  }
  return out;
}`,
    },
    usedBy: [
      {
        company: "Optimizely / experimentation platforms",
        product: "Feature-flag combination testing",
        usage:
          "Multivariate experiments enumerate the subset/permutation space of variants before pruning to a testable set.",
      },
      {
        company: "Netflix",
        product: "Chaos experiment matrices",
        usage:
          "Failure-injection suites enumerate combinations of failing dependencies to find the ones that break the request path.",
        href: "https://netflixtechblog.com/tagged/chaos-engineering",
      },
      {
        company: "Meta",
        product: "Property-based / fuzz input generation",
        usage:
          "Systematic enumeration of small input combinations catches ordering bugs random testing misses.",
      },
    ],
    references: [
      {
        label: "Netflix Tech Blog — chaos engineering",
        href: "https://netflixtechblog.com/tagged/chaos-engineering",
      },
      {
        label: "CP-Algorithms — submask enumeration",
        href: "https://cp-algorithms.com/algebra/all-submasks.html",
      },
    ],
  },
  {
    slug: "branch-and-bound",
    title: "Branch and Bound",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Search optimization branches while pruning hopeless states.",
    caption:
      "Expand the best bound and prune branches that cannot beat the incumbent. This is exhaustive search with math-guided cuts.",
    component: BranchAndBoundLab,
    skillTags: ["DSA", "Optimization"],
    concept:
      "Branch and bound solves optimization problems by branching over decisions and computing a bound on the best possible result inside each branch. If a branch cannot beat the current best solution, it is pruned.\n\nThe quality of the bound determines performance. Strong bounds prune aggressively; weak bounds degrade toward brute force.",
    complexity: [
      { operation: "Worst case", time: "exponential", space: "depends on frontier" },
      {
        operation: "Pruned practical case",
        time: "problem/bound dependent",
        space: "problem dependent",
      },
    ],
    realWorld: [
      "Integer programming, knapsack optimization, TSP solvers, scheduling, and search planning.",
    ],
    pitfalls: [
      "A wrong bound can prune the optimal answer.",
      "Weak bounds do little work reduction.",
      "Priority frontier can grow large.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Explore the search tree, but prune any branch whose optimistic bound
// cannot beat the best solution found so far.
function branchAndBound(root: State, bound: (s: State) => number, value: (s: State) => number) {
  let best = -Infinity, bestState: State | null = null;
  const stack = [root];
  while (stack.length) {
    const s = stack.pop()!;
    if (bound(s) <= best) continue; // optimistic estimate is still worse -> prune
    if (s.isComplete) {
      const v = value(s);
      if (v > best) { best = v; bestState = s; }
      continue;
    }
    stack.push(...s.children());
  }
  return { best, bestState }; // bound quality decides whether this is fast or exponential
}`,
    },
    usedBy: [
      {
        company: "Google",
        product: "OR-Tools routing & MIP solvers",
        usage:
          "Vehicle routing and mixed-integer models are solved by branch-and-bound over LP relaxations.",
        href: "https://developers.google.com/optimization/routing",
      },
      {
        company: "Gurobi / IBM CPLEX",
        product: "Commercial MIP solvers",
        usage:
          "Branch-and-cut (bound + cutting planes) is the industry-standard exact method for supply-chain and scheduling models.",
        href: "https://www.gurobi.com/resources/mixed-integer-programming-mip-a-primer-on-the-basics/",
      },
      {
        company: "Bitcoin Core",
        product: "Coin selection",
        usage:
          "The wallet runs a bounded branch-and-bound search for an exact-match input set before falling back to random selection.",
        href: "https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp",
      },
    ],
    references: [
      {
        label: "Gurobi — MIP basics (branch and bound)",
        href: "https://www.gurobi.com/resources/mixed-integer-programming-mip-a-primer-on-the-basics/",
      },
      {
        label: "Google OR-Tools — routing solver",
        href: "https://developers.google.com/optimization/routing",
      },
    ],
  },
  {
    slug: "merge-sort-recursion",
    title: "Merge Sort Recursion",
    category: "Algorithms",
    difficulty: "Beginner",
    readingTimeMin: 4,
    blurb: "Divide arrays into halves, then merge sorted halves.",
    caption:
      "Split down to singletons, then merge back into sorted order. Merge sort is the canonical divide-and-conquer algorithm.",
    component: MergeSortRecursionLab,
    skillTags: ["DSA", "Divide and Conquer"],
    concept:
      "Merge sort divides an array into halves until each piece has one element, then merges sorted halves back together. The divide phase creates log n levels, and each level performs O(n) total merge work.\n\nIt guarantees O(n log n), is stable, and adapts well to linked lists and external sorting because merging is sequential.",
    complexity: [
      { operation: "Sort", time: "O(n log n)", space: "O(n)" },
      { operation: "Merge two sorted arrays", time: "O(n)", space: "O(n)" },
    ],
    realWorld: [
      "Stable sorting, external merge sort, linked-list sorting, and distributed sort pipelines.",
    ],
    pitfalls: [
      "Needs extra memory for arrays.",
      "Recursive allocation can be costly if not optimized.",
      "Small arrays are often faster with insertion sort.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Divide and conquer: T(n) = 2T(n/2) + O(n) => O(n log n), stable.
export function mergeSort(xs: number[]): number[] {
  if (xs.length <= 1) return xs;
  const mid = xs.length >> 1;
  const left = mergeSort(xs.slice(0, mid));
  const right = mergeSort(xs.slice(mid));
  const out: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    out.push(left[i] <= right[j] ? left[i++] : right[j++]); // <= keeps it stable
  }
  return out.concat(left.slice(i), right.slice(j));
}`,
    },
    usedBy: [
      {
        company: "Python Software Foundation",
        product: "Timsort merge phase",
        usage:
          "Timsort is an adaptive merge sort: natural runs are merged with galloping mode instead of blind halving.",
        href: "https://github.com/python/cpython/blob/main/Objects/listsort.txt",
      },
      {
        company: "Google",
        product: "MapReduce / BigQuery shuffle merges",
        usage:
          "Distributed sorts merge sorted partitions across machines — merge sort where each half lives on a different node.",
        href: "https://research.google/pubs/pub62/",
      },
      {
        company: "Elastic",
        product: "Lucene segment merges",
        usage:
          "Sorted postings from multiple segments are merged into a larger sorted segment during background merges.",
        href: "https://lucene.apache.org/core/9_9_0/core/org/apache/lucene/index/MergePolicy.html",
      },
    ],
    references: [
      {
        label: "CPython — listsort.txt (adaptive merging)",
        href: "https://github.com/python/cpython/blob/main/Objects/listsort.txt",
      },
      {
        label: "Lucene — MergePolicy",
        href: "https://lucene.apache.org/core/9_9_0/core/org/apache/lucene/index/MergePolicy.html",
      },
    ],
  },
  {
    slug: "oidc-flow",
    title: "OAuth 2.0 / OIDC Flow",
    category: "Security",
    difficulty: "Advanced",
    readingTimeMin: 6,
    blurb: "Authz-code + PKCE, replay attack, tampered verifier — step by step.",
    caption:
      "Animate the OIDC dance between a browser, client app, authz server (Ory Hydra-style), and resource server. Swap scenarios to see why PKCE matters and how a replayed code gets rejected.",
    whereUsed: { label: "Auth stack at Tech Holding", href: "/#experience" },
    component: OIDCFlow,
    skillTags: ["Security", "System Design"],
    concept:
      "OAuth 2.0 grants delegated access to resources; OIDC layers identity (who is the user) on top via the id_token. The Authorization Code flow is the recommended grant for both web and SPAs — combined with PKCE (Proof Key for Code Exchange) for public clients that can't keep a secret.\n\nPKCE works by having the client generate a random code_verifier, hashing it (S256) into a code_challenge sent to the authz server. When exchanging the auth code for tokens, the client must present the original verifier. An attacker who intercepts the auth code can't redeem it without the verifier — even if they capture the redirect.\n\nOther safeguards: state parameter (CSRF), nonce (id_token replay), short-lived access tokens, refresh-token rotation, audience binding, JWKS-based signature validation.",
    realWorld: [
      "Google, Microsoft, Apple, Okta, Auth0, Ory Hydra — all standard OIDC providers.",
      "All major browsers' WebAuthn/passkey flows ride on top of OIDC.",
      "Most B2B SaaS uses OIDC for SSO instead of legacy SAML.",
    ],
    pitfalls: [
      "Implicit flow is deprecated — never use it for new code.",
      "Validating the id_token signature is non-optional; never trust the JSON without verifying with the JWKS.",
      "Refresh tokens stored in localStorage are XSS-exposed — use httpOnly cookies or BFF pattern.",
    ],
    references: [
      { label: "RFC 6749 — OAuth 2.0", href: "https://datatracker.ietf.org/doc/html/rfc6749" },
      { label: "RFC 7636 — PKCE", href: "https://datatracker.ietf.org/doc/html/rfc7636" },
      {
        label: "OpenID Connect Core 1.0",
        href: "https://openid.net/specs/openid-connect-core-1_0.html",
      },
    ],
    codeSnippet: {
      language: "ts",
      code: `// Authorization Code + PKCE — the only browser-safe OAuth flow today.
const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
const challenge = base64url(await crypto.subtle.digest("SHA-256", enc(verifier)));
sessionStorage.setItem("pkce_verifier", verifier);

location.href = \`\${issuer}/authorize?\` + new URLSearchParams({
  response_type: "code",
  client_id: clientId,
  redirect_uri: redirectUri,
  scope: "openid profile email",
  state: crypto.randomUUID(),        // CSRF binding, verify on return
  nonce: crypto.randomUUID(),        // replay binding, must match the id_token
  code_challenge: challenge,
  code_challenge_method: "S256",
});

// On the callback: exchange the one-time code for tokens with the verifier.
await fetch(\`\${issuer}/token\`, {
  method: "POST",
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code, redirect_uri: redirectUri, client_id: clientId,
    code_verifier: sessionStorage.getItem("pkce_verifier")!,
  }),
});`,
    },
    usedBy: [
      {
        company: "Google",
        product: "Sign in with Google",
        usage:
          "Google's identity platform is an OIDC provider; the id_token is a signed JWT verified against its published JWKS.",
        href: "https://developers.google.com/identity/openid-connect/openid-connect",
      },
      {
        company: "Okta / Auth0",
        product: "Enterprise SSO",
        usage:
          "Auth0 and Okta ship Authorization Code + PKCE as the default for SPAs and native apps, with the implicit flow deprecated.",
        href: "https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce",
      },
      {
        company: "Microsoft",
        product: "Entra ID (Azure AD)",
        usage:
          "Microsoft 365 sign-in issues OIDC id_tokens plus scoped access tokens for Graph API calls.",
        href: "https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc",
      },
      {
        company: "GitHub",
        product: "Actions OIDC to cloud providers",
        usage:
          "Workflows exchange a short-lived OIDC token for cloud credentials, removing long-lived secrets from CI.",
        href: "https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect",
      },
    ],
  },
  {
    slug: "message-queue",
    title: "Distributed Message Queue",
    category: "Distributed Systems",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "Kafka-style Pub/Sub with partitions and consumer lag.",
    caption:
      "Publish events to a topic. Messages are partitioned and processed asynchronously by a consumer group. Watch out for consumer lag if you publish too fast!",
    component: MessageQueue,
    skillTags: ["System Design", "Distributed Systems", "Kafka"],
    concept:
      "A distributed log (Kafka, Pulsar, Kinesis) is a partitioned, append-only commit log per topic. Producers append to a partition; consumers track their own offset. This decouples producers from consumers — they don't need to be online at the same time, and consumers can replay history.\n\nPartitioning is the unit of parallelism: each partition is consumed by exactly one member of a consumer group. Within a partition, ordering is guaranteed; across partitions, it isn't. The partitioning key (often user_id) decides which partition a message lands in — pick it carefully because skewed keys mean hot partitions.\n\nConsumer lag (= producer offset − consumer offset) is the canonical health metric. Steady lag = matched throughput. Growing lag = consumers can't keep up; scale out, batch more, or shed load.",
    realWorld: [
      "Kafka — LinkedIn's original use case; now powers most event-driven backends.",
      "AWS Kinesis, GCP Pub/Sub, Azure Event Hubs — managed equivalents.",
      "Redis Streams, NATS JetStream — lighter-weight alternatives for smaller scales.",
      "Database CDC: Debezium streams Postgres/MySQL changes into Kafka.",
    ],
    pitfalls: [
      "Hot partitions from skewed keys — monitor per-partition byte rate.",
      "Auto-commit can lose messages if a consumer crashes mid-batch — prefer manual commit after side effects succeed.",
      "Re-partitioning is painful (Kafka doesn't move data) — over-partition early.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Consumer contract that survives redelivery: idempotency + explicit ack.
async function handle(msg: { id: string; body: unknown; attempt: number }) {
  const claimed = await store.claimOnce(msg.id); // dedupe key, e.g. UNIQUE(message_id)
  if (!claimed) return ack(msg);                 // already processed -> at-least-once is fine
  try {
    await doWork(msg.body);
    await ack(msg);
  } catch (err) {
    await store.releaseClaim(msg.id);
    if (msg.attempt >= 5) return deadLetter(msg, err); // stop poisoning the queue
    await nack(msg, { backoffMs: 2 ** msg.attempt * 250 });
  }
}`,
    },
    usedBy: [
      {
        company: "Amazon",
        product: "AWS SQS / SNS",
        usage:
          "Standard queues are at-least-once with visibility timeouts and dead-letter queues; FIFO queues add ordering and dedupe ids.",
        href: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-basic-architecture.html",
      },
      {
        company: "LinkedIn",
        product: "Apache Kafka",
        usage:
          "Kafka was built at LinkedIn as a partitioned commit log: consumers track offsets, so replay and fan-out are cheap.",
        href: "https://kafka.apache.org/documentation/#design",
      },
      {
        company: "Stripe",
        product: "Webhook delivery",
        usage:
          "Events are queued and retried with exponential backoff, and consumers are told to key on the event id because delivery is at-least-once.",
        href: "https://docs.stripe.com/webhooks",
      },
      {
        company: "Uber",
        product: "Cadence / Temporal workflows",
        usage:
          "Task queues plus durable timers turn multi-step business flows into retryable, replayable state machines.",
        href: "https://www.uber.com/blog/cadence-multi-tenant-workflow-sys/",
      },
    ],
    references: [
      {
        label: "Kafka — design (log, offsets, delivery semantics)",
        href: "https://kafka.apache.org/documentation/#design",
      },
      {
        label: "Stripe — webhook retries and idempotency",
        href: "https://docs.stripe.com/webhooks",
      },
    ],
  },
  {
    slug: "merkle-tree",
    title: "Merkle Tree",
    category: "Data Structures",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Data integrity via cryptographic hashes.",
    caption:
      "Mutate a data block (leaf node) to see its hash change. Watch how the invalidation bubbles up the tree, changing the Root Hash. Used in Git, Blockchain, and DynamoDB.",
    component: MerkleTree,
    skillTags: ["System Design", "Security"],
    concept:
      "A Merkle tree is a binary tree where each leaf is the hash of a data block, and each internal node is the hash of the concatenation of its children's hashes. The single root hash uniquely fingerprints the entire dataset.\n\nThe magic: to prove a single block is part of the dataset, you only need O(log n) sibling hashes — a Merkle proof. To detect any tampering, you re-hash the changed block; the change cascades up to a different root.\n\nThis enables efficient verification in adversarial settings (blockchains, content-addressed storage) and efficient sync in distributed systems (compare roots; if they differ, descend into the differing subtree to find the diverging block).",
    complexity: [
      { operation: "Build", time: "O(n)", space: "O(n)" },
      { operation: "Membership proof", time: "O(log n)", space: "O(log n)" },
      { operation: "Update one leaf", time: "O(log n)", space: "O(1)" },
    ],
    realWorld: [
      "Git — every commit/tree/blob is content-addressed by SHA-1/SHA-256 hash.",
      "Bitcoin / Ethereum — every block header contains a Merkle root over its transactions.",
      "DynamoDB / Cassandra — Merkle trees for anti-entropy: detect divergent replicas with O(log n) comparisons.",
      "IPFS, BitTorrent v2 — content addressing and partial verification.",
    ],
    references: [
      {
        label: "Ralph Merkle — original 1979 paper",
        href: "https://www.merkle.com/papers/Thesis1979.pdf",
      },
    ],
    codeSnippet: {
      language: "ts",
      code: `// Hash pairs upward; the root commits to every leaf.
import { createHash } from "node:crypto";
const h = (s: string) => createHash("sha256").update(s).digest("hex");

export function merkleRoot(leaves: string[]): string {
  let level = leaves.map(h);
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(h(level[i] + (level[i + 1] ?? level[i]))); // duplicate odd tail
    }
    level = next;
  }
  return level[0] ?? h("");
}

// A proof is the sibling hash per level: O(log n) data verifies one leaf.
export function verify(leaf: string, proof: { hash: string; right: boolean }[], root: string) {
  return proof.reduce((acc, p) => h(p.right ? acc + p.hash : p.hash + acc), h(leaf)) === root;
}`,
    },
    pitfalls: [
      "Duplicating an odd trailing leaf (the Bitcoin CVE-2012-2459 pattern) can let two different leaf sets produce the same root — domain-separate leaf and internal hashes.",
      "A root only proves inclusion, never absence; you need a sorted/sparse Merkle variant for non-membership proofs.",
      "Verifying a proof without pinning the expected root against a trusted source proves nothing.",
      "Rebuilding the whole tree on every write is O(n); production stores keep incremental subtree hashes.",
    ],
    usedBy: [
      {
        company: "Git / Linux Foundation",
        product: "Commit & tree objects",
        usage:
          "Every commit hash covers the whole tree of contents, which is why a rewritten history changes every downstream hash.",
        href: "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects",
      },
      {
        company: "Apache Cassandra / Amazon DynamoDB",
        product: "Anti-entropy repair",
        usage:
          "Replicas exchange Merkle trees to find the few diverging ranges instead of streaming entire partitions.",
        href: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
      },
      {
        company: "Google",
        product: "Certificate Transparency logs",
        usage:
          "Append-only Merkle logs let anyone verify a certificate was logged and that the log was never rewritten.",
        href: "https://certificate.transparency.dev/howctworks/",
      },
      {
        company: "Bitcoin / Ethereum",
        product: "Block transaction roots",
        usage:
          "Light clients verify a transaction is in a block with a logarithmic proof instead of downloading the block.",
        href: "https://developer.bitcoin.org/reference/block_chain.html",
      },
    ],
  },
  // ─── New labs ────────────────────────────────────────────────────────────
  {
    slug: "consistent-hashing",
    title: "Consistent Hashing",
    category: "Distributed Systems",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "Add/remove nodes and remap only ~K/N keys.",
    caption:
      "Toggle nodes on/off and watch how consistent hashing remaps only a small fraction of keys, while naive `hash % N` would remap nearly everything — the difference between a graceful degradation and a cache stampede.",
    whereUsed: { label: "Cache & sharding work", href: "/#projects" },
    component: ConsistentHashLab,
    skillTags: ["Distributed Systems", "System Design", "Redis"],
    concept:
      "Consistent hashing solves a sharding problem: when you add or remove a node, how do you avoid remapping every key? With naive `hash(key) % N`, a single node change shuffles ~all keys. With consistent hashing, a key remapping is bounded to ~K/N keys.\n\nThe trick: hash both keys and nodes onto a circular ring (typically 0 to 2^32). A key is owned by the next node clockwise. Adding a node steals only the slice between it and the previous node; removing a node hands its slice to the next clockwise node.\n\nReal implementations use 'virtual nodes' (each physical node owns hundreds of points on the ring) to smooth out load and reduce variance. Without vnodes, a single hot node can dominate.",
    complexity: [
      { operation: "Lookup", time: "O(log V)", space: "O(V)" },
      { operation: "Add/remove node", time: "O(K/N) keys remapped", space: "O(V/N)" },
    ],
    codeSnippet: {
      language: "ts",
      code: `class ConsistentHash {
  private ring: { angle: number; node: string }[] = [];
  constructor(nodes: string[], private vnodes = 100) {
    for (const n of nodes) this.addNode(n);
  }
  addNode(n: string) {
    for (let v = 0; v < this.vnodes; v++) {
      this.ring.push({ angle: hash(\`\${n}#\${v}\`), node: n });
    }
    this.ring.sort((a, b) => a.angle - b.angle);
  }
  lookup(key: string): string {
    const a = hash(key);
    // binary search for first angle >= a, wrap around if needed
    for (const v of this.ring) if (v.angle >= a) return v.node;
    return this.ring[0].node;
  }
}`,
    },
    realWorld: [
      "Amazon DynamoDB — ring-based partitioning across nodes.",
      "Apache Cassandra — Murmur3-partitioner on a 64-bit token ring.",
      "Memcached client libraries (ketama).",
      "Akka Cluster Sharding.",
    ],
    pitfalls: [
      "Skip vnodes and you'll get hot spots — load variance scales as 1/√V.",
      "Don't use a weak hash like simple modulo of node names — clustering wrecks load balance.",
      "Re-balancing requires moving data — plan for the I/O burst when scaling.",
    ],
    references: [
      {
        label: "Karger et al. — Consistent Hashing (1997)",
        href: "https://dl.acm.org/doi/10.1145/258533.258660",
      },
      {
        label: "DynamoDB paper",
        href: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
      },
    ],
    usedBy: [
      {
        company: "Amazon",
        product: "DynamoDB / Dynamo partitioning",
        usage:
          "The original Dynamo paper introduced virtual nodes on a hash ring so adding a node moves only its share of keys.",
        href: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
      },
      {
        company: "Discord",
        product: "Gateway / guild sharding",
        usage:
          "Consistent hashing routes each guild to a node so a deploy or scale-up doesn't reshuffle every live connection.",
        href: "https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users",
      },
      {
        company: "Cloudflare",
        product: "Load balancing to origins & cache tiers",
        usage:
          "Ring hashing keeps a given cache key pinned to the same edge server so hit rates survive membership changes.",
        href: "https://blog.cloudflare.com/improving-origin-performance-for-everyone-with-orpheus-and-tiered-cache/",
      },
      {
        company: "Apache Cassandra",
        product: "Token ring placement",
        usage:
          "Each node owns token ranges on a ring; replicas are the next N nodes clockwise from the key's token.",
        href: "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html",
      },
    ],
  },
  {
    slug: "rate-limiter",
    title: "Rate Limiter Showdown",
    category: "Distributed Systems",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "Token Bucket vs Leaky Bucket vs Fixed Window vs Sliding Log.",
    caption:
      "Fire single requests or 20-request bursts. Watch how each rate-limiter strategy responds — the same traffic, four different verdicts. Pick the one that matches your tolerance for bursts vs smoothness.",
    component: RateLimiterLab,
    skillTags: ["System Design", "Distributed Systems"],
    concept:
      "Rate limiting protects a service from being overwhelmed. The four common strategies trade bursts vs smoothness vs memory:\n\n• Token Bucket — tokens refill at a steady rate up to a cap; each request consumes one. Allows bursts up to the cap. Used by Stripe, AWS, GCP.\n• Leaky Bucket — requests enter a FIFO queue that drains at a fixed rate. Smooths output; excess overflows. Common in network shapers.\n• Fixed Window — count requests per N-second window; reset on tick. Simple but allows 2× burst at the window boundary.\n• Sliding Log/Window — track request timestamps and only count those in the last N seconds. Most accurate, costs memory per request.\n\nDistributed rate limiting (across a cluster) usually centralizes counters in Redis (INCR + EXPIRE) or uses a probabilistic approximation per node.",
    complexity: [
      { operation: "Token Bucket allow?", time: "O(1)", space: "O(1) per key" },
      { operation: "Sliding Log allow?", time: "O(log N)", space: "O(N) per key" },
    ],
    codeSnippet: {
      language: "ts",
      code: `class TokenBucket {
  private tokens: number;
  private last = Date.now();
  constructor(private capacity: number, private refillPerSec: number) {
    this.tokens = capacity;
  }
  allow(): boolean {
    const now = Date.now();
    const dt = (now - this.last) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + dt * this.refillPerSec);
    this.last = now;
    if (this.tokens >= 1) { this.tokens -= 1; return true; }
    return false; // 429
  }
}`,
    },
    realWorld: [
      "Stripe API: token-bucket per API key, 100 req/s with burst.",
      "AWS API Gateway: token-bucket with regional quotas.",
      "Cloudflare: sliding-window per zone + token-bucket per IP.",
      "Linux tc (traffic control): leaky-bucket-style token bucket filter (TBF).",
    ],
    pitfalls: [
      "Fixed window allows up to 2× the limit at the window boundary — switch to sliding for strict caps.",
      "Distributed rate limiting on Redis without Lua scripts can race — use atomic INCRBY + TTL.",
      "Per-IP limits can be defeated by NAT/CGNAT — combine with per-account where possible.",
    ],
    usedBy: [
      {
        company: "Stripe",
        product: "API rate limiting",
        usage:
          "Stripe runs multiple limiter types (request-rate, concurrency, fleet-usage load shedders) built on token buckets in Redis.",
        href: "https://stripe.com/blog/rate-limiters",
      },
      {
        company: "GitHub",
        product: "REST & GraphQL API quotas",
        usage:
          "Primary and secondary limits are exposed via x-ratelimit headers so clients can back off before being blocked.",
        href: "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
      },
      {
        company: "Cloudflare",
        product: "Rate limiting rules at the edge",
        usage:
          "Counters are evaluated per-colo at the edge so abusive traffic is dropped before it reaches the origin.",
        href: "https://developers.cloudflare.com/waf/rate-limiting-rules/",
      },
      {
        company: "Google",
        product: "Cloud APIs quota & Envoy token buckets",
        usage:
          "Service meshes enforce per-client token buckets so one noisy tenant cannot exhaust shared capacity.",
        href: "https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/local_rate_limit_filter",
      },
    ],
    references: [
      {
        label: "Stripe — scaling your API with rate limiters",
        href: "https://stripe.com/blog/rate-limiters",
      },
      {
        label: "GitHub — REST API rate limits",
        href: "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
      },
      {
        label: "RFC 6585 — 429 Too Many Requests",
        href: "https://datatracker.ietf.org/doc/html/rfc6585#section-4",
      },
    ],
  },
  {
    slug: "btree-index",
    title: "B-Tree Index",
    category: "Data Structures",
    difficulty: "Advanced",
    readingTimeMin: 6,
    blurb: "Insert keys and watch nodes split — Postgres-style.",
    caption:
      "Insert keys into a B-tree of order 4 and watch nodes split as they fill. Lookup any key to compare against a naive table scan — this is exactly how Postgres and MySQL turn O(n) into O(log n).",
    component: BTreeIndexLab,
    skillTags: ["DSA", "Postgres", "System Design"],
    concept:
      "A B-tree (or B+ tree) is a self-balancing search tree where each node holds many keys instead of just one. This is critical for storage engines: a node fits inside a single disk page (~4KB-16KB), so each level of the tree is one disk read.\n\nWith a fanout of 100+, a B-tree of 100 million rows is only 4 levels deep — meaning a row lookup costs ~4 disk reads. A binary tree at the same scale would be 27+ levels deep.\n\nWhen a node fills (more than `order` keys), it splits in half and pushes the median key up to the parent. The tree grows at the root, never the leaves, which is why B-trees stay balanced. B+ trees (the variant Postgres and MySQL use) keep all data in leaf nodes and link the leaves into a sorted list, making range scans O(log n + k) instead of O((log n) × k).",
    complexity: [
      { operation: "Search", time: "O(log_b n)", space: "O(1)" },
      { operation: "Insert", time: "O(log_b n)", space: "O(log_b n) splits" },
      { operation: "Range scan (B+)", time: "O(log_b n + k)", space: "O(1)" },
    ],
    codeSnippet: {
      language: "sql",
      code: `-- Postgres: every PRIMARY KEY and UNIQUE constraint
-- is backed by a B-tree index. You can also create them explicitly:
CREATE INDEX users_email_idx ON users (email);

-- Compound index supports prefix queries
CREATE INDEX orders_user_date_idx ON orders (user_id, created_at);

-- Use EXPLAIN to see the planner pick the index
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'jainil@example.com';
-- Index Scan using users_email_idx  (cost=0.43..8.45 rows=1)`,
    },
    realWorld: [
      "PostgreSQL — default index type. B+ tree with 8KB pages.",
      "MySQL InnoDB — clustered B+ tree on the primary key (the table is the index).",
      "SQLite, Oracle, SQL Server — all default to B-trees.",
      "LSM-trees (RocksDB, Cassandra, ScyllaDB) are the alternative for write-heavy workloads.",
    ],
    pitfalls: [
      "Indexes speed reads but slow writes — every INSERT/UPDATE rewrites every affected index.",
      "Composite index (a, b, c) helps WHERE a=… and WHERE a=… AND b=… but NOT WHERE b=… alone.",
      "Index bloat from updates — VACUUM or REINDEX periodically on Postgres.",
      "High-cardinality indexes work great; low-cardinality (boolean) often don't help vs full scan.",
    ],
    usedBy: [
      {
        company: "PostgreSQL",
        product: "btree / covering indexes",
        usage:
          "Default indexes are Lehman-Yao B+trees; INCLUDE columns enable index-only scans that never touch the heap.",
        href: "https://www.postgresql.org/docs/current/indexes-index-only-scans.html",
      },
      {
        company: "Oracle / MySQL",
        product: "InnoDB clustered + secondary indexes",
        usage:
          "Rows live in the primary-key tree, so a secondary index lookup costs an extra primary-key traversal.",
        href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html",
      },
      {
        company: "MongoDB",
        product: "Compound index prefix rules",
        usage:
          "A compound index serves queries that use a left prefix of its keys — the same ordering constraint as SQL engines.",
        href: "https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/",
      },
      {
        company: "SQLite",
        product: "Query planner index selection",
        usage:
          "SQLite's documented planner rules show exactly when a B-tree index can satisfy WHERE plus ORDER BY.",
        href: "https://www.sqlite.org/queryplanner.html",
      },
    ],
    references: [
      {
        label: "PostgreSQL — index-only scans and covering indexes",
        href: "https://www.postgresql.org/docs/current/indexes-index-only-scans.html",
      },
      { label: "SQLite — the query planner", href: "https://www.sqlite.org/queryplanner.html" },
    ],
  },
  {
    slug: "graph-traversal",
    title: "BFS vs DFS",
    category: "Algorithms",
    difficulty: "Beginner",
    readingTimeMin: 4,
    blurb: "Same graph, two strategies — Queue vs Stack.",
    caption:
      "Step through BFS and DFS on identical graphs. Watch the queue (FIFO) explore in layers and the stack (LIFO) plunge depth-first. The shape of the frontier is everything.",
    component: GraphTraversalLab,
    skillTags: ["DSA"],
    concept:
      "BFS (Breadth-First Search) explores layer by layer using a queue. It finds the shortest path in an unweighted graph — the first time you reach a node, you've reached it through the fewest edges.\n\nDFS (Depth-First Search) plunges as deep as possible before backtracking, using a stack (or recursion). It's the right tool for cycle detection, topological sort, finding connected components, and any problem where you need to enumerate paths or do tree-shaped recursion.\n\nBoth are O(V + E) time, O(V) space. The difference is the data structure — and that's why they're often the first interview question after arrays: they teach how a tiny choice (queue vs stack) reshapes the entire algorithm's behavior.",
    complexity: [
      { operation: "BFS", time: "O(V + E)", space: "O(V) queue" },
      { operation: "DFS", time: "O(V + E)", space: "O(V) stack/recursion" },
    ],
    codeSnippet: {
      language: "ts",
      code: `function bfs(start: string, adj: Map<string, string[]>) {
  const visited = new Set<string>([start]);
  const queue = [start];
  while (queue.length) {
    const node = queue.shift()!; // FIFO
    for (const nb of adj.get(node) ?? []) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
    }
  }
  return visited;
}

function dfs(start: string, adj: Map<string, string[]>) {
  const visited = new Set<string>([start]);
  const stack = [start];
  while (stack.length) {
    const node = stack.pop()!; // LIFO
    for (const nb of adj.get(node) ?? []) {
      if (!visited.has(nb)) { visited.add(nb); stack.push(nb); }
    }
  }
  return visited;
}`,
    },
    realWorld: [
      "BFS — web crawlers (politeness layer), shortest-path in unweighted graphs, social-network 'degrees of separation'.",
      "DFS — topological sort (build systems, npm install order), cycle detection (deadlock detection!), maze solving.",
      "Garbage collectors mark phase: typically DFS to keep stack small.",
    ],
    pitfalls: [
      "DFS recursion blows the stack on deep graphs — convert to iterative DFS with explicit stack.",
      "Never forget to mark visited at enqueue time (BFS), not dequeue — otherwise a node can be enqueued many times.",
    ],
    usedBy: [
      {
        company: "Meta",
        product: "Friends-of-friends / degrees of separation",
        usage:
          'BFS over the social graph with early termination powers mutual-friend counts and "people you may know" candidate generation.',
        href: "https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/",
      },
      {
        company: "LinkedIn",
        product: "1st / 2nd / 3rd degree connection badges",
        usage:
          "Every profile view runs a bounded breadth-first distance query against the connection graph.",
        href: "https://engineering.linkedin.com/blog",
      },
      {
        company: "Google",
        product: "Crawler frontier",
        usage:
          "Web crawling is a prioritised breadth-first walk over discovered links with dedupe on visited URLs.",
        href: "http://infolab.stanford.edu/~backrub/google.html",
      },
    ],
    references: [
      {
        label: "Meta Engineering — TAO graph store",
        href: "https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/",
      },
      {
        label: "CP-Algorithms — BFS and DFS",
        href: "https://cp-algorithms.com/graph/breadth-first-search.html",
      },
    ],
  },
  {
    slug: "cap-theorem",
    title: "CAP Theorem",
    category: "Distributed Systems",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Pick CP or AP — partition is non-negotiable.",
    caption:
      "Trigger a network partition between two halves of a 3-node cluster. Pick CP (refuse writes on the minority) or AP (accept writes, diverge). Then heal the partition and watch conflict resolution.",
    component: CapTheoremLab,
    skillTags: ["Distributed Systems", "System Design"],
    concept:
      "CAP says: in the presence of a network Partition, a distributed system must choose between Consistency and Availability. You can't have all three.\n\nCP systems (etcd, Spanner, Mongo with majority writes) refuse writes on the minority side of a partition — guaranteeing that any successful read returns the most recent write. The cost: minority partitions become read-only or fully unavailable.\n\nAP systems (Cassandra, DynamoDB with eventual consistency, Riak) accept writes on both sides during a partition, then reconcile when the partition heals — using strategies like last-write-wins, vector clocks, or CRDTs. The cost: reads can return stale data, and conflict resolution can lose writes.\n\nCAP is about partitions specifically. The day-to-day trade-off is closer to PACELC: when there's a Partition, choose A or C; Else, choose Latency or Consistency.",
    realWorld: [
      "CP — etcd, ZooKeeper, Consul, Google Spanner, MongoDB (majority).",
      "AP — Cassandra, DynamoDB (default), Riak, CouchDB, Redis Cluster (with quirks).",
      "CRDTs — used in collaborative editing (Figma, Notion, Yjs) to give AP without losing writes.",
    ],
    pitfalls: [
      "'My DB is CA' is a confused statement — partitions are a fact of networking, not a choice.",
      "Eventual consistency works only if your application can tolerate stale reads — money rarely can.",
      "Last-write-wins silently loses concurrent updates — vector clocks or CRDTs surface conflicts.",
    ],
    references: [
      {
        label: "Eric Brewer — CAP Theorem (2000 keynote, 2012 retrospective)",
        href: "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/",
      },
    ],
    codeSnippet: {
      language: "sql",
      code: `-- CAP is a per-operation choice, not a per-database label.
-- Cassandra: pick your side of the tradeoff per query.

-- CP-leaning: refuse to answer unless a quorum agrees.
CONSISTENCY QUORUM;
SELECT balance FROM accounts WHERE id = 42;

-- AP-leaning: answer from whatever replica is reachable.
CONSISTENCY ONE;
SELECT last_seen FROM presence WHERE user_id = 42;

-- Read + write quorums overlap when R + W > RF, which is how
-- an AP-capable store gives you strong reads when you need them.`,
    },
    usedBy: [
      {
        company: "Amazon",
        product: "DynamoDB eventual vs strongly consistent reads",
        usage:
          "The API exposes the tradeoff directly: strongly consistent reads cost more and are unavailable during some partitions.",
        href: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html",
      },
      {
        company: "Google",
        product: "Spanner (CP with TrueTime)",
        usage:
          "Spanner chooses consistency and uses synchronised clocks to keep availability high in practice, not by escaping CAP.",
        href: "https://research.google/pubs/pub39966/",
      },
      {
        company: "CNCF",
        product: "etcd / Kubernetes control plane",
        usage:
          "etcd is CP: on a partition the minority side stops accepting writes rather than serving stale cluster state.",
        href: "https://etcd.io/docs/latest/learning/api_guarantees/",
      },
      {
        company: "Apache Cassandra",
        product: "Tunable consistency levels",
        usage:
          "ONE / QUORUM / ALL per statement is CAP as a runtime dial rather than a design-time decision.",
        href: "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html",
      },
    ],
  },
  {
    slug: "deadlock",
    title: "Dining Philosophers — Deadlock",
    category: "Distributed Systems",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "5 philosophers, 5 forks, one classic deadlock.",
    caption:
      "Run the naive strategy and watch all 5 philosophers grab the left fork → instant deadlock. Switch to resource ordering or asymmetric and watch them eat. The wait-for graph never closes a cycle.",
    component: DeadlockLab,
    skillTags: ["DSA", "System Design", "Distributed Systems"],
    concept:
      "Dijkstra's Dining Philosophers problem is the canonical concurrency parable. Five philosophers sit around a table; between each pair is one fork. Each needs both adjacent forks to eat. If everyone grabs their left fork at the same time, everyone waits forever for their right — a perfect circular wait, the textbook deadlock.\n\nDeadlock requires four conditions (Coffman, 1971): mutual exclusion, hold-and-wait, no preemption, and a circular wait. Break any one and you can't deadlock.\n\nClassic fixes: (1) global resource ordering — always grab the lower-numbered fork first, breaking the circular wait; (2) asymmetric solution — one philosopher reverses their order; (3) try-and-back-off with random retry (livelock risk!); (4) waiter/arbitrator mediates fork access.\n\nReal systems hit this constantly: database transactions waiting on row locks, distributed locks across services, even goroutine channel sends.",
    realWorld: [
      "Postgres deadlock detector — runs every deadlock_timeout (1s default), aborts one transaction.",
      "MySQL InnoDB — same; SHOW ENGINE INNODB STATUS shows the last detected cycle.",
      "JVM thread dumps — jstack flags 'Found one Java-level deadlock' with the cycle.",
      "Distributed locks (Redlock, ZooKeeper) — careful lock ordering across services.",
    ],
    pitfalls: [
      "Random back-off can become livelock — both retry, both back off, both retry…",
      "Lock ordering only works if all callers know the order — one rogue path = deadlock returns.",
      "Holding a transaction open across user input is the #1 way to deadlock a database in production.",
    ],
    references: [
      {
        label: "Coffman et al. — System Deadlocks (1971)",
        href: "https://dl.acm.org/doi/10.1145/356586.356588",
      },
    ],
    codeSnippet: {
      language: "sql",
      code: `-- Classic deadlock: two transactions lock the same rows in opposite order.
-- tx A                                  -- tx B
BEGIN;                                    BEGIN;
UPDATE accounts SET bal = bal - 10        UPDATE accounts SET bal = bal - 5
  WHERE id = 1;                             WHERE id = 2;
UPDATE accounts SET bal = bal + 10        UPDATE accounts SET bal = bal + 5
  WHERE id = 2;  -- waits for B             WHERE id = 1;  -- waits for A  => cycle

-- Fixes, in order of preference:
--   1. always lock rows in a deterministic order (e.g. ORDER BY id)
--   2. keep transactions short and touch fewer rows
--   3. set a lock timeout and retry the victim transaction
SET lock_timeout = '2s';`,
    },
    usedBy: [
      {
        company: "Oracle",
        product: "MySQL InnoDB deadlock detector",
        usage:
          "InnoDB maintains a wait-for graph, detects cycles, and rolls back the transaction with the fewest changes.",
        href: "https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlock-detection.html",
      },
      {
        company: "PostgreSQL",
        product: "deadlock_timeout detection",
        usage:
          "Postgres waits deadlock_timeout, then checks the lock graph and aborts one transaction with a detailed error.",
        href: "https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS",
      },
      {
        company: "Microsoft",
        product: "SQL Server deadlock graphs",
        usage:
          "Extended Events capture the deadlock graph so teams can see which statements locked resources in conflicting order.",
        href: "https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide",
      },
      {
        company: "Go project",
        product: 'Runtime "all goroutines are asleep" detector',
        usage:
          "Go panics on total deadlock, surfacing circular channel waits that would otherwise hang silently.",
        href: "https://go.dev/ref/mem",
      },
    ],
  },
  {
    slug: "gossip-protocol",
    title: "Gossip Protocol",
    category: "Distributed Systems",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Epidemic state dissemination.",
    caption:
      "A cluster of nodes spreads state like a virus. Adjust the fanout and watch how a single update infects the entire network in O(log N) steps. Perfect for decentralized systems without a single point of failure.",
    component: GossipProtocol,
    skillTags: ["Distributed Systems", "System Design"],
    concept:
      "Gossip protocols (or epidemic protocols) are a family of decentralized communication patterns inspired by the way social gossip or viruses spread. In a cluster, each node periodically picks a random peer and 'gossips' its latest state. \n\nThe beauty of gossip is its resilience: it requires no central coordinator, and even if half the network fails, the message will still eventually reach every surviving node. It converges in O(log N) rounds, where N is the number of nodes. \n\nModern systems use gossip for failure detection (detecting when a node goes down), membership (knowing who is in the cluster), and metadata synchronization.",
    complexity: [
      { operation: "Convergence", time: "O(log N)", space: "O(1) local state" },
      { operation: "Message Load", time: "O(1) per node per tick", space: "O(fanout)" },
    ],
    realWorld: [
      "Apache Cassandra: uses gossip for cluster membership and failure detection.",
      "HashiCorp Consul: uses the Serf library (Swim-based gossip) for health checking.",
      "Amazon S3: spreads bucket metadata across thousands of nodes using gossip.",
      "Bitcoin: nodes discover peers and announce new transactions via gossip.",
    ],
    pitfalls: [
      "High fanout = faster convergence but higher network bandwidth usage.",
      "Network partitions can cause 'split brain' if not combined with a consensus layer.",
      "Zombie nodes: if a node is silent for too long, it's hard to distinguish 'dead' from 'partitioned'.",
    ],
    references: [
      {
        label: "SWIM: Scalable Weakly-consistent Infection-style Process Group Membership",
        href: "https://www.cs.cornell.edu/projects/Quicksilver/public_pdfs/SWIM.pdf",
      },
    ],
    codeSnippet: {
      language: "ts",
      code: `// Each node periodically pushes its view to a few random peers.
// Information spreads in O(log N) rounds without any coordinator.
setInterval(() => {
  const peers = pickRandom(members, 3); // fanout
  for (const peer of peers) {
    send(peer, { heartbeats: myView, incarnation: myIncarnation });
  }
}, 1000);

function onGossip(msg: { heartbeats: Map<string, number> }) {
  for (const [node, counter] of msg.heartbeats) {
    if (counter > (myView.get(node) ?? -1)) {
      myView.set(node, counter);       // take the fresher heartbeat
      lastSeen.set(node, Date.now());
    }
  }
  for (const [node, at] of lastSeen) {
    if (Date.now() - at > suspectTimeout) markSuspect(node); // SWIM-style suspicion
  }
}`,
    },
    usedBy: [
      {
        company: "HashiCorp",
        product: "Consul / Serf (SWIM gossip)",
        usage:
          "Membership, failure detection and event broadcast run over a SWIM-based gossip layer instead of a central registry.",
        href: "https://www.serf.io/docs/internals/gossip.html",
      },
      {
        company: "Apache Cassandra",
        product: "Cluster membership & schema propagation",
        usage:
          "Nodes gossip state once per second so topology and schema changes converge without a master.",
        href: "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html",
      },
      {
        company: "Amazon",
        product: "Dynamo-style ring membership",
        usage:
          "The Dynamo paper uses gossip for membership and failure detection to avoid a single coordination point.",
        href: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
      },
      {
        company: "Redis",
        product: "Redis Cluster bus",
        usage:
          "The cluster bus gossips node health and slot ownership; failover starts when enough nodes mark a master as failing.",
        href: "https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/",
      },
    ],
  },
  {
    slug: "distributed-tx",
    title: "Saga vs 2PC",
    category: "Distributed Systems",
    difficulty: "Advanced",
    readingTimeMin: 6,
    blurb: "2-Phase Commit vs Eventual Sagas.",
    caption:
      "Simulate a cross-service purchase. Compare the rigid lock-step of 2PC (Two-Phase Commit) with the flexible, compensating-transaction model of Sagas. Inject failures and watch how each system recovers — or fails.",
    component: DistributedTx,
    skillTags: ["Distributed Systems", "Microservices"],
    concept:
      "Atomic transactions are easy in a single database, but across microservices, you must choose between Strong Consistency (2PC) and Eventual Consistency (Saga).\n\n2PC (Two-Phase Commit) uses a coordinator to ask all participants to 'prepare' (lock resources), then 'commit'. It guarantees atomicity but is blocking and fragile: if the coordinator or a node fails during the lock phase, the system stalls.\n\nSagas break a transaction into a sequence of local transactions. Each step has a corresponding 'compensating transaction' (undo). If step 3 fails, the Saga runs the undo actions for steps 2 and 1. It scales better and doesn't hold locks, but allows 'interleaving' where other users might see partially complete state.",
    complexity: [
      { operation: "2PC Latency", time: "2 RTTs + Locks", space: "O(N) locks" },
      { operation: "Saga Latency", time: "N local TXs", space: "O(N) log storage" },
    ],
    realWorld: [
      "Bank Transfers: legacy systems often use 2PC/XA for strong atomicity.",
      "Uber/Lyft: Sagas manage the ride-request → payment → driver-dispatch flow.",
      "Booking.com: Sagas handle flight + hotel + car rental bundles.",
      "Temporal / Zeebe: Workflow engines designed specifically to manage long-running Sagas.",
    ],
    pitfalls: [
      "Saga steps must be idempotent because undos/retries will happen.",
      "2PC scales poorly beyond a few nodes due to the blocking 'prepare' phase.",
      "Lack of isolation in Sagas means you need 'semantic locks' or careful business logic to handle concurrent updates.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Saga: local transactions + compensations instead of a global lock.
const steps = [
  { do: reserveInventory, undo: releaseInventory },
  { do: chargeCard,       undo: refundCard },
  { do: createShipment,   undo: cancelShipment },
];

async function runSaga(order: Order) {
  const done: typeof steps = [];
  try {
    for (const step of steps) {
      await step.do(order); // each step commits locally and is idempotent
      done.push(step);
    }
  } catch (err) {
    for (const step of done.reverse()) await step.undo(order); // compensate backwards
    throw err;
  }
}
// 2PC gives atomicity but blocks on coordinator failure; sagas stay available
// and pay for it with temporary, visible inconsistency.`,
    },
    usedBy: [
      {
        company: "Uber",
        product: "Cadence / Temporal workflows",
        usage:
          "Long-running business transactions are expressed as durable workflows with explicit compensation activities.",
        href: "https://www.uber.com/blog/cadence-multi-tenant-workflow-sys/",
      },
      {
        company: "Amazon",
        product: "AWS Step Functions saga pattern",
        usage:
          "AWS documents the saga pattern with Step Functions for order/booking flows spanning multiple services.",
        href: "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html",
      },
      {
        company: "Stripe",
        product: "Idempotent payment operations",
        usage:
          "Idempotency keys make each step in a payment flow safely retryable, which is what makes compensation-based flows workable.",
        href: "https://docs.stripe.com/api/idempotent_requests",
      },
      {
        company: "Google",
        product: "Spanner distributed commits",
        usage:
          "Spanner does run two-phase commit across Paxos groups — with TrueTime bounding the uncertainty window.",
        href: "https://research.google/pubs/pub39966/",
      },
    ],
    references: [
      {
        label: "Gray & Lamport — Consensus on transaction commit (Paxos Commit)",
        href: "https://www.microsoft.com/en-us/research/publication/consensus-on-transaction-commit/",
      },
      {
        label: "Temporal — durable execution as an alternative to 2PC",
        href: "https://docs.temporal.io/temporal",
      },
      {
        label: "Microsoft — Saga distributed transactions pattern",
        href: "https://learn.microsoft.com/en-us/azure/architecture/patterns/saga",
      },
    ],
  },
  {
    slug: "snowflake-id",
    title: "Snowflake IDs",
    category: "Distributed Systems",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "K-ordered unique IDs at scale.",
    caption:
      "Generate IDs that are unique across thousands of machines without a central database. Deconstruct the 64-bit ID into its components: Timestamp, Worker ID, and Sequence number. Fast, sorted, and collision-free.",
    component: SnowflakeId,
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
  },
  {
    slug: "vector-clocks",
    title: "Vector Clocks",
    category: "Distributed Systems",
    difficulty: "Advanced",
    readingTimeMin: 6,
    blurb: "Detecting causality and conflicts.",
    caption:
      "Witness how distributed systems track time without a central clock. Trigger events on different nodes and watch the vectors grow. Detect 'happened-before' relationships and identify concurrent write conflicts (siblings).",
    component: VectorClocks,
    skillTags: ["Distributed Systems", "System Design"],
    concept:
      "In a distributed system, there is no single 'now'. Physical clocks drift, making them unreliable for ordering events. Vector clocks are a logical clock mechanism used to determine the partial ordering of events and detect causality violations.\n\nEach node maintains a vector of counters (one for every node in the cluster). When a node performs an internal event, it increments its own counter. When it sends a message, it includes its vector. The receiver updates its vector by taking the element-wise maximum. \n\nIf vector A is strictly less than vector B, then A 'happened before' B. If neither is less than the other, the events happened concurrently, and we have a conflict that requires resolution (e.g., Last-Write-Wins or application-side merging).",
    complexity: [
      { operation: "Update", time: "O(1)", space: "O(N) where N = nodes" },
      { operation: "Compare", time: "O(N)", space: "—" },
    ],
    realWorld: [
      "Amazon Dynamo: the original paper popularized vector clocks for conflict detection.",
      "Riak: a distributed NoSQL DB that uses vector clocks (and later Dotted Version Vectors).",
      "Voldemort: LinkedIn's distributed key-value store.",
    ],
    pitfalls: [
      "Vector size grows linearly with the number of nodes. In large clusters, vectors can become massive ('Vector Clock Bloat').",
      "Pruning: to save space, systems eventually prune old counters, which can rarely lead to false conflict detections.",
    ],
    references: [
      {
        label: "Leslie Lamport — Time, Clocks, and the Ordering of Events (1978)",
        href: "https://lamport.azurewebsites.net/pubs/time-clocks.pdf",
      },
      {
        label: "Dynamo: Amazon’s Highly Available Key-value Store",
        href: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
      },
    ],
    codeSnippet: {
      language: "ts",
      code: `type Clock = Record<string, number>; // node -> counter

const onLocalEvent = (c: Clock, self: string): Clock => ({ ...c, [self]: (c[self] ?? 0) + 1 });

const onReceive = (mine: Clock, theirs: Clock, self: string): Clock => {
  const merged: Clock = { ...mine };
  for (const [node, n] of Object.entries(theirs)) merged[node] = Math.max(merged[node] ?? 0, n);
  merged[self] = (merged[self] ?? 0) + 1;
  return merged;
};

// a happened-before b iff every entry of a <= b and at least one is strictly <.
function compare(a: Clock, b: Clock): "before" | "after" | "concurrent" {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let lt = false, gt = false;
  for (const k of keys) {
    const x = a[k] ?? 0, y = b[k] ?? 0;
    if (x < y) lt = true;
    if (x > y) gt = true;
  }
  return lt && gt ? "concurrent" : lt ? "before" : "after"; // concurrent -> conflict to resolve
}`,
    },
    usedBy: [
      {
        company: "Amazon",
        product: "Dynamo shopping cart",
        usage:
          "Dynamo used vector clocks to detect concurrent cart writes and surfaced siblings to the application to merge.",
        href: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
      },
      {
        company: "Riak / Basho",
        product: "Dotted version vectors",
        usage:
          "Riak refined vector clocks into dotted version vectors to keep causality metadata from growing without bound.",
        href: "https://docs.riak.com/riak/kv/latest/learn/concepts/causal-context/index.html",
      },
      {
        company: "Figma",
        product: "Multiplayer conflict resolution",
        usage:
          "Concurrent edits are detected by causal metadata and resolved by documented merge rules rather than last-write-wins guesses.",
        href: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
      },
      {
        company: "Apache Cassandra",
        product: "Timestamp-based LWW (the contrast)",
        usage:
          "Cassandra deliberately chose wall-clock last-write-wins, which is why clock skew can silently drop a concurrent write.",
        href: "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html",
      },
    ],
  },
  {
    slug: "lsm-tree",
    title: "LSM Tree",
    category: "Data Structures",
    difficulty: "Advanced",
    readingTimeMin: 6,
    blurb: "Write-optimized storage engine.",
    caption:
      "Experience the high-throughput engine behind NoSQL. Watch as writes are buffered in a MemTable, flushed to immutable SSTables, and eventually merged through background compaction. Fast writes, at the cost of background I/O.",
    component: LSMTree,
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
  },
  {
    slug: "hyperloglog",
    title: "HyperLogLog",
    category: "Data Structures",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Probabilistic cardinality estimation.",
    caption:
      "Count 10 million unique items using only 1.5KB of memory. Watch the 'buckets' record the maximum number of leading zeros in hashed values to estimate cardinality with a ~1% error rate. Space-efficiency at its peak.",
    component: HyperLogLog,
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
  },
  {
    slug: "quadtree",
    title: "QuadTree / GeoSpatial",
    category: "Data Structures",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "2D spatial partitioning.",
    caption:
      "Efficiently find points in a 2D area. Watch the space recursively subdivide into four quadrants as more points are added. Perfect for collision detection, map markers, and image compression.",
    component: QuadTreeLab,
    skillTags: ["DSA", "Graphics", "GeoSpatial"],
    concept:
      "A QuadTree is a spatial data structure used to partition a two-dimensional space by recursively subdividing it into four quadrants (Northwest, Northeast, Southwest, Southeast). \n\nInstead of checking every point in the world (O(N)), a QuadTree allows you to prune entire branches of the search tree that don't overlap with your query area. This turns a global search into an O(log N) operation.\n\nIt is the 2D equivalent of an Octree (3D) and is a foundational structure for game engines, geographic information systems (GIS), and sparse data representations.",
    complexity: [
      { operation: "Insert", time: "O(log N) avg, O(N) worst", space: "O(N)" },
      { operation: "Range Query", time: "O(K + log N)", space: "O(log N) stack" },
    ],
    realWorld: [
      "Game Engines: for broad-phase collision detection between entities.",
      "Map Rendering: to efficiently determine which markers are visible on the current screen zoom.",
      "Image Compression: regions with uniform color are represented by larger nodes.",
    ],
    pitfalls: [
      "Degenerate cases: if many points are at the exact same coordinate, the tree can become extremely deep. Most implementations set a 'Max Depth'.",
      "Dynamic objects: if objects move constantly, re-inserting them into the QuadTree every frame can be expensive.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Recursively split space into 4 quadrants; leaves hold at most \`cap\` points.
interface Box { x: number; y: number; w: number; h: number }
class QuadTree {
  points: { x: number; y: number }[] = [];
  kids: QuadTree[] = [];
  constructor(private box: Box, private cap = 4) {}
  insert(p: { x: number; y: number }): boolean {
    if (!contains(this.box, p)) return false;
    if (this.kids.length === 0 && this.points.length < this.cap) {
      this.points.push(p);
      return true;
    }
    if (this.kids.length === 0) this.split();
    return this.kids.some((k) => k.insert(p));
  }
  private split() {
    const { x, y, w, h } = this.box;
    const [hw, hh] = [w / 2, h / 2];
    this.kids = [
      new QuadTree({ x, y, w: hw, h: hh }, this.cap),
      new QuadTree({ x: x + hw, y, w: hw, h: hh }, this.cap),
      new QuadTree({ x, y: y + hh, w: hw, h: hh }, this.cap),
      new QuadTree({ x: x + hw, y: y + hh, w: hw, h: hh }, this.cap),
    ];
    this.points.splice(0).forEach((p) => this.insert(p));
  }
}
const contains = (b: Box, p: { x: number; y: number }) =>
  p.x >= b.x && p.x < b.x + b.w && p.y >= b.y && p.y < b.y + b.h;`,
    },
    usedBy: [
      {
        company: "Uber",
        product: "H3 spatial index (hex grid)",
        usage:
          'Uber indexes the world with a hierarchical cell system so "drivers near me" is a cell lookup, not a distance scan over everyone.',
        href: "https://www.uber.com/blog/h3/",
      },
      {
        company: "Google",
        product: "S2 geometry / Maps tiling",
        usage:
          "S2 recursively subdivides the sphere into cells, the same hierarchical-space idea used for map tiles and region queries.",
        href: "http://s2geometry.io/",
      },
      {
        company: "PostgreSQL / PostGIS",
        product: "Spatial indexes",
        usage:
          "R-tree/GiST spatial indexes prune bounding boxes so range and nearest-neighbour queries touch few rows.",
        href: "https://postgis.net/workshops/postgis-intro/indexing.html",
      },
    ],
    references: [
      {
        label: "Uber Engineering — H3 hexagonal hierarchical spatial index",
        href: "https://www.uber.com/blog/h3/",
      },
      { label: "S2 Geometry — hierarchical cell decomposition", href: "http://s2geometry.io/" },
    ],
  },
  {
    slug: "skip-list",
    title: "Skip List",
    category: "Data Structures",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Probabilistic search structure.",
    caption:
      "A linked list that acts like a balanced tree. Use 'express lanes' (higher levels) to skip large sections of data. Watch the coin-flip decide the height of each node during insertion. The simplicity of a list with the speed of a tree.",
    component: SkipList,
    skillTags: ["DSA", "Redis"],
    concept:
      "A Skip List is a probabilistic data structure that provides the same O(log N) search and insertion complexity as a balanced binary tree (like an AVL or Red-Black tree), but with a much simpler implementation based on linked lists.\n\nIt consists of multiple layers. The bottom layer is a standard sorted linked list. Each higher layer acts as an 'express lane' for the lists below. To find a value, you start at the top level and 'skip' forward until you would overshoot, then drop down a level.\n\nInsertion height is determined randomly (usually a 50% chance to grow a level), which statistically ensures that the layers maintain the proper density for O(log N) performance.",
    complexity: [
      { operation: "Search", time: "O(log N) avg", space: "O(N) avg" },
      { operation: "Insert", time: "O(log N) avg", space: "O(1) per node" },
    ],
    realWorld: [
      "Redis: the internal structure for `Sorted Sets` (ZSET).",
      "LevelDB / RocksDB: the implementation used for the in-memory MemTable.",
      "Lucene: used for some parts of the inverted index.",
    ],
    pitfalls: [
      "Worst-case performance is O(N) if the coin flips are extremely unlucky (all nodes height 1), though the probability is infinitesimally small.",
      "Pointer overhead: the multiple levels of pointers consume more memory than a compact array-based structure.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Probabilistic layered linked list: expected O(log n) search, no rotations.
function randomLevel(maxLevel = 16, p = 0.5) {
  let lvl = 1;
  while (Math.random() < p && lvl < maxLevel) lvl++;
  return lvl; // coin flips replace rebalancing logic
}

interface SkipNode { key: number; next: (SkipNode | undefined)[] }

function search(head: SkipNode, key: number): SkipNode | undefined {
  let node: SkipNode | undefined = head;
  for (let lvl = head.next.length - 1; lvl >= 0; lvl--) {
    while (node?.next[lvl] && node.next[lvl]!.key < key) node = node.next[lvl];
  }
  const cand = node?.next[0];
  return cand?.key === key ? cand : undefined;
}`,
    },
    usedBy: [
      {
        company: "Redis",
        product: "Sorted sets (ZSET / ZRANGEBYSCORE)",
        usage:
          "Redis backs sorted sets with a skip list plus a hash map, giving ranked leaderboards with O(log n) rank queries.",
        href: "https://redis.io/docs/latest/develop/data-types/sorted-sets/",
      },
      {
        company: "Apache Software Foundation",
        product: "HBase / Cassandra memtables",
        usage:
          "Concurrent skip lists keep in-memory writes sorted before flushing them to immutable SSTables.",
        href: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentSkipListMap.html",
      },
      {
        company: "MongoDB / WiredTiger",
        product: "In-memory update lists",
        usage:
          "Skip lists provide lock-friendly ordered inserts for concurrent writers without tree rotations.",
      },
    ],
    references: [
      {
        label: "Redis docs — Sorted sets (skiplist encoding)",
        href: "https://redis.io/docs/latest/develop/data-types/sorted-sets/",
      },
      {
        label: "Pugh (1990) — Skip lists: a probabilistic alternative to balanced trees",
        href: "https://dl.acm.org/doi/10.1145/78973.78977",
      },
    ],
  },
  {
    slug: "trie",
    title: "Trie (Prefix Tree)",
    category: "Data Structures",
    difficulty: "Beginner",
    readingTimeMin: 3,
    blurb: "The engine of autocomplete.",
    caption:
      "Store and search strings by their common prefixes. Watch as words like 'CAT' and 'CART' share the same initial nodes. Perfect for dictionaries, IP routing, and predictive text.",
    component: TrieLab,
    skillTags: ["DSA", "Strings"],
    concept:
      "A Trie (from 'retrieval') is a tree-based data structure used for storing a set of strings where each node represents a single character. Words with common prefixes share the same path from the root.\n\nUnlike a hash map, a Trie allows for efficient prefix-based queries ('find all words starting with 'tra''). Searching for a word of length L takes O(L) time, regardless of how many millions of words are in the Trie.\n\nWhile space-intensive for small sets, Tries become very efficient as the overlap between strings increases.",
    complexity: [
      { operation: "Insert", time: "O(L) where L = length", space: "O(L * alphabet_size)" },
      { operation: "Search", time: "O(L)", space: "O(1)" },
      { operation: "Prefix Search", time: "O(L + K) where K = matches", space: "O(1)" },
    ],
    realWorld: [
      "Search Engines: for 'as-you-type' suggestions (autocomplete).",
      "IP Routing: Longest Prefix Match (LPM) in network routers.",
      "T9 Predictive Text: on older mobile phones.",
      "Spell Checkers: for identifying valid word completions.",
    ],
    pitfalls: [
      "High Memory: for large datasets with little prefix overlap, a Trie can use much more memory than a sorted list or hash set. Use a **Radix Tree** (compressed Trie) to solve this.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Prefix tree: lookup cost depends on key length, not dictionary size.
class TrieNode {
  children = new Map<string, TrieNode>();
  terminal = false;
  top: string[] = []; // cached best completions for this prefix
}

function insert(root: TrieNode, word: string) {
  let node = root;
  for (const ch of word) {
    if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
    node = node.children.get(ch)!;
  }
  node.terminal = true;
}

function complete(root: TrieNode, prefix: string): string[] {
  let node: TrieNode | undefined = root;
  for (const ch of prefix) node = node?.children.get(ch);
  return node?.top ?? []; // precomputed top-k keeps typeahead O(len(prefix))
}`,
    },
    usedBy: [
      {
        company: "Google",
        product: "Search autocomplete",
        usage:
          "Prefix structures with precomputed top completions are how a suggestion list returns within a keystroke budget.",
        href: "https://blog.google/products/search/how-google-autocomplete-works-search/",
      },
      {
        company: "Elastic",
        product: "Elasticsearch completion suggester (FST)",
        usage:
          "Lucene stores the term dictionary as a finite state transducer — a compressed trie — for prefix and fuzzy lookups.",
        href: "https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html",
      },
      {
        company: "Cloudflare / router vendors",
        product: "IP routing tables (radix trie)",
        usage: "Longest-prefix-match forwarding uses a compressed radix trie over address bits.",
        href: "https://datatracker.ietf.org/doc/html/rfc1519",
      },
    ],
    references: [
      {
        label: "Elasticsearch — suggesters (FST-backed completion)",
        href: "https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html",
      },
      {
        label: "Google — how autocomplete works",
        href: "https://blog.google/products/search/how-google-autocomplete-works-search/",
      },
    ],
  },
  {
    slug: "astar-search",
    title: "A* Search",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "Heuristic-based pathfinding.",
    caption:
      "Find the optimal path with intelligence. Compare A* to Dijkstra and watch how the heuristic (distance to goal) guides the search, pruning thousands of unnecessary explorations. The standard for game AI and GPS.",
    component: AStarSearch,
    skillTags: ["DSA", "AI"],
    concept:
      "A* is an extension of Dijkstra's algorithm that uses a heuristic to guide its search. While Dijkstra explores in all directions equally (circularly), A* prioritizes nodes that 'look' closer to the goal.\n\nIt uses the function `f(n) = g(n) + h(n)`:\n- `g(n)`: the actual cost from the start to node `n`.\n- `h(n)`: the estimated cost from `n` to the goal (the heuristic).\n\nIf the heuristic is **admissible** (it never overestimates the cost), A* is guaranteed to find the shortest path while exploring far fewer nodes than Dijkstra.",
    complexity: [{ operation: "Search", time: "O(E) worst case", space: "O(V)" }],
    realWorld: [
      "Video Games: for NPC movement and navigation meshes.",
      "Google Maps: as a base for routing (often with contraction hierarchies).",
      "Robotics: for motion planning in known environments.",
    ],
    pitfalls: [
      "Bad Heuristics: if your heuristic is not admissible, A* might find a sub-optimal path. If it's not consistent, it might be slower than Dijkstra.",
      "Memory: Like Dijkstra, A* keeps all visited nodes in memory, which can be an issue for massive graphs.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// A* = Dijkstra + heuristic. f(n) = g(n) + h(n).
// h must be admissible (never overestimate) or the path may be suboptimal.
function astar(start: string, goal: string, neighbors: (n: string) => [string, number][], h: (n: string) => number) {
  const open = new Map<string, number>([[start, h(start)]]); // node -> f
  const g = new Map([[start, 0]]);
  const cameFrom = new Map<string, string>();
  while (open.size) {
    const [node] = [...open.entries()].sort((a, b) => a[1] - b[1])[0]; // use a heap
    if (node === goal) return reconstruct(cameFrom, node);
    open.delete(node);
    for (const [next, w] of neighbors(node)) {
      const tentative = g.get(node)! + w;
      if (tentative < (g.get(next) ?? Infinity)) {
        g.set(next, tentative);
        cameFrom.set(next, node);
        open.set(next, tentative + h(next));
      }
    }
  }
  return null;
}`,
    },
    usedBy: [
      {
        company: "Google",
        product: "Maps route planning",
        usage:
          "Goal-directed search with geographic heuristics (plus contraction hierarchies) makes continent-scale routing interactive.",
        href: "https://research.google/pubs/pub41336/",
      },
      {
        company: "Blizzard / Unity",
        product: "Game NPC pathfinding",
        usage:
          "A* over navmeshes or tile grids is the default pathfinder in game engines and middleware.",
        href: "https://docs.unity3d.com/Manual/nav-InnerWorkings.html",
      },
      {
        company: "Amazon Robotics",
        product: "Warehouse robot routing",
        usage:
          "Floor robots plan collision-aware paths with heuristic search under time-window constraints.",
      },
    ],
    references: [
      {
        label:
          "Hart, Nilsson & Raphael (1968) — A formal basis for heuristic determination of minimum cost paths",
        href: "https://ieeexplore.ieee.org/document/4082128",
      },
      {
        label: "Unity — navigation and pathfinding internals",
        href: "https://docs.unity3d.com/Manual/nav-InnerWorkings.html",
      },
    ],
  },
  {
    slug: "pagerank",
    title: "PageRank",
    category: "Algorithms",
    difficulty: "Advanced",
    readingTimeMin: 6,
    blurb: "The logic of influence.",
    caption:
      "See the web through Google's original lens. Watch 'authority' flow between nodes via links. Adjust the damping factor and watch how the most connected and influential pages rise to the top of the rankings.",
    component: PageRankLab,
    skillTags: ["Algorithms", "Graphs", "Data Science"],
    concept:
      "PageRank is the algorithm that launched Google. it measures the importance of website pages by treating links as votes. A page is important if many other pages link to it, especially if those linking pages are themselves important.\n\nIt works via a 'random surfer' model: a user clicks random links, and occasionally jumps to a random page (the **Damping Factor**, usually 0.85). The PageRank of a node is the probability that the surfer ends up there after many steps.\n\nMathematically, it's an eigenvector problem: we repeatedly multiply a probability vector by a transition matrix until it converges.",
    complexity: [
      { operation: "Iteration", time: "O(V + E)", space: "O(V)" },
      { operation: "Convergence", time: "Depends on graph", space: "—" },
    ],
    realWorld: [
      "Search Engines: for ranking web pages by authority.",
      "Social Networks: identifying 'influencers' or key nodes in a social graph.",
      "Bioinformatics: ranking the importance of genes or proteins in biological pathways.",
      "Recommendation Systems: predicting which products a user might like based on graph similarity.",
    ],
    pitfalls: [
      "Link Farms: groups of pages that link to each other to artificially inflate their PageRank.",
      "Dangling Nodes: nodes with no outgoing links can 'drain' the PageRank from the system if not handled with a jump factor.",
    ],
    references: [
      {
        label: "The Anatomy of a Large-Scale Hypertextual Web Search Engine (Brin & Page, 1998)",
        href: "http://infolab.stanford.edu/~backrub/google.html",
      },
    ],
    codeSnippet: {
      language: "py",
      code: `# Power iteration with a damping factor: rank flows along links.
def pagerank(out_links, d=0.85, iters=30):
    nodes = list(out_links)
    n = len(nodes)
    rank = {v: 1 / n for v in nodes}
    for _ in range(iters):
        nxt = {v: (1 - d) / n for v in nodes}          # teleport term
        dangling = sum(rank[v] for v in nodes if not out_links[v])
        for v in nodes:
            share = d * rank[v] / len(out_links[v]) if out_links[v] else 0
            for w in out_links[v]:
                nxt[w] += share
            nxt[v] += d * dangling / n                 # redistribute sinks
        rank = nxt
    return rank`,
    },
    usedBy: [
      {
        company: "Google",
        product: "Search ranking (original algorithm)",
        usage:
          "PageRank scored pages by the random-surfer probability of landing on them; it remains one signal among many today.",
        href: "http://infolab.stanford.edu/~backrub/google.html",
      },
      {
        company: "Twitter / X",
        product: 'WTF "Who to Follow" (personalised PageRank)',
        usage: "Personalised random walks over the follow graph generate account recommendations.",
        href: "https://dl.acm.org/doi/10.1145/2488388.2488433",
      },
      {
        company: "Neo4j",
        product: "Graph Data Science library",
        usage:
          "PageRank ships as a built-in centrality algorithm for influence and importance scoring in enterprise graphs.",
        href: "https://neo4j.com/docs/graph-data-science/current/algorithms/page-rank/",
      },
    ],
  },
  {
    slug: "levenshtein",
    title: "Levenshtein Distance",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Calculating the cost of change.",
    caption:
      "Find the minimum number of edits to turn one string into another. Watch the Dynamic Programming matrix fill up as it calculates the cost of Insertions, Deletions, and Substitutions. The foundation of diffing and spell-check.",
    component: LevenshteinLab,
    skillTags: ["Algorithms", "Strings", "Dynamic Programming"],
    concept:
      "Levenshtein Distance (or Edit Distance) measures the minimum number of single-character edits required to change one string into another. Edits include: Insertion, Deletion, and Substitution.\n\nIt is a classic application of **Dynamic Programming**. We build a 2D matrix where `dp[i][j]` represents the distance between the first `i` characters of string A and the first `j` characters of string B. \n\nEach cell is calculated from its neighbors: a match costs 0 + diagonal, while a mismatch costs 1 + the minimum of the three adjacent cells.",
    complexity: [
      { operation: "Compute", time: "O(M * N)", space: "O(M * N)" },
      { operation: "Optimized Space", time: "O(M * N)", space: "O(min(M, N))" },
    ],
    realWorld: [
      "Spell Checkers: suggesting the closest valid word to a typo.",
      "Git Diff: helping calculate which lines were modified.",
      "Bioinformatics: comparing DNA sequences to find mutations.",
      "NLP: fuzzy string matching for entity resolution.",
    ],
    pitfalls: [
      "Performance: O(M*N) is too slow for very long strings (e.g., full books). Use the **Wagner–Fischer** algorithm optimization or bit-parallelism for better performance.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Edit distance with a rolling row: O(n*m) time, O(min(n,m)) memory.
export function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,          // deletion
        cur[j - 1] + 1,       // insertion
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1), // substitution
      );
    }
    prev = cur;
  }
  return prev[b.length];
}`,
    },
    usedBy: [
      {
        company: "Elastic",
        product: "Elasticsearch fuzzy queries",
        usage:
          "`fuzziness: AUTO` matches terms within a Levenshtein distance using a Levenshtein automaton over the term dictionary.",
        href: "https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html",
      },
      {
        company: "Google",
        product: '"Did you mean" spelling correction',
        usage:
          "Candidate corrections are generated within a small edit distance and then re-ranked by language models and click data.",
        href: "https://blog.google/products/search/how-google-autocomplete-works-search/",
      },
      {
        company: "Git / Linux Foundation",
        product: "Command suggestions",
        usage:
          "`git: 'comit' is not a git command` suggestions come from edit distance against the known command list.",
        href: "https://git-scm.com/docs/git-config#Documentation/git-config.txt-helpautoCorrect",
      },
    ],
    references: [
      {
        label: "Elasticsearch — fuzzy query (edit distance)",
        href: "https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html",
      },
      {
        label: "Schulz & Mihov — fast string correction with Levenshtein automata",
        href: "https://link.springer.com/article/10.1007/s10032-002-0082-8",
      },
    ],
  },
  {
    slug: "rabin-karp",
    title: "Rabin-Karp",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Rolling hash string search.",
    caption:
      "Search for a needle in a haystack using math. Watch the rolling hash window slide across the text, updating its value in O(1) time. Efficiently detect pattern matches and potential collisions with cryptographic-like hashing.",
    component: RabinKarp,
    skillTags: ["Algorithms", "Strings", "Hashing"],
    concept:
      "Rabin-Karp is a string-searching algorithm that uses hashing to find any one of a set of pattern strings in a text. \n\nInstead of checking every character at every position (O(N*M)), it calculates a hash for the pattern and compares it to the hash of the current window in the text. To make this efficient, it uses a **Rolling Hash**: when the window slides, the new hash is calculated from the old hash in O(1) time by 'removing' the character that left and 'adding' the one that entered.\n\nIf the hashes match, the algorithm performs a character-by-character check to handle potential collisions.",
    complexity: [
      { operation: "Search", time: "O(N + M) average", space: "O(1)" },
      { operation: "Search (Worst)", time: "O(N * M)", space: "O(1)" },
    ],
    realWorld: [
      "Plagiarism Detection: finding identical passages across multiple documents.",
      "Intrusion Detection: searching network packets for multiple known malware signatures.",
      "Bioinformatics: finding specific gene sequences in a genome.",
    ],
    pitfalls: [
      "Hash Collisions: a bad hash function can lead to many 'spurious hits' where hashes match but strings don't, degrading performance to O(N*M).",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Rolling hash: slide the window in O(1) per step, verify only on hash hits.
export function rabinKarp(text: string, pattern: string): number[] {
  const B = 256n, M = 1_000_000_007n;
  const m = pattern.length;
  if (m === 0 || m > text.length) return [];
  let power = 1n;
  for (let i = 1; i < m; i++) power = (power * B) % M;
  const hash = (s: string, from: number) => {
    let h = 0n;
    for (let i = from; i < from + m; i++) h = (h * B + BigInt(s.charCodeAt(i))) % M;
    return h;
  };
  const target = hash(pattern, 0);
  let rolling = hash(text, 0);
  const hits: number[] = [];
  for (let i = 0; ; i++) {
    if (rolling === target && text.startsWith(pattern, i)) hits.push(i); // verify
    if (i + m >= text.length) break;
    rolling = ((rolling - BigInt(text.charCodeAt(i)) * power % M + M) % M * B + BigInt(text.charCodeAt(i + m))) % M;
  }
  return hits;
}`,
    },
    usedBy: [
      {
        company: "Dropbox",
        product: "Delta sync / block deduplication",
        usage:
          "Content-defined chunking with rolling hashes finds shifted duplicate blocks so only changed chunks upload.",
        href: "https://dropbox.tech/infrastructure/streaming-file-synchronization",
      },
      {
        company: "rsync / Samba team",
        product: "rsync delta transfer",
        usage:
          "A weak rolling checksum scans the file byte-by-byte and only strong-hashes on a match — Rabin-Karp's verify pattern.",
        href: "https://rsync.samba.org/tech_report/",
      },
      {
        company: "Turnitin / plagiarism tooling",
        product: "Document fingerprinting (winnowing)",
        usage:
          "Overlapping k-gram hashes fingerprint documents so near-duplicate passages surface without pairwise comparison.",
      },
    ],
    references: [
      {
        label: "rsync — technical report (rolling checksum)",
        href: "https://rsync.samba.org/tech_report/",
      },
      {
        label: "CP-Algorithms — string hashing / Rabin-Karp",
        href: "https://cp-algorithms.com/string/string-hashing.html",
      },
    ],
  },
  {
    slug: "jwt-anatomy",
    title: "JWT Anatomy",
    category: "Security",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Stateless auth and tampered tokens.",
    caption:
      "Deconstruct a JSON Web Token. Edit the payload and watch the signature turn red. Learn why JWTs are 'signed, not encrypted' and how to safely store user claims without a database round-trip.",
    component: JWTAnatomy,
    skillTags: ["Security", "Auth", "Backend"],
    concept:
      "A JSON Web Token (JWT) is a compact, URL-safe way to represent claims between two parties. It consists of three parts separated by dots: **Header**, **Payload**, and **Signature**.\n\n- **Header**: Contains the algorithm (e.g., HS256) and token type.\n- **Payload**: Contains the actual data (claims) like user ID or expiration time.\n- **Signature**: Used to verify that the sender is who they say they are and that the message wasn't tampered with.\n\nJWTs are usually signed with a secret (HMAC) or a public/private key pair (RSA/ECDSA). Crucially, the payload is only Base64-encoded, NOT encrypted — anyone with the token can read the data, but only those with the key can modify it without breaking the signature.",
    realWorld: [
      "Microservices: passing user identity between services without hitting a central session DB.",
      "Single Sign-On (SSO): OIDC uses JWTs as ID Tokens.",
      "Stateless Sessions: reducing DB load in high-traffic applications.",
    ],
    pitfalls: [
      "Sensitive Data: NEVER put passwords or credit card numbers in a JWT payload.",
      "The 'alg: none' attack: older libraries allowed tokens with no signature; always validate the algorithm on the server.",
      "Expiration: Stateless tokens can't be easily revoked. Use short-lived JWTs with long-lived Refresh Tokens.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Verification is the whole security model — decoding is not verifying.
import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(new URL(\`\${issuer}/.well-known/jwks.json\`));

const { payload } = await jwtVerify(token, jwks, {
  issuer,                       // iss must match your IdP
  audience: clientId,           // aud must be *your* app
  algorithms: ["RS256"],        // pin algs: never accept "none" or alg confusion
  clockTolerance: "5s",
});

// payload.exp / nbf are checked by the library; revocation is not —
// short TTLs plus a refresh token (or a deny-list) are how you log someone out.`,
    },
    usedBy: [
      {
        company: "Auth0 / Okta",
        product: "Access & id tokens",
        usage:
          "Tokens are RS256-signed JWTs verified against a rotating JWKS endpoint rather than a shared secret.",
        href: "https://auth0.com/docs/secure/tokens/json-web-tokens",
      },
      {
        company: "Supabase / Firebase",
        product: "Row-level security claims",
        usage:
          "The JWT's claims are passed into database policies, so authorization is enforced in Postgres rather than app code.",
        href: "https://supabase.com/docs/guides/database/postgres/row-level-security",
      },
      {
        company: "CNCF",
        product: "Kubernetes service account tokens",
        usage:
          "Projected service-account tokens are audience-scoped, time-bound JWTs validated by the API server.",
        href: "https://kubernetes.io/docs/concepts/security/service-accounts/",
      },
      {
        company: "Stripe",
        product: "Connect / embedded session tokens",
        usage:
          "Short-lived signed tokens scope a client session to specific accounts and permissions.",
        href: "https://docs.stripe.com/connect",
      },
    ],
    references: [
      { label: "RFC 7519 — JSON Web Token", href: "https://datatracker.ietf.org/doc/html/rfc7519" },
      {
        label: "RFC 8725 — JWT best current practices (alg confusion, none)",
        href: "https://datatracker.ietf.org/doc/html/rfc8725",
      },
    ],
  },
  {
    slug: "tls-handshake",
    title: "TLS Handshake",
    category: "Security",
    difficulty: "Advanced",
    readingTimeMin: 6,
    blurb: "The foundation of HTTPS.",
    caption:
      "Watch the 5-step dance that secures the internet. Animate the exchange of certificates, the Diffie-Hellman key agreement, and the transition from slow asymmetric encryption to fast, shared symmetric keys.",
    component: TLSHandshake,
    skillTags: ["Security", "Networking", "HTTPS"],
    concept:
      "Transport Layer Security (TLS) is the protocol that provides privacy and data integrity between two communicating applications. It is the 'S' in HTTPS.\n\nThe 'Handshake' is the initial negotiation where the client and server:\n1. Agree on the TLS version and cipher suites.\n2. Authenticate the server via its Certificate (and optionally the client).\n3. Establish a **Shared Session Key** using asymmetric encryption (RSA or Diffie-Hellman).\n\nOnce the handshake is complete, all further communication is encrypted using fast **Symmetric Encryption** (like AES) with the shared key established during the handshake.",
    realWorld: [
      "Every HTTPS website you visit.",
      "Secure Email (IMAPS, SMTPS).",
      "VPNs (OpenVPN, WireGuard).",
      "Database connections (SQL over TLS).",
    ],
    pitfalls: [
      "Certificate Pinning: can be brittle and break if certificates are rotated unexpectedly.",
      "Downgrade Attacks: attackers might try to force the connection to an older, insecure version like TLS 1.0 or SSL 3.0.",
    ],
    references: [
      {
        label: "RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3",
        href: "https://datatracker.ietf.org/doc/html/rfc8446",
      },
    ],
    codeSnippet: {
      language: "go",
      code: `// TLS 1.3: one round trip. ClientHello already carries a key share.
cfg := &tls.Config{
    MinVersion: tls.VersionTLS13,      // no downgrade to legacy suites
    ServerName: "api.example.com",     // SNI + certificate hostname check
    CurvePreferences: []tls.CurveID{tls.X25519},
}
conn, err := tls.Dial("tcp", "api.example.com:443", cfg)
// state.HandshakeComplete, state.CipherSuite, state.PeerCertificates[0]
state := conn.ConnectionState()

// Flow: ClientHello(key_share) -> ServerHello(key_share) + EncryptedExtensions
//       + Certificate + CertificateVerify + Finished -> Finished.
// Forward secrecy comes from the ephemeral ECDHE key, not the certificate.`,
    },
    usedBy: [
      {
        company: "Cloudflare",
        product: "TLS 1.3 & Encrypted Client Hello at the edge",
        usage:
          "Cloudflare drove TLS 1.3 deployment and publishes measurements of handshake latency and 0-RTT tradeoffs.",
        href: "https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/",
      },
      {
        company: "Google",
        product: "Chrome / QUIC & HTTP/3",
        usage:
          "QUIC embeds the TLS 1.3 handshake into the transport, so connection setup and encryption complete together.",
        href: "https://datatracker.ietf.org/doc/html/rfc9001",
      },
      {
        company: "Let's Encrypt / ISRG",
        product: "ACME certificate issuance",
        usage:
          "Automated 90-day certificates are what made universal HTTPS (and the certificate chain in every handshake) practical.",
        href: "https://letsencrypt.org/how-it-works/",
      },
      {
        company: "Apple",
        product: "App Transport Security",
        usage:
          "iOS requires TLS with modern ciphers by default, forcing app backends onto forward-secret suites.",
        href: "https://developer.apple.com/documentation/security/preventing-insecure-network-connections",
      },
    ],
  },
  {
    slug: "cors-lab",
    title: "CORS",
    category: "Security",
    difficulty: "Beginner",
    readingTimeMin: 4,
    blurb: "Origins and Preflights.",
    caption:
      "Demystify the most common web error. Simulate requests between different domains, watch the browser trigger 'Preflight' OPTIONS requests, and learn how to configure your headers to safely share resources.",
    component: CORSLab,
    skillTags: ["Security", "Web Development", "Backend"],
    concept:
      "Cross-Origin Resource Sharing (CORS) is a browser security mechanism that allows or restricts a web page from making requests to a domain different from the one that served it.\n\nBy default, browsers follow the **Same-Origin Policy**. If `app.com` tries to fetch from `api.com`, the browser blocks it unless `api.com` explicitly sends an `Access-Control-Allow-Origin` header.\n\nFor 'non-simple' requests (like those with JSON bodies or custom headers), the browser first sends a **Preflight** request (OPTIONS method) to ask the server for permission before sending the actual data.",
    realWorld: [
      "Frontend apps talking to a separate API server.",
      "Loading fonts or scripts from a CDN.",
      "Embedding third-party widgets or maps.",
    ],
    pitfalls: [
      "Access-Control-Allow-Origin: *: While easy, this allows ANY site to read your API data. Never use this for authenticated endpoints.",
      "Misconfigured Credential Support: If you allow credentials (cookies), you cannot use the wildcard `*`.",
      "Opaque Errors: Browsers don't always explain why a CORS request failed for security reasons; check the Network tab carefully.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// CORS is a browser policy, not server security. It relaxes the same-origin rule.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin); // echo, never "*" with credentials
    res.setHeader("Vary", "Origin");                      // or caches will poison responses
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "content-type,authorization");
    res.setHeader("Access-Control-Max-Age", "600");       // cache the preflight
    return res.status(204).end();
  }
  next();
});`,
    },
    usedBy: [
      {
        company: "Stripe",
        product: "Stripe.js / browser SDKs",
        usage:
          "Public-key browser calls are explicitly CORS-enabled while secret-key endpoints are server-only by design.",
        href: "https://docs.stripe.com/api",
      },
      {
        company: "Amazon",
        product: "S3 bucket CORS configuration",
        usage:
          "Direct browser uploads require an explicit CORS policy per bucket listing origins, methods and exposed headers.",
        href: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html",
      },
      {
        company: "Mozilla",
        product: "Fetch / browser enforcement",
        usage:
          "The browser (not the server) blocks the response; preflights and credential rules are specified in the Fetch standard.",
        href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS",
      },
      {
        company: "Cloudflare",
        product: "Workers & CDN header handling",
        usage:
          "Edge middleware injects CORS headers and must Vary on Origin so one origin's response isn't served to another.",
        href: "https://developers.cloudflare.com/workers/examples/cors-header-proxy/",
      },
    ],
    references: [
      {
        label: "MDN — Cross-Origin Resource Sharing (CORS)",
        href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS",
      },
      {
        label: "Fetch standard — CORS protocol",
        href: "https://fetch.spec.whatwg.org/#http-cors-protocol",
      },
    ],
  },
  {
    slug: "webauthn",
    title: "WebAuthn / Passkeys",
    category: "Security",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "The end of the password.",
    caption:
      "Step into the future of authentication. Simulate a hardware-backed registration and login flow. See how public-key cryptography and biometrics replace vulnerable passwords with unphishable Passkeys.",
    component: WebAuthnLab,
    skillTags: ["Security", "Auth", "Passkeys"],
    concept:
      "WebAuthn (Web Authentication) is a web standard that allows users to log in to websites using secure, hardware-backed credentials like biometrics (TouchID/FaceID) or USB security keys (YubiKeys).\n\nUnlike passwords, which are sent to a server and can be stolen, WebAuthn uses **Public Key Cryptography**:\n1. The user's device creates a unique key pair for the site.\n2. The device sends the **Public Key** to the server.\n3. To log in, the server sends a 'challenge'. The device signs it with the **Private Key** (after biometric verification) and sends it back.\n\nThis is 'unphishable' because the device only signs challenges for the specific domain it was registered with.",
    realWorld: [
      "Google Passkeys: the default login method for Google Accounts.",
      "Apple iCloud Keychain: syncing passkeys across devices.",
      "GitHub: supports WebAuthn for 2FA and passwordless login.",
    ],
    pitfalls: [
      "Recovery: If a user loses their only hardware key, they are locked out. Always encourage multiple keys or secondary recovery methods.",
      "Browser Support: While broad, some older browsers or enterprise environments still lack full WebAuthn support.",
    ],
    references: [
      { label: "W3C Web Authentication Working Group", href: "https://www.w3.org/TR/webauthn-2/" },
      { label: "FIDO Alliance — How it works", href: "https://fidoalliance.org/how-fido-works/" },
    ],
    codeSnippet: {
      language: "ts",
      code: `// Registration: the authenticator keeps the private key; the server stores a public key.
const cred = (await navigator.credentials.create({
  publicKey: {
    challenge: serverChallenge,               // random, single use, server-generated
    rp: { id: "example.com", name: "Example" }, // origin binding kills phishing
    user: { id: userIdBytes, name: email, displayName: name },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],   // ES256
    authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
    usedBy: [
      {
        company: "Apple",
        product: "iCloud Keychain passkeys",
        usage: "Passkeys sync across devices and replace passwords with Face ID / Touch ID-gated WebAuthn credentials.",
        href: "https://developer.apple.com/passkeys/",
      },
      {
        company: "Google",
        product: "Passkeys for Google Accounts",
        usage: "Google made passkeys the default sign-in option and reports faster, phishing-resistant authentication.",
        href: "https://blog.google/technology/safety-security/the-beginning-of-the-end-of-the-password/",
      },
      {
        company: "GitHub",
        product: "Security keys & passkeys for 2FA",
        usage: "GitHub supports WebAuthn security keys and passkeys, including for sudo-mode reauthentication.",
        href: "https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication",
      },
      {
        company: "Cloudflare",
        product: "Company-wide hardware keys",
        usage: "Cloudflare credits mandatory hardware security keys with blocking a targeted phishing campaign that hit other companies.",
        href: "https://blog.cloudflare.com/2022-07-sms-phishing-attacks/",
      },
    ],
  },
})) as PublicKeyCredential;

// Login: sign the challenge; the server verifies with the stored public key
// and checks the signature counter / origin. No shared secret ever leaves the device.
await navigator.credentials.get({ publicKey: { challenge, rpId: "example.com" } });`,
    },
    usedBy: [
      {
        company: "Apple",
        product: "iCloud Keychain passkeys",
        usage:
          "Passkeys sync across devices and replace passwords with Face ID / Touch ID-gated WebAuthn credentials.",
        href: "https://developer.apple.com/passkeys/",
      },
      {
        company: "Google",
        product: "Passkeys for Google Accounts",
        usage:
          "Google made passkeys the default sign-in option and reports faster, phishing-resistant authentication.",
        href: "https://blog.google/technology/safety-security/the-beginning-of-the-end-of-the-password/",
      },
      {
        company: "GitHub",
        product: "Security keys & passkeys for 2FA",
        usage:
          "GitHub supports WebAuthn security keys and passkeys, including for sudo-mode reauthentication.",
        href: "https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication",
      },
      {
        company: "Cloudflare",
        product: "Company-wide hardware keys",
        usage:
          "Cloudflare credits mandatory hardware security keys with blocking a targeted phishing campaign that hit other companies.",
        href: "https://blog.cloudflare.com/2022-07-sms-phishing-attacks/",
      },
    ],
  },
  {
    slug: "load-balancer",
    title: "Load Balancing",
    category: "Distributed Systems",
    difficulty: "Intermediate",
    readingTimeMin: 5,
    blurb: "Route requests with round-robin, least-connections, and weighted strategies.",
    caption:
      "Send requests into three backend nodes and compare routing policies. Complete active requests to see why least-connections reacts better to slow servers than simple round-robin.",
    component: LoadBalancerLab,
    skillTags: ["Distributed Systems", "System Design", "Backend"],
    concept:
      "A load balancer spreads traffic across healthy backend instances so one machine does not become the bottleneck. The policy matters: round-robin is simple but ignores current load, least-connections tracks in-flight work, weighted routing sends more traffic to larger instances, and hash-based routing keeps related requests stable.\n\nReal production balancers also perform health checks, connection draining, TLS termination, sticky sessions, retries, outlier detection, and circuit breaking. The goal is not only even traffic; it is predictable latency during failure, deploys, and uneven workloads.",
    complexity: [
      { operation: "Round-robin route", time: "O(1)", space: "O(1)" },
      { operation: "Least-connections route", time: "O(n servers)", space: "O(n)" },
      { operation: "Weighted route", time: "O(1) to O(log n)", space: "O(n)" },
    ],
    realWorld: [
      "Nginx, HAProxy, Envoy, AWS ALB/NLB, and Cloudflare Load Balancing.",
      "Service meshes use local load balancing plus retries and outlier detection.",
    ],
    pitfalls: [
      "Retries can amplify overload if every client retries at once.",
      "Sticky sessions simplify state but reduce balancing quality.",
      "Health checks must detect partial failure, not just process liveness.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// "Power of two choices": sample 2 backends, send to the less loaded one.
// Near-optimal balance without global state — what Envoy/NGINX least-request does.
function pick(backends: { id: string; inflight: number; healthy: boolean }[]) {
  const live = backends.filter((b) => b.healthy);
  if (live.length <= 1) return live[0];
  const a = live[Math.floor(Math.random() * live.length)];
  const b = live[Math.floor(Math.random() * live.length)];
  return a.inflight <= b.inflight ? a : b;
}

// Round robin ignores request cost; least-request tracks it;
// consistent hashing trades balance for cache affinity (session/shard stickiness).`,
    },
    usedBy: [
      {
        company: "Google / CNCF",
        product: "Envoy least-request policy",
        usage:
          "Envoy implements power-of-two-choices as its default least-request load balancer for HTTP upstreams.",
        href: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers",
      },
      {
        company: "NGINX / F5",
        product: "upstream least_conn & hash",
        usage:
          "NGINX exposes round-robin, least-connections and hash-based (sticky) balancing per upstream block.",
        href: "https://nginx.org/en/docs/http/load_balancing.html",
      },
      {
        company: "AWS",
        product: "Application Load Balancer",
        usage:
          "ALB spreads requests across targets in multiple AZs with health checks and connection draining on deploys.",
        href: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html",
      },
      {
        company: "Cloudflare",
        product: "Anycast + PoP-level balancing",
        usage:
          "Traffic reaches the nearest PoP by anycast routing, then is balanced across machines inside that PoP.",
        href: "https://blog.cloudflare.com/unimog-cloudflares-edge-load-balancer/",
      },
    ],
    references: [
      {
        label: "Mitzenmacher — The power of two choices in randomized load balancing",
        href: "https://www.eecs.harvard.edu/~michaelm/postscripts/handbook2001.pdf",
      },
      {
        label: "Envoy — load balancing architecture overview",
        href: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers",
      },
      {
        label: "Cloudflare — Unimog, the edge load balancer",
        href: "https://blog.cloudflare.com/unimog-cloudflares-edge-load-balancer/",
      },
    ],
  },
  {
    slug: "circuit-breaker",
    title: "Circuit Breaker",
    category: "Distributed Systems",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Fail fast when a dependency is unhealthy instead of piling on retries.",
    caption:
      "Increase downstream failure rate and call the service. After repeated failures, the breaker opens, blocks requests, and probes with half-open recovery.",
    component: CircuitBreakerLab,
    skillTags: ["Distributed Systems", "Resilience", "Backend"],
    concept:
      "A circuit breaker protects callers from repeatedly waiting on a failing dependency. In the closed state, requests pass through. After enough failures, the breaker opens and fails fast. After a cooldown, it enters half-open and allows a small number of probe requests. A successful probe closes the circuit; another failure opens it again.\n\nThis pattern turns slow cascading failure into bounded degradation. It is usually paired with timeouts, bulkheads, fallback responses, retry budgets, and observability.",
    complexity: [
      { operation: "Record result", time: "O(1)", space: "O(1) or rolling window" },
      { operation: "Allow/deny call", time: "O(1)", space: "O(1)" },
    ],
    realWorld: [
      "Hystrix popularized the pattern; Resilience4j, Envoy, Linkerd, and Istio implement variants.",
      "Payment, search, recommendation, and email services often use fallbacks behind breakers.",
    ],
    pitfalls: [
      "A breaker without timeouts still lets calls hang.",
      "Aggressive retry plus open breakers can produce traffic bursts during recovery.",
      "Fallbacks must be intentionally degraded, not silently wrong.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// closed -> (failures exceed threshold) -> open -> (after cooldown) -> half-open
class CircuitBreaker {
  private state: "closed" | "open" | "half-open" = "closed";
  private failures = 0;
  private openedAt = 0;
  constructor(private threshold = 5, private cooldownMs = 10_000) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.openedAt < this.cooldownMs) throw new Error("circuit open"); // fail fast
      this.state = "half-open"; // let one probe through
    }
    try {
      const out = await fn();
      this.failures = 0;
      this.state = "closed";
      return out;
    } catch (err) {
      if (++this.failures >= this.threshold || this.state === "half-open") {
        this.state = "open";
        this.openedAt = Date.now();
      }
      throw err;
    }
  }
}`,
    },
    usedBy: [
      {
        company: "Netflix",
        product: "Hystrix / resilience tooling",
        usage:
          "Netflix popularised circuit breakers with Hystrix so one failing dependency degrades instead of collapsing the API.",
        href: "https://netflixtechblog.com/introducing-hystrix-for-resilience-engineering-13531c1ab362",
      },
      {
        company: "Google / CNCF",
        product: "Envoy outlier detection",
        usage:
          "Envoy ejects hosts that exceed error thresholds and re-admits them gradually — a breaker per upstream host.",
        href: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/outlier",
      },
      {
        company: "Amazon",
        product: "Retry, backoff and brownout guidance",
        usage:
          "The Builders' Library documents fail-fast and load-shedding patterns to prevent retry storms during partial failure.",
        href: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
      },
      {
        company: "Shopify",
        product: "Semian resiliency library",
        usage:
          "Shopify open-sourced circuit breakers plus bulkheads for MySQL/Redis/HTTP calls in the storefront path.",
        href: "https://github.com/Shopify/semian",
      },
    ],
    references: [
      {
        label: "Martin Fowler — CircuitBreaker",
        href: "https://martinfowler.com/bliki/CircuitBreaker.html",
      },
      {
        label: "AWS Builders' Library — Timeouts, retries and backoff with jitter",
        href: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
      },
      {
        label: "Envoy — outlier detection",
        href: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/outlier",
      },
    ],
  },
  {
    slug: "crdt-counter",
    title: "CRDT G-Counter",
    category: "Distributed Systems",
    difficulty: "Advanced",
    readingTimeMin: 5,
    blurb: "Conflict-free replicated data that converges without coordination.",
    caption:
      "Increment two replicas independently, then merge. The counter converges by taking the max value seen for each replica slot.",
    component: CRDTLab,
    skillTags: ["Distributed Systems", "Databases"],
    concept:
      "A CRDT is a data type designed so replicas can update independently and later merge into the same value. The G-Counter is the simplest example: each replica owns one slot in a vector and only increments its own slot. Merge takes the element-wise maximum. The visible count is the sum of the vector.\n\nBecause merge is associative, commutative, and idempotent, replicas converge even if messages arrive out of order, duplicate, or after partitions. More advanced CRDTs model sets, maps, registers, text editing, and presence.",
    complexity: [
      { operation: "Increment", time: "O(1)", space: "O(replicas)" },
      { operation: "Merge", time: "O(replicas)", space: "O(replicas)" },
      { operation: "Read", time: "O(replicas)", space: "O(1)" },
    ],
    realWorld: [
      "Riak, Redis Enterprise active-active, collaborative editors, counters, likes, reactions, and offline-first apps.",
    ],
    pitfalls: [
      "Metadata grows with replica count unless compacted.",
      "Not every invariant can be preserved without coordination.",
      "Deletes require more complex CRDTs such as OR-Sets or tombstones.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// PN-Counter: two grow-only maps, merge with per-node max -> commutative,
// associative, idempotent. Replicas converge regardless of message order.
type GCounter = Record<string, number>;
interface PNCounter { inc: GCounter; dec: GCounter }

const increment = (c: PNCounter, node: string, by = 1): PNCounter =>
  ({ ...c, inc: { ...c.inc, [node]: (c.inc[node] ?? 0) + by } });

const mergeG = (a: GCounter, b: GCounter): GCounter => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
};

const merge = (a: PNCounter, b: PNCounter): PNCounter =>
  ({ inc: mergeG(a.inc, b.inc), dec: mergeG(a.dec, b.dec) });

const value = (c: PNCounter) =>
  Object.values(c.inc).reduce((s, n) => s + n, 0) - Object.values(c.dec).reduce((s, n) => s + n, 0);`,
    },
    usedBy: [
      {
        company: "Figma",
        product: "Multiplayer document state",
        usage:
          "Figma's realtime engine uses CRDT-inspired merge rules so concurrent edits converge without a locking server.",
        href: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
      },
      {
        company: "Apple",
        product: "Notes sync across devices",
        usage:
          "Apple has described using CRDTs so edits made offline on different devices merge without conflict dialogs.",
        href: "https://archive.org/details/crdts-in-production-apple-notes",
      },
      {
        company: "Redis",
        product: "Active-Active geo-replication (CRDBs)",
        usage:
          "Redis Enterprise databases replicate multi-master using CRDT semantics for counters, sets and maps.",
        href: "https://redis.io/docs/latest/operate/rs/databases/active-active/",
      },
      {
        company: "Automerge / Yjs ecosystem",
        product: "Local-first collaborative apps",
        usage:
          "Open-source CRDT libraries power offline-first editors where every peer can write and later sync.",
        href: "https://automerge.org/",
      },
    ],
    references: [
      {
        label:
          "Shapiro et al. — A comprehensive study of Convergent and Commutative Replicated Data Types",
        href: "https://inria.hal.science/inria-00555588/document",
      },
      {
        label: "Redis — Active-Active geo-replication (CRDBs)",
        href: "https://redis.io/docs/latest/operate/rs/databases/active-active/",
      },
      {
        label: "Automerge — CRDT library documentation",
        href: "https://automerge.org/docs/hello/",
      },
    ],
  },
  {
    slug: "sharding-replication",
    title: "Sharding & Replication",
    category: "Distributed Systems",
    difficulty: "Advanced",
    readingTimeMin: 6,
    blurb: "Route keys to shards and compare quorum vs asynchronous replication.",
    caption:
      "Type a key to route it to a shard. Switch between quorum and async replication to see the consistency/latency tradeoff on writes.",
    component: ShardingReplicationLab,
    skillTags: ["Distributed Systems", "Databases", "System Design"],
    concept:
      "Sharding partitions data across machines, usually by hashing or ranges, so storage and write load scale horizontally. Replication copies each shard to multiple nodes for availability and read scale. Together, they form the backbone of large databases and search systems.\n\nWrites can wait for a quorum of replicas, which improves consistency but adds latency, or acknowledge on the primary and replicate asynchronously, which is faster but may lose recent writes during failover. Rebalancing, hot keys, secondary indexes, and cross-shard transactions are the hard parts.",
    complexity: [
      { operation: "Hash route key", time: "O(1)", space: "O(shards)" },
      { operation: "Quorum write", time: "O(replica RTT)", space: "O(replicas)" },
      { operation: "Scatter-gather query", time: "O(shards)", space: "O(shards)" },
    ],
    realWorld: [
      "DynamoDB partitions, Cassandra token ranges, MongoDB sharding, Elasticsearch shards, and Vitess keyspaces.",
    ],
    pitfalls: [
      "Hot keys overload one shard even if average load is low.",
      "Cross-shard joins and transactions are expensive.",
      "Resharding needs careful dual-write, backfill, and cutover plans.",
    ],
    codeSnippet: {
      language: "sql",
      code: `-- Shard key choice decides whether you scale or build a hotspot.
-- Bad: monotonically increasing key -> every write lands on the newest shard.
-- Better: hash a high-cardinality, query-aligned key.

CREATE TABLE events (
  tenant_id  bigint      NOT NULL,
  event_id   bigint      NOT NULL,
  created_at timestamptz NOT NULL,
  payload    jsonb       NOT NULL,
  PRIMARY KEY (tenant_id, event_id)
) PARTITION BY HASH (tenant_id);

-- Cross-shard queries lose single-shard transactions and need scatter-gather:
SELECT tenant_id, count(*) FROM events
WHERE created_at > now() - interval '1 day'
GROUP BY tenant_id;  -- fans out to every shard, then merges`,
    },
    usedBy: [
      {
        company: "YouTube / PlanetScale",
        product: "Vitess",
        usage:
          "Vitess was built to shard YouTube's MySQL fleet transparently, and now backs PlanetScale and Slack's MySQL.",
        href: "https://vitess.io/docs/",
      },
      {
        company: "Instagram / Meta",
        product: "Logical shards in Postgres",
        usage:
          "Thousands of logical shards are mapped onto fewer physical machines so rebalancing does not require re-sharding data.",
        href: "https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c",
      },
      {
        company: "MongoDB",
        product: "Sharded clusters",
        usage:
          "Shard key selection, chunk balancing and scatter-gather query costs are documented as first-class design concerns.",
        href: "https://www.mongodb.com/docs/manual/sharding/",
      },
      {
        company: "Discord",
        product: "Cassandra → ScyllaDB message store",
        usage:
          "Messages are partitioned by channel and bucketed by time to keep partitions bounded and reads local.",
        href: "https://discord.com/blog/how-discord-stores-trillions-of-messages",
      },
    ],
    references: [
      {
        label: "Vitess — sharding concepts",
        href: "https://vitess.io/docs/user-guides/configuration-basic/",
      },
      {
        label: "MongoDB — sharded cluster and shard key selection",
        href: "https://www.mongodb.com/docs/manual/core/sharding-shard-key/",
      },
      {
        label: "Discord — how Discord stores trillions of messages",
        href: "https://discord.com/blog/how-discord-stores-trillions-of-messages",
      },
    ],
  },
  {
    slug: "backpressure",
    title: "Backpressure",
    category: "Distributed Systems",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Keep producers from overwhelming consumers with buffers, drops, or throttling.",
    caption:
      "Adjust producer and consumer rates, then compare buffering, dropping, and throttling policies. Watch queue growth expose overload.",
    component: BackpressureLab,
    skillTags: ["Distributed Systems", "Streaming", "Backend"],
    concept:
      "Backpressure is the signal that a downstream component cannot keep up. Without it, queues grow until latency explodes or memory is exhausted. Systems respond by buffering, dropping low-value work, slowing producers, applying rate limits, or splitting load across more consumers.\n\nGood backpressure is explicit and measurable: queue depth, lag, max in-flight requests, bounded buffers, deadlines, and rejection rates. It changes overload from hidden collapse into a controlled product decision.",
    complexity: [
      { operation: "Enqueue/dequeue", time: "O(1)", space: "O(buffer)" },
      { operation: "Throttle decision", time: "O(1)", space: "O(1)" },
    ],
    realWorld: [
      "Kafka consumer lag, Node streams, TCP flow control, Reactive Streams, async worker queues, and API rate limits.",
    ],
    pitfalls: [
      "Unbounded queues trade visible errors for invisible latency.",
      "Dropping must be safe for the workload.",
      "Autoscaling from queue depth needs cooldowns to avoid oscillation.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Little's law: concurrency = arrival rate x latency.
// If you can't slow arrivals, you must bound concurrency and shed the rest.
class Bulkhead {
  private inflight = 0;
  constructor(private limit: number, private queueLimit: number) {}
  private queue: (() => void)[] = [];

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.inflight >= this.limit) {
      if (this.queue.length >= this.queueLimit) throw new Error("503: shed load"); // fail fast
      await new Promise<void>((r) => this.queue.push(r));
    }
    this.inflight++;
    try {
      return await task();
    } finally {
      this.inflight--;
      this.queue.shift()?.();
    }
  }
}
// Unbounded queues don't remove overload — they convert it into latency and timeouts.`,
    },
    usedBy: [
      {
        company: "Netflix",
        product: "Adaptive concurrency limits",
        usage:
          "Netflix open-sourced TCP-congestion-style adaptive limits that discover a service's safe concurrency at runtime.",
        href: "https://netflixtechblog.medium.com/performance-under-load-3e6fa9a60581",
      },
      {
        company: "Amazon",
        product: "Load shedding & timeout guidance",
        usage:
          "The Builders' Library documents shedding excess work early rather than letting queues absorb overload.",
        href: "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/",
      },
      {
        company: "IETF / all browsers",
        product: "HTTP/2 & gRPC flow control",
        usage:
          "Stream and connection windows are literal backpressure: a receiver advertises how many bytes it can absorb.",
        href: "https://datatracker.ietf.org/doc/html/rfc9113#name-flow-control",
      },
      {
        company: "Reactive Streams / Akka",
        product: "Demand-based stream protocol",
        usage:
          "Subscribers request(n) items, so a fast producer can never overwhelm a slow consumer.",
        href: "https://www.reactive-streams.org/",
      },
    ],
    references: [
      {
        label: "Netflix — performance under load (adaptive concurrency limits)",
        href: "https://netflixtechblog.medium.com/performance-under-load-3e6fa9a60581",
      },
      {
        label: "AWS Builders' Library — using load shedding to avoid overload",
        href: "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/",
      },
      {
        label: "RFC 9113 — HTTP/2 flow control",
        href: "https://datatracker.ietf.org/doc/html/rfc9113#name-flow-control",
      },
    ],
  },
  {
    slug: "topological-sort",
    title: "Topological Sort",
    category: "Algorithms",
    difficulty: "Intermediate",
    readingTimeMin: 4,
    blurb: "Order dependent work in a DAG with Kahn's algorithm.",
    caption:
      "Run tasks only when dependencies are complete. The ready queue reveals how topological ordering powers builds, migrations, and schedulers.",
    component: TopologicalSortLab,
    skillTags: ["DSA", "Algorithms"],
    concept:
      "Topological sort orders nodes in a directed acyclic graph so every dependency appears before the work that depends on it. Kahn's algorithm tracks each node's in-degree, pushes zero-dependency nodes into a queue, removes them one by one, and decreases the in-degree of their outgoing neighbors.\n\nIf nodes remain but the ready queue is empty, the graph contains a cycle. That makes topological sort useful both for scheduling valid work and detecting invalid dependency graphs.",
    complexity: [
      { operation: "Topological sort", time: "O(V + E)", space: "O(V + E)" },
      { operation: "Cycle detection", time: "O(V + E)", space: "O(V)" },
    ],
    realWorld: [
      "Build systems, package managers, database migrations, workflow engines, compiler passes, and spreadsheet recalculation.",
    ],
    pitfalls: [
      "Only works on DAGs; cycles must be reported clearly.",
      "Multiple valid orders can exist.",
      "Dynamic dependency graphs need incremental recomputation or invalidation.",
    ],
    codeSnippet: {
      language: "ts",
      code: `// Kahn's algorithm: repeatedly emit nodes with no remaining dependencies.
export function topoSort(nodes: string[], edges: [string, string][]): string[] {
  const indeg = new Map(nodes.map((n) => [n, 0]));
  const adj = new Map(nodes.map((n) => [n, [] as string[]]));
  for (const [from, to] of edges) {
    adj.get(from)!.push(to);
    indeg.set(to, indeg.get(to)! + 1);
  }
  const ready = nodes.filter((n) => indeg.get(n) === 0);
  const order: string[] = [];
  while (ready.length) {
    const n = ready.shift()!; // any ready node -> parallelisable batch
    order.push(n);
    for (const next of adj.get(n)!) {
      indeg.set(next, indeg.get(next)! - 1);
      if (indeg.get(next) === 0) ready.push(next);
    }
  }
  if (order.length !== nodes.length) throw new Error("cycle detected");
  return order;
}`,
    },
    usedBy: [
      {
        company: "Google",
        product: "Bazel build graph",
        usage:
          'Actions run in dependency order, and every independent "ready" set is dispatched in parallel across workers.',
        href: "https://bazel.build/basics/build-graph",
      },
      {
        company: "Apache Airflow",
        product: "DAG task scheduling",
        usage:
          "The scheduler queues tasks whose upstream dependencies have all succeeded — Kahn's algorithm with retries.",
        href: "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html",
      },
      {
        company: "Vercel",
        product: "Turborepo task pipelines",
        usage:
          "`turbo run build` topologically orders package tasks and parallelises independent branches of the graph.",
        href: "https://turbo.build/repo/docs/crafting-your-repository/running-tasks",
      },
    ],
    references: [
      { label: "Bazel — the build graph", href: "https://bazel.build/basics/build-graph" },
      {
        label: "Turborepo — task graph & parallel execution",
        href: "https://turbo.build/repo/docs/crafting-your-repository/running-tasks",
      },
    ],
  },
];

export function getLabBySlug(slug: string): LabEntry | undefined {
  return labRegistry.find((l) => l.slug === slug);
}

export function getLabsForSkill(skill: string): LabEntry[] {
  return labRegistry.filter((l) => l.skillTags.includes(skill));
}

export const LAB_CATEGORIES: LabCategory[] = [
  "Distributed Systems",
  "Data Structures",
  "Algorithms",
  "Security",
];
