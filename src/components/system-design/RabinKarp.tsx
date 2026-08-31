import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, RotateCcw, FastForward } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

const PRIME = 101;
const D = 256;

export function RabinKarp() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [text, setText] = useState("ABABDABACDABABCABAB");
  const [pattern, setPattern] = useState("ABABC");

  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [patternHash, setPatternHash] = useState<number | null>(null);
  const [windowHash, setWindowHash] = useState<number | null>(null);
  const [matches, setMatches] = useState<number[]>([]);
  const [log, setLog] = useState<{ id: number; msg: string }[]>([]);
  const [logId, setLogId] = useState(0);

  function addLog(msg: string) {
    setLogId((prev) => {
      setLog((l) => [{ id: prev, msg }, ...l].slice(0, 4));
      return prev + 1;
    });
  }

  const delay = (ms: number) => new Promise((res) => setTimeout(res, animate ? ms : 0));

  async function search(fast = false) {
    if (isRunning || !text || !pattern || text.length < pattern.length) return;
    setIsRunning(true);
    setMatches([]);
    setCurrentIndex(null);
    setLog([]);

    const M = pattern.length;
    const N = text.length;
    let i, j;
    let p = 0;
    let t = 0;
    let h = 1;

    for (i = 0; i < M - 1; i++) {
      h = (h * D) % PRIME;
    }

    for (i = 0; i < M; i++) {
      p = (D * p + pattern.charCodeAt(i)) % PRIME;
      t = (D * t + text.charCodeAt(i)) % PRIME;
    }

    setPatternHash(p);
    if (!fast) addLog(`Pattern Hash = ${p}`);

    const foundMatches: number[] = [];

    for (i = 0; i <= N - M; i++) {
      if (!fast) {
        setCurrentIndex(i);
        setWindowHash(t);
        await delay(600);
      }

      if (p === t) {
        if (!fast) addLog(`Hash match at index ${i}! Verifying characters...`);
        let match = true;
        for (j = 0; j < M; j++) {
          if (text[i + j] !== pattern[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          if (!fast) addLog(`Exact match found at index ${i}!`);
          foundMatches.push(i);
          setMatches([...foundMatches]);
          if (!fast) await delay(300);
        } else {
          if (!fast) addLog(`Spurious hit at index ${i} (Hash collision).`);
        }
      }

      if (i < N - M) {
        let next_t = (D * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + M)) % PRIME;
        if (next_t < 0) next_t = next_t + PRIME;
        t = next_t;
      }
    }

    if (fast) {
      setCurrentIndex(N - M);
      setWindowHash(t);
      setMatches([...foundMatches]);
      addLog(`Search completed. Found ${foundMatches.length} matches.`);
    } else {
      addLog(`Search completed.`);
    }

    setCurrentIndex(null);
    setIsRunning(false);
  }

  function reset() {
    if (isRunning) return;
    setCurrentIndex(null);
    setPatternHash(null);
    setWindowHash(null);
    setMatches([]);
    setLog([]);
    setLogId(0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-16 text-muted-foreground">Text:</span>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value.toUpperCase())}
                maxLength={30}
                disabled={isRunning}
                className="w-48 rounded border border-border bg-background px-2 py-1 outline-none focus:border-terminal/50 disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-muted-foreground">Pattern:</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value.toUpperCase())}
                maxLength={10}
                disabled={isRunning}
                className="w-48 rounded border border-border bg-background px-2 py-1 outline-none focus:border-amber-500/50 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => search(false)}
              disabled={isRunning || !text || !pattern || text.length < pattern.length}
              className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 font-mono text-xs text-terminal hover:bg-terminal/20 disabled:opacity-50"
            >
              <Play className="size-3" /> Search
            </button>
            <button
              onClick={() => search(true)}
              disabled={isRunning || !text || !pattern || text.length < pattern.length}
              className="flex items-center gap-1.5 rounded-md border border-cyan-accent/40 bg-cyan-accent/10 px-3 py-1.5 font-mono text-xs text-cyan-accent hover:bg-cyan-accent/20 disabled:opacity-50"
            >
              <FastForward className="size-3" /> Instant
            </button>
          </div>
        </div>

        <button
          onClick={reset}
          disabled={isRunning}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <RotateCcw className="size-3" /> reset
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-6 overflow-x-auto">
        <div className="min-w-max flex flex-col gap-6 font-mono text-sm">
          {/* Text Array */}
          <div className="flex">
            {text.split("").map((char, i) => {
              const isMatch = matches.some((m) => i >= m && i < m + pattern.length);
              const isWindow =
                currentIndex !== null && i >= currentIndex && i < currentIndex + pattern.length;

              let bgClass = "border-border bg-background text-muted-foreground";
              if (isMatch)
                bgClass =
                  "border-terminal bg-terminal/20 text-terminal shadow-[0_0_8px_rgba(20,184,166,0.5)] z-10";
              else if (isWindow) bgClass = "border-amber-500 bg-amber-500/20 text-amber-500 z-10";

              return (
                <motion.div
                  key={i}
                  initial={false}
                  animate={animate && (isMatch || isWindow) ? { y: -2 } : { y: 0 }}
                  className={`flex size-8 items-center justify-center border-y border-r first:border-l first:rounded-l last:rounded-r transition-colors duration-200 ${bgClass}`}
                >
                  {char}
                </motion.div>
              );
            })}
          </div>

          {/* Pattern sliding underneath */}
          <div className="relative h-12">
            {currentIndex !== null && (
              <motion.div
                className="absolute flex items-center gap-4"
                initial={false}
                animate={animate ? { x: currentIndex * 32 } : false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex border border-amber-500/50 rounded shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  {pattern.split("").map((char, i) => (
                    <div
                      key={i}
                      className="flex size-8 items-center justify-center bg-background text-amber-500 border-r border-amber-500/20 last:border-0"
                    >
                      {char}
                    </div>
                  ))}
                </div>

                {/* Hash display */}
                <div className="flex items-center gap-2 whitespace-nowrap text-xs">
                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground">Pattern Hash:</span>
                    <span className="text-muted-foreground">Window Hash:</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-amber-500 font-bold">{patternHash}</span>
                    <span
                      className={
                        windowHash === patternHash
                          ? "text-terminal font-bold"
                          : "text-destructive font-bold"
                      }
                    >
                      {windowHash}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {log.length > 0 && (
          <div className="rounded-lg border border-border bg-card/40 p-4 font-mono text-xs">
            <h3 className="mb-2 uppercase tracking-wider text-muted-foreground">Log</h3>
            <ul className="space-y-1">
              {log.map((entry) => (
                <motion.li
                  key={entry.id}
                  initial={animate ? { opacity: 0, x: -10 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  className={`border-b border-border/50 pb-1 last:border-0 ${
                    entry.msg.includes("Exact match")
                      ? "text-terminal"
                      : entry.msg.includes("Hash match")
                        ? "text-amber-500"
                        : "text-muted-foreground"
                  }`}
                >
                  &gt; {entry.msg}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
          <p>
            <strong>Rabin-Karp</strong> uses a rolling hash to rapidly filter out positions that
            cannot possibly match the pattern. Instead of calculating the hash for the entire window
            from scratch each time, it takes the previous hash, subtracts the first character,
            shifts, and adds the new character in <code>O(1)</code> time. Characters are only
            compared one-by-one if the hashes match (to handle rare hash collisions).
          </p>
        </div>
      </div>
    </div>
  );
}
