import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, RotateCcw, Search, Zap } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

type Node = { val: number; levels: number };

export function SkipList() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [nodes, setNodes] = useState<Node[]>([]);
  const MAX_LEVEL = 4;

  const [inputVal, setInputVal] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [path, setPath] = useState<{ val: number; level: number }[]>([]);
  const [log, setLog] = useState<{ id: number; msg: string }[]>([]);
  const [logId, setLogId] = useState(0);

  function addLog(msg: string) {
    setLogId((prev) => {
      setLog((l) => [{ id: prev, msg }, ...l].slice(0, 5));
      return prev + 1;
    });
  }

  function randomLevel() {
    let lvl = 1;
    while (Math.random() < 0.5 && lvl < MAX_LEVEL) {
      lvl++;
    }
    return lvl;
  }

  function insert(e?: React.FormEvent, value?: number) {
    if (e) e.preventDefault();
    const val = value ?? parseInt(inputVal);
    if (isNaN(val)) return;

    setNodes((prev) => {
      const existing = prev.find((n) => n.val === val);
      if (existing) return prev;

      const next = [...prev, { val, levels: randomLevel() }];
      next.sort((a, b) => a.val - b.val);
      return next;
    });

    addLog(`Inserted ${val}`);
    if (!value) setInputVal("");
    setPath([]);
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    const target = parseInt(searchVal);
    if (isNaN(target)) return;

    const searchPath: { val: number; level: number }[] = [];

    let currentLevel = MAX_LEVEL;
    let currentIdx = -1; // -Infinity

    while (currentLevel >= 1) {
      searchPath.push({
        val: currentIdx === -1 ? -Infinity : nodes[currentIdx].val,
        level: currentLevel,
      });

      let nextIdx = currentIdx + 1;
      while (nextIdx < nodes.length) {
        if (nodes[nextIdx].levels >= currentLevel) {
          if (nodes[nextIdx].val === target) {
            searchPath.push({ val: nodes[nextIdx].val, level: currentLevel });
            setPath(searchPath);
            addLog(`Found ${target}!`);
            setSearchVal("");
            return;
          } else if (nodes[nextIdx].val < target) {
            currentIdx = nextIdx;
            searchPath.push({ val: nodes[currentIdx].val, level: currentLevel });
          } else {
            break;
          }
        }
        nextIdx++;
      }
      currentLevel--;
    }

    setPath(searchPath);
    addLog(`${target} not found`);
    setSearchVal("");
  }

  function addRandom() {
    insert(undefined, Math.floor(Math.random() * 99) + 1);
  }

  function reset() {
    setNodes([]);
    setPath([]);
    setLog([]);
    setLogId(0);
  }

  const levelsArray = Array.from({ length: MAX_LEVEL }, (_, i) => MAX_LEVEL - i);

  function isPath(val: number, level: number) {
    return path.some((p) => p.val === val && p.level === level);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={insert} className="flex items-center gap-2 font-mono text-xs">
            <input
              type="number"
              min="0"
              max="999"
              placeholder="value"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-20 rounded border border-border bg-background px-2 py-1.5 outline-none focus:border-terminal/50"
              required
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 text-terminal hover:bg-terminal/20"
            >
              <Plus className="size-3" /> Insert
            </button>
            <button
              type="button"
              onClick={addRandom}
              className="flex items-center gap-1.5 rounded-md border border-cyan-accent/40 bg-cyan-accent/10 px-3 py-1.5 text-cyan-accent hover:bg-cyan-accent/20"
            >
              <Zap className="size-3" /> Random
            </button>
          </form>

          <form onSubmit={search} className="flex items-center gap-2 font-mono text-xs">
            <input
              type="number"
              min="0"
              max="999"
              placeholder="target"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-20 rounded border border-border bg-background px-2 py-1.5 outline-none focus:border-amber-500/50"
              required
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-amber-500 hover:bg-amber-500/20"
            >
              <Search className="size-3" /> Search
            </button>
          </form>
        </div>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" /> reset
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-6 overflow-x-auto">
        <div className="min-w-max flex flex-col gap-4 font-mono">
          {levelsArray.map((level) => (
            <div key={`lvl-${level}`} className="flex items-center gap-4">
              <div className="w-12 text-xs uppercase tracking-wider text-muted-foreground text-right">
                L{level}
              </div>

              {/* Head node (-Infinity) */}
              <motion.div
                initial={false}
                animate={
                  animate
                    ? {
                        scale: isPath(-Infinity, level) ? 1.1 : 1,
                        borderColor: isPath(-Infinity, level)
                          ? "rgba(245,158,11,0.5)"
                          : "rgba(var(--border))",
                      }
                    : false
                }
                className={`flex size-10 items-center justify-center rounded-full border bg-background text-xs transition-colors ${
                  isPath(-Infinity, level)
                    ? "bg-amber-500/20 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    : "text-muted-foreground"
                }`}
              >
                H
              </motion.div>

              {/* Nodes in this level */}
              <div className="flex flex-1 items-center gap-4 relative">
                <div className="absolute top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-border/50" />

                {nodes.map((node) => {
                  const inLevel = node.levels >= level;
                  const inPath = isPath(node.val, level);

                  return (
                    <div
                      key={`${node.val}-${level}`}
                      className="flex justify-center"
                      style={{ width: "40px" }}
                    >
                      {inLevel ? (
                        <motion.div
                          initial={animate ? { scale: 0 } : false}
                          animate={
                            animate
                              ? {
                                  scale: inPath ? 1.1 : 1,
                                  borderColor: inPath
                                    ? "rgba(245,158,11,0.5)"
                                    : "rgba(20,184,166,0.4)",
                                }
                              : { scale: 1 }
                          }
                          className={`flex size-10 items-center justify-center rounded-full border transition-colors ${
                            inPath
                              ? "bg-amber-500/20 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] z-10"
                              : "bg-terminal/5 text-terminal"
                          }`}
                        >
                          {node.val}
                        </motion.div>
                      ) : (
                        <div className="size-10" /> // Spacer for alignment
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {log.length > 0 && (
        <div className="rounded-lg border border-border bg-card/40 p-4 font-mono text-xs">
          <h3 className="mb-2 uppercase tracking-wider text-muted-foreground">Operations Log</h3>
          <ul className="space-y-1">
            {log.map((entry) => (
              <motion.li
                key={entry.id}
                initial={animate ? { opacity: 0, x: -10 } : false}
                animate={{ opacity: 1, x: 0 }}
                className={`border-b border-border/50 pb-1 last:border-0 ${
                  entry.msg.includes("not found")
                    ? "text-destructive"
                    : entry.msg.includes("Found")
                      ? "text-amber-500"
                      : "text-terminal"
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
          Skip Lists use probability to build a data structure with the same <code>O(log N)</code>{" "}
          search/insert time as a balanced tree, but without the complex rotation logic. Searching
          starts at the top layer, rapidly skipping past smaller values, and drops down a layer when
          it overshoots the target. Redis uses Skip Lists to implement Sorted Sets.
        </p>
      </div>
    </div>
  );
}
