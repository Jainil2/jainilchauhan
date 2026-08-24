import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSimulationStore } from "@/lib/useSimulationStore";

const SIZE = 32;

function hash(seed: number, s: string): number {
  let h = seed;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h % SIZE;
}

function indices(s: string): [number, number, number] {
  return [hash(7, s), hash(31, s), hash(101, s)];
}

/**
 * Bloom Filter sim — three independent hash functions flip three bits per insert.
 * Lookups answer "maybe" or "definitely not". Tracks live false-positive rate.
 */
export function BloomFilter() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const [bits, setBits] = useState<boolean[]>(() => Array(SIZE).fill(false));
  const [inserted, setInserted] = useState<string[]>([]);
  const [input, setInput] = useState("redis");
  const [highlight, setHighlight] = useState<number[]>([]);
  const [lookup, setLookup] = useState<{ word: string; result: "maybe" | "no" } | null>(null);

  const fillRatio = useMemo(() => bits.filter(Boolean).length / SIZE, [bits]);
  const fpRate = useMemo(() => Math.pow(fillRatio, 3), [fillRatio]);

  function add() {
    const w = input.trim().toLowerCase();
    if (!w) return;
    const idx = indices(w);
    setHighlight(idx);
    setBits((prev) => {
      const next = [...prev];
      idx.forEach((i) => (next[i] = true));
      return next;
    });
    setInserted((prev) => (prev.includes(w) ? prev : [...prev, w].slice(-8)));
    setLookup(null);
  }

  function check() {
    const w = input.trim().toLowerCase();
    if (!w) return;
    const idx = indices(w);
    setHighlight(idx);
    const allSet = idx.every((i) => bits[i]);
    setLookup({ word: w, result: allSet ? "maybe" : "no" });
  }

  function reset() {
    setBits(Array(SIZE).fill(false));
    setInserted([]);
    setHighlight([]);
    setLookup(null);
  }

  const animate = simulationsEnabled && !reduce;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          aria-label="Word to insert or check"
          className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm text-foreground outline-none focus:border-terminal/60"
          placeholder="type a word..."
        />
        <button
          onClick={add}
          className="rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 font-mono text-xs text-terminal hover:bg-terminal/20"
        >
          add
        </button>
        <button
          onClick={check}
          className="rounded-md border border-border bg-secondary/50 px-3 py-1.5 font-mono text-xs text-foreground hover:bg-secondary"
        >
          check
        </button>
        <button
          onClick={reset}
          className="rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          reset
        </button>
      </div>

      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-16">
        {bits.map((on, i) => {
          const isHi = highlight.includes(i);
          return (
            <motion.div
              key={i}
              initial={false}
              animate={animate ? { scale: isHi ? 1.18 : 1 } : false}
              transition={{ duration: 0.25 }}
              aria-label={`bit ${i} ${on ? "set" : "unset"}`}
              className={`flex aspect-square items-center justify-center rounded font-mono text-xs transition-colors ${
                on
                  ? isHi
                    ? "border border-terminal bg-terminal/40 text-foreground glow-terminal"
                    : "border border-terminal/50 bg-terminal/20 text-terminal"
                  : isHi
                    ? "border border-cyan-accent bg-cyan-accent/20 text-cyan-accent"
                    : "border border-border bg-secondary/30 text-muted-foreground"
              }`}
            >
              {on ? "1" : "0"}
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="fill" value={`${(fillRatio * 100).toFixed(0)}%`} />
        <Stat label="fp rate" value={`${(fpRate * 100).toFixed(1)}%`} />
        <Stat label="inserted" value={String(inserted.length)} />
      </div>

      {lookup && (
        <div
          aria-live="polite"
          className={`rounded-md border p-3 font-mono text-xs ${
            lookup.result === "maybe"
              ? "border-cyan-accent/40 bg-cyan-accent/5 text-cyan-accent"
              : "border-destructive/40 bg-destructive/5 text-destructive"
          }`}
        >
          <span className="text-muted-foreground">contains("{lookup.word}") →</span>{" "}
          {lookup.result === "maybe" ? "maybe (could be a false positive)" : "definitely not"}
        </div>
      )}

      {inserted.length > 0 && (
        <div className="font-mono text-xs text-muted-foreground">
          recent inserts:{" "}
          {inserted.map((w) => (
            <span
              key={w}
              className="ml-1 rounded border border-border bg-secondary/40 px-1.5 py-0.5 text-foreground"
            >
              {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 px-3 py-2">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-lg text-terminal">{value}</p>
    </div>
  );
}