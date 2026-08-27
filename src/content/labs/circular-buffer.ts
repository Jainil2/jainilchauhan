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
};
