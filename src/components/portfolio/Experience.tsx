import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { Counter } from "./Counter";
import { Reveal } from "./Reveal";
import { useSimulationStore } from "@/lib/useSimulationStore";

/* ─── Data ──────────────────────────────────────────────────────────────────── */

interface LogEntry {
  id: string;
  timestamp: string;
  op: string;
  value: string;
  compacted?: boolean;
}

interface SSTableBlock {
  id: string;
  label: string;
  keys: string[];
  color: string;
}

const MEMTABLE_ENTRIES: LogEntry[] = [
  { id: "log-1", timestamp: "2025-01", op: "PUT", value: "role=Software Engineer @ Tech Holding" },
  { id: "log-2", timestamp: "2025-02", op: "PUT", value: "tech=[OAuth2, OIDC, Ory Hydra]" },
  { id: "log-3", timestamp: "2025-03", op: "PUT", value: "metric=50K+ SSO users, 99.9% uptime" },
  { id: "log-4", timestamp: "2025-04", op: "PUT", value: "tech=[GraphQL, Redis, k6]" },
  { id: "log-5", timestamp: "2025-05", op: "PUT", value: "metric=3,600 RPS load tested" },
  { id: "log-6", timestamp: "2025-06", op: "PUT", value: "tech=[AWS, Kubernetes, Docker]" },
];

const INITIAL_SSTABLES: SSTableBlock[] = [
  {
    id: "sst-0",
    label: "SST-0 · Education",
    keys: ["degree=BCA", "university=DDU", "grad=2024"],
    color: "oklch(0.78 0.16 200)",
  },
];

const COMPACTED_BLOCK: SSTableBlock = {
  id: "sst-compacted",
  label: "SST-1 · Tech Holding (compacted)",
  keys: [
    "role=Software Engineer",
    "tenure=Jan 2025–Present",
    "skills=[OAuth2, GraphQL, k6, Redis, AWS, K8s]",
    "impact=50K SSO users · 40% latency cut · 3.6K RPS",
  ],
  color: "oklch(0.85 0.21 150)",
};

