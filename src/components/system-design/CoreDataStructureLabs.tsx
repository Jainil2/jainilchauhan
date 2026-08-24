import { useMemo, useState } from "react";

const cellClass =
  "flex min-h-12 items-center justify-center rounded border border-border bg-background/50 font-mono text-xs";
const buttonClass =
  "rounded border border-border px-2 py-1 font-mono text-xs text-muted-foreground hover:border-terminal/50 hover:text-terminal";
const activeClass = "border-terminal bg-terminal/10 text-terminal";

function hashKey(key: string, buckets: number) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % buckets;
}

export function ArrayLab() {
  const values = [12, 7, 19, 4, 25, 11, 8, 30];
  const [index, setIndex] = useState(2);
  const [windowStart, setWindowStart] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setIndex((i) => (i + 1) % values.length)} className={buttonClass}>
          access next
        </button>
        <button
          onClick={() => setWindowStart((i) => Math.min(values.length - 3, i + 1))}
          className={buttonClass}
        >
          slide window
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {values.map((value, i) => {
          const active = i === index;
          const inWindow = i >= windowStart && i < windowStart + 3;
          return (
            <div
              key={i}
              className={`${cellClass} ${active ? activeClass : ""} ${inWindow ? "ring-1 ring-cyan-accent/60" : ""}`}
            >
              <div>
                <div className="text-center text-muted-foreground">[{i}]</div>
                <div className="text-center text-foreground">{value}</div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Address math: base + index * elementSize gives direct O(1) random access.
      </p>
    </div>
  );
}

export function DynamicArrayLab() {
  const [items, setItems] = useState([4, 8, 15]);
  const capacity = useMemo(() => {
    let c = 4;
    while (c < items.length) c *= 2;
    return c;
  }, [items.length]);

  function push() {
    setItems((v) => [...v, Math.floor(Math.random() * 90) + 10]);
  }

  return (
    <div className="space-y-4">
      <button
        onClick={push}
        className="rounded border border-terminal/40 px-3 py-1 font-mono text-xs text-terminal"
      >
        push
      </button>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {Array.from({ length: capacity }, (_, i) => (
          <div
            key={i}
            className={`${cellClass} ${i < items.length ? "text-foreground" : "text-muted-foreground"}`}
          >
            {items[i] ?? "empty"}
          </div>
        ))}
      </div>
      <div className="rounded border border-border bg-background/40 p-3 font-mono text-xs text-muted-foreground">
        length {items.length} / capacity {capacity}. When full, allocate 2x capacity and copy
        existing elements.
      </div>
    </div>
  );
}

export function LinkedListLab() {
  const [head, setHead] = useState([13, 21, 34, 55]);
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setHead((v) => [Math.floor(Math.random() * 50), ...v].slice(0, 6))}
          className={buttonClass}
        >
          insert head
        </button>
        <button onClick={() => setSelected((i) => (i + 1) % head.length)} className={buttonClass}>
          traverse
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {head.map((value, i) => (
          <div key={`${value}-${i}`} className="flex items-center gap-2">
            <div className={`${cellClass} w-20 ${selected === i ? activeClass : ""}`}>
              <div>
                <div className="text-center text-foreground">{value}</div>
                <div className="text-center text-muted-foreground">next</div>
              </div>
            </div>
            {i < head.length - 1 && <span className="font-mono text-cyan-accent">-&gt;</span>}
          </div>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Insert/delete is O(1) when the node is known; indexed lookup is O(n) traversal.
      </p>
    </div>
  );
}

export function StackLab() {
  const [stack, setStack] = useState(["main()", "parse()", "eval()"]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setStack((s) => [`call${s.length + 1}()`, ...s].slice(0, 6))}
          className={buttonClass}
        >
          push
        </button>
        <button onClick={() => setStack((s) => s.slice(1))} className={buttonClass}>
          pop
        </button>
      </div>
      <div className="mx-auto flex max-w-sm flex-col gap-2">
        {stack.map((frame, i) => (
          <div key={`${frame}-${i}`} className={`${cellClass} ${i === 0 ? activeClass : ""}`}>
            {i === 0 ? "top -> " : ""}
            {frame}
          </div>
        ))}
      </div>
    </div>
  );
}

export function QueueLab() {
  const [queue, setQueue] = useState(["job-1", "job-2", "job-3"]);
  const nextId = queue.length + 1;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setQueue((q) => [...q, `job-${nextId}`].slice(-7))}
          className={buttonClass}
        >
          enqueue
        </button>
        <button onClick={() => setQueue((q) => q.slice(1))} className={buttonClass}>
          dequeue
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-cyan-accent">front</span>
        {queue.map((job, i) => (
          <div key={`${job}-${i}`} className={`${cellClass} w-20 ${i === 0 ? activeClass : ""}`}>
            {job}
          </div>
        ))}
        <span className="font-mono text-xs text-muted-foreground">back</span>
      </div>
    </div>
  );
}

