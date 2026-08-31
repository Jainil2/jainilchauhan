import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, RotateCcw, Link2 } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

type Node = { id: string; x: number; y: number };
type Edge = { from: string; to: string };

const nodes: Node[] = [
  { id: "A", x: 30, y: 20 },
  { id: "B", x: 80, y: 30 },
  { id: "C", x: 40, y: 80 },
  { id: "D", x: 90, y: 80 },
];

const edges: Edge[] = [
  { from: "A", to: "B" },
  { from: "A", to: "C" },
  { from: "B", to: "C" },
  { from: "C", to: "A" },
  { from: "D", to: "C" },
  { from: "D", to: "A" },
];

export function PageRankLab() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [ranks, setRanks] = useState<Record<string, number>>({
    A: 1,
    B: 1,
    C: 1,
    D: 1,
  });

  const [iteration, setIteration] = useState(0);

  function step() {
    const nextRanks = { ...ranks };
    const d = 0.85; // damping factor

    // Out degrees
    const outDegree: Record<string, number> = {};
    for (const n of nodes) outDegree[n.id] = 0;
    for (const e of edges) outDegree[e.from]++;

    for (const node of nodes) {
      let sum = 0;
      // Find inbound edges
      const inEdges = edges.filter((e) => e.to === node.id);
      for (const e of inEdges) {
        sum += ranks[e.from] / outDegree[e.from];
      }
      nextRanks[node.id] = 1 - d + d * sum;
    }

    setRanks(nextRanks);
    setIteration((i) => i + 1);
  }

  function reset() {
    setRanks({ A: 1, B: 1, C: 1, D: 1 });
    setIteration(0);
  }

  // Find max rank to normalize colors/sizes
  const maxRank = Math.max(...Object.values(ranks));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={step}
            className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-4 py-2 font-mono text-xs text-terminal hover:bg-terminal/20"
          >
            <Play className="size-3" /> Step Iteration
          </button>

          <div className="font-mono text-sm text-muted-foreground">
            Iteration: <span className="text-foreground">{iteration}</span>
          </div>
        </div>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" /> reset
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_250px]">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-card/40 p-4">
          <svg className="absolute inset-0 size-full pointer-events-none">
            {/* Define arrow marker */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="rgba(var(--muted-foreground), 0.5)" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="rgba(20,184,166, 0.8)" />
              </marker>
            </defs>

            {edges.map((e, i) => {
              const n1 = nodes.find((n) => n.id === e.from)!;
              const n2 = nodes.find((n) => n.id === e.to)!;
              // Add slight curve if bidirectional or just for aesthetics
              const dx = n2.x - n1.x;
              const dy = n2.y - n1.y;
              const cx = (n1.x + n2.x) / 2 - dy * 0.1;
              const cy = (n1.y + n2.y) / 2 + dx * 0.1;

              // If the source node has a high rank, color its outbound edges slightly
              const weight = ranks[e.from] / maxRank;
              const strokeColor =
                weight > 0.8 ? "rgba(20,184,166, 0.6)" : "rgba(var(--muted-foreground), 0.3)";
              const marker = weight > 0.8 ? "url(#arrowhead-active)" : "url(#arrowhead)";

              return (
                <path
                  key={i}
                  d={`M ${n1.x}% ${n1.y}% Q ${cx}% ${cy}% ${n2.x}% ${n2.y}%`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2"
                  markerEnd={marker}
                  className="transition-colors duration-500"
                />
              );
            })}
          </svg>

          {nodes.map((n) => {
            const rank = ranks[n.id];
            const scale = 1 + (rank / maxRank) * 0.5; // Scale up to 1.5x based on relative rank
            const isTop = rank === maxRank && iteration > 0;

            return (
              <motion.div
                key={n.id}
                initial={false}
                animate={
                  animate
                    ? {
                        scale,
                        backgroundColor: isTop
                          ? "rgba(20,184,166,0.2)"
                          : "rgba(var(--secondary), 0.8)",
                        borderColor: isTop ? "rgba(20,184,166,0.8)" : "rgba(var(--border))",
                      }
                    : false
                }
                className={`absolute flex size-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 text-center transition-colors duration-500 ${isTop ? "shadow-[0_0_15px_rgba(20,184,166,0.5)] z-10" : ""}`}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
              >
                <span
                  className={`font-mono text-sm font-bold ${isTop ? "text-terminal" : "text-foreground"}`}
                >
                  {n.id}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="rounded-lg border border-border bg-card/40 p-4">
            <h3 className="mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Link2 className="size-3" /> Page Ranks
            </h3>
            <div className="flex flex-col gap-3">
              {nodes.map((n) => (
                <div key={n.id} className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span
                      className={
                        ranks[n.id] === maxRank && iteration > 0
                          ? "text-terminal font-bold"
                          : "text-muted-foreground"
                      }
                    >
                      Node {n.id}
                    </span>
                    <span className="text-foreground">{ranks[n.id].toFixed(3)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary/50 overflow-hidden">
                    <motion.div
                      className="h-full bg-terminal"
                      initial={false}
                      animate={
                        animate
                          ? { width: `${(ranks[n.id] / Math.max(maxRank, 1)) * 100}%` }
                          : false
                      }
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          PageRank evaluates the importance of a node by counting the number and quality of links to
          it. A link from a highly-ranked node (like <strong>C</strong>) passes more "weight" than a
          link from a low-ranked node. The formula includes a damping factor (usually 0.85)
          representing the probability that a random surfer will continue clicking links vs jumping
          to a random new page.
        </p>
      </div>
    </div>
  );
}
