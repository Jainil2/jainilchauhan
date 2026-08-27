import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "circular-buffer",
  title: "Circular Buffer",
  category: "Data Structures",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Fixed-size ring storage with wrapping head and tail pointers.",
  caption:
    "Write and read through a fixed ring. Head and tail wrap with modulo arithmetic so no element shifting is required.",
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
  challenge: {
    prompt:
      "Simulate a fixed-size ring buffer that overwrites its oldest entry when full. Return the surviving items oldest-first, plus how many were dropped. Streaming token output and telemetry buffers both work this way: bounded memory, newest data wins.",
    entry: "ring",
    starter: `/**
 * @param {number} capacity - buffer size. Zero means nothing is ever kept.
 * @param {any[]} writes - items written in order.
 * @returns {{items: any[], overwritten: number}} survivors oldest-first, and the drop count.
 */
function ring(capacity, writes) {
  // Nothing is ever shifted: the write position wraps with the remainder
  // operator, and once full every write overwrites the oldest slot.
}
`,
    tests: [
      {
        name: "keeps everything while there is room",
        body: `assertEquals(solution(3, ['a', 'b']), { items: ['a', 'b'], overwritten: 0 });`,
      },
      {
        name: "exactly full, nothing dropped",
        body: `assertEquals(solution(3, ['a', 'b', 'c']), { items: ['a', 'b', 'c'], overwritten: 0 });`,
      },
      {
        name: "overwrites the oldest once full",
        body: `assertEquals(solution(3, ['a', 'b', 'c', 'd']), { items: ['b', 'c', 'd'], overwritten: 1 });`,
      },
      {
        name: "wraps more than once",
        body: `assertEquals(solution(2, [1, 2, 3, 4, 5]), { items: [4, 5], overwritten: 3 });`,
      },
      {
        name: "zero capacity keeps nothing",
        body: `assertEquals(solution(0, ['a', 'b']), { items: [], overwritten: 2 });`,
      },
      {
        name: "no writes",
        body: `assertEquals(solution(4, []), { items: [], overwritten: 0 });`,
      },
      {
        name: "memory stays bounded on a long stream",
        body: `var writes = [];
for (var i = 0; i < 100000; i++) writes.push(i);
var r = solution(10, writes);
assertEquals(r.items.length, 10);
assertEquals(r.items[9], 99999);
assertEquals(r.overwritten, 99990);`,
      },
    ],
    hints: [
      "Track a write position and a count. The slot to write is position % capacity.",
      "Every write after the buffer is full drops exactly one older item.",
      "To read oldest-first once wrapped, start at (writePosition % capacity) and walk forward, wrapping.",
    ],
    reference: `function ring(capacity, writes) {
  if (capacity <= 0) return { items: [], overwritten: writes.length };
  const slots = new Array(capacity);
  let written = 0;
  for (const value of writes) {
    slots[written % capacity] = value; // wraps; nothing is ever shifted
    written++;
  }
  const kept = Math.min(written, capacity);
  const start = written <= capacity ? 0 : written % capacity;
  const items = [];
  for (let i = 0; i < kept; i++) items.push(slots[(start + i) % capacity]);
  return { items, overwritten: Math.max(0, written - capacity) };
}
`,
  },
};
