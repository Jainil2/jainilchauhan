import { useMemo, useState, type ReactNode } from "react";
import { Bar, Slider, Stat } from "./ai-primitives";

/* ─── shared chrome ────────────────────────────────────────────────────────── */

/**
 * A segmented control. Used instead of a <select> so the option not chosen is
 * still visible — several of these demos are about the default being wrong,
 * which only reads if you can see what else was on offer.
 */
function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="font-code text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={opt.value === value}
            className={`rounded-md border px-2.5 py-1 font-code text-xs transition-colors ${
              opt.value === value
                ? "border-foreground bg-secondary text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
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

function Note({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>;
}

/* ─── 1. rate limiting at scale ────────────────────────────────────────────── */

const FLEET_LIMIT = 100; // req/s the policy promises
const OFFERED = 600; // req/s one abusive customer actually sends

type LimiterStrategy = "copy" | "split" | "central";

/**
 * The naive deployment is the default: every node holds a full-size bucket, so
 * the fleet enforces limit x nodes and each node's own metrics look correct.
 */
export function RateLimitingAtScaleLab() {
  const [nodes, setNodes] = useState(4);
  const [skew, setSkew] = useState(0);
  const [strategy, setStrategy] = useState<LimiterStrategy>("copy");

  const { rows, admitted } = useMemo(() => {
    const even = 1 / nodes;
    const hotShare = even + (skew / 100) * (1 - even);
    const restShare = nodes > 1 ? (1 - hotShare) / (nodes - 1) : 0;
    // Central store: one bucket for the fleet, so admission is simply capped.
    const centralScale = Math.min(1, FLEET_LIMIT / OFFERED);
    const cap = strategy === "split" ? FLEET_LIMIT / nodes : FLEET_LIMIT;

    const rows = Array.from({ length: nodes }, (_, i) => {
      const offered = OFFERED * (i === 0 ? hotShare : restShare);
      const admitted = strategy === "central" ? offered * centralScale : Math.min(offered, cap);
      return { offered, admitted, cap };
    });

    return { rows, admitted: rows.reduce((n, r) => n + r.admitted, 0) };
  }, [nodes, skew, strategy]);

  const overshoot = admitted / FLEET_LIMIT;

  return (
    <div className="space-y-4">
      <Choice<LimiterStrategy>
        label="where the bucket lives"
        value={strategy}
        onChange={setStrategy}
        options={[
          { value: "copy", label: "local bucket per node" },
          { value: "split", label: "budget split by node" },
          { value: "central", label: "central store" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="nodes" value={nodes} min={2} max={8} onChange={setNodes} />
        <Slider
          label="traffic skew onto node 1"
          value={skew}
          min={0}
          max={80}
          suffix="%"
          onChange={setSkew}
        />
      </div>

      <ul className="space-y-1.5">
        {rows.map((row, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className="w-16 font-code text-xs text-muted-foreground">node {i + 1}</span>
            <span className="flex-1">
              <Bar fraction={row.admitted / OFFERED} />
            </span>
            <span className="w-40 text-right font-code text-xs tabular-nums text-muted-foreground">
              {Math.round(row.admitted)} of {Math.round(row.offered)} admitted · cap{" "}
              {Math.round(row.cap)}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="policy limit" value={`${FLEET_LIMIT}/s`} hint="what the docs promise" />
        <Stat
          label="actually admitted"
          value={`${Math.round(admitted)}/s`}
          hint={`offered ${OFFERED}/s`}
        />
        <Stat
          label="overshoot"
          value={`${overshoot.toFixed(1)}×`}
          hint={
            strategy === "central"
              ? `+1 store op on all ${OFFERED} req/s`
              : "every node reports it is enforcing"
          }
        />
      </div>

      <Note>
        Four nodes, each holding a full 100 req/s bucket, admit 400 req/s against a 100 req/s policy
        — and no node is wrong, because each one really did enforce its own bucket. Splitting the
        budget fixes the total, then the skew slider shows the new problem: push traffic onto one
        node and the customer is throttled at a fraction of the limit while the rest of the fleet
        idles.
      </Note>
    </div>
  );
}

/* ─── 2. caching layers ────────────────────────────────────────────────────── */

const L1_MS = 0.1;
const L2_MS = 1.2;
const ORIGIN_MS = 28;
const TRACE_LEN = 400;

function runTiers(distinct: number, l1Size: number, l2Size: number) {
  const l1 = new Map<number, true>();
  const l2 = new Map<number, true>();
  const counts = { l1: 0, l2: 0, origin: 0 };

  const insert = (cache: Map<number, true>, key: number, cap: number) => {
    if (cap <= 0) return;
    cache.delete(key);
    cache.set(key, true);
    while (cache.size > cap) cache.delete(cache.keys().next().value as number);
  };

  for (let i = 0; i < TRACE_LEN; i++) {
    // A looping scan: the access pattern behind almost every "our cache does
    // nothing" investigation.
    const key = i % distinct;
    if (l1.has(key)) {
      counts.l1 += 1;
      insert(l1, key, l1Size);
      continue;
    }
    if (l2.has(key)) {
      counts.l2 += 1;
      insert(l2, key, l2Size);
      insert(l1, key, l1Size);
      continue;
    }
    counts.origin += 1;
    insert(l2, key, l2Size);
    insert(l1, key, l1Size);
  }
  return counts;
}

/** Opens with an L1 smaller than the working set, so its hit rate is exactly 0%. */
export function CachingLayersLab() {
  const [l1Size, setL1Size] = useState(8);
  const [l2Size, setL2Size] = useState(64);
  const [distinct, setDistinct] = useState(40);

  const counts = useMemo(() => runTiers(distinct, l1Size, l2Size), [distinct, l1Size, l2Size]);

  const latency =
    (counts.l1 * L1_MS +
      counts.l2 * (L1_MS + L2_MS) +
      counts.origin * (L1_MS + L2_MS + ORIGIN_MS)) /
    TRACE_LEN;
  const hitRate = (counts.l1 + counts.l2) / TRACE_LEN;

  const tiers = [
    { label: "L1 · in-process", value: counts.l1, hint: "~0.1 ms" },
    { label: "L2 · shared", value: counts.l2, hint: "~1.2 ms + network" },
    { label: "origin · database", value: counts.origin, hint: "~28 ms" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label="L1 entries" value={l1Size} min={0} max={64} onChange={setL1Size} />
        <Slider label="L2 entries" value={l2Size} min={0} max={128} onChange={setL2Size} />
        <Slider label="working set" value={distinct} min={4} max={80} onChange={setDistinct} />
      </div>

      <ul className="space-y-2">
        {tiers.map((tier) => (
          <li key={tier.label} className="flex items-center gap-3">
            <span className="w-32 font-code text-xs text-muted-foreground">{tier.label}</span>
            <span className="flex-1">
              <Bar fraction={tier.value / TRACE_LEN} muted={tier.label.startsWith("origin")} />
            </span>
            <span className="w-28 text-right font-code text-xs tabular-nums text-muted-foreground">
              {Math.round((tier.value / TRACE_LEN) * 100)}% · {tier.hint}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="L1 hit rate"
          value={`${Math.round((counts.l1 / TRACE_LEN) * 100)}%`}
          hint={counts.l1 === 0 ? "the top layer is dead weight" : "no network hop"}
        />
        <Stat label="overall hit rate" value={`${Math.round(hitRate * 100)}%`} hint="L1 + L2" />
        <Stat
          label="avg latency"
          value={`${latency.toFixed(2)} ms`}
          hint="misses dominate, not hits"
        />
      </div>

      <Note>
        The trace loops over a working set five times larger than L1, so by the time it returns to a
        key, recency has already evicted it: the L1 hit rate opens at 0% and every request pays the
        network hop to L2 regardless. Overall hit rate still reads in the nineties, which is exactly
        why that number on its own hides a useless layer. Raise L1 past the working set and the top
        bar jumps in one step — cache hit rates are cliffs, not curves.
      </Note>
    </div>
  );
}

/* ─── 3. CDN & edge caching ────────────────────────────────────────────────── */

const CDN_WINDOW_S = 600; // 10 minutes of traffic
const CDN_INTERVAL_S = 5; // each PoP is asked for the object this often

const POP_NAMES = [
  "lhr",
  "cdg",
  "fra",
  "iad",
  "sfo",
  "nrt",
  "syd",
  "gru",
  "sin",
  "yyz",
  "ams",
  "mad",
  "bom",
  "jnb",
  "scl",
  "arn",
];

/** Tiered caching off by default: every PoP misses on its own, N× per window. */
export function CdnEdgeLab() {
  const [popCount, setPopCount] = useState(8);
  const [ttl, setTtl] = useState(60);
  const [shield, setShield] = useState(false);

  const { perPop, fetches, requests } = useMemo(() => {
    const perPop = new Array(popCount).fill(0);
    let fetches = 0;
    let requests = 0;
    const edgeExpiry = new Array(popCount).fill(-1);
    let shieldExpiry = -1;

    for (let t = 0; t < CDN_WINDOW_S; t += CDN_INTERVAL_S) {
      for (let p = 0; p < popCount; p++) {
        requests += 1;
        if (t < edgeExpiry[p]) continue; // fresh at the edge
        if (shield) {
          if (t >= shieldExpiry) {
            fetches += 1;
            perPop[p] += 1;
            shieldExpiry = t + ttl;
          }
        } else {
          fetches += 1;
          perPop[p] += 1;
        }
        edgeExpiry[p] = t + ttl;
      }
    }
    return { perPop, fetches, requests };
  }, [popCount, ttl, shield]);

  const windows = Math.ceil(CDN_WINDOW_S / ttl);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="points of presence"
          value={popCount}
          min={2}
          max={16}
          onChange={setPopCount}
        />
        <Slider label="TTL" value={ttl} min={10} max={300} step={10} suffix="s" onChange={setTtl} />
      </div>

      <Toggle
        label="tiered cache (one shield owns the object)"
        checked={shield}
        onChange={setShield}
      />

      <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {perPop.map((n, i) => (
          <li
            key={POP_NAMES[i]}
            className="flex items-center justify-between rounded-md border border-border bg-card/60 px-2 py-1.5 font-code text-xs"
          >
            <span className="text-muted-foreground">{POP_NAMES[i]}</span>
            <span className="tabular-nums">{n} fetch</span>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="origin fetches"
          value={String(fetches)}
          hint={shield ? `≈1 per ${ttl}s window` : `${popCount} per ${ttl}s window`}
        />
        <Stat
          label="edge hit ratio"
          value={`${Math.round((1 - fetches / requests) * 100)}%`}
          hint={`${requests} requests in 10 min`}
        />
        <Stat
          label="fetches with a shield"
          value={String(windows)}
          hint={shield ? "in effect now" : `instead of the ${fetches} above`}
        />
      </div>

      <Note>
        Eight PoPs, a 60-second TTL and tiered caching off — the shipping default. Each edge misses
        independently, so the origin serves eight fetches per TTL window and eighty over ten
        minutes, while the hit ratio anyone would put on a dashboard sits above 90%. Turn the shield
        on and the same traffic costs ten fetches. The ratio barely moves; origin load drops by 8×.
      </Note>
    </div>
  );
}

/* ─── 4. API gateway ───────────────────────────────────────────────────────── */

const GW_ROUTES = [
  { id: "users-svc", prefix: "/api/users", methods: ["*"] },
  { id: "admin-svc", prefix: "/api/admin", methods: ["*"], staffOnly: true },
  { id: "billing-svc", prefix: "/api/billing", methods: ["GET", "POST"] },
  { id: "monolith", prefix: "/", methods: ["*"] },
];

const GW_REQUESTS = [
  { path: "/api/users/42", method: "GET", expect: "users-svc" },
  { path: "/api/usersearch", method: "GET", expect: "monolith" },
  { path: "/api/admin/flags", method: "POST", expect: "admin-svc" },
  { path: "/api/administrators", method: "GET", expect: "monolith" },
  { path: "/api/billing/invoices", method: "DELETE", expect: "monolith" },
  { path: "/healthz", method: "GET", expect: "monolith" },
];

function matchRoute(path: string, method: string, segmentAware: boolean) {
  let bestId: string | null = null;
  let bestLen = -1;
  let bestStaff = false;

  for (const r of GW_ROUTES) {
    const pathHit =
      r.prefix === "/"
        ? true
        : segmentAware
          ? path === r.prefix || path.startsWith(r.prefix + "/")
          : path.startsWith(r.prefix);
    if (!pathHit) continue;
    if (!r.methods.includes("*") && !r.methods.includes(method)) continue;
    const len = r.prefix === "/" ? 0 : r.prefix.length;
    if (len > bestLen) {
      bestLen = len;
      bestId = r.id;
      bestStaff = Boolean(r.staffOnly);
    }
  }
  return { id: bestId, staffOnly: bestStaff };
}

/** Opens on raw startsWith matching, so two of the six requests are misrouted. */
export function ApiGatewayLab() {
  const [segmentAware, setSegmentAware] = useState(false);

  const results = useMemo(
    () =>
      GW_REQUESTS.map((req) => {
        const got = matchRoute(req.path, req.method, segmentAware);
        return { ...req, got: got.id, staffOnly: got.staffOnly, wrong: got.id !== req.expect };
      }),
    [segmentAware],
  );

  const wrong = results.filter((r) => r.wrong).length;
  const leaked = results.filter((r) => r.wrong && r.staffOnly).length;

  return (
    <div className="space-y-4">
      <Toggle
        label="match on segment boundaries (path === prefix || path starts with prefix + '/')"
        checked={segmentAware}
        onChange={setSegmentAware}
      />

      <ul className="space-y-1.5">
        {results.map((r) => (
          <li
            key={r.path}
            className={`flex items-center gap-3 rounded-md border p-2 text-sm ${
              r.wrong ? "border-foreground bg-card" : "border-border bg-card/60"
            }`}
          >
            <span className="w-16 font-code text-xs text-muted-foreground">{r.method}</span>
            <span className="flex-1 truncate font-code text-xs">{r.path}</span>
            <span className="w-28 text-right font-code text-xs">{r.got}</span>
            <span className="w-24 text-right font-code text-xs text-muted-foreground">
              {r.wrong ? (
                <span className="font-semibold text-foreground">
                  {r.staffOnly ? "wrong + staff" : "misrouted"}
                </span>
              ) : (
                "ok"
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="misrouted" value={`${wrong} / ${GW_REQUESTS.length}`} hint="no error raised" />
        <Stat
          label="landed on a staff-only route"
          value={String(leaked)}
          hint={leaked ? "policy applied to the wrong path" : "none"}
        />
        <Stat
          label="matching rule"
          value={segmentAware ? "segment" : "startsWith"}
          hint={segmentAware ? "correct" : "the default in hand-rolled routers"}
        />
      </div>

      <Note>
        With plain prefix matching, <span className="font-code">/api/usersearch</span> is handed to
        the users service and <span className="font-code">/api/administrators</span> to the
        staff-only admin service, purely because the strings line up. Both return 200s from a
        service that was never meant to see them, so this shows up as a service bug rather than a
        routing one. The last row is the other half of the table: DELETE is not in the billing
        route's method list, so it falls through to the catch-all instead of matching and 405-ing.
      </Note>
    </div>
  );
}

/* ─── 5. database scaling ──────────────────────────────────────────────────── */

const DB_QUERIES = [
  { sql: "orders WHERE workspace_id = 11", keys: [11] },
  { sql: "orders WHERE workspace_id = 4", keys: [4] },
  { sql: "orders WHERE workspace_id IN (3, 20, 27)", keys: [3, 20, 27] },
  { sql: "orders WHERE status = 'refunded'", keys: null },
  { sql: "users WHERE email = $1", keys: null },
  { sql: "orders WHERE workspace_id = 11 AND created_at > $1", keys: [11] },
];

// One enterprise tenant plus twenty small ones. Row counts, not request counts:
// hash sharding spreads rows evenly and traffic not at all.
const DB_TENANTS = [
  { id: 11, weight: 40 },
  ...Array.from({ length: 20 }, (_, i) => i + 1)
    .filter((id) => id !== 11)
    .map((id) => ({ id, weight: 3 })),
];

/** Opens at eight shards: two unkeyed queries scatter, and shard 3 owns the whale. */
export function DatabaseScalingLab() {
  const [shards, setShards] = useState(8);

  const { plans, load, scatter } = useMemo(() => {
    const plans = DB_QUERIES.map((q) => {
      if (q.keys === null) return { ...q, shards: Array.from({ length: shards }, (_, i) => i) };
      const set = new Set(q.keys.map((k) => k % shards));
      return { ...q, shards: Array.from(set).sort((a, b) => a - b) };
    });

    const load = new Array(shards).fill(0);
    let total = 0;
    for (const t of DB_TENANTS) {
      load[t.id % shards] += t.weight;
      total += t.weight;
    }

    return {
      plans,
      load: load.map((w) => w / total),
      scatter: plans.filter((p) => p.keys === null).length,
    };
  }, [shards]);

  const shardHits = plans.reduce((n, p) => n + p.shards.length, 0);
  const hottest = load.indexOf(Math.max(...load));

  return (
    <div className="space-y-4">
      <Slider label="shards" value={shards} min={2} max={16} onChange={setShards} />

      <ul className="space-y-1.5">
        {plans.map((p) => (
          <li key={p.sql} className="flex items-center gap-3 text-sm">
            <span className="flex-1 truncate font-code text-xs">{p.sql}</span>
            <span className="flex gap-0.5">
              {Array.from({ length: shards }, (_, i) => (
                <span
                  key={i}
                  className={`h-3 w-2 rounded-sm ${
                    p.shards.includes(i) ? "bg-foreground" : "bg-secondary"
                  }`}
                />
              ))}
            </span>
            <span className="w-20 text-right font-code text-xs tabular-nums text-muted-foreground">
              {p.keys === null ? "scatter" : `${p.shards.length} shard`}
            </span>
          </li>
        ))}
      </ul>

      <div>
        <p className="mb-1.5 font-code text-xs uppercase tracking-wider text-muted-foreground">
          rows per shard
        </p>
        <div className="grid gap-1">
          {load.map((fraction, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-16 font-code text-xs text-muted-foreground">shard {i}</span>
              <span className="flex-1">
                <Bar fraction={fraction} muted={i !== hottest} />
              </span>
              <span className="w-12 text-right font-code text-xs tabular-nums text-muted-foreground">
                {Math.round(fraction * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="unkeyed queries"
          value={`${scatter} / ${DB_QUERIES.length}`}
          hint="every shard, every time"
        />
        <Stat
          label="shard hits per pass"
          value={String(shardHits)}
          hint="latency is max of N, not avg"
        />
        <Stat
          label="hottest shard"
          value={`shard ${hottest}`}
          hint={`${Math.round(load[hottest] * 100)}% of all rows`}
        />
      </div>

      <Note>
        Four of the six queries carry the workspace id and touch one shard. The other two carry no
        shard key at all, so the router has to ask all eight and wait for the slowest — and dragging
        the shard count up makes those two worse, not better. Underneath, one enterprise tenant
        hashes to shard 3 and owns close to half the rows on its own; move the slider and the
        hotspot relocates to another shard rather than disappearing.
      </Note>
    </div>
  );
}

/* ─── 6. read replicas ─────────────────────────────────────────────────────── */

const RR_SPAN = 2000; // ms drawn on the timeline

/** Opens with the read on a replica 800 ms behind, 200 ms after the write. */
export function ReadReplicasLab() {
  const [lag, setLag] = useState(800);
  const [readAt, setReadAt] = useState(200);
  const [sticky, setSticky] = useState(false);

  const onPrimary = sticky && readAt < lag;
  const replicaHasWrite = readAt >= lag;
  const stale = !onPrimary && !replicaHasWrite;

  const x = (ms: number) => 20 + (Math.min(ms, RR_SPAN) / RR_SPAN) * 360;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="replication lag"
          value={lag}
          min={0}
          max={2000}
          step={50}
          suffix=" ms"
          onChange={setLag}
        />
        <Slider
          label="read happens at"
          value={readAt}
          min={0}
          max={2000}
          step={50}
          suffix=" ms"
          onChange={setReadAt}
        />
      </div>

      <Toggle
        label="sticky reads (route a writer's own reads to the primary)"
        checked={sticky}
        onChange={setSticky}
      />

      <svg
        viewBox="0 0 400 120"
        className="mx-auto w-full max-w-[420px] rounded-lg border border-border bg-card/60"
        role="img"
        aria-label="Timeline of a write on the primary and a read on a replica"
      >
        <text x="20" y="24" className="fill-muted-foreground font-code text-[12px]">
          primary
        </text>
        <line x1="20" y1="38" x2="380" y2="38" className="stroke-border" strokeWidth="1" />
        <circle cx={x(0)} cy="38" r="4" className="fill-foreground" />
        <text x={x(0) + 8} y="34" className="fill-foreground font-code text-[12px]">
          write v2
        </text>

        <text x="20" y="74" className="fill-muted-foreground font-code text-[12px]">
          replica
        </text>
        <line x1="20" y1="88" x2="380" y2="88" className="stroke-border" strokeWidth="1" />
        {/* The lag window: the replica still answers v1 for this whole stretch. */}
        <line
          x1={x(0)}
          y1="88"
          x2={x(lag)}
          y2="88"
          className="stroke-muted-foreground"
          strokeWidth="3"
          strokeDasharray="3 2"
        />
        <circle cx={x(lag)} cy="88" r="4" className="fill-foreground" />
        <text x={x(lag) + 8} y="84" className="fill-muted-foreground font-code text-[12px]">
          applies v2
        </text>

        {/* Where the read lands. */}
        <line
          x1={x(readAt)}
          y1="28"
          x2={x(readAt)}
          y2="100"
          className="stroke-foreground"
          strokeWidth="1.5"
        />
        <text
          x={x(readAt)}
          y="114"
          textAnchor="middle"
          className="fill-foreground font-code text-[12px]"
        >
          read
        </text>
      </svg>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="read served by"
          value={onPrimary ? "primary" : "replica"}
          hint={sticky ? "sticky window active" : "reader endpoint, always"}
        />
        <Stat
          label="row returned"
          value={onPrimary || replicaHasWrite ? "v2" : "v1"}
          hint="the user's own edit"
        />
        <Stat
          label="outcome"
          value={stale ? "stale" : "fresh"}
          hint={stale ? "HTTP 200, no error anywhere" : "correct"}
        />
      </div>

      <Note>
        The write commits at 0 ms, the replica applies it at 800 ms, and the page reload reads at
        200 ms — from the replica, because that is what pointing an ORM at the reader endpoint does.
        The user is shown v1: their own comment, missing, with a 200 status and nothing in any error
        budget. Turn sticky reads on and only the writer pays the cost of going to the primary,
        which is the whole reason the trick scales.
      </Note>
    </div>
  );
}

/* ─── 7. connection pooling ────────────────────────────────────────────────── */

const DB_PARALLELISM = 16; // cores * 2 -- what the database can really run at once

/** Opens saturated: offered load is exactly twice what the pool can sustain. */
export function ConnectionPoolingLab() {
  const [pool, setPool] = useState(20);
  const [arrival, setArrival] = useState(3200);
  const [queryMs, setQueryMs] = useState(10);

  const { effectiveMs, capacity, rho, wait } = useMemo(() => {
    // Past the database's real parallelism, extra connections buy contention
    // rather than throughput: hold time grows in proportion.
    const contention = Math.max(1, pool / DB_PARALLELISM);
    const effectiveMs = queryMs * contention;
    const capacity = pool / (effectiveMs / 1000);
    const rho = arrival / capacity;
    // Standard queueing shape. Past rho = 1 the queue has no steady state.
    const wait = rho >= 1 ? Infinity : (effectiveMs * rho) / (1 - rho);
    return { effectiveMs, capacity, rho, wait };
  }, [pool, arrival, queryMs]);

  const total = wait === Infinity ? Infinity : wait + effectiveMs;
  const queueShare = total === Infinity ? 1 : wait / total;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label="pool size" value={pool} min={1} max={200} onChange={setPool} />
        <Slider
          label="offered load"
          value={arrival}
          min={200}
          max={8000}
          step={200}
          suffix=" req/s"
          onChange={setArrival}
        />
        <Slider
          label="query time"
          value={queryMs}
          min={1}
          max={40}
          suffix=" ms"
          onChange={setQueryMs}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-28 font-code text-xs text-muted-foreground">in the database</span>
          <span className="flex-1">
            <Bar fraction={total === Infinity ? 0.04 : effectiveMs / total} muted />
          </span>
          <span className="w-24 text-right font-code text-xs tabular-nums text-muted-foreground">
            {effectiveMs.toFixed(1)} ms
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-28 font-code text-xs text-muted-foreground">waiting for a conn</span>
          <span className="flex-1">
            <Bar fraction={queueShare} />
          </span>
          <span className="w-24 text-right font-code text-xs tabular-nums text-muted-foreground">
            {wait === Infinity ? "unbounded" : `${wait.toFixed(1)} ms`}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="sustainable throughput"
          value={`${Math.round(capacity)}/s`}
          hint={pool > DB_PARALLELISM ? "flat past 16 connections" : "pool / hold time"}
        />
        <Stat
          label="utilisation"
          value={`${Math.round(rho * 100)}%`}
          hint={rho >= 1 ? `backlog grows ${Math.round(arrival - capacity)}/s` : "steady state"}
        />
        <Stat
          label="queue share of latency"
          value={`${Math.round(queueShare * 100)}%`}
          hint="the metric nobody graphs"
        />
      </div>

      <Note>
        Twenty connections holding a 10 ms query sustain about 1,600 req/s, and 3,200 req/s are
        arriving: the pool is pinned at 100% busy, the checkout queue grows by 1,600 requests every
        second, and effectively all of the latency a user feels is queue time rather than query
        time. Now drag the pool wider. Sustainable throughput stops improving past sixteen
        connections, because each extra one lengthens every hold — which is why the fix is a faster
        query, not a bigger pool.
      </Note>
    </div>
  );
}

/* ─── 8. queues vs streams ─────────────────────────────────────────────────── */

const MSGS = [
  { id: 1, key: "u1" },
  { id: 2, key: "u2" },
  { id: 3, key: "u1" },
  { id: 4, key: "u3" },
  { id: 5, key: "u2" },
  { id: 6, key: "u4" },
  { id: 7, key: "u1" },
  { id: 8, key: "u3" },
];

function keyHash(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100000;
  return h;
}

/** Opens with six consumers on four partitions: two of them hold nothing. */
export function QueuesVsStreamsLab() {
  const [partitions, setPartitions] = useState(4);
  const [consumers, setConsumers] = useState(6);

  const { queueWork, logRows, idle } = useMemo(() => {
    // Queue: competing consumers, so every worker gets messages. Order is gone.
    const queueWork: number[][] = Array.from({ length: consumers }, () => []);
    MSGS.forEach((m, i) => queueWork[i % consumers].push(m.id));

    // Log: the partition, not the message, is the unit of assignment — handed
    // out in contiguous ranges, at most one consumer per partition.
    const logRows: { parts: number[]; ids: number[] }[] = [];
    const base = Math.floor(partitions / consumers);
    const extra = partitions % consumers;
    let cursor = 0;
    for (let c = 0; c < consumers; c++) {
      const take = base + (c < extra ? 1 : 0);
      const parts: number[] = [];
      for (let n = 0; n < take; n++) parts.push(cursor++);
      logRows.push({
        parts,
        ids: MSGS.filter((m) => parts.includes(keyHash(m.key) % partitions)).map((m) => m.id),
      });
    }

    return { queueWork, logRows, idle: logRows.filter((r) => r.parts.length === 0).length };
  }, [partitions, consumers]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="partitions" value={partitions} min={1} max={8} onChange={setPartitions} />
        <Slider label="consumers" value={consumers} min={1} max={8} onChange={setConsumers} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-code text-xs uppercase tracking-wider text-muted-foreground">
            queue — delete on ack
          </p>
          <ul className="space-y-1">
            {queueWork.map((ids, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded border border-border bg-card/60 p-1.5 font-code text-xs"
              >
                <span className="w-16 text-muted-foreground">worker {i + 1}</span>
                <span className="flex-1 truncate">{ids.map((id) => `#${id}`).join(" ")}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 font-code text-xs text-muted-foreground">
            all {consumers} busy · no ordering
          </p>
        </div>

        <div>
          <p className="mb-2 font-code text-xs uppercase tracking-wider text-muted-foreground">
            log — one consumer per partition
          </p>
          <ul className="space-y-1">
            {logRows.map((row, i) => (
              <li
                key={i}
                className={`flex items-center gap-2 rounded border p-1.5 font-code text-xs ${
                  row.parts.length === 0
                    ? "border-dashed border-border text-muted-foreground"
                    : "border-border bg-card/60"
                }`}
              >
                <span className="w-16 text-muted-foreground">worker {i + 1}</span>
                <span className="flex-1 truncate">
                  {row.parts.length === 0
                    ? "idle — no partition assigned"
                    : `p${row.parts.join(",p")} · ${row.ids.map((id) => `#${id}`).join(" ")}`}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 font-code text-xs text-muted-foreground">
            {consumers - idle} of {consumers} busy · ordered per key
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="idle consumers"
          value={String(idle)}
          hint={idle ? "processes that will never get a message" : "all assigned"}
        />
        <Stat
          label="useful parallelism"
          value={`${Math.min(partitions, consumers)} of ${consumers}`}
          hint="log: capped by partitions"
        />
        <Stat label="replay" value="log only" hint="a queue deletes on ack" />
      </div>

      <Note>
        Six consumers, four partitions. On the queue side all six workers are busy, because
        delete-on-ack lets any number of consumers compete for the next message — and message order
        is gone as a result. On the log side workers 5 and 6 hold no partition at all and will never
        receive anything, which is what scaling a lagging stream by adding processes actually buys
        you. The compensation is in the right column: messages for a given key stay in sequence, and
        the log can be replayed.
      </Note>
    </div>
  );
}

/* ─── 9. idempotency ───────────────────────────────────────────────────────── */

type KeyMode = "none" | "regenerated" | "reused";
const CHARGE_CENTS = 4999;

/** Opens with no idempotency key: one purchase, two charges in the ledger. */
export function IdempotencyLab() {
  const [mode, setMode] = useState<KeyMode>("none");
  const [retries, setRetries] = useState(1);

  const attempts = useMemo(() => {
    const store = new Map<string, number>();
    let nextCharge = 1;

    return Array.from({ length: retries + 1 }, (_, i) => {
      // The first attempt's response is always lost to a timeout; the client
      // cannot tell that from a failure, so it retries.
      const lost = i < retries;
      const key = mode === "none" ? null : mode === "reused" ? "idem_7f3a" : `idem_7f3a_${i}`;

      if (key !== null && store.has(key)) {
        return { i, key, lost: false, chargeId: store.get(key) as number, replayed: true };
      }
      const chargeId = nextCharge++;
      if (key !== null) store.set(key, chargeId);
      return { i, key, lost, chargeId, replayed: false };
    });
  }, [mode, retries]);

  const charges = attempts.filter((a) => !a.replayed);
  const money = (charges.length * CHARGE_CENTS) / 100;

  return (
    <div className="space-y-4">
      <Choice<KeyMode>
        label="idempotency key"
        value={mode}
        onChange={setMode}
        options={[
          { value: "none", label: "none sent" },
          { value: "regenerated", label: "new key per attempt" },
          { value: "reused", label: "one key, reused" },
        ]}
      />

      <Slider label="client retries" value={retries} min={0} max={4} onChange={setRetries} />

      <ol className="space-y-1.5">
        {attempts.map((a) => (
          <li
            key={a.i}
            className="flex items-center gap-3 rounded-md border border-border bg-card/60 p-2 text-sm"
          >
            <span className="w-20 font-code text-xs text-muted-foreground">
              {a.i === 0 ? "POST" : "retry " + a.i}
            </span>
            <span className="flex-1 truncate font-code text-xs">{a.key ?? "no key header"}</span>
            <span className="w-40 text-right font-code text-xs">
              {a.replayed ? (
                <span className="text-muted-foreground">replayed ch_{a.chargeId}</span>
              ) : (
                <span className="text-foreground">
                  charged ch_{a.chargeId}
                  {a.lost ? " · response lost" : ""}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="charges in the ledger"
          value={String(charges.length)}
          hint="for one purchase"
        />
        <Stat
          label="money moved"
          value={`$${money.toFixed(2)}`}
          hint={`$${(CHARGE_CENTS / 100).toFixed(2)} intended`}
        />
        <Stat
          label="errors reported"
          value="0"
          hint={charges.length > 1 ? "both sides behaved correctly" : "correct and quiet"}
        />
      </div>

      <Note>
        The first POST succeeds and its response is lost to a timeout, so the client retries — which
        is the right thing for a client to do. With no key header the server has no way to recognise
        the second request, and the ledger ends with two charges for one purchase and not a single
        error on either side. The middle option is the subtler bug: a key generated inside the retry
        loop is a new key each time, so it protects nothing. Only reusing one key across all
        attempts makes the retry a replay.
      </Note>
    </div>
  );
}

/* ─── 10. retries & timeouts ───────────────────────────────────────────────── */

const CLIENTS = 1000;
const BUCKETS = 40;
const BUCKET_MS = 50;

/** Opens with fixed backoff and no jitter: four synchronised spikes. */
export function RetriesAndTimeoutsLab() {
  const [retries, setRetries] = useState(3);
  const [backoff, setBackoff] = useState(200);
  const [jitter, setJitter] = useState(false);

  const { hist, peak, retryPeak } = useMemo(() => {
    const hist = new Array(BUCKETS).fill(0);

    for (let c = 0; c < CLIENTS; c++) {
      let t = 0;
      hist[0] += 1; // every client's first attempt lands at t = 0
      for (let k = 1; k <= retries; k++) {
        // Full jitter samples uniformly in [0, delay]. A fixed per-client
        // fraction stands in for the sample so the render is deterministic.
        const fraction = ((c * 7 + k * 13) % 1000) / 1000;
        t += jitter ? fraction * backoff : backoff;
        const b = Math.floor(t / BUCKET_MS);
        if (b < BUCKETS) hist[b] += 1;
      }
    }

    // The first wave is a given — they all failed at once. What jitter changes
    // is the shape of everything after it.
    return {
      hist,
      peak: Math.max(...hist),
      retryPeak: Math.max(0, ...hist.slice(1)),
    };
  }, [retries, backoff, jitter]);

  const totalLoad = 1 + retries;
  const smooth = (CLIENTS * retries) / BUCKETS;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="retries per client" value={retries} min={0} max={5} onChange={setRetries} />
        <Slider
          label="backoff delay"
          value={backoff}
          min={50}
          max={400}
          step={50}
          suffix=" ms"
          onChange={setBackoff}
        />
      </div>

      <Toggle
        label="full jitter — sleep a random time in [0, delay]"
        checked={jitter}
        onChange={setJitter}
      />

      <div
        className="flex h-24 items-end gap-0.5 rounded-lg border border-border bg-card/60 p-2"
        role="img"
        aria-label="Requests arriving at the dependency over two seconds"
      >
        {hist.map((n, i) => (
          <span
            key={i}
            className="flex-1 rounded-sm bg-foreground"
            style={{ height: `${Math.max(n === 0 ? 0 : 2, (n / peak) * 100)}%` }}
          />
        ))}
      </div>
      <p className="flex justify-between font-code text-xs text-muted-foreground">
        <span>0 ms</span>
        <span>arrivals per 50 ms window</span>
        <span>{BUCKETS * BUCKET_MS} ms</span>
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="peak retry burst"
          value={`${retryPeak} / 50 ms`}
          hint={jitter ? "spread across windows" : "a synchronised spike per round"}
        />
        <Stat
          label="load multiplier"
          value={`${totalLoad.toFixed(1)}×`}
          hint={`${CLIENTS * totalLoad} requests for ${CLIENTS} calls`}
        />
        <Stat
          label="burst vs spread out"
          value={smooth === 0 ? "—" : `${(retryPeak / smooth).toFixed(1)}×`}
          hint="the same work, worse shaped"
        />
      </div>

      <Note>
        A thousand clients fail at the same instant and every one waits exactly 200 ms, so the
        dependency receives four spikes of a thousand requests rather than four thousand requests
        spread over a second. That is the default in most HTTP clients: correct backoff, no jitter,
        and a thundering herd on every round. Tick full jitter and the same 4× of total work arrives
        as a curve the service can absorb — the load did not change, only its shape.
      </Note>
    </div>
  );
}
