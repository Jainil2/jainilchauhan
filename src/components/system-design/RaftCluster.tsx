import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSimulationStore } from "@/lib/useSimulationStore";

type Role = "leader" | "follower" | "candidate" | "down";
interface Node {
  id: number;
  role: Role;
  term: number;
}

const N = 5;
const RADIUS = 110;
const CENTER = 140;

function nodePos(i: number): { x: number; y: number } {
  const a = (i / N) * Math.PI * 2 - Math.PI / 2;
  return { x: CENTER + Math.cos(a) * RADIUS, y: CENTER + Math.sin(a) * RADIUS };
}

/**
 * Tiny Raft sim: leader heartbeats, follower timeouts, candidate election.
 * Click any node to crash/restore. Animated RPC packets travel between nodes.
 */
export function RaftCluster() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const [nodes, setNodes] = useState<Node[]>(() =>
    Array.from({ length: N }, (_, i) => ({
      id: i,
      role: i === 0 ? "leader" : "follower",
      term: 1,
    })),
  );
  const [packets, setPackets] = useState<{ id: string; from: number; to: number; kind: "hb" | "vote" }[]>(
    [],
  );
  const [log, setLog] = useState<string[]>(["term 1: node 0 elected leader"]);

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const tickRef = useRef(0);

  const enabled = simulationsEnabled && !reduce;

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      tickRef.current += 1;
      const cur = nodesRef.current;
      const leader = cur.find((n) => n.role === "leader");
      if (leader) {
        // Heartbeats
        const newPackets = cur
          .filter((n) => n.role !== "down" && n.id !== leader.id)
          .map((n) => ({
            id: `hb-${tickRef.current}-${n.id}`,
            from: leader.id,
            to: n.id,
            kind: "hb" as const,
          }));
        setPackets((p) => [...p, ...newPackets].slice(-12));
        return;
      }
      // No leader → trigger election
      const alive = cur.filter((n) => n.role !== "down");
      if (alive.length === 0) return;
      const candidate = alive[Math.floor(Math.random() * alive.length)];
      const newTerm = Math.max(...cur.map((n) => n.term)) + 1;
      setNodes((prev) =>
        prev.map((n) =>
          n.id === candidate.id
            ? { ...n, role: "candidate", term: newTerm }
            : n.role === "down"
              ? n
              : { ...n, term: newTerm },
        ),
      );
      const votes = alive
        .filter((n) => n.id !== candidate.id)
        .map((n) => ({
          id: `vote-${tickRef.current}-${n.id}`,
          from: candidate.id,
          to: n.id,
          kind: "vote" as const,
        }));
      setPackets((p) => [...p, ...votes].slice(-12));
      setLog((l) => [`term ${newTerm}: node ${candidate.id} requesting votes`, ...l].slice(0, 5));
      // Promote after a short delay
      setTimeout(() => {
        setNodes((prev) =>
          prev.map((n) => (n.id === candidate.id && n.role === "candidate" ? { ...n, role: "leader" } : n)),
        );
        setLog((l) => [`term ${newTerm}: node ${candidate.id} elected leader`, ...l].slice(0, 5));
      }, 900);
    }, 1400);
    return () => clearInterval(id);
  }, [enabled]);

  // Drop stale packets
  useEffect(() => {
    if (packets.length === 0) return;
    const t = setTimeout(() => setPackets((p) => p.slice(2)), 1100);
    return () => clearTimeout(t);
  }, [packets]);

  function toggle(id: number) {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id
          ? n.role === "down"
            ? { ...n, role: "follower" }
            : { ...n, role: "down" }
          : n,
      ),
    );
    setLog((l) =>
      [`node ${id} ${nodesRef.current[id].role === "down" ? "restored" : "crashed"}`, ...l].slice(0, 5),
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <svg viewBox="0 0 280 280" className="h-72 w-full" role="img" aria-label="Raft cluster">
        {nodes.map((n) => {
          const p = nodePos(n.id);
          return (
            <line
              key={`l-${n.id}`}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="var(--border)"
              strokeDasharray="2 4"
              strokeWidth={1}
            />
          );
        })}
        <AnimatePresence>
          {packets.map((pk) => {
            const from = nodePos(pk.from);
            const to = nodePos(pk.to);
            return (
              <motion.circle
                key={pk.id}
                r={4}
                fill={pk.kind === "hb" ? "var(--terminal)" : "var(--cyan-accent)"}
                initial={{ cx: from.x, cy: from.y, opacity: 0 }}
                animate={{ cx: to.x, cy: to.y, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            );
          })}
        </AnimatePresence>
        {nodes.map((n) => {
          const p = nodePos(n.id);
          const fill =
            n.role === "leader"
              ? "var(--terminal)"
              : n.role === "candidate"
                ? "var(--cyan-accent)"
                : n.role === "down"
                  ? "var(--destructive)"
                  : "var(--secondary)";
          return (
            <g
              key={n.id}
              onClick={() => toggle(n.id)}
              className="cursor-pointer"
              role="button"
              aria-label={`node ${n.id} ${n.role}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggle(n.id);
                }
              }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={22}
                fill={fill}
                stroke={n.role === "leader" ? "var(--terminal)" : "var(--border)"}
                strokeWidth={n.role === "leader" ? 2 : 1}
                opacity={n.role === "down" ? 0.4 : 1}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                className="font-mono"
                fontSize={11}
                fill="var(--background)"
                fontWeight={600}
              >
                N{n.id}
              </text>
              <text
                x={p.x}
                y={p.y + 36}
                textAnchor="middle"
                fontSize={9}
                fill="var(--muted-foreground)"
                className="font-mono"
              >
                {n.role}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="space-y-3">
        <div className="rounded-md border border-border bg-background/40 p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            event log
          </p>
          <ul className="mt-2 space-y-1 font-mono text-xs text-foreground" aria-live="polite">
            {log.map((l, i) => (
              <li key={i} className={i === 0 ? "text-terminal" : "text-muted-foreground"}>
                {">"} {l}
              </li>
            ))}
          </ul>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          Click a node to <span className="text-destructive">crash</span> it, click again to restore.
        </p>
      </div>
    </div>
  );
}