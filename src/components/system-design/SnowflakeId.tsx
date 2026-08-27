import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Fingerprint, RotateCcw } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

const EPOCH = 1767225600000; // Jan 1 2026

interface GeneratedId {
  id: bigint;
  timestamp: number;
  dc: number;
  worker: number;
  seq: number;
}

export function SnowflakeId() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [datacenterId, setDatacenterId] = useState(1);
  const [workerId, setWorkerId] = useState(1);
  const [sequence, setSequence] = useState(0);

  const [ids, setIds] = useState<GeneratedId[]>([]);

  function generate() {
    const now = Date.now();
    const ts = BigInt(now - EPOCH);
    const dc = BigInt(datacenterId) & 31n;
    const worker = BigInt(workerId) & 31n;
    const seq = BigInt(sequence) & 4095n;

    const id = (ts << 22n) | (dc << 17n) | (worker << 12n) | seq;

    setIds((prev) =>
      [
        { id, timestamp: now, dc: Number(dc), worker: Number(worker), seq: Number(seq) },
        ...prev,
      ].slice(0, 5),
    );
    setSequence((s) => (s + 1) & 4095);
  }

  function reset() {
    setSequence(0);
    setIds([]);
  }

  function formatBinary(val: bigint) {
    const bin = val.toString(2).padStart(64, "0");
    return {
      sign: bin.slice(0, 1),
      ts: bin.slice(1, 42),
      dc: bin.slice(42, 47),
      worker: bin.slice(47, 52),
      seq: bin.slice(52, 64),
    };
  }

  const latest = ids[0];
  const bin = latest ? formatBinary(latest.id) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={generate}
            className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 font-mono text-xs text-terminal hover:bg-terminal/20"
          >
            <Fingerprint className="size-3" /> generate id
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" /> reset
          </button>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
          <label className="flex items-center gap-2">
            datacenter:
            <input
              type="number"
              min="0"
              max="31"
              value={datacenterId}
              onChange={(e) => setDatacenterId(Number(e.target.value))}
              className="w-16 rounded border border-border bg-background px-2 py-1 outline-none focus:border-terminal/50"
            />
          </label>
          <label className="flex items-center gap-2">
            worker:
            <input
              type="number"
              min="0"
              max="31"
              value={workerId}
              onChange={(e) => setWorkerId(Number(e.target.value))}
              className="w-16 rounded border border-border bg-background px-2 py-1 outline-none focus:border-terminal/50"
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/40 p-6">
        {bin ? (
          <motion.div
            key={latest.id.toString()}
            initial={animate ? { y: -10, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="text-3xl font-bold tracking-wider text-foreground">
              {latest.id.toString()}
            </div>

            <div className="flex flex-wrap justify-center gap-x-2 gap-y-4 text-center font-mono">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase text-muted-foreground">Sign (1)</span>
                <span className="rounded bg-secondary/50 px-1 py-0.5 text-xs text-muted-foreground">
                  {bin.sign}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase text-cyan-accent">Timestamp (41)</span>
                <span className="rounded border border-cyan-accent/30 bg-cyan-accent/10 px-1 py-0.5 text-xs text-cyan-accent">
                  {bin.ts}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase text-amber-500">DC (5)</span>
                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 text-xs text-amber-500">
                  {bin.dc}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase text-fuchsia-400">Worker (5)</span>
                <span className="rounded border border-fuchsia-500/30 bg-fuchsia-500/10 px-1 py-0.5 text-xs text-fuchsia-400">
                  {bin.worker}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase text-terminal">Sequence (12)</span>
                <span className="rounded border border-terminal/30 bg-terminal/10 px-1 py-0.5 text-xs text-terminal">
                  {bin.seq}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex h-[120px] items-center justify-center font-mono text-sm text-muted-foreground">
            Click generate to create a distributed ID
          </div>
        )}
      </div>

      {ids.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Recent IDs
          </h3>
          <div className="rounded-lg border border-border bg-background/50 overflow-hidden">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="p-2 font-normal text-muted-foreground">ID</th>
                  <th className="p-2 font-normal text-muted-foreground hidden sm:table-cell">
                    Timestamp
                  </th>
                  <th className="p-2 font-normal text-muted-foreground text-right">DC</th>
                  <th className="p-2 font-normal text-muted-foreground text-right">Worker</th>
                  <th className="p-2 font-normal text-muted-foreground text-right">Seq</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ids.map((item) => (
                  <tr key={item.id.toString()} className="transition-colors hover:bg-secondary/10">
                    <td className="p-2 text-foreground">{item.id.toString()}</td>
                    <td className="p-2 text-cyan-accent/80 hidden sm:table-cell">
                      {new Date(item.timestamp).toISOString().split("T")[1].slice(0, -1)}
                    </td>
                    <td className="p-2 text-right text-amber-500/80">{item.dc}</td>
                    <td className="p-2 text-right text-fuchsia-400/80">{item.worker}</td>
                    <td className="p-2 text-right text-terminal/80">{item.seq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          Snowflake generates 64-bit IDs that are roughly time-ordered and guaranteed unique without
          coordination. The 41-bit timestamp gives 69 years of IDs. 10 bits of machine ID allows
          1024 nodes. The 12-bit sequence prevents collisions if a single machine generates multiple
          IDs in the same millisecond (up to 4096/ms).
        </p>
      </div>
    </div>
  );
}