export function DequeLab() {
  const [deque, setDeque] = useState(["B", "C", "D"]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setDeque((d) => ["A", ...d].slice(0, 7))} className={buttonClass}>
          push front
        </button>
        <button onClick={() => setDeque((d) => [...d, "Z"].slice(-7))} className={buttonClass}>
          push back
        </button>
        <button onClick={() => setDeque((d) => d.slice(1))} className={buttonClass}>
          pop front
        </button>
        <button onClick={() => setDeque((d) => d.slice(0, -1))} className={buttonClass}>
          pop back
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
        {deque.map((item, i) => (
          <div key={`${item}-${i}`} className={cellClass}>
            {item}
          </div>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Deques power sliding-window maximum, work stealing, and undo/redo buffers.
      </p>
    </div>
  );
}

export function CircularBufferLab() {
  const capacity = 6;
  const [buffer, setBuffer] = useState<(string | null)[]>(["A", "B", "C", null, null, null]);
  const [head, setHead] = useState(0);
  const [tail, setTail] = useState(3);
  const [count, setCount] = useState(3);

  function write() {
    const value = String.fromCharCode(65 + ((tail + count) % 26));
    setBuffer((b) => b.map((cell, i) => (i === tail ? value : cell)));
    setTail((t) => (t + 1) % capacity);
    setCount((c) => Math.min(capacity, c + 1));
    if (count === capacity) setHead((h) => (h + 1) % capacity);
  }

  function read() {
    if (!count) return;
    setBuffer((b) => b.map((cell, i) => (i === head ? null : cell)));
    setHead((h) => (h + 1) % capacity);
    setCount((c) => Math.max(0, c - 1));
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={write} className={buttonClass}>
          write
        </button>
        <button onClick={read} className={buttonClass}>
          read
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {buffer.map((value, i) => (
          <div
            key={i}
            className={`${cellClass} ${i === head ? "ring-1 ring-cyan-accent" : ""} ${i === tail ? "border-terminal" : ""}`}
          >
            <div>
              <div className="text-center text-muted-foreground">{i}</div>
              <div className="text-center text-foreground">{value ?? "-"}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        head {head}, tail {tail}, count {count}. Tail wraps with modulo instead of shifting memory.
      </p>
    </div>
  );
}

export function HashTableLab() {
  const [key, setKey] = useState("user42");
  const [entries, setEntries] = useState(["cat", "dog", "bird", "user42", "cart9"]);
  const buckets = useMemo(() => {
    const out: string[][] = Array.from({ length: 5 }, () => []);
    for (const entry of entries) out[hashKey(entry, out.length)].push(entry);
    return out;
  }, [entries]);
  const target = hashKey(key, buckets.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="min-w-40 flex-1 rounded border border-border bg-background px-3 py-1 font-mono text-xs outline-none focus:border-terminal"
        />
        <button
          onClick={() => setEntries((e) => Array.from(new Set([...e, key])))}
          className={buttonClass}
        >
          insert
        </button>
      </div>
      <div className="space-y-2">
        {buckets.map((bucket, i) => (
          <div
            key={i}
            className={`rounded border p-2 font-mono text-xs ${target === i ? "border-terminal bg-terminal/10" : "border-border bg-background/40"}`}
          >
            <span className="mr-3 text-muted-foreground">bucket {i}</span>
            {bucket.length ? bucket.join(" -> ") : "empty"}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BitsetLab() {
  const [bits, setBits] = useState([0, 1, 0, 1, 1, 0, 0, 1]);
  const number = bits.reduce((sum, bit, i) => sum + bit * 2 ** (bits.length - 1 - i), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {bits.map((bit, i) => (
          <button
            key={i}
            onClick={() => setBits((b) => b.map((v, idx) => (idx === i ? 1 - v : v)))}
            className={`${cellClass} ${bit ? activeClass : ""}`}
          >
            <div>
              <div className="text-muted-foreground">{i}</div>
              <div>{bit}</div>
            </div>
          </button>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        binary {bits.join("")} = decimal <span className="text-terminal">{number}</span>. One byte
        stores eight boolean flags.
      </p>
    </div>
  );
}

export function SparseMatrixLab() {
  const points = [
    [0, 2, 8],
    [1, 4, 5],
    [2, 1, 7],
    [3, 3, 9],
    [4, 0, 6],
  ];
  const [selected, setSelected] = useState(0);
  const [row, col, value] = points[selected];

  return (
    <div className="space-y-4">
      <button onClick={() => setSelected((i) => (i + 1) % points.length)} className={buttonClass}>
        scan non-zero
      </button>
      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 25 }, (_, i) => {
            const r = Math.floor(i / 5);
            const c = i % 5;
            const match = points.find((p) => p[0] === r && p[1] === c);
            return (
              <div key={i} className={`${cellClass} ${r === row && c === col ? activeClass : ""}`}>
                {match?.[2] ?? 0}
              </div>
            );
          })}
        </div>
        <div className="rounded border border-border bg-background/40 p-3 font-mono text-xs">
          <p className="text-muted-foreground">COO triples</p>
          {points.map((p, i) => (
            <div key={i} className={i === selected ? "text-terminal" : "text-foreground"}>
              ({p[0]}, {p[1]}, {p[2]})
            </div>
          ))}
          <p className="mt-3 text-cyan-accent">selected value: {value}</p>
        </div>
      </div>
    </div>
  );
}
