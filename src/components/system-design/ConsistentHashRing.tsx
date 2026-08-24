"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/lib/useSimulationStore";

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const ALL_NODES = [
  { id: "node-1", label: "SRV-01", color: "oklch(0.85 0.21 150)" },
  { id: "node-2", label: "SRV-02", color: "oklch(0.78 0.16 200)" },
  { id: "node-3", label: "SRV-03", color: "oklch(0.75 0.18 310)" },
] as const;

type NodeId = (typeof ALL_NODES)[number]["id"];

export type Project = {
  title: string;
  id: string;
};

/* ─── Hashing ───────────────────────────────────────────────────────────────── */

/** Simple djb2-style hash → bucket index among healthy nodes */
function hashToNode(projectId: string, healthyIds: string[]): string {
  let h = 5381;
  for (let i = 0; i < projectId.length; i++) {
    h = (h * 33) ^ projectId.charCodeAt(i);
  }
  const idx = Math.abs(h) % healthyIds.length;
  return healthyIds[idx];
}

/* ─── SVG constants ─────────────────────────────────────────────────────────── */

const CX = 120; // ring centre x
const CY = 120; // ring centre y
const RING_R = 75; // ring radius
const NODE_R = 18; // server node circle radius
const LB_X = 120; // load balancer x
const LB_Y = 235; // load balancer y
const CLIENT_X = 120; // client x
const CLIENT_Y = 290; // client y

/** Angles for 3 nodes evenly around the ring */
const NODE_ANGLES: Record<NodeId, number> = {
  "node-1": -90,
  "node-2": 30,
  "node-3": 210,
};

function nodePos(id: NodeId) {
  const deg = NODE_ANGLES[id];
  const rad = (deg * Math.PI) / 180;
  return {
    x: CX + RING_R * Math.cos(rad),
    y: CY + RING_R * Math.sin(rad),
  };
}

/* ─── Packet animation ──────────────────────────────────────────────────────── */

