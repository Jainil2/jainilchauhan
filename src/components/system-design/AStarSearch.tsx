import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, RotateCcw, Activity } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

type Point = { r: number; c: number };

const ROWS = 12;
const COLS = 16;

const START: Point = { r: 5, c: 2 };
const END: Point = { r: 5, c: 13 };

export function AStarSearch() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [grid, setGrid] = useState<number[][]>(() => {
    const g = Array(ROWS).fill(0).map(() => Array(COLS).fill(0)); // 0: empty, 1: wall
    for(let r=3; r<=8; r++) g[r][7] = 1;
    return g;
  });
  
  const [visited, setVisited] = useState<boolean[][]>(Array(ROWS).fill(0).map(() => Array(COLS).fill(false)));
  const [path, setPath] = useState<Point[]>([]);
  const [openSet, setOpenSet] = useState<Point[]>([]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ nodesVisited: 0, pathLength: 0 });

  function toggleWall(r: number, c: number) {
    if (isRunning) return;
    if ((r === START.r && c === START.c) || (r === END.r && c === END.c)) return;
    
    setGrid(prev => {
      const next = [...prev];
      next[r] = [...next[r]];
      next[r][c] = next[r][c] === 1 ? 0 : 1;
      return next;
    });
    clearResults();
  }

  function clearResults() {
    setVisited(Array(ROWS).fill(0).map(() => Array(COLS).fill(false)));
    setPath([]);
    setOpenSet([]);
    setStats({ nodesVisited: 0, pathLength: 0 });
  }

  function reset() {
    if (isRunning) return;
    setGrid(Array(ROWS).fill(0).map(() => Array(COLS).fill(0)));
    clearResults();
  }

  const delay = (ms: number) => new Promise(res => setTimeout(res, animate ? ms : 0));

  async function runSearch(algorithm: 'dijkstra' | 'astar') {
    if (isRunning) return;
    setIsRunning(true);
    clearResults();

    const dist = Array(ROWS).fill(0).map(() => Array(COLS).fill(Infinity));
    const parent = Array(ROWS).fill(0).map(() => Array(COLS).fill(null));
    const vis = Array(ROWS).fill(0).map(() => Array(COLS).fill(false));
    
    dist[START.r][START.c] = 0;
    
    const pq = [{ r: START.r, c: START.c, f: 0 }];
    
    let nodesVisited = 0;

    const heuristic = (r: number, c: number) => {
      if (algorithm === 'dijkstra') return 0;
      return Math.abs(r - END.r) + Math.abs(c - END.c); // Manhattan Distance
    };

    while (pq.length > 0) {
      pq.sort((a, b) => a.f - b.f);
      const curr = pq.shift()!;
      
      if (vis[curr.r][curr.c]) continue;
      vis[curr.r][curr.c] = true;
      nodesVisited++;

      setVisited([...vis.map(row => [...row])]);
      setOpenSet([...pq.map(p => ({r: p.r, c: p.c}))]);
      setStats(s => ({ ...s, nodesVisited }));

      if (curr.r === END.r && curr.c === END.c) {
        break; 
      }

      const neighbors = [
        { r: curr.r - 1, c: curr.c },
        { r: curr.r + 1, c: curr.c },
        { r: curr.r, c: curr.c - 1 },
        { r: curr.r, c: curr.c + 1 },
      ];

      for (const n of neighbors) {
        if (n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS && grid[n.r][n.c] !== 1 && !vis[n.r][n.c]) {
          const newDist = dist[curr.r][curr.c] + 1;
          if (newDist < dist[n.r][n.c]) {
            dist[n.r][n.c] = newDist;
            parent[n.r][n.c] = { r: curr.r, c: curr.c };
            pq.push({ r: n.r, c: n.c, f: newDist + heuristic(n.r, n.c) });
          }
        }
      }
      
      await delay(20);
    }

    const p: Point[] = [];
    let curr: Point | null = { r: END.r, c: END.c };
    if (parent[END.r][END.c]) {
       while (curr) {
         p.push(curr);
         curr = parent[curr.r][curr.c];
       }
       p.reverse();
       setPath(p);
       setStats(s => ({ ...s, pathLength: p.length - 1 }));
    }

    setIsRunning(false);
  }

  function isPath(r: number, c: number) {
    return path.some(p => p.r === r && p.c === c);
  }
  
  function isOpen(r: number, c: number) {
    return openSet.some(p => p.r === r && p.c === c);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
           <button
             onClick={() => runSearch('dijkstra')}
             disabled={isRunning}
             className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 font-mono text-xs text-terminal hover:bg-terminal/20 disabled:opacity-50"
           >
             <Play className="size-3" /> Dijkstra (BFS)
           </button>
           <button
             onClick={() => runSearch('astar')}
             disabled={isRunning}
             className="flex items-center gap-1.5 rounded-md border border-cyan-accent/40 bg-cyan-accent/10 px-3 py-1.5 font-mono text-xs text-cyan-accent hover:bg-cyan-accent/20 disabled:opacity-50"
           >
             <Activity className="size-3" /> A* Search
           </button>
        </div>

        <button
          onClick={reset}
          disabled={isRunning}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <RotateCcw className="size-3" /> clear walls
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-6">
        <div className="overflow-x-auto rounded-xl border border-border bg-card/40 p-4">
           <div 
             className="grid w-max gap-0.5" 
             style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
           >
              {grid.map((row, r) => 
                row.map((val, c) => {
                   const isStart = r === START.r && c === START.c;
                   const isEnd = r === END.r && c === END.c;
                   const isWall = val === 1;
                   const isVis = visited[r][c];
                   const isP = isPath(r, c);
                   const isOp = isOpen(r, c);
                   
                   let bgClass = "bg-secondary/30";
                   if (isStart) bgClass = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] z-10 text-black";
                   else if (isEnd) bgClass = "bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)] z-10 text-white";
                   else if (isWall) bgClass = "bg-muted-foreground/80";
                   else if (isP) bgClass = "bg-terminal shadow-[0_0_8px_rgba(20,184,166,0.6)] z-10";
                   else if (isOp) bgClass = "bg-cyan-accent/30";
                   else if (isVis) bgClass = "bg-terminal/20";
                   
                   return (
                     <motion.div
                       key={`${r}-${c}`}
                       onClick={() => toggleWall(r, c)}
                       initial={false}
                       animate={animate ? { scale: isP ? [0.8, 1.1, 1] : 1 } : false}
                       className={`flex size-6 sm:size-8 cursor-pointer items-center justify-center rounded-sm transition-colors duration-300 ${bgClass}`}
                     >
                        {isStart && <span className="font-mono text-xs font-bold">S</span>}
                        {isEnd && <span className="font-mono text-xs font-bold">E</span>}
                     </motion.div>
                   )
                })
              )}
           </div>
        </div>

        <div className="flex w-40 flex-col gap-4 font-mono text-xs">
           <div className="rounded-lg border border-border bg-card/40 p-4">
              <h3 className="mb-2 uppercase tracking-wider text-muted-foreground">Stats</h3>
              <div className="flex justify-between">
                <span>Visited</span>
                <span className="text-terminal">{stats.nodesVisited}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Path Len</span>
                <span className="text-cyan-accent">{stats.pathLength > 0 ? stats.pathLength : '-'}</span>
              </div>
           </div>
           
           <div className="rounded-lg border border-border bg-card/40 p-4">
              <h3 className="mb-2 uppercase tracking-wider text-muted-foreground">Legend</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2"><div className="size-3 rounded-sm bg-muted-foreground/80"></div>Wall</div>
                <div className="flex items-center gap-2"><div className="size-3 rounded-sm bg-terminal/20"></div>Visited</div>
                <div className="flex items-center gap-2"><div className="size-3 rounded-sm bg-cyan-accent/30"></div>Frontier</div>
                <div className="flex items-center gap-2"><div className="size-3 rounded-sm bg-terminal shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>Path</div>
              </div>
           </div>
        </div>
      </div>

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          <strong>Dijkstra</strong> expands in all directions equally (Breadth-First Search on an unweighted grid), visiting many unnecessary nodes. 
          <strong>A* Search</strong> uses a heuristic (Manhattan distance) to prioritize exploring nodes that move <em>closer to the goal</em>, resulting in significantly fewer visited nodes while still finding the shortest path.
        </p>
      </div>
    </div>
  );
}
