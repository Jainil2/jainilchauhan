import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useSimulationStore } from "@/lib/useSimulationStore";

const ROWS = 12;
const COLS = 20;
const START = { r: 5, c: 1 };
const END = { r: 5, c: 18 };

type CellState = "empty" | "wall" | "visited" | "path" | "start" | "end";

function key(r: number, c: number) {
  return `${r},${c}`;
}

function dijkstra(walls: Set<string>): { visitedOrder: string[]; path: string[] } {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visitedOrder: string[] = [];
  const queue: { k: string; r: number; c: number; d: number }[] = [];
  const startK = key(START.r, START.c);
  const endK = key(END.r, END.c);
  dist[startK] = 0;
  queue.push({ k: startK, r: START.r, c: START.c, d: 0 });

  while (queue.length) {
    queue.sort((a, b) => a.d - b.d);
    const cur = queue.shift()!;
    if (visitedOrder.includes(cur.k)) continue;
    visitedOrder.push(cur.k);
    if (cur.k === endK) break;
    for (const [dr, dc] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      const nk = key(nr, nc);
      if (walls.has(nk)) continue;
      const nd = cur.d + 1;
      if (dist[nk] === undefined || nd < dist[nk]) {
        dist[nk] = nd;
        prev[nk] = cur.k;
        queue.push({ k: nk, r: nr, c: nc, d: nd });
      }
    }
  }

  const path: string[] = [];
  let cur: string | null = endK;
  while (cur && prev[cur] !== undefined) {
    path.unshift(cur);
    cur = prev[cur] ?? null;
  }
  if (path[0] !== startK) path.length = 0;
  return { visitedOrder, path };
}

export function DijkstraGrid() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const [walls, setWalls] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);

  function toggleWall(r: number, c: number) {
    if (running) return;
    if ((r === START.r && c === START.c) || (r === END.r && c === END.c)) return;
    const k = key(r, c);
    setWalls((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
    setVisited(new Set());
    setPath(new Set());
  }

  async function run() {
    setRunning(true);
    setVisited(new Set());
    setPath(new Set());
    const { visitedOrder, path: p } = dijkstra(walls);
    const animate = simulationsEnabled && !reduce;
    if (!animate) {
      setVisited(new Set(visitedOrder));
      setPath(new Set(p));
      setRunning(false);
      return;
    }
    for (let i = 0; i < visitedOrder.length; i++) {
      await new Promise((r) => setTimeout(r, 8));
      setVisited((prev) => new Set([...prev, visitedOrder[i]]));
    }
    for (let i = 0; i < p.length; i++) {
      await new Promise((r) => setTimeout(r, 30));
      setPath((prev) => new Set([...prev, p[i]]));
    }
    setRunning(false);
  }

  function clear() {
    setWalls(new Set());
    setVisited(new Set());
    setPath(new Set());
  }

  function cellState(r: number, c: number): CellState {
    if (r === START.r && c === START.c) return "start";
    if (r === END.r && c === END.c) return "end";
    const k = key(r, c);
    if (path.has(k)) return "path";
    if (walls.has(k)) return "wall";
    if (visited.has(k)) return "visited";
    return "empty";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={run}
          disabled={running}
          className="rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 font-mono text-xs text-terminal hover:bg-terminal/20 disabled:opacity-50"
        >
          ▶ run dijkstra
        </button>
        <button
          onClick={clear}
          className="rounded-md border border-border bg-secondary/50 px-3 py-1.5 font-mono text-xs text-foreground hover:bg-secondary"
        >
          clear
        </button>
        <span className="ml-auto self-center font-mono text-xs text-muted-foreground">
          visited: <span className="text-cyan-accent">{visited.size}</span> · path:{" "}
          <span className="text-terminal">{path.size}</span>
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-background/40 p-2">
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: ROWS }).flatMap((_, r) =>
            Array.from({ length: COLS }).map((_, c) => {
              const state = cellState(r, c);
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => toggleWall(r, c)}
                  aria-label={`cell ${r},${c} ${state}`}
                  className={`aspect-square rounded-sm transition-colors ${
                    state === "start"
                      ? "bg-terminal"
                      : state === "end"
                        ? "bg-cyan-accent"
                        : state === "wall"
                          ? "bg-foreground/80"
                          : state === "path"
                            ? "bg-terminal/70"
                            : state === "visited"
                              ? "bg-cyan-accent/30"
                              : "bg-secondary/40 hover:bg-secondary"
                  }`}
                />
              );
            }),
          )}
        </div>
      </div>

      <p className="font-mono text-xs text-muted-foreground">
        Click cells to toggle walls. Start = <span className="text-terminal">green</span>, End ={" "}
        <span className="text-cyan-accent">cyan</span>.
      </p>
    </div>
  );
}
