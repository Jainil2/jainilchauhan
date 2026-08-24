import { useEffect, useMemo, useState } from "react";

type Algo = "bfs" | "dfs";

const NODES = [
  { id: "A", x: 50, y: 40 },
  { id: "B", x: 130, y: 40 },
  { id: "C", x: 210, y: 40 },
  { id: "D", x: 50, y: 120 },
  { id: "E", x: 130, y: 120 },
  { id: "F", x: 210, y: 120 },
  { id: "G", x: 90, y: 200 },
  { id: "H", x: 170, y: 200 },
];
const EDGES: [string, string][] = [
  ["A", "B"], ["A", "D"], ["B", "C"], ["B", "E"],
  ["C", "F"], ["D", "E"], ["D", "G"], ["E", "F"],
  ["E", "H"], ["F", "H"], ["G", "H"],
];

function buildAdj() {
  const adj: Record<string, string[]> = {};
  for (const n of NODES) adj[n.id] = [];
  for (const [a, b] of EDGES) { adj[a].push(b); adj[b].push(a); }
  for (const k in adj) adj[k].sort();
  return adj;
}

interface Step {
  visited: Set<string>;
  frontier: string[]; // queue or stack
  current: string | null;
}

function trace(algo: Algo, start: string): Step[] {
  const adj = buildAdj();
  const steps: Step[] = [];
  const visited = new Set<string>();
  const frontier = [start];
  visited.add(start);
  steps.push({ visited: new Set(visited), frontier: [...frontier], current: null });
  while (frontier.length > 0) {
    const node = algo === "bfs" ? frontier.shift()! : frontier.pop()!;
    steps.push({ visited: new Set(visited), frontier: [...frontier], current: node });
    for (const nb of adj[node]) {
      if (!visited.has(nb)) { visited.add(nb); frontier.push(nb); }
    }
    steps.push({ visited: new Set(visited), frontier: [...frontier], current: node });
  }
  return steps;
}

function GraphView({ step, label }: { step: Step | null; label: string }) {
  return (
    <div className="rounded border border-border bg-background/40 p-3">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <svg viewBox="0 0 260 240" className="w-full">
        {EDGES.map(([a, b], i) => {
          const na = NODES.find((n) => n.id === a)!;
          const nb = NODES.find((n) => n.id === b)!;
          return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="oklch(0.30 0.02 150 / 50%)" strokeWidth="1" />;
        })}
        {NODES.map((n) => {
          const visited = step?.visited.has(n.id);
          const isCurrent = step?.current === n.id;
          return (
            <g key={n.id}>
              <circle
                cx={n.x} cy={n.y} r={14}
                fill={isCurrent ? "oklch(0.85 0.21 150)" : visited ? "oklch(0.85 0.21 150 / 30%)" : "oklch(0.20 0.02 150)"}
                stroke={isCurrent ? "oklch(0.85 0.21 150)" : visited ? "oklch(0.85 0.21 150 / 60%)" : "oklch(0.30 0.02 150)"}
                strokeWidth="1.5"
              />
              <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono"
                fill={isCurrent ? "oklch(0.20 0.02 150)" : "oklch(0.85 0.21 150)"}>{n.id}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function GraphTraversalLab() {
  const bfsSteps = useMemo(() => trace("bfs", "A"), []);
  const dfsSteps = useMemo(() => trace("dfs", "A"), []);
  const max = Math.max(bfsSteps.length, dfsSteps.length);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setI((x) => (x + 1 >= max ? (setPlaying(false), x) : x + 1)), 600);
    return () => clearInterval(id);
  }, [playing, max]);

  const bfs = bfsSteps[Math.min(i, bfsSteps.length - 1)] ?? null;
  const dfs = dfsSteps[Math.min(i, dfsSteps.length - 1)] ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <button onClick={() => setPlaying((p) => !p)} className="rounded border border-border px-2 py-1 hover:border-terminal/50 hover:text-terminal">
          {playing ? "pause" : "play"}
        </button>
        <button onClick={() => setI((x) => Math.min(x + 1, max - 1))} className="rounded border border-border px-2 py-1 hover:border-terminal/50 hover:text-terminal">step →</button>
        <button onClick={() => { setI(0); setPlaying(false); }} className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">reset</button>
        <span className="ml-auto text-muted-foreground">step {i + 1} / {max}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <GraphView step={bfs} label="BFS — uses Queue" />
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            queue: <span className="text-terminal">[{bfs?.frontier.join(", ") ?? ""}]</span>
          </p>
        </div>
        <div>
          <GraphView step={dfs} label="DFS — uses Stack" />
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            stack: <span className="text-cyan-accent">[{dfs?.frontier.join(", ") ?? ""}]</span>
          </p>
        </div>
      </div>
    </div>
  );
}
