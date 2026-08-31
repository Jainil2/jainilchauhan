import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSimulationStore } from "@/lib/useSimulationStore";

const CAPACITY = 5;
const KEYS = ["users", "posts", "feed", "auth", "img", "geo", "stats", "tags"];

/**
 * LRU sim — head = most recent, tail = least recent. Evicts tail on overflow.
 * Click a key chip to "access" it.
 */
export function LRUCache() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const [list, setList] = useState<string[]>(["users", "posts", "feed"]);
  const [evicted, setEvicted] = useState<string | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);

  function access(k: string) {
    setEvicted(null);
    setList((prev) => {
      const exists = prev.includes(k);
      if (exists) {
        setHits((h) => h + 1);
        return [k, ...prev.filter((x) => x !== k)];
      }
      setMisses((m) => m + 1);
      const next = [k, ...prev];
      if (next.length > CAPACITY) {
        const drop = next.pop();
        if (drop) setEvicted(drop);
      }
      return next;
    });
  }

  function reset() {
    setList([]);
    setEvicted(null);
    setHits(0);
    setMisses(0);
  }

  const animate = simulationsEnabled && !reduce;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => access(k)}
            className="rounded-md border border-border bg-secondary/50 px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:border-terminal/60 hover:text-terminal"
          >
            {k}
          </button>
        ))}
        <button
          onClick={reset}
          className="ml-auto rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          reset
        </button>
      </div>

      <div className="rounded-md border border-border bg-background/40 p-4">
        <div className="mb-2 flex justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <span>head (most recent)</span>
          <span>tail (next eviction)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence mode="popLayout">
            {list.map((k, i) => (
              <motion.div
                key={k}
                layout={animate}
                initial={animate ? { opacity: 0, scale: 0.7 } : false}
                animate={{ opacity: 1, scale: 1 }}
                exit={animate ? { opacity: 0, x: 30, scale: 0.7 } : { opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-xs ${
                  i === 0
                    ? "border-terminal/60 bg-terminal/15 text-terminal"
                    : i === list.length - 1 && list.length === CAPACITY
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-border bg-card/60 text-foreground"
                }`}
              >
                <span>{k}</span>
                {i < list.length - 1 && <span className="text-muted-foreground">⇄</span>}
              </motion.div>
            ))}
          </AnimatePresence>
          {Array.from({ length: Math.max(0, CAPACITY - list.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="rounded-md border border-dashed border-border px-3 py-2 font-mono text-xs text-muted-foreground"
            >
              ∅
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-background/40 px-3 py-2 font-mono text-xs">
          <span className="text-muted-foreground">hits </span>
          <span className="text-terminal">{hits}</span>
        </div>
        <div className="rounded-md border border-border bg-background/40 px-3 py-2 font-mono text-xs">
          <span className="text-muted-foreground">misses </span>
          <span className="text-cyan-accent">{misses}</span>
        </div>
        <div className="rounded-md border border-border bg-background/40 px-3 py-2 font-mono text-xs">
          <span className="text-muted-foreground">evicted </span>
          <span className="text-destructive">{evicted ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}