const metrics = [
  { label: "latency reduced", value: 40, suffix: "%" },
  { label: "users on SSO", value: 50000, suffix: "+" },
  { label: "k6 load test RPS", value: 3600, suffix: "+" },
  { label: "uptime", value: 99.9, suffix: "%", decimals: 1 },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function Experience() {
  const { simulationsEnabled } = useSimulationStore();
  const [compacted, setCompacted] = useState(false);
  const [compacting, setCompacting] = useState(false);
  const [sstables, setSstables] = useState<SSTableBlock[]>(INITIAL_SSTABLES);

  async function runCompaction() {
    if (compacted || compacting) return;
    setCompacting(true);
    // Let entries "flush" with staggered animation (driven by CSS delay), then add SST block
    await new Promise((r) => setTimeout(r, MEMTABLE_ENTRIES.length * 80 + 400));
    setSstables((prev) => [...prev, COMPACTED_BLOCK]);
    setCompacted(true);
    setCompacting(false);
  }

  function reset() {
    setCompacted(false);
    setCompacting(false);
    setSstables(INITIAL_SSTABLES);
  }

  /* Fallback: classic layout when simulations are disabled */
  if (!simulationsEnabled) {
    return <ClassicExperience />;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading id="experience" prompt="Where I have worked" title="Experience" />

      {/* Metrics row */}
      <Reveal>
        <ul className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map((m) => (
            <li
              key={m.label}
              className="rounded-md border border-border bg-background/40 p-3 text-center"
            >
              <div className="font-mono text-2xl font-bold text-terminal">
                <Counter value={m.value} suffix={m.suffix} decimals={m.decimals ?? 0} />
              </div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {m.label}
              </div>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* LSM Tree 2-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT — MemTable (Append Log) */}
        <div className="rounded-lg border border-border bg-card/60 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-cyan-accent">
                // MemTable · in-memory append log
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                recent writes not yet flushed to disk
              </p>
            </div>
            <button
              type="button"
              onClick={compacted ? reset : runCompaction}
              disabled={compacting}
              className="rounded border border-terminal/40 bg-terminal/10 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-terminal transition-all hover:bg-terminal/20 hover:glow-terminal disabled:cursor-wait disabled:opacity-50"
            >
              {compacting ? "flushing…" : compacted ? "↺ reset" : "⚡ run compaction"}
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <AnimatePresence mode="popLayout">
              {MEMTABLE_ENTRIES.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 1, x: 0 }}
                  animate={
                    compacting
                      ? {
                          opacity: [1, 0.6, 0],
                          x: [0, 8, 60],
                          transition: { delay: i * 0.08, duration: 0.35 },
                        }
                      : compacted
                        ? { opacity: 0.15, x: 0 }
                        : { opacity: 1, x: 0 }
                  }
                  className="flex items-start gap-2 rounded border border-border/50 bg-background/30 px-3 py-2"
                >
                  <span className="shrink-0 text-muted-foreground">{entry.timestamp}</span>
                  <span className="shrink-0 rounded bg-terminal/10 px-1 text-terminal">
                    {entry.op}
                  </span>
                  <span className="break-all text-foreground">{entry.value}</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {compacted && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-2 text-center text-muted-foreground"
              >
                ↳ flushed to SSTable
              </motion.p>
            )}
          </div>
        </div>

        {/* RIGHT — SSTables (Disk layer) */}
        <div className="rounded-lg border border-border bg-card/60 p-5">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-cyan-accent">
            // SSTables · compacted on-disk blocks
          </p>
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            sorted, immutable segments — fast range reads
          </p>

          <div className="space-y-3">
            <AnimatePresence>
              {sstables.map((sst) => (
                <motion.div
                  key={sst.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="rounded-md border bg-background/40 px-4 py-3"
                  style={{ borderColor: `${sst.color}40` }}
                >
                  <p
                    className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider"
                    style={{ color: sst.color }}
                  >
                    {sst.label}
                  </p>
                  <ul className="space-y-1 font-mono text-xs text-foreground">
                    {sst.keys.map((k) => (
                      <li key={k} className="flex items-start gap-1.5">
                        <span style={{ color: sst.color }} className="shrink-0 opacity-60">
                          ▸
                        </span>
                        {k}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </AnimatePresence>

            {sstables.length === 1 && !compacting && !compacted && (
              <p className="pt-3 text-center font-mono text-xs text-muted-foreground">
                run compaction to flush MemTable →
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Explainer */}
      <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
        Inspired by LSM-Tree storage engines (LevelDB, RocksDB, Cassandra) — append-only writes
        flush to sorted SSTables, which compact over time for fast reads.
      </p>
    </section>
  );
}

/* ─── Classic fallback (simulations off) ──────────────────────────────────── */

const bullets = [
  "Cut GraphQL API latency by ~40% through query optimization, smarter data-fetching, and targeted caching.",
  "Shipped an enterprise OAuth 2.0 / OIDC platform on Ory Hydra serving 50K+ users with single sign-on and 99.9% uptime.",
  "Load-tested authentication flows at 3,600+ RPS using k6, surfacing and removing bottlenecks before production rollout.",
  "Built a cloud cost optimization platform with anomaly detection, rightsizing recommendations, and security posture monitoring across AWS accounts.",
];

function ClassicExperience() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading id="experience" prompt="Where I have worked" title="Experience" />
      <div className="relative rounded-lg border border-border bg-card/60 p-6 sm:p-8">
        <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h3 className="font-mono text-xl font-semibold text-foreground">
              Software Engineer · <span className="text-terminal">Tech Holding</span>
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Ahmedabad, India</p>
          </div>
          <p className="font-mono text-sm text-cyan-accent">Jan 2025 — Present</p>
        </div>
        <Reveal>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((m) => (
              <li
                key={m.label}
                className="rounded-md border border-border bg-background/40 p-3 text-center"
              >
                <div className="font-mono text-2xl font-bold text-terminal">
                  <Counter value={m.value} suffix={m.suffix} decimals={m.decimals ?? 0} />
                </div>
                <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
        <ul className="mt-5 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 text-muted-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-terminal" />
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