interface Packet {
  id: string;
  targetNodeId: string;
  phase: "lb" | "node"; // travelling to LB, then to node
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

interface Props {
  projects: Project[];
  /** Called with node ID when user clicks a project card */
  onProjectHover?: (projectId: string | null) => void;
}

export function ConsistentHashRing({ projects, onProjectHover }: Props) {
  const { activeNodes, killNode, restoreNode } = useSimulationStore();
  const [packets, setPackets] = useState<Packet[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [assignedNode, setAssignedNode] = useState<Record<string, string>>({});
  const packetCounter = useRef(0);

  // Recompute assignments whenever healthy nodes change
  useEffect(() => {
    const healthy = activeNodes.length > 0 ? activeNodes : ["node-1"];
    const map: Record<string, string> = {};
    for (const p of projects) {
      map[p.id] = hashToNode(p.id, healthy);
    }
    setAssignedNode(map);
  }, [activeNodes, projects]);

  function firePacket(projectId: string) {
    const targetNodeId = assignedNode[projectId] ?? "node-1";
    const pid = `pkt-${packetCounter.current++}`;
    setPackets((prev) => [...prev, { id: pid, targetNodeId, phase: "lb" }]);

    // After 400ms switch to "node" phase
    setTimeout(() => {
      setPackets((prev) =>
        prev.map((p) => (p.id === pid ? { ...p, phase: "node" } : p)),
      );
    }, 400);

    // Remove after full animation
    setTimeout(() => {
      setPackets((prev) => prev.filter((p) => p.id !== pid));
    }, 900);
  }

  function handleProjectHover(projectId: string | null) {
    setActiveProject(projectId);
    onProjectHover?.(projectId);
    if (projectId) firePacket(projectId);
  }

  function toggleNode(nodeId: NodeId) {
    if (activeNodes.includes(nodeId)) {
      // Don't kill the last healthy node
      if (activeNodes.length === 1) return;
      killNode(nodeId);
    } else {
      restoreNode(nodeId);
    }
  }

  const nodeColor = (id: NodeId) =>
    ALL_NODES.find((n) => n.id === id)?.color ?? "oklch(0.85 0.21 150)";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Legend */}
      <div className="flex gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-terminal" /> healthy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-destructive/70" /> dead
        </span>
        <span className="text-muted-foreground">click node to toggle</span>
      </div>

      {/* SVG Network Graph */}
      <svg
        width="240"
        height="310"
        viewBox="0 0 240 310"
        className="overflow-visible"
        role="img"
        aria-label="Consistent hash ring network diagram"
      >
        {/* Ring circle */}
        <circle
          cx={CX}
          cy={CY}
          r={RING_R}
          fill="none"
          stroke="oklch(0.30 0.02 150 / 40%)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Spokes from LB to each healthy node */}
        {ALL_NODES.map((node) => {
          const pos = nodePos(node.id);
          const alive = activeNodes.includes(node.id);
          return (
            <line
              key={`spoke-${node.id}`}
              x1={LB_X}
              y1={LB_Y}
              x2={pos.x}
              y2={pos.y}
              stroke={alive ? "oklch(0.30 0.02 150 / 60%)" : "oklch(0.30 0.02 150 / 20%)"}
              strokeWidth="1"
              strokeDasharray={alive ? "none" : "3 4"}
            />
          );
        })}

        {/* Line: Client → LB */}
        <line
          x1={CLIENT_X}
          y1={CLIENT_Y}
          x2={LB_X}
          y2={LB_Y}
          stroke="oklch(0.30 0.02 150 / 50%)"
          strokeWidth="1"
        />

        {/* Packets */}
        <AnimatePresence>
          {packets.map((pkt) => {
            const target = nodePos(pkt.targetNodeId as NodeId);
            const startX = pkt.phase === "lb" ? CLIENT_X : LB_X;
            const startY = pkt.phase === "lb" ? CLIENT_Y : LB_Y;
            const endX = pkt.phase === "lb" ? LB_X : target.x;
            const endY = pkt.phase === "lb" ? LB_Y : target.y;
            return (
              <motion.circle
                key={pkt.id + pkt.phase}
                r={4}
                fill={nodeColor(pkt.targetNodeId as NodeId)}
                style={{ filter: `drop-shadow(0 0 4px ${nodeColor(pkt.targetNodeId as NodeId)})` }}
                initial={{ cx: startX, cy: startY, opacity: 1 }}
                animate={{ cx: endX, cy: endY, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.38, ease: "easeInOut" }}
              />
            );
          })}
        </AnimatePresence>

        {/* Server nodes */}
        {ALL_NODES.map((node) => {
          const pos = nodePos(node.id);
          const alive = activeNodes.includes(node.id);
          const isTarget =
            activeProject !== null &&
            assignedNode[activeProject] === node.id;

          return (
            <g key={node.id}>
              {/* Glow ring when active target */}
              <AnimatePresence>
                {isTarget && alive && (
                  <motion.circle
                    key="glow"
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_R + 6}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2"
                    initial={{ opacity: 0, r: NODE_R }}
                    animate={{ opacity: [0.6, 0.2, 0.6], r: NODE_R + 8 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
              </AnimatePresence>

              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_R}
                fill={alive ? "oklch(0.20 0.02 150)" : "oklch(0.16 0.02 150)"}
                stroke={alive ? node.color : "oklch(0.65 0.22 27)"}
                strokeWidth={isTarget ? 2.5 : 1.5}
                animate={{ opacity: alive ? 1 : 0.4 }}
                onClick={() => toggleNode(node.id)}
                style={{ cursor: "pointer" }}
                aria-label={`${node.label}: ${alive ? "healthy" : "dead"}. Click to toggle.`}
                role="button"
              />

              {/* Node label */}
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fontFamily="JetBrains Mono, monospace"
                fill={alive ? node.color : "oklch(0.65 0.22 27)"}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {node.label}
              </text>

              {/* Dead X */}
              {!alive && (
                <text
                  x={pos.x + NODE_R - 5}
                  y={pos.y - NODE_R + 5}
                  fontSize="8"
                  fill="oklch(0.65 0.22 27)"
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  ✕
                </text>
              )}

              {/* Project count badge */}
              {alive && (
                <text
                  x={pos.x}
                  y={pos.y + NODE_R + 10}
                  textAnchor="middle"
                  fontSize="7"
                  fontFamily="JetBrains Mono, monospace"
                  fill="oklch(0.68 0.02 150)"
                  style={{ pointerEvents: "none" }}
                >
                  {Object.values(assignedNode).filter((n) => n === node.id).length}p
                </text>
              )}
            </g>
          );
        })}

        {/* Load Balancer */}
        <rect
          x={LB_X - 22}
          y={LB_Y - 10}
          width="44"
          height="20"
          rx="4"
          fill="oklch(0.22 0.02 150)"
          stroke="oklch(0.78 0.16 200)"
          strokeWidth="1.5"
        />
        <text
          x={LB_X}
          y={LB_Y + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7"
          fontFamily="JetBrains Mono, monospace"
          fill="oklch(0.78 0.16 200)"
          style={{ userSelect: "none" }}
        >
          LOAD BAL
        </text>

        {/* Client */}
        <rect
          x={CLIENT_X - 18}
          y={CLIENT_Y - 8}
          width="36"
          height="16"
          rx="3"
          fill="oklch(0.22 0.02 150)"
          stroke="oklch(0.68 0.02 150)"
          strokeWidth="1"
        />
        <text
          x={CLIENT_X}
          y={CLIENT_Y + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7"
          fontFamily="JetBrains Mono, monospace"
          fill="oklch(0.68 0.02 150)"
          style={{ userSelect: "none" }}
        >
          CLIENT
        </text>
      </svg>

      {/* Project cards */}
      <div className="grid w-full gap-2">
        {projects.map((p) => {
          const targetId = assignedNode[p.id];
          const nodeInfo = ALL_NODES.find((n) => n.id === targetId);
          const alive = targetId ? activeNodes.includes(targetId) : true;
          return (
            <motion.button
              key={p.id}
              type="button"
              onHoverStart={() => handleProjectHover(p.id)}
              onHoverEnd={() => handleProjectHover(null)}
              onFocus={() => handleProjectHover(p.id)}
              onBlur={() => handleProjectHover(null)}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="flex w-full items-center justify-between rounded border border-border bg-card/60 px-3 py-2 text-left font-mono text-xs transition-colors hover:border-terminal/40"
              aria-label={`Project: ${p.title}`}
            >
              <span className="text-foreground">{p.title}</span>
              <span
                className="flex items-center gap-1.5 text-xs"
                style={{ color: nodeInfo?.color ?? "oklch(0.68 0.02 150)" }}
              >
                <span
                  className="inline-block size-1.5 rounded-full"
                  style={{
                    backgroundColor: nodeInfo?.color ?? "oklch(0.68 0.02 150)",
                    opacity: alive ? 1 : 0.3,
                  }}
                />
                {nodeInfo?.label ?? "—"}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
