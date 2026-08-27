import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Github,
  Linkedin,
  Mail,
  Download,
  X,
  Cpu,
  Activity,
  Beaker,
  AlertTriangle,
  TerminalSquare,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/lib/useSimulationStore";
import { useHudPrefs, type HudTab } from "@/lib/useHudPrefs";
import { useControlPlane, type EnvMode } from "@/lib/useControlPlane";

/**
 * Compact dock — collapsed pill by default with at-a-glance signals
 * (env / tps / nodes), expands into a tabbed panel: stats · me · ops.
 * Persisted via localStorage. Desktop only (mobile uses MobileShellFab).
 */
export function PortfolioHUD() {
  const { visible, setVisible, expanded, setExpanded, tab, setTab, hydrated } = useHudPrefs();
  const { activeNodes, tokenCount, simulationsEnabled, setSimulationsEnabled } =
    useSimulationStore();
  const env = useControlPlane((s) => s.env);
  const setEnv = useControlPlane((s) => s.setEnv);
  const vitals = useControlPlane((s) => s.vitals);
  const status = useControlPlane((s) => s.status);
  const tpsHistory = useControlPlane((s) => s.tpsHistory);
  const pushTps = useControlPlane((s) => s.pushTps);
  const incidents = useControlPlane((s) => s.incidents);
  const ackIncident = useControlPlane((s) => s.ackIncident);

  const [tps, setTps] = useState(0);
  useTokenRate(tokenCount, setTps, pushTps);

  if (!hydrated) return null;

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        aria-label="Show portfolio HUD"
        className="fixed bottom-5 left-5 z-40 hidden items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 font-mono text-xs text-muted-foreground shadow-lg backdrop-blur-md hover:text-terminal md:inline-flex"
      >
        <Activity className="size-3.5 text-terminal" />
        hud
      </button>
    );
  }

  const openIncidents = incidents.filter((i) => !i.ack);
  const nodesOk = activeNodes.length === 3;

  // ── HUD Shell ────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      {!expanded ? (
        <motion.div
          key="collapsed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-5 left-5 z-40 hidden md:block"
        >
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-expanded="false"
            aria-label="Expand HUD dock"
            className="group flex items-center gap-2.5 rounded-full border border-border bg-card/90 px-3 py-1.5 font-mono text-xs shadow-lg backdrop-blur-md transition-all hover:border-terminal/40 hover:shadow-[0_0_15px_rgba(20,184,166,0.15)]"
          >
            <span className="relative flex items-center gap-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-terminal" />
              <span className="text-terminal">{env}</span>
              {openIncidents.length > 0 && (
                <span
                  aria-label={`${openIncidents.length} open incidents`}
                  className="absolute -right-2 -top-2 size-2 rounded-full bg-destructive"
                />
              )}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-cyan-accent">{tps.toFixed(1)}</span>
            <span className="text-muted-foreground">tps</span>
            <span className="text-muted-foreground">·</span>
            <span className={nodesOk ? "text-terminal" : "text-destructive"}>
              {activeNodes.length}/3
            </span>
            <ChevronUp className="size-3 text-muted-foreground transition-transform group-hover:-translate-y-0.5" />
          </button>
        </motion.div>
      ) : (
        <motion.aside
          key="expanded"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          role="complementary"
          aria-label="Portfolio HUD"
          className="fixed bottom-5 left-5 z-40 hidden w-[320px] rounded-lg border border-border bg-card/90 shadow-xl backdrop-blur-md md:block"
        >
          <header className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="size-1.5 animate-pulse rounded-full bg-terminal" />
              <span className="text-terminal">jc-hud</span>
              <span className="text-muted-foreground">
                · <span className="text-cyan-accent">{shortSha(status.commit)}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded(false)}
                aria-label="Collapse HUD"
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <ChevronDown className="size-3.5" />
              </button>
              <button
                onClick={() => setVisible(false)}
                aria-label="Hide HUD"
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </header>

          <TabBar value={tab} onChange={setTab} incidents={openIncidents.length} />

          <div className="p-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
              >
                {tab === "stats" && (
                  <StatsTab
                    env={env}
                    setEnv={setEnv}
                    tokenCount={tokenCount}
                    tps={tps}
                    activeNodes={activeNodes.length}
                    tpsHistory={tpsHistory}
                    vitals={vitals}
                  />
                )}
                {tab === "me" && <MeTab bundleKb={status.bundleKb} />}
                {tab === "ops" && (
                  <OpsTab
                    simulationsEnabled={simulationsEnabled}
                    setSimulationsEnabled={setSimulationsEnabled}
                    env={env}
                    setEnv={setEnv}
                    incidents={openIncidents}
                    onAck={ackIncident}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ── Tab bar ────────────────────────────────────────────────────────────── */

function TabBar({
  value,
  onChange,
  incidents,
}: {
  value: HudTab;
  onChange: (t: HudTab) => void;
  incidents: number;
}) {
  const tabs: { k: HudTab; label: string }[] = [
    { k: "stats", label: "stats" },
    { k: "me", label: "me" },
    { k: "ops", label: "ops" },
  ];
  return (
    <div role="tablist" className="flex border-b border-border px-1.5 pt-1.5">
      {tabs.map((t) => {
        const active = value === t.k;
        const showBadge = t.k === "ops" && incidents > 0;
        return (
          <button
            key={t.k}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.k)}
            className={`relative flex-1 rounded-t px-2 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
              active
                ? "bg-background/50 text-terminal"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {showBadge && (
              <span
                aria-label={`${incidents} open incidents`}
                className="absolute right-1.5 top-1 size-1.5 rounded-full bg-destructive"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Tab: stats ─────────────────────────────────────────────────────────── */

function StatsTab(props: {
  env: EnvMode;
  setEnv: (e: EnvMode) => void;
  tokenCount: number;
  tps: number;
  activeNodes: number;
  tpsHistory: number[];
  vitals: { lcp: number | null; inp: number | null; cls: number | null };
}) {
  return (
    <div className="space-y-3">
      <EnvSwitcher value={props.env} onChange={props.setEnv} />

      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        <Cell label="tokens" value={String(props.tokenCount)} accent="terminal" />
        <Cell label="tps" value={props.tps.toFixed(1)} accent="cyan" />
        <Cell
          label="nodes"
          value={`${props.activeNodes}/3`}
          accent={props.activeNodes === 3 ? "terminal" : "destructive"}
        />
      </div>

      <Sparkline series={props.tpsHistory} />

      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        <Cell
          label="lcp"
          value={props.vitals.lcp === null ? "…" : `${props.vitals.lcp}ms`}
          accent={vitalTone(props.vitals.lcp, [2500, 4000])}
        />
        <Cell
          label="inp"
          value={props.vitals.inp === null ? "…" : `${props.vitals.inp}ms`}
          accent={vitalTone(props.vitals.inp, [200, 500])}
        />
        <Cell
          label="cls"
          value={props.vitals.cls === null ? "…" : String(props.vitals.cls)}
          accent={vitalTone(props.vitals.cls !== null ? props.vitals.cls * 1000 : null, [100, 250])}
        />
      </div>
    </div>
  );
}

/* ── Tab: me ────────────────────────────────────────────────────────────── */

function MeTab({ bundleKb }: { bundleKb: number | null }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-background/50 px-3 py-2 font-mono text-xs">
        <p className="text-muted-foreground">
          <span className="text-terminal">jainil</span>@portfolio:~$
        </p>
        <p className="mt-0.5 text-foreground">SWE · backend · distributed</p>
        <p className="text-muted-foreground">
          Nadiad, IN · bundle{" "}
          <span className="text-foreground">{bundleKb !== null ? `${bundleKb}kb` : "—"}</span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        <a
          href="/jainil-chauhan-resume.pdf"
          download
          title="Resume"
          className="flex-1 rounded-md border border-terminal/40 bg-terminal/10 px-2 py-1.5 text-center font-mono text-xs text-terminal hover:bg-terminal/20"
        >
          <Download className="mx-auto size-3" />
        </a>
        <a
          href="https://github.com/jainil-chauhan"
          target="_blank"
          rel="noreferrer"
          title="GitHub"
          className="flex-1 rounded-md border border-border bg-secondary/50 px-2 py-1.5 text-center text-foreground hover:border-terminal/50"
        >
          <Github className="mx-auto size-3" />
        </a>
        <a
          href="https://www.linkedin.com/in/jainil-chauhan"
          target="_blank"
          rel="noreferrer"
          title="LinkedIn"
          className="flex-1 rounded-md border border-border bg-secondary/50 px-2 py-1.5 text-center text-foreground hover:border-terminal/50"
        >
          <Linkedin className="mx-auto size-3" />
        </a>
        <a
          href="mailto:jainil.chauhan@example.com"
          title="Email"
          className="flex-1 rounded-md border border-border bg-secondary/50 px-2 py-1.5 text-center text-foreground hover:border-terminal/50"
        >
          <Mail className="mx-auto size-3" />
        </a>
        <Link
          to="/lab"
          title="Lab"
          className="flex-1 rounded-md border border-cyan-accent/40 bg-cyan-accent/10 px-2 py-1.5 text-center text-cyan-accent hover:bg-cyan-accent/20"
        >
          <Beaker className="mx-auto size-3" />
        </Link>
      </div>
    </div>
  );
}

/* ── Tab: ops ───────────────────────────────────────────────────────────── */

function OpsTab({
  simulationsEnabled,
  setSimulationsEnabled,
  env,
  setEnv,
  incidents,
  onAck,
}: {
  simulationsEnabled: boolean;
  setSimulationsEnabled: (v: boolean) => void;
  env: EnvMode;
  setEnv: (e: EnvMode) => void;
  incidents: { id: string; title: string; detail: string }[];
  onAck: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <EnvSwitcher value={env} onChange={setEnv} />

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setSimulationsEnabled(!simulationsEnabled)}
          className="flex flex-1 items-center justify-between rounded-md border border-border bg-background/50 px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Cpu className="size-3" /> simulations
          </span>
          <span className={simulationsEnabled ? "text-terminal" : "text-destructive"}>
            {simulationsEnabled ? "ON" : "OFF"}
          </span>
        </button>
        <button
          onClick={openShell}
          title="Open shell (⌘J)"
          aria-label="Open shell"
          className="rounded-md border border-border bg-background/50 px-2 py-1.5 font-mono text-xs text-muted-foreground hover:text-terminal"
        >
          <TerminalSquare className="size-3" />
        </button>
      </div>

      {incidents.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-background/30 px-3 py-2 font-mono text-xs text-muted-foreground">
          // no open incidents
        </p>
      ) : (
        <ul className="space-y-1.5">
          {incidents.map((i) => (
            <li
              key={i.id}
              className="flex items-start justify-between gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5 font-mono text-xs"
            >
              <div className="flex flex-1 items-start gap-1.5">
                <AlertTriangle className="mt-0.5 size-3 text-destructive" />
                <div>
                  <p className="text-destructive">{i.title}</p>
                  <p className="text-muted-foreground">{i.detail}</p>
                </div>
              </div>
              <button
                onClick={() => onAck(i.id)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Acknowledge incident"
              >
                ack
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function openShell() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "j", metaKey: true }));
}

function EnvSwitcher({ value, onChange }: { value: EnvMode; onChange: (e: EnvMode) => void }) {
  const items: { k: EnvMode; label: string; cls: string }[] = [
    {
      k: "prod",
      label: "prod",
      cls: "text-terminal border-terminal/40 bg-terminal/10",
    },
    {
      k: "staging",
      label: "staging",
      cls: "text-cyan-accent border-cyan-accent/40 bg-cyan-accent/10",
    },
    {
      k: "chaos",
      label: "chaos",
      cls: "text-destructive border-destructive/40 bg-destructive/10",
    },
  ];
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-background/50 p-0.5 font-mono text-xs">
      {items.map((it) => {
        const active = value === it.k;
        return (
          <button
            key={it.k}
            onClick={() => onChange(it.k)}
            aria-pressed={active}
            className={`flex-1 rounded px-2 py-1 transition-colors ${
              active
                ? it.cls + " border"
                : "border border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function Sparkline({ series }: { series: number[] }) {
  const max = Math.max(1, ...series);
  const w = 304;
  const h = 24;
  const step = w / Math.max(1, series.length - 1);
  const pts = series
    .map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 2) - 1).toFixed(1)}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-6 w-full"
      aria-label="TPS sparkline (last 30 samples)"
    >
      <polyline
        points={pts}
        fill="none"
        stroke="var(--cyan-accent)"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Cell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "terminal" | "cyan" | "destructive" | "muted";
}) {
  const color =
    accent === "terminal"
      ? "text-terminal"
      : accent === "cyan"
        ? "text-cyan-accent"
        : accent === "destructive"
          ? "text-destructive"
          : "text-muted-foreground";
  return (
    <div className="rounded-md border border-border bg-background/50 px-2 py-1.5 text-center">
      <p className="text-muted-foreground">{label}</p>
      <p className={`text-sm ${color}`}>{value}</p>
    </div>
  );
}

function vitalTone(
  n: number | null,
  thresholds: [number, number],
): "terminal" | "cyan" | "destructive" | "muted" {
  if (n === null) return "muted";
  if (n <= thresholds[0]) return "terminal";
  if (n <= thresholds[1]) return "cyan";
  return "destructive";
}

function shortSha(commit: string): string {
  if (!commit || commit === "dev") return "dev";
  return commit.slice(0, 7);
}

/** Throttles tokens-per-second derivation to 4 Hz; also pushes samples into the control-plane. */
function useTokenRate(tokens: number, setTps: (n: number) => void, pushTps: (n: number) => void) {
  const tokensRef = useRef(tokens);
  const lastRef = useRef({ t: tokens, time: Date.now() });
  tokensRef.current = tokens;

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const last = lastRef.current;
      const dt = (now - last.time) / 1000;
      if (dt > 0) {
        const currentTokens = tokensRef.current;
        const delta = Math.max(0, last.t - currentTokens);
        const rate = delta / dt;
        setTps(rate);
        pushTps(rate);
        lastRef.current = { t: currentTokens, time: now };
      }
    }, 250);
    return () => clearInterval(id);
  }, [setTps, pushTps]);
}
