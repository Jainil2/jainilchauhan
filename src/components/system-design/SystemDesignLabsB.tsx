import { useMemo, useState } from "react";
import { Bar, Slider, Stat } from "./ai-primitives";

/* ─── shared helpers ───────────────────────────────────────────────────────── */

/** 32-bit FNV-1a. Deterministic, so SSR and the first client render agree. */
function fnv1a(str: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 font-code text-xs">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-foreground"
      />
      {label}
    </label>
  );
}

/** A fixed-width track with one bar placed on it. Used by every timeline here. */
function Track({
  from,
  to,
  span,
  muted,
}: {
  from: number;
  to: number;
  span: number;
  muted?: boolean;
}) {
  const left = Math.max(0, Math.min(100, (from / span) * 100));
  const width = Math.max(0.8, Math.min(100 - left, ((to - from) / span) * 100));
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={`absolute h-2 rounded-full ${muted ? "bg-muted-foreground/50" : "bg-foreground"}`}
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  );
}

/* ─── observability ────────────────────────────────────────────────────────── */

interface Span {
  id: number;
  parent: number | null;
  name: string;
  depth: number;
  start: number;
  end: number;
}

/**
 * Seven spans engineered so the two rankings disagree: `lock.acquire` is first
 * by self time and fourth by total duration, which is exactly how a real
 * serialised lock hides underneath two wrapper spans.
 */
const TRACE_SPANS: Span[] = [
  { id: 1, parent: null, name: "GET /checkout", depth: 0, start: 0, end: 980 },
  { id: 2, parent: 1, name: "auth.verify", depth: 1, start: 5, end: 45 },
  { id: 3, parent: 1, name: "handler.render", depth: 1, start: 45, end: 975 },
  { id: 4, parent: 3, name: "cart.load", depth: 2, start: 50, end: 300 },
  { id: 5, parent: 4, name: "db.select_items", depth: 3, start: 55, end: 295 },
  { id: 6, parent: 3, name: "pricing.rpc", depth: 2, start: 300, end: 960 },
  { id: 7, parent: 6, name: "lock.acquire", depth: 3, start: 305, end: 900 },
];

const TRACE_SPAN_MS = 980;

/** Self time = duration minus the *union* of the children's intervals. */
function selfTimes(spans: Span[]) {
  return spans.map((span) => {
    const kids = spans.filter((s) => s.parent === span.id);
    const clipped = kids
      .map((k) => [Math.max(k.start, span.start), Math.min(k.end, span.end)] as const)
      .filter(([a, b]) => b > a)
      .sort((a, b) => a[0] - b[0]);
    let covered = 0;
    let reach = -Infinity;
    for (const [a, b] of clipped) {
      if (b <= reach) continue;
      covered += b - Math.max(a, reach);
      reach = b;
    }
    const total = span.end - span.start;
    return { ...span, total, self: Math.max(0, total - covered) };
  });
}

export function ObservabilityLab() {
  const [byTotal, setByTotal] = useState(false);

  const rows = useMemo(() => {
    const scored = selfTimes(TRACE_SPANS);
    return scored.sort((a, b) => (byTotal ? b.total - a.total : b.self - a.self) || a.id - b.id);
  }, [byTotal]);

  const worstTotal = useMemo(() => selfTimes(TRACE_SPANS).sort((a, b) => b.total - a.total)[0], []);
  const worstSelf = useMemo(() => selfTimes(TRACE_SPANS).sort((a, b) => b.self - a.self)[0], []);
  const naiveRank =
    selfTimes(TRACE_SPANS)
      .sort((a, b) => b.total - a.total)
      .findIndex((s) => s.id === worstSelf.id) + 1;

  return (
    <div className="space-y-4">
      <Toggle
        label="rank by total duration (what a naive dashboard shows)"
        checked={byTotal}
        onChange={setByTotal}
      />

      <ol className="space-y-1.5">
        {rows.map((span, i) => (
          <li key={span.id} className="flex items-center gap-3">
            <span className="w-4 font-code text-xs text-muted-foreground">{i + 1}</span>
            <span
              className="w-40 shrink-0 truncate font-code text-xs"
              style={{ paddingLeft: `${span.depth * 8}px` }}
            >
              {span.name}
            </span>
            <span className="flex-1">
              <Track from={span.start} to={span.end} span={TRACE_SPAN_MS} muted={byTotal} />
            </span>
            <span className="w-14 text-right font-code text-xs tabular-nums text-muted-foreground">
              {span.total}ms
            </span>
            <span className="w-14 text-right font-code text-xs tabular-nums">{span.self}ms</span>
          </li>
        ))}
      </ol>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="slowest by total" value={worstTotal.name} hint={`${worstTotal.total}ms`} />
        <Stat label="slowest by self" value={worstSelf.name} hint={`${worstSelf.self}ms`} />
        <Stat
          label="its naive rank"
          value={`#${naiveRank}`}
          hint="where a duration-sorted list puts it"
        />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        The right-hand column is the honest one. <span className="font-code">GET /checkout</span> is
        the longest span in the trace and spent 10ms of its own 980; the 595ms went to a lock
        acquisition two levels down, which a duration-sorted list puts fourth. Rank by total and the
        top three rows are wrappers that were slow because their children were.
      </p>
    </div>
  );
}

