import { useMemo, useState } from "react";

const KEYS = Array.from({ length: 60 }, (_, i) => `k${i}`);
const ALL_NODES = ["A", "B", "C", "D", "E"] as const;
const NODE_COLORS: Record<string, string> = {
  A: "oklch(0.85 0.21 150)",
  B: "oklch(0.78 0.16 200)",
  C: "oklch(0.75 0.18 310)",
  D: "oklch(0.80 0.18 60)",
  E: "oklch(0.78 0.18 0)",
};
const VNODE_PER_NODE = 40;
const RING = 360;

function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildRing(nodes: readonly string[]) {
  const ring: { angle: number; node: string }[] = [];
  for (const n of nodes) {
    for (let v = 0; v < VNODE_PER_NODE; v++) {
      ring.push({ angle: hash(`${n}#${v}`) % RING, node: n });
    }
  }
  return ring.sort((a, b) => a.angle - b.angle);
}

function lookupConsistent(key: string, ring: { angle: number; node: string }[]) {
  if (ring.length === 0) return "—";
  const a = hash(key) % RING;
  for (const v of ring) if (v.angle >= a) return v.node;
  return ring[0].node;
}

function lookupNaive(key: string, nodes: readonly string[]) {
  if (nodes.length === 0) return "—";
  return nodes[hash(key) % nodes.length];
}

export function ConsistentHashLab() {
  const [active, setActive] = useState<string[]>(["A", "B", "C"]);
  const [snapshot, setSnapshot] = useState<{ con: Record<string, string>; naive: Record<string, string> } | null>(null);

  const ring = useMemo(() => buildRing(active), [active]);

  const assignmentsCon = useMemo(() => {
    const m: Record<string, string> = {};
    for (const k of KEYS) m[k] = lookupConsistent(k, ring);
    return m;
  }, [ring]);

  const assignmentsNaive = useMemo(() => {
    const m: Record<string, string> = {};
    for (const k of KEYS) m[k] = lookupNaive(k, active);
    return m;
  }, [active]);

  function snap() {
    setSnapshot({ con: { ...assignmentsCon }, naive: { ...assignmentsNaive } });
  }

  function toggle(n: string) {
    setActive((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort()));
  }

  const remappedCon = snapshot
    ? KEYS.filter((k) => snapshot.con[k] !== assignmentsCon[k]).length
    : 0;
  const remappedNaive = snapshot
    ? KEYS.filter((k) => snapshot.naive[k] !== assignmentsNaive[k]).length
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">nodes:</span>
        {ALL_NODES.map((n) => {
          const on = active.includes(n);
          return (
            <button
              key={n}
              onClick={() => toggle(n)}
              className={`rounded border px-2 py-0.5 font-mono text-xs ${
                on ? "border-terminal text-terminal" : "border-border text-muted-foreground line-through"
              }`}
              style={{ borderColor: on ? NODE_COLORS[n] : undefined, color: on ? NODE_COLORS[n] : undefined }}
            >
              {n}
            </button>
          );
        })}
        <button
          onClick={snap}
          className="ml-auto rounded border border-border px-2 py-0.5 font-mono text-xs text-foreground hover:border-terminal/50 hover:text-terminal"
        >
          snapshot → toggle a node → compare remap
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Ring */}
        <div className="rounded border border-border bg-background/40 p-3">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">consistent hash ring</p>
          <svg viewBox="0 0 220 220" className="w-full">
            <circle cx="110" cy="110" r="90" fill="none" stroke="oklch(0.30 0.02 150 / 40%)" strokeDasharray="3 4" />
            {ring.map((v, i) => {
              const rad = (v.angle / RING) * 2 * Math.PI - Math.PI / 2;
              const x = 110 + 90 * Math.cos(rad);
              const y = 110 + 90 * Math.sin(rad);
              return <circle key={i} cx={x} cy={y} r={2} fill={NODE_COLORS[v.node]} opacity={0.6} />;
            })}
            {KEYS.map((k) => {
              const a = hash(k) % RING;
              const rad = (a / RING) * 2 * Math.PI - Math.PI / 2;
              const x = 110 + 70 * Math.cos(rad);
              const y = 110 + 70 * Math.sin(rad);
              const node = assignmentsCon[k];
              return <circle key={k} cx={x} cy={y} r={1.4} fill={NODE_COLORS[node] ?? "#888"} />;
            })}
            <text x="110" y="114" textAnchor="middle" fontSize="9" fill="oklch(0.68 0.02 150)" fontFamily="JetBrains Mono">
              {KEYS.length} keys · {active.length} nodes
            </text>
          </svg>
        </div>

        {/* Counters */}
        <div className="rounded border border-border bg-background/40 p-3 font-mono text-xs">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">key-remap after change</p>
          {snapshot ? (
            <>
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-foreground">consistent hashing</span>
                <span className="text-terminal text-lg tabular-nums">{remappedCon}/{KEYS.length}</span>
              </div>
              <div className="mb-3 h-1.5 overflow-hidden rounded bg-card">
                <div className="h-full bg-terminal" style={{ width: `${(remappedCon / KEYS.length) * 100}%` }} />
              </div>
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-foreground">naive hash % N</span>
                <span className="text-destructive text-lg tabular-nums">{remappedNaive}/{KEYS.length}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded bg-card">
                <div className="h-full bg-destructive" style={{ width: `${(remappedNaive / KEYS.length) * 100}%` }} />
              </div>
              <p className="mt-3 text-muted-foreground">
                Consistent hashing remaps ~K/N. Naive remaps almost everything → cache stampede.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Click <span className="text-terminal">snapshot</span>, then toggle a node to compare.</p>
          )}
        </div>
      </div>
    </div>
  );
}
