import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useSimulationStore } from "@/lib/useSimulationStore";

const N = 32;

type Algo = "bubble" | "quick" | "merge";
const ALGOS: { id: Algo; name: string; color: string }[] = [
  { id: "bubble", name: "Bubble", color: "var(--destructive)" },
  { id: "quick", name: "Quick", color: "var(--terminal)" },
  { id: "merge", name: "Merge", color: "var(--cyan-accent)" },
];

function randArr(): number[] {
  return Array.from({ length: N }, () => Math.floor(Math.random() * 90) + 10);
}

/** Generates a step trace for each algorithm so we can replay it at a uniform tick rate. */
function bubbleSteps(arr: number[]): number[][] {
  const a = [...arr];
  const steps: number[][] = [a.slice()];
  let cmps = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      cmps++;
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push(a.slice());
      }
    }
  }
  return steps.length ? steps : [arr];
}

function quickSteps(arr: number[]): number[][] {
  const a = [...arr];
  const steps: number[][] = [a.slice()];
  function qs(lo: number, hi: number) {
    if (lo >= hi) return;
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        i++;
        steps.push(a.slice());
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    steps.push(a.slice());
    qs(lo, i - 1);
    qs(i + 1, hi);
  }
  qs(0, a.length - 1);
  return steps;
}

function mergeSteps(arr: number[]): number[][] {
  const a = [...arr];
  const steps: number[][] = [a.slice()];
  function ms(lo: number, hi: number) {
    if (hi - lo < 1) return;
    const mid = Math.floor((lo + hi) / 2);
    ms(lo, mid);
    ms(mid + 1, hi);
    const merged: number[] = [];
    let i = lo,
      j = mid + 1;
    while (i <= mid && j <= hi) {
      if (a[i] <= a[j]) merged.push(a[i++]);
      else merged.push(a[j++]);
    }
    while (i <= mid) merged.push(a[i++]);
    while (j <= hi) merged.push(a[j++]);
    for (let k = 0; k < merged.length; k++) {
      a[lo + k] = merged[k];
    }
    steps.push(a.slice());
  }
  ms(0, a.length - 1);
  return steps;
}

export function SortingRace() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const [seed, setSeed] = useState(0);
  const initial = useMemo(() => randArr(), [seed]);
  const traces = useMemo(
    () => ({
      bubble: bubbleSteps(initial),
      quick: quickSteps(initial),
      merge: mergeSteps(initial),
    }),
    [initial],
  );
  const [frame, setFrame] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);

  const maxLen = Math.max(traces.bubble.length, traces.quick.length, traces.merge.length);
  const enabled = simulationsEnabled && !reduce;

  useEffect(() => {
    if (!running || !enabled) return;
    const tick = (t: number) => {
      if (t - lastRef.current > 35) {
        lastRef.current = t;
        setFrame((f) => {
          if (f >= maxLen - 1) {
            setRunning(false);
            return f;
          }
          return f + 1;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, enabled, maxLen]);

  function start() {
    setFrame(0);
    setRunning(true);
  }

  function reshuffle() {
    setRunning(false);
    setFrame(0);
    setSeed((s) => s + 1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={start}
          disabled={running}
          className="rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 font-mono text-xs text-terminal hover:bg-terminal/20 disabled:opacity-50"
        >
          ▶ start race
        </button>
        <button
          onClick={reshuffle}
          className="rounded-md border border-border bg-secondary/50 px-3 py-1.5 font-mono text-xs text-foreground hover:bg-secondary"
        >
          ↻ reshuffle
        </button>
        <span className="ml-auto self-center font-mono text-xs text-muted-foreground">
          frame {frame} / {maxLen - 1}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {ALGOS.map((algo) => {
          const trace = traces[algo.id];
          const cur = trace[Math.min(frame, trace.length - 1)];
          const done = frame >= trace.length - 1;
          return (
            <div key={algo.id} className="rounded-md border border-border bg-background/40 p-2">
              <div className="mb-2 flex items-center justify-between font-mono text-xs">
                <span style={{ color: algo.color }}>{algo.name}</span>
                <span className={done ? "text-terminal" : "text-muted-foreground"}>
                  {done ? "✓ done" : `${trace.length} ops`}
                </span>
              </div>
              <div className="flex h-32 items-end gap-px">
                {cur.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${v}%`,
                      backgroundColor: algo.color,
                      opacity: done ? 1 : 0.7,
                    }}
                    className="flex-1 rounded-sm transition-all"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