/* ─── graceful shutdown ────────────────────────────────────────────────────── */

const SHUTDOWN_REQUESTS = [
  { id: 1, label: "GET /feed", startedAt: -2000, durationMs: 5000 },
  { id: 2, label: "POST /export", startedAt: -1000, durationMs: 45000 },
  { id: 3, label: "POST /report", startedAt: -500, durationMs: 38000 },
  { id: 4, label: "GET /profile", startedAt: -3000, durationMs: 4000 },
  { id: 5, label: "GET /feed", startedAt: 1000, durationMs: 900 },
  { id: 6, label: "GET /search", startedAt: 3000, durationMs: 500 },
  { id: 7, label: "POST /cart", startedAt: 5000, durationMs: 2000 },
  { id: 8, label: "GET /feed", startedAt: 7500, durationMs: 800 },
];

/** How long the balancer keeps routing to a pod after the endpoint is removed. */
const LB_NOTICES_AT = 8000;
const SHUTDOWN_ORIGIN = -3000;

export function GracefulShutdownLab() {
  const [preStopMs, setPreStopMs] = useState(0);
  const [graceMs, setGraceMs] = useState(30000);

  const rows = useMemo(() => {
    const deadline = graceMs;
    return SHUTDOWN_REQUESTS.map((req) => {
      // The listener closes preStopMs after SIGTERM. Anything routed here
      // after that is refused, and the balancer keeps routing until 8s.
      if (req.startedAt >= 0 && req.startedAt >= preStopMs) {
        return { ...req, outcome: "refused" as const, endsAt: req.startedAt };
      }
      const finishesAt = req.startedAt + req.durationMs;
      if (finishesAt <= deadline)
        return { ...req, outcome: "completed" as const, endsAt: finishesAt };
      return { ...req, outcome: "killed" as const, endsAt: deadline };
    });
  }, [preStopMs, graceMs]);

  const refused = rows.filter((r) => r.outcome === "refused").length;
  const killed = rows.filter((r) => r.outcome === "killed").length;
  const completed = rows.filter((r) => r.outcome === "completed").length;
  const span = graceMs - SHUTDOWN_ORIGIN;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="preStop sleep"
          value={preStopMs / 1000}
          min={0}
          max={15}
          suffix="s"
          onChange={(n) => setPreStopMs(n * 1000)}
        />
        <Slider
          label="grace period"
          value={graceMs / 1000}
          min={10}
          max={60}
          step={5}
          suffix="s"
          onChange={(n) => setGraceMs(n * 1000)}
        />
      </div>

      <div className="flex justify-between font-code text-xs text-muted-foreground">
        <span>SIGTERM 0s</span>
        <span>balancer stops routing {LB_NOTICES_AT / 1000}s</span>
        <span>SIGKILL {graceMs / 1000}s</span>
      </div>

      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate font-code text-xs">{r.label}</span>
            <span className="flex-1">
              <Track
                from={r.startedAt - SHUTDOWN_ORIGIN}
                to={r.endsAt - SHUTDOWN_ORIGIN}
                span={span}
                muted={r.outcome === "completed"}
              />
            </span>
            <span className="w-24 text-right font-code text-xs">
              {r.outcome === "completed" ? (
                <span className="text-muted-foreground">completed</span>
              ) : (
                <span className="font-semibold">{r.outcome === "killed" ? "killed" : "502"}</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="refused (502)"
          value={String(refused)}
          hint="arrived after the listener closed"
        />
        <Stat
          label="killed at deadline"
          value={String(killed)}
          hint="no status code, just a reset"
        />
        <Stat label="completed" value={String(completed)} />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        With no preStop sleep the process closes its listener the moment SIGTERM lands, while the
        balancer keeps routing for another eight seconds — four requests become 502s that no
        dashboard attributes to the deploy. Two more are killed at the deadline because they were
        always going to outlive a 30s grace period. Raise the sleep past 8s and the 502s go to zero;
        the killed ones need a shorter request timeout instead.
      </p>
    </div>
  );
}

/* ─── multi-region ─────────────────────────────────────────────────────────── */

const REGION_WRITES = [100, 300, 500, 700, 900, 1100, 1300, 1450];
const SPIKE_FROM = 700;
const SPIKE_TO = 1200;
const SPIKE_EXTRA = 1000;

export function MultiRegionLab() {
  const [baseLag, setBaseLag] = useState(400);
  const [failoverAt, setFailoverAt] = useState(2000);
  const [spike, setSpike] = useState(true);

  const rows = useMemo(() => {
    const lagAt = (t: number) =>
      spike && t >= SPIKE_FROM && t < SPIKE_TO ? baseLag + SPIKE_EXTRA : baseLag;
    return REGION_WRITES.map((ackedAt, i) => {
      const replicatedAt = ackedAt + lagAt(ackedAt);
      return { id: i + 1, ackedAt, replicatedAt, lost: replicatedAt > failoverAt };
    });
  }, [baseLag, failoverAt, spike]);

  const lost = rows.filter((r) => r.lost);
  const rpo = lost.length === 0 ? 0 : failoverAt - Math.min(...lost.map((r) => r.ackedAt));
  const span = Math.max(failoverAt, ...rows.map((r) => r.replicatedAt)) + 100;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="replication lag"
          value={baseLag}
          min={0}
          max={1200}
          step={50}
          suffix="ms"
          onChange={setBaseLag}
        />
        <Slider
          label="primary lost at"
          value={failoverAt}
          min={500}
          max={3000}
          step={100}
          suffix="ms"
          onChange={setFailoverAt}
        />
      </div>

      <Toggle
        label="lag spike during the write burst (700–1200ms)"
        checked={spike}
        onChange={setSpike}
      />

      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3">
            <span className="w-20 shrink-0 font-code text-xs text-muted-foreground">
              ack {r.ackedAt}ms
            </span>
            <span className="flex-1">
              <Track from={r.ackedAt} to={r.replicatedAt} span={span} muted={!r.lost} />
            </span>
            <span className="w-24 text-right font-code text-xs">
              {r.lost ? (
                <span className="font-semibold">lost</span>
              ) : (
                <span className="text-muted-foreground">replicated</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="failover" value="succeeded" hint="every health check is green" />
        <Stat label="writes lost" value={String(lost.length)} hint="acknowledged, then gone" />
        <Stat label="RPO window" value={`${rpo} ms`} hint="oldest lost write to failover" />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        The bar for each write runs from the 200 the client received to the moment the standby
        actually had it. At 400ms of steady lag with a spike through the burst, three writes were
        still in flight when the primary died — and nothing in the failover reports that, because
        from the new primary&apos;s point of view those writes never happened.
      </p>
    </div>
  );
}

/* ─── feature flags ────────────────────────────────────────────────────────── */

const FLAG_USERS = Array.from({ length: 20 }, (_, i) => `acct-${i + 1}`);
const FLAG_A = "checkout-v2";
const FLAG_B = "nav-redesign";

export function FeatureFlagsLab() {
  const [rollout, setRollout] = useState(25);
  const [sharedSalt, setSharedSalt] = useState(true);

  const { cohortA, cohortB, overlap } = useMemo(() => {
    const bucket = (key: string, user: string) =>
      sharedSalt ? fnv1a(user) % 100 : fnv1a(`${key}:${user}`) % 100;
    const a = FLAG_USERS.filter((u) => bucket(FLAG_A, u) < rollout);
    const b = FLAG_USERS.filter((u) => bucket(FLAG_B, u) < rollout);
    const setB = new Set(b);
    return { cohortA: a, cohortB: b, overlap: a.filter((u) => setB.has(u)).length };
  }, [rollout, sharedSalt]);

  const identical = cohortA.length > 0 && overlap === cohortA.length && overlap === cohortB.length;

  const row = (cohort: string[], label: string) => (
    <div>
      <p className="mb-1 font-code text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="grid grid-cols-10 gap-1">
        {FLAG_USERS.map((u, i) => {
          const inside = cohort.includes(u);
          return (
            <span
              key={u}
              title={u}
              className={`rounded border py-1 text-center font-code text-xs tabular-nums ${
                inside
                  ? "border-foreground bg-foreground text-background"
                  : "border-dashed border-border text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Slider
        label="rollout"
        value={rollout}
        min={0}
        max={100}
        step={5}
        suffix="%"
        onChange={setRollout}
      />
      <Toggle
        label="hash the user id only (no per-flag salt)"
        checked={sharedSalt}
        onChange={setSharedSalt}
      />

      <div className="space-y-3">
        {row(cohortA, `flag: ${FLAG_A}`)}
        {row(cohortB, `flag: ${FLAG_B}`)}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={FLAG_A} value={`${cohortA.length}/20`} />
        <Stat label={FLAG_B} value={`${cohortB.length}/20`} />
        <Stat
          label="cohort overlap"
          value={String(overlap)}
          hint={identical ? "identical cohorts" : "independent cohorts"}
        />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        With the user id hashed on its own, the bucket is a property of the person rather than of
        the flag: both 25% rollouts select the same five accounts, so those five beta-test every
        risky change you ship while your aggregate error rate stays flat. Add the flag key to the
        hash and the two cohorts separate. Widen the rollout either way and the filled cells only
        ever grow — nobody loses a feature they already saw.
      </p>
    </div>
  );
}

/* ─── schema migration ─────────────────────────────────────────────────────── */

type CodeState = "ok" | "breaks" | "waiting" | "gone";

interface MigrationStep {
  step: string;
  old: CodeState;
  next: CodeState;
}

const ONE_STEP: MigrationStep[] = [
  {
    step: "ALTER TABLE accounts RENAME COLUMN email TO email_address",
    old: "breaks",
    next: "waiting",
  },
  { step: "rolling deploy — 50% of replicas on the new code", old: "breaks", next: "ok" },
  { step: "rolling deploy — 100% on the new code", old: "gone", next: "ok" },
];

const EXPAND_CONTRACT: MigrationStep[] = [
  { step: "ALTER TABLE accounts ADD COLUMN email_address text", old: "ok", next: "waiting" },
  { step: "backfill in 1000-row keyset batches, watching replica lag", old: "ok", next: "waiting" },
  { step: "deploy — write both columns", old: "ok", next: "ok" },
  { step: "deploy — read email_address", old: "ok", next: "ok" },
  { step: "deploy — stop writing the old column", old: "gone", next: "ok" },
  { step: "ALTER TABLE accounts DROP COLUMN email", old: "gone", next: "ok" },
];

const STATE_LABEL: Record<CodeState, string> = {
  ok: "ok",
  breaks: "breaks",
  waiting: "not live",
  gone: "retired",
};

export function SchemaMigrationLab() {
  const [plan, setPlan] = useState<"one-step" | "expand-contract">("one-step");
  const steps = plan === "one-step" ? ONE_STEP : EXPAND_CONTRACT;
  const broken = steps.filter((s) => s.old === "breaks" || s.next === "breaks").length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["one-step", "expand-contract"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlan(p)}
            className={`rounded-md border px-3 py-1.5 font-code text-xs ${
              plan === p
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left">
          <thead>
            <tr className="font-code text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-1 pr-3 font-normal">step</th>
              <th className="w-24 py-1 font-normal">old code</th>
              <th className="w-24 py-1 font-normal">new code</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s, i) => {
              const bad = s.old === "breaks" || s.next === "breaks";
              return (
                <tr key={s.step} className={`border-t border-border ${bad ? "bg-card" : ""}`}>
                  <td className="py-2 pr-3 font-code text-xs">
                    <span className="text-muted-foreground">{i + 1}. </span>
                    {s.step}
                  </td>
                  {[s.old, s.next].map((state, k) => (
                    <td
                      key={k}
                      className={`py-2 font-code text-xs ${
                        state === "breaks" ? "font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {STATE_LABEL[state]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="steps" value={String(steps.length)} />
        <Stat
          label="steps that break production"
          value={String(broken)}
          hint={
            broken ? "old replicas reading a column that is gone" : "every state valid for both"
          }
        />
        <Stat label="safe to roll back" value={plan === "one-step" ? "no" : "until step 5"} />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        The one-step plan looks like two lines of work and contains a window — steps 1 and 2 — where
        the column is renamed and half the replicas are still running code that selects the old
        name. Every request they serve errors. The expand/contract plan is six deploys instead of
        one and has no such window: each intermediate schema is valid for the code before it and the
        code after it.
      </p>
    </div>
  );
}

/* ─── capacity planning ────────────────────────────────────────────────────── */

const BASE_SERVICE_MS = 40;
const PER_SERVER_CONCURRENCY = 64;
const ZONES = 3;

export function CapacityPlanningLab() {
  const [utilPct, setUtilPct] = useState(85);
  const [rps, setRps] = useState(2000);

  const plan = useMemo(() => {
    const rho = utilPct / 100;
    const multiplier = 1 / (1 - rho);
    const p99 = BASE_SERVICE_MS * multiplier;
    const concurrency = (rps * p99) / 1000;
    const servers = Math.ceil(concurrency / (PER_SERVER_CONCURRENCY * rho));
    const afterLoss = (rho * ZONES) / (ZONES - 1);
    return { rho, multiplier, p99, concurrency, servers, afterLoss };
  }, [utilPct, rps]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="target utilisation"
          value={utilPct}
          min={40}
          max={95}
          step={5}
          suffix="%"
          onChange={setUtilPct}
        />
        <Slider
          label="peak traffic"
          value={rps}
          min={500}
          max={5000}
          step={100}
          suffix=" rps"
          onChange={setRps}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="queueing multiplier"
          value={`${plan.multiplier.toFixed(1)}×`}
          hint="1 / (1 − ρ)"
        />
        <Stat
          label="p99 latency"
          value={`${Math.round(plan.p99)} ms`}
          hint={`${BASE_SERVICE_MS}ms of work, the rest is waiting`}
        />
        <Stat
          label="fleet"
          value={String(plan.servers)}
          hint={`${Math.round(plan.concurrency)} requests in flight`}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-code text-xs text-muted-foreground">
          <span>utilisation now</span>
          <span className="tabular-nums text-foreground">{Math.round(plan.rho * 100)}%</span>
        </div>
        <Bar fraction={plan.rho} muted />
        <div className="flex justify-between font-code text-xs text-muted-foreground">
          <span>after losing 1 of {ZONES} zones</span>
          <span className="tabular-nums text-foreground">{Math.round(plan.afterLoss * 100)}%</span>
        </div>
        <Bar fraction={plan.afterLoss} />
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <p className="font-code text-xs uppercase tracking-wider text-muted-foreground">
          N−1 verdict
        </p>
        <p className="mt-1 font-code text-xl tabular-nums">
          {plan.afterLoss > 1 ? "saturated" : "survivable"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {plan.afterLoss > 1
            ? `the surviving zones would need ${Math.round(plan.afterLoss * 100)}% of their capacity`
            : `headroom of ${Math.round((1 - plan.afterLoss) * 100)} points remains after a zone failure`}
        </p>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        85% utilisation sounds like good stewardship. It multiplies the 40ms of actual work by 6.7,
        so the p99 is 267ms of mostly queueing — and when one of three zones goes, the survivors are
        asked for 127% of what they have, which is a cascading failure rather than degraded service.
        Drag the target down to 60% and both numbers become boring, which is the objective.
      </p>
    </div>
  );
}

/* ─── blue-green & canary ──────────────────────────────────────────────────── */

const CANARY_RPS = 9;
const BASELINE_RATE = 0.005;
const CANARY_TRUE_RATE = 0.015;
const ERROR_BUDGET = 0.002;
const MIN_SAMPLES = 1000;

export function BlueGreenCanaryLab() {
  const [sharePct, setSharePct] = useState(1);
  const [bakeMin, setBakeMin] = useState(2);
  const [requireSamples, setRequireSamples] = useState(false);

  const run = useMemo(() => {
    const total = CANARY_RPS * bakeMin * 60;
    const canaryRequests = Math.round((sharePct / 100) * total);
    const baselineRequests = Math.round((1 - sharePct / 100) * total);
    const baselineErrors = Math.round(baselineRequests * BASELINE_RATE);
    const canaryErrors = Math.round(canaryRequests * CANARY_TRUE_RATE);

    const baselineRate = baselineRequests > 0 ? baselineErrors / baselineRequests : 0;
    const canaryRate = canaryRequests > 0 ? canaryErrors / canaryRequests : 0;
    const delta = canaryRate - baselineRate;

    const pooled = (baselineErrors + canaryErrors) / Math.max(1, baselineRequests + canaryRequests);
    const noise = canaryRequests > 0 ? 2 * Math.sqrt((pooled * (1 - pooled)) / canaryRequests) : 1;

    let verdict: string;
    if (requireSamples && canaryRequests < MIN_SAMPLES) verdict = "inconclusive";
    else if (delta <= ERROR_BUDGET) verdict = "promote";
    else verdict = delta > noise ? "rollback" : "inconclusive";

    return { canaryRequests, canaryErrors, baselineRate, canaryRate, delta, noise, verdict };
  }, [sharePct, bakeMin, requireSamples]);

  const realRegression = CANARY_TRUE_RATE - BASELINE_RATE;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="canary traffic"
          value={sharePct}
          min={1}
          max={50}
          suffix="%"
          onChange={setSharePct}
        />
        <Slider
          label="bake time"
          value={bakeMin}
          min={1}
          max={60}
          suffix=" min"
          onChange={setBakeMin}
        />
      </div>

      <Toggle
        label={`refuse a verdict below ${MIN_SAMPLES} canary requests`}
        checked={requireSamples}
        onChange={setRequireSamples}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="canary requests"
          value={String(run.canaryRequests)}
          hint={`${CANARY_RPS} rps, ${sharePct}% for ${bakeMin} min`}
        />
        <Stat
          label="canary errors seen"
          value={String(run.canaryErrors)}
          hint={`true rate is ${(CANARY_TRUE_RATE * 100).toFixed(1)}%`}
        />
        <Stat
          label="automated verdict"
          value={run.verdict}
          hint={`baseline ${(run.baselineRate * 100).toFixed(2)}%`}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-code text-xs text-muted-foreground">
          <span>real regression</span>
          <span className="tabular-nums text-foreground">
            {(realRegression * 100).toFixed(2)} pp
          </span>
        </div>
        <Bar fraction={realRegression / 0.05} muted />
        <div className="flex justify-between font-code text-xs text-muted-foreground">
          <span>smallest regression this canary can see</span>
          <span className="tabular-nums text-foreground">{(run.noise * 100).toFixed(2)} pp</span>
        </div>
        <Bar fraction={run.noise / 0.05} />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        The new version is genuinely three times worse. At 1% of nine requests per second for two
        minutes the canary handles eleven requests and observes zero errors, so the delta is
        negative and the automated verdict is a confident promote. The lower bar is what this sample
        could actually detect — about four percentage points, against a real regression of one.
        Widen the slice or extend the bake until the bottom bar drops below the top one; until then
        the green light means nothing.
      </p>
    </div>
  );
}

/* ─── config & secrets ─────────────────────────────────────────────────────── */

const TOKEN_TTL_MIN = 60;
const KEY_A_ACTIVATES = -1440;
const KEY_B_LIFETIME = 1440;

export function ConfigAndSecretsLab() {
  const [deployDelay, setDeployDelay] = useState(40);
  const [overlap, setOverlap] = useState(0);
  const [now, setNow] = useState(20);

  const view = useMemo(() => {
    const keys = [
      { id: "key-a", activatesAt: KEY_A_ACTIVATES, retiresAt: 0, expiresAt: overlap },
      {
        id: "key-b",
        activatesAt: deployDelay,
        retiresAt: deployDelay + KEY_B_LIFETIME,
        expiresAt: deployDelay + KEY_B_LIFETIME * 2,
      },
    ];
    const signers = keys.filter((k) => k.activatesAt <= now && now < k.retiresAt);
    const signWith = signers.sort((a, b) => b.activatesAt - a.activatesAt)[0] ?? null;
    const verifyWith = keys.filter((k) => k.activatesAt <= now && now < k.expiresAt);
    const signingGap = Math.max(0, deployDelay - 0);
    // Tokens minted just before the cut live for TOKEN_TTL_MIN; anything past
    // key-a's expiry can no longer be verified by anyone.
    const orphanWindow = Math.max(0, TOKEN_TTL_MIN - overlap);
    return { keys, signWith, verifyWith, signingGap, orphanWindow };
  }, [deployDelay, overlap, now]);

  const axisFrom = -180;
  const axisTo = 360;
  const span = axisTo - axisFrom;
  const pct = (t: number) => ((Math.max(axisFrom, Math.min(axisTo, t)) - axisFrom) / span) * 100;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider
          label="deploy delay"
          value={deployDelay}
          min={0}
          max={180}
          step={10}
          suffix=" min"
          onChange={setDeployDelay}
        />
        <Slider
          label="verify overlap"
          value={overlap}
          min={0}
          max={240}
          step={10}
          suffix=" min"
          onChange={setOverlap}
        />
        <Slider
          label="now"
          value={now}
          min={-60}
          max={300}
          step={10}
          suffix=" min"
          onChange={setNow}
        />
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card/60 p-3">
        {view.keys.map((k) => (
          <div key={k.id} className="flex items-center gap-3">
            <span className="w-16 shrink-0 font-code text-xs">{k.id}</span>
            <div className="relative h-3 flex-1 rounded-full bg-secondary">
              <div
                className="absolute h-3 rounded-full bg-muted-foreground/50"
                style={{
                  left: `${pct(k.activatesAt)}%`,
                  width: `${Math.max(0, pct(k.expiresAt) - pct(k.activatesAt))}%`,
                }}
              />
              <div
                className="absolute h-3 rounded-full bg-foreground"
                style={{
                  left: `${pct(k.activatesAt)}%`,
                  width: `${Math.max(0, pct(k.retiresAt) - pct(k.activatesAt))}%`,
                }}
              />
              <div
                className="absolute -top-1 h-5 w-px bg-foreground"
                style={{ left: `${pct(now)}%` }}
              />
            </div>
          </div>
        ))}
        <p className="font-code text-xs text-muted-foreground">
          solid = may sign · muted = still verifies · vertical rule = now
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="signer at now"
          value={view.signWith ? view.signWith.id : "none"}
          hint={view.signWith ? "signing normally" : "nothing can issue a token"}
        />
        <Stat
          label="signing gap"
          value={`${view.signingGap} min`}
          hint="old key retired, new key not deployed"
        />
        <Stat
          label="orphaned tokens"
          value={`${view.orphanWindow} min`}
          hint={`issued before the cut, TTL ${TOKEN_TTL_MIN} min`}
        />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        The default plan retires key-a on schedule and expires it at the same instant, while the
        deploy carrying key-b arrives forty minutes late. For those forty minutes nothing can sign,
        and every token minted in the hour before the cut is unverifiable because the key that
        signed it is already gone. The rule that fixes it is arithmetic: retirement plus the longest
        token TTL plus the deploy delay must be no later than expiry — so push the verify overlap
        past 100 minutes and both failures disappear.
      </p>
    </div>
  );
}

/* ─── multi-tenancy ────────────────────────────────────────────────────────── */

/** Power-law loads, as tenant sizes actually are. One whale, a long tail. */
const TENANTS = [
  { name: "northwind", load: 480 },
  { name: "globex", load: 180 },
  { name: "stark", load: 30 },
  { name: "hooli", load: 20 },
  { name: "gringotts", load: 10 },
  { name: "acme", load: 60 },
  { name: "tyrell", load: 40 },
  { name: "soylent", load: 24 },
  { name: "dunder", load: 16 },
  { name: "wonka", load: 8 },
  { name: "nakatomi", load: 4 },
  { name: "cyberdyne", load: 44 },
  { name: "pied-piper", load: 12 },
  { name: "initech", load: 34 },
  { name: "umbrella", load: 22 },
  { name: "wayne", load: 18 },
  { name: "aperture", load: 14 },
  { name: "vandelay", load: 9 },
  { name: "massive", load: 6 },
  { name: "oceanic", load: 3 },
];

const SHARD_COUNT = 4;

export function MultiTenancyLab() {
  const [capacity, setCapacity] = useState(300);
  const [sizeAware, setSizeAware] = useState(false);

  const placement = useMemo(() => {
    const shards: { name: string; load: number }[][] = Array.from(
      { length: SHARD_COUNT },
      () => [],
    );
    const siloed: { name: string; load: number }[] = [];

    if (!sizeAware) {
      // Uniform hash over tenant_id. Perfect for cache keys, blind to size.
      for (const t of TENANTS) shards[fnv1a(`t:${t.name}`) % SHARD_COUNT].push(t);
    } else {
      const loads = new Array(SHARD_COUNT).fill(0);
      const ordered = [...TENANTS].sort((a, b) => b.load - a.load || a.name.localeCompare(b.name));
      for (const t of ordered) {
        let best = -1;
        for (let i = 0; i < SHARD_COUNT; i++) {
          if (loads[i] + t.load > capacity) continue;
          if (best === -1 || loads[i] < loads[best]) best = i;
        }
        if (best === -1) siloed.push(t);
        else {
          shards[best].push(t);
          loads[best] += t.load;
        }
      }
    }

    const totals = shards.map((s) => s.reduce((n, t) => n + t.load, 0));
    return { shards, siloed, totals, hottest: Math.max(...totals) };
  }, [capacity, sizeAware]);

  return (
    <div className="space-y-4">
      <Slider
        label="shard capacity"
        value={capacity}
        min={150}
        max={600}
        step={50}
        onChange={setCapacity}
      />
      <Toggle
        label="size-aware placement (a directory instead of a hash)"
        checked={sizeAware}
        onChange={setSizeAware}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {placement.shards.map((shard, i) => {
          const total = placement.totals[i];
          const over = total > capacity;
          return (
            <div
              key={i}
              className={`rounded-lg border p-3 ${over ? "border-foreground bg-card" : "border-border bg-card/60"}`}
            >
              <p className="flex justify-between font-code text-xs uppercase tracking-wider text-muted-foreground">
                shard {i}
                <span className={`tabular-nums ${over ? "font-semibold text-foreground" : ""}`}>
                  {Math.round((total / capacity) * 100)}%
                </span>
              </p>
              <div className="mt-2">
                <Bar fraction={total / capacity} muted={!over} />
              </div>
              <ul className="mt-2 space-y-0.5">
                {[...shard]
                  .sort((a, b) => b.load - a.load)
                  .map((t) => (
                    <li key={t.name} className="flex justify-between font-code text-xs">
                      <span className="truncate text-muted-foreground">{t.name}</span>
                      <span className="tabular-nums">{t.load}</span>
                    </li>
                  ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="hottest shard"
          value={`${Math.round((placement.hottest / capacity) * 100)}%`}
          hint={`${placement.hottest} of ${capacity} capacity`}
        />
        <Stat
          label="shards over capacity"
          value={String(placement.totals.filter((t) => t > capacity).length)}
        />
        <Stat
          label="needs a silo"
          value={placement.siloed.length ? placement.siloed.map((t) => t.name).join(", ") : "—"}
          hint={placement.siloed.length ? "bigger than any shard" : "everything fits the pool"}
        />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        The hash spreads tenants evenly and load not at all: northwind and globex land together and
        shard 0 sits at 240% of capacity while shard 2 is at 19%. Switching to a directory places
        the big tenants deliberately and gives the honest answer the hash cannot — northwind is
        larger than any shard you have, so it needs one of its own rather than a neighbour to ruin.
      </p>
    </div>
  );
}

/* ─── cost modeling ────────────────────────────────────────────────────────── */

const FIXED_COMPUTE = 24 * 730 * 0.192;
const METRIC_COUNT = 25;
const PER_SERIES = 0.05;
const EGRESS_BYTES = 40960;
const EGRESS_PER_GB = 0.09;
const LOG_PER_GB = 2.5;

export function CostModelingLab() {
  const [requestsM, setRequestsM] = useState(300);
  const [labelDims, setLabelDims] = useState(4);
  const [logBytes, setLogBytes] = useState(2048);

  const model = useMemo(() => {
    const requests = requestsM * 1e6;
    const series = METRIC_COUNT * Math.pow(10, labelDims);
    const lines = [
      { name: "metrics (custom series)", cost: series * PER_SERIES, unit: `${series} series` },
      { name: "compute", cost: FIXED_COMPUTE, unit: "24 × 730 h" },
      { name: "logs (ingest)", cost: ((requests * logBytes) / 1e9) * LOG_PER_GB, unit: "per GB" },
      {
        name: "egress",
        cost: ((requests * EGRESS_BYTES) / 1e9) * EGRESS_PER_GB,
        unit: "per GB",
      },
      { name: "database", cost: 1120, unit: "managed instance" },
      { name: "object storage", cost: 340, unit: "per GB-month" },
    ].sort((a, b) => b.cost - a.cost);

    const total = lines.reduce((n, l) => n + l.cost, 0);
    const infra = lines
      .filter((l) => ["compute", "database", "egress"].includes(l.name))
      .reduce((n, l) => n + l.cost, 0);
    return { lines, total, infra, perMillion: total / requestsM, dominant: lines[0] };
  }, [requestsM, labelDims, logBytes]);

  const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider
          label="monthly requests"
          value={requestsM}
          min={50}
          max={1000}
          step={50}
          suffix="M"
          onChange={setRequestsM}
        />
        <Slider
          label="metric label dims"
          value={labelDims}
          min={1}
          max={5}
          onChange={setLabelDims}
        />
        <Slider
          label="log bytes / request"
          value={logBytes}
          min={0}
          max={8192}
          step={512}
          onChange={setLogBytes}
        />
      </div>

      <ul className="space-y-1.5">
        {model.lines.map((line) => (
          <li key={line.name} className="flex items-center gap-3">
            <span className="w-44 shrink-0 truncate font-code text-xs">{line.name}</span>
            <span className="flex-1">
              <Bar
                fraction={line.cost / model.dominant.cost}
                muted={line.name !== model.dominant.name}
              />
            </span>
            <span className="w-20 text-right font-code text-xs tabular-nums">
              {money(line.cost)}
            </span>
            <span className="w-10 text-right font-code text-xs tabular-nums text-muted-foreground">
              {Math.round((line.cost / model.total) * 100)}%
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="monthly total" value={money(model.total)} />
        <Stat
          label="per 1M requests"
          value={`$${model.perMillion.toFixed(2)}`}
          hint="the number to track over time"
        />
        <Stat
          label="dominant vs infra"
          value={`${(model.dominant.cost / model.infra).toFixed(1)}×`}
          hint="compute + database + egress combined"
        />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        The top line is not a machine anyone provisioned. Twenty-five metrics with four label
        dimensions is 250,000 billed series, and at five cents each that is more than the servers,
        the database and the egress put together. Drag the dimension slider by one and watch the
        number multiply by ten — that is a one-line diff, and it passes review.
      </p>
    </div>
  );
}
