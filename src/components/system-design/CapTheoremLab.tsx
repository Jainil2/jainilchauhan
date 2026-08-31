import { useState } from "react";

type Mode = "CP" | "AP";
type NodeId = "N1" | "N2" | "N3";

interface NState {
  id: NodeId;
  side: "left" | "right";
  value: string;
  online: boolean;
}

const INITIAL: NState[] = [
  { id: "N1", side: "left", value: "v0", online: true },
  { id: "N2", side: "left", value: "v0", online: true },
  { id: "N3", side: "right", value: "v0", online: true },
];

export function CapTheoremLab() {
  const [mode, setMode] = useState<Mode>("CP");
  const [partitioned, setPartitioned] = useState(false);
  const [nodes, setNodes] = useState<NState[]>(INITIAL);
  const [log, setLog] = useState<string[]>([]);

  function append(line: string) {
    setLog((l) => [line, ...l].slice(0, 8));
  }

  function write(side: "left" | "right", value: string) {
    const sideNodes = nodes.filter((n) => n.side === side && n.online);
    if (partitioned) {
      const isMajority = sideNodes.length > nodes.length / 2;
      if (mode === "CP" && !isMajority) {
        append(`✗ write(${value}) on ${side} → REJECTED (CP, no quorum)`);
        return;
      }
      // AP, or majority side in CP
      setNodes((ns) => ns.map((n) => (n.side === side && n.online ? { ...n, value } : n)));
      append(
        `✓ write(${value}) on ${side} → accepted${mode === "AP" && !isMajority ? " (will diverge)" : ""}`,
      );
    } else {
      setNodes((ns) => ns.map((n) => (n.online ? { ...n, value } : n)));
      append(`✓ write(${value}) → replicated to all`);
    }
  }

  function partition() {
    setPartitioned(true);
    append("⚡ network partition between left/right");
  }

  function heal() {
    if (!partitioned) return;
    const left = nodes.find((n) => n.side === "left")?.value ?? "v0";
    const right = nodes.find((n) => n.side === "right")?.value ?? "v0";
    setPartitioned(false);
    if (left !== right) {
      // last-write-wins: pick "right" arbitrarily as winner for demo
      const winner = right.localeCompare(left) > 0 ? right : left;
      setNodes((ns) => ns.map((n) => ({ ...n, value: winner })));
      append(`✓ heal → conflict ${left} vs ${right} → LWW resolved to ${winner}`);
    } else {
      append("✓ heal → no conflict");
    }
  }

  function reset() {
    setNodes(INITIAL);
    setPartitioned(false);
    setLog([]);
  }

  const sides: ("left" | "right")[] = ["left", "right"];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-muted-foreground">strategy:</span>
        {(["CP", "AP"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded border px-2 py-1 ${mode === m ? "border-terminal text-terminal" : "border-border text-muted-foreground"}`}
          >
            {m === "CP" ? "CP — Consistency" : "AP — Availability"}
          </button>
        ))}
        <button
          onClick={partition}
          disabled={partitioned}
          className="ml-auto rounded border border-amber-500/40 px-2 py-1 text-amber-300 disabled:opacity-40"
        >
          ⚡ partition
        </button>
        <button
          onClick={heal}
          disabled={!partitioned}
          className="rounded border border-terminal/40 px-2 py-1 text-terminal disabled:opacity-40"
        >
          heal
        </button>
        <button
          onClick={reset}
          className="rounded border border-border px-2 py-1 text-muted-foreground"
        >
          reset
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {sides.map((side) => {
          const sideNodes = nodes.filter((n) => n.side === side);
          const sideOnline = sideNodes.filter((n) => n.online).length;
          const isMajority = sideOnline > nodes.length / 2;
          const writable = !partitioned || mode === "AP" || isMajority;
          return (
            <div key={side} className="rounded-lg border border-border bg-background/40 p-3">
              <div className="mb-2 flex items-center justify-between font-mono text-xs">
                <span className="uppercase tracking-widest text-muted-foreground">
                  {side} partition
                </span>
                <span className={isMajority || !partitioned ? "text-terminal" : "text-destructive"}>
                  {!partitioned ? "online" : isMajority ? "majority" : "minority"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sideNodes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded border border-border bg-card/60 px-3 py-2 font-mono text-xs"
                  >
                    <div className="text-muted-foreground">{n.id}</div>
                    <div className="text-terminal text-base">{n.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => write(side, `v${Math.floor(Math.random() * 99) + 1}`)}
                  disabled={!writable}
                  className="flex-1 rounded border border-border px-2 py-1 font-mono text-xs hover:border-terminal/50 hover:text-terminal disabled:opacity-30 disabled:hover:text-foreground"
                >
                  {writable ? "write" : "✗ refused"}
                </button>
                <button className="flex-1 rounded border border-border px-2 py-1 font-mono text-xs text-cyan-accent">
                  read → {sideNodes[0]?.value}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded border border-border bg-background/40 p-3 font-mono text-xs">
        <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">cluster log</p>
        {log.length === 0 ? (
          <p className="text-muted-foreground">
            No events yet — try writing on each side, then partition.
          </p>
        ) : (
          log.map((l, i) => (
            <div key={i} className="text-foreground">
              {l}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
