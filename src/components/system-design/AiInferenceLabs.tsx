import { useMemo, useState } from "react";
import { useSimulationStore } from "@/lib/useSimulationStore";

/* ─── shared bits ──────────────────────────────────────────────────────────── */

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between font-code text-xs uppercase tracking-wider text-muted-foreground">
        {label}
        <span className="tabular-nums text-foreground">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-foreground"
      />
    </label>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <p className="font-code text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-code text-xl tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Bar({ fraction, muted }: { fraction: number; muted?: boolean }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={`h-full rounded-full ${muted ? "bg-muted-foreground/50" : "bg-foreground"}`}
        style={{ width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }}
      />
    </div>
  );
}

/* ─── KV cache ─────────────────────────────────────────────────────────────── */

interface Sequence {
  id: number;
  tokens: number;
  lastTouched: number;
}

/**
 * Sequences competing for a fixed GPU memory budget, evicted least-recently-used
 * first. The identical policy as the LRU cache lab, with tokens as the unit and
 * VRAM as the ceiling.
 */
export function KVCacheLab() {
  const { simulationsEnabled } = useSimulationStore();
  const [budget, setBudget] = useState(20);
  const [clock, setClock] = useState(6);
  const [sequences, setSequences] = useState<Sequence[]>([
    { id: 1, tokens: 8, lastTouched: 1 },
    { id: 2, tokens: 6, lastTouched: 2 },
    { id: 3, tokens: 10, lastTouched: 3 },
  ]);
  const [nextId, setNextId] = useState(4);

  // Newest-touched survive; the oldest are dropped until the budget fits.
  const { resident, evicted } = useMemo(() => {
    const byRecency = [...sequences].sort((a, b) => b.lastTouched - a.lastTouched);
    const kept: Sequence[] = [];
    const dropped: Sequence[] = [];
    let used = 0;
    for (const seq of byRecency) {
      if (used + seq.tokens <= budget) {
        kept.push(seq);
        used += seq.tokens;
      } else {
        dropped.push(seq);
      }
    }
    return { resident: kept.sort((a, b) => a.id - b.id), evicted: dropped };
  }, [sequences, budget]);

  const used = resident.reduce((n, s) => n + s.tokens, 0);

  function touch(id: number) {
    setClock((c) => c + 1);
    setSequences((prev) => prev.map((s) => (s.id === id ? { ...s, lastTouched: clock + 1 } : s)));
  }

  function addSequence() {
    if (!simulationsEnabled) return;
    setClock((c) => c + 1);
    setSequences((prev) => [
      ...prev,
      { id: nextId, tokens: 4 + ((nextId * 3) % 9), lastTouched: clock + 1 },
    ]);
    setNextId((n) => n + 1);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="VRAM budget"
          value={budget}
          min={6}
          max={48}
          suffix=" tok"
          onChange={setBudget}
        />
        <div className="flex items-end gap-2">
          <button
            onClick={addSequence}
            className="rounded-md border border-border px-3 py-1.5 font-code text-xs hover:border-foreground/30"
          >
            + new request
          </button>
          <button
            onClick={() => {
              setSequences([{ id: 1, tokens: 8, lastTouched: 1 }]);
              setNextId(2);
              setClock(2);
            }}
            className="rounded-md border border-border px-3 py-1.5 font-code text-xs text-muted-foreground hover:text-foreground"
          >
            reset
          </button>
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between font-code text-xs text-muted-foreground">
          <span>KV cache occupancy</span>
          <span className="tabular-nums">
            {used} / {budget} tokens
          </span>
        </div>
        <Bar fraction={used / budget} />
      </div>

      <ul className="space-y-2">
        {sequences
          .slice()
          .sort((a, b) => a.id - b.id)
          .map((seq) => {
            const isEvicted = evicted.some((e) => e.id === seq.id);
            return (
              <li
                key={seq.id}
                className={`flex items-center gap-3 rounded-md border p-2.5 ${
                  isEvicted ? "border-dashed border-border opacity-50" : "border-border bg-card/60"
                }`}
              >
                <span className="font-code text-xs text-muted-foreground">seq {seq.id}</span>
                <span className="flex flex-1 flex-wrap gap-0.5">
                  {Array.from({ length: seq.tokens }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-3 w-2 rounded-[1px] ${isEvicted ? "bg-muted-foreground/30" : "bg-foreground"}`}
                    />
                  ))}
                </span>
                <span className="font-code text-xs tabular-nums text-muted-foreground">
                  {seq.tokens} tok
                </span>
                <button
                  onClick={() => touch(seq.id)}
                  className="rounded border border-border px-2 py-0.5 font-code text-xs hover:border-foreground/30"
                >
                  {isEvicted ? "recompute" : "use"}
                </button>
              </li>
            );
          })}
      </ul>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Evicted sequences are not lost — they are <em>recomputed</em> from scratch on their next
        token, which is why eviction shows up as a latency spike rather than an error.
      </p>
    </div>
  );
}

/* ─── continuous batching ──────────────────────────────────────────────────── */

/**
 * Static batching versus continuous batching over the same arrivals. The whole
 * difference is whether a finished slot waits for the batch or is refilled
 * immediately.
 */
export function ContinuousBatchingLab() {
  const [slots, setSlots] = useState(4);
  const [continuous, setContinuous] = useState(true);
  const TICKS = 14;

  // Deterministic workload: request i runs for a fixed number of ticks.
  const lengths = useMemo(() => Array.from({ length: 30 }, (_, i) => 2 + ((i * 5) % 6)), []);

  const timeline = useMemo(() => {
    const rows: (number | null)[][] = [];
    let queue = 0;
    const busy: { id: number; left: number }[] = Array.from({ length: slots }, () => ({
      id: -1,
      left: 0,
    }));

    for (let t = 0; t < TICKS; t++) {
      const anyBusy = busy.some((b) => b.left > 0);
      for (let s = 0; s < slots; s++) {
        if (busy[s].left > 0) {
          busy[s].left--;
          continue;
        }
        // Static batching refuses to refill until the whole batch drains.
        if (!continuous && anyBusy) continue;
        busy[s] = { id: queue, left: lengths[queue % lengths.length] };
        queue++;
      }
      rows.push(busy.map((b) => (b.left > 0 ? b.id : null)));
    }
    return rows;
  }, [slots, continuous, lengths]);

  const filled = timeline.flat().filter((x) => x !== null).length;
  const utilisation = filled / (TICKS * slots);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Batch slots" value={slots} min={2} max={6} onChange={setSlots} />
        <label className="flex items-end gap-2 font-code text-xs">
          <input
            type="checkbox"
            checked={continuous}
            onChange={(e) => setContinuous(e.target.checked)}
            className="size-4 accent-foreground"
          />
          continuous batching
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="GPU utilisation" value={`${Math.round(utilisation * 100)}%`} />
        <Stat
          label="Mode"
          value={continuous ? "continuous" : "static"}
          hint={continuous ? "slot refills the moment it frees" : "slot waits for the whole batch"}
        />
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {Array.from({ length: slots }).map((_, s) => (
            <div key={s} className="mb-1 flex items-center gap-1">
              <span className="w-12 shrink-0 font-code text-xs text-muted-foreground">
                slot {s}
              </span>
              {timeline.map((row, t) => (
                <span
                  key={t}
                  title={row[s] === null ? "idle" : `request ${row[s]}`}
                  className={`h-5 w-5 shrink-0 rounded-[2px] ${
                    row[s] === null
                      ? "bg-secondary"
                      : row[s]! % 2 === 0
                        ? "bg-foreground"
                        : "bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
          ))}
          <div className="mt-1 flex items-center gap-1">
            <span className="w-12 shrink-0" />
            <span className="font-code text-xs text-muted-foreground">time →</span>
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Grey gaps are a GPU that is powered on and doing nothing. Static batching creates them every
        time one long request holds the batch open.
      </p>
    </div>
  );
}

/* ─── speculative decoding ─────────────────────────────────────────────────── */

/**
 * A cheap draft model proposes k tokens, the expensive model verifies them in
 * one pass, and everything up to the first disagreement is kept.
 */
export function SpeculativeDecodingLab() {
  const [k, setK] = useState(4);
  const [agreement, setAgreement] = useState(70);
  const ROUNDS = 8;

  const rounds = useMemo(() => {
    // Deterministic pseudo-random so the demo is stable across renders.
    let seed = 12345;
    const next = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    return Array.from({ length: ROUNDS }, () => {
      const draft = Array.from({ length: k }, () => next() * 100 < agreement);
      const firstReject = draft.indexOf(false);
      const accepted = firstReject === -1 ? k : firstReject;
      // Every round yields the accepted prefix plus one token the big model
      // produces itself, so progress is never zero.
      return { draft, accepted, produced: accepted + 1 };
    });
  }, [k, agreement]);

  const produced = rounds.reduce((n, r) => n + r.produced, 0);
  const baseline = ROUNDS; // one token per big-model pass without speculation
  const speedup = produced / baseline;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Draft length k" value={k} min={1} max={8} onChange={setK} />
        <Slider
          label="Draft agreement"
          value={agreement}
          min={10}
          max={95}
          suffix="%"
          onChange={setAgreement}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Tokens out" value={String(produced)} hint={`${ROUNDS} verify passes`} />
        <Stat label="Speedup" value={`${speedup.toFixed(2)}×`} hint="vs one token per pass" />
        <Stat
          label="Wasted drafts"
          value={String(rounds.reduce((n, r) => n + (k - r.accepted), 0))}
          hint="computed then thrown away"
        />
      </div>

      <ul className="space-y-1.5">
        {rounds.map((round, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-16 shrink-0 font-code text-xs text-muted-foreground">
              pass {i + 1}
            </span>
            {round.draft.map((ok, j) => (
              <span
                key={j}
                title={j < round.accepted ? "accepted" : "rejected"}
                className={`h-5 w-5 rounded-[2px] ${
                  j < round.accepted ? "bg-foreground" : "bg-secondary line-through"
                }`}
              />
            ))}
            <span className="h-5 w-5 rounded-[2px] border-2 border-dashed border-foreground/50" />
            <span className="font-code text-xs text-muted-foreground">+{round.produced}</span>
          </li>
        ))}
      </ul>

      <p className="text-xs leading-relaxed text-muted-foreground">
        The dashed square is the token the large model always produces itself, which is why a fully
        rejected draft still makes progress. Push k too high and you pay for drafts nobody keeps.
      </p>
    </div>
  );
}

/* ─── inference cost ───────────────────────────────────────────────────────── */

/**
 * Where the money and the latency actually go: output tokens dominate both, and
 * concurrency trades one against the other.
 */
export function InferenceCostLab() {
  const [inputTokens, setInputTokens] = useState(2000);
  const [outputTokens, setOutputTokens] = useState(400);
  const [concurrency, setConcurrency] = useState(4);
  const [rps, setRps] = useState(20);

  const IN_PER_M = 3; // dollars per million input tokens
  const OUT_PER_M = 15; // output costs more because it is generated serially
  const MS_PER_OUT_TOKEN = 12;

  const costPerCall = (inputTokens / 1e6) * IN_PER_M + (outputTokens / 1e6) * OUT_PER_M;
  const inputShare = ((inputTokens / 1e6) * IN_PER_M) / costPerCall;
  const latencyMs = outputTokens * MS_PER_OUT_TOKEN;
  const capacity = (concurrency / (latencyMs / 1000)) | 0;
  const overloaded = rps > capacity;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="Input tokens"
          value={inputTokens}
          min={100}
          max={20000}
          step={100}
          onChange={setInputTokens}
        />
        <Slider
          label="Output tokens"
          value={outputTokens}
          min={50}
          max={2000}
          step={50}
          onChange={setOutputTokens}
        />
        <Slider
          label="Concurrency"
          value={concurrency}
          min={1}
          max={64}
          onChange={setConcurrency}
        />
        <Slider
          label="Offered load"
          value={rps}
          min={1}
          max={200}
          suffix=" rps"
          onChange={setRps}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Cost / call" value={`$${costPerCall.toFixed(5)}`} />
        <Stat label="Latency" value={`${(latencyMs / 1000).toFixed(1)}s`} hint="output is serial" />
        <Stat
          label="Capacity"
          value={`${capacity} rps`}
          hint={overloaded ? "offered load exceeds this" : "headroom available"}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-code text-xs text-muted-foreground">
          <span>input tokens</span>
          <span className="tabular-nums">{Math.round(inputShare * 100)}% of cost</span>
        </div>
        <Bar fraction={inputShare} muted />
        <div className="flex justify-between font-code text-xs text-muted-foreground">
          <span>output tokens</span>
          <span className="tabular-nums">{Math.round((1 - inputShare) * 100)}% of cost</span>
        </div>
        <Bar fraction={1 - inputShare} />
      </div>

      {overloaded && (
        <p className="rounded-md border border-destructive/40 p-3 font-code text-xs">
          Offered load exceeds capacity. Requests queue, latency climbs without bound, and a rate
          limiter is the only thing standing between this and a timeout cascade.
        </p>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        Output tokens are generated one at a time, so they set the latency and cost several times
        more per token. Trimming a prompt feels productive; capping the response usually is.
      </p>
    </div>
  );
}

/* ─── quantization ─────────────────────────────────────────────────────────── */

const WEIGHTS = [0.82, -0.41, 0.13, 0.97, -0.68, 0.35, -0.05, 0.51, -0.93, 0.24, 0.77, -0.19];

/**
 * Packing weights into fewer bits: memory falls geometrically, error rises, and
 * the interesting part is how slowly it rises at first.
 */
export function QuantizationLab() {
  const [bits, setBits] = useState(8);

  const { quantised, maxError, scale } = useMemo(() => {
    const max = Math.max(...WEIGHTS.map(Math.abs));
    const levels = 2 ** (bits - 1) - 1;
    const step = max / levels;
    const q = WEIGHTS.map((w) => Math.round(w / step) * step);
    const err = Math.max(...WEIGHTS.map((w, i) => Math.abs(w - q[i])));
    return { quantised: q, maxError: err, scale: step };
  }, [bits]);

  const bytesFp32 = WEIGHTS.length * 4;
  const bytesNow = (WEIGHTS.length * bits) / 8;

  return (
    <div className="space-y-4">
      <Slider label="Bits per weight" value={bits} min={2} max={32} onChange={setBits} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Memory"
          value={`${bytesNow.toFixed(0)} B`}
          hint={`${(bytesFp32 / bytesNow).toFixed(1)}× smaller than fp32`}
        />
        <Stat label="Max error" value={maxError.toFixed(4)} hint="worst single weight" />
        <Stat label="Step size" value={scale.toFixed(4)} hint="gap between levels" />
      </div>

      <div className="space-y-1.5">
        {WEIGHTS.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-10 shrink-0 font-code text-xs tabular-nums text-muted-foreground">
              w{i}
            </span>
            <div className="relative h-4 flex-1 rounded bg-secondary">
              <div
                className="absolute top-0 h-full bg-muted-foreground/50"
                style={{
                  left: "50%",
                  width: `${Math.abs(w) * 50}%`,
                  transform: w < 0 ? "translateX(-100%)" : undefined,
                }}
              />
              <div
                className="absolute top-1 h-2 bg-foreground"
                style={{
                  left: "50%",
                  width: `${Math.abs(quantised[i]) * 50}%`,
                  transform: quantised[i] < 0 ? "translateX(-100%)" : undefined,
                }}
              />
            </div>
            <span className="w-28 shrink-0 text-right font-code text-xs tabular-nums text-muted-foreground">
              {w.toFixed(2)} → {quantised[i].toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        The pale bar is the original weight, the solid one is what survives quantisation. Down to
        about 8 bits the two are hard to tell apart; below 4 the model starts forgetting things.
      </p>
    </div>
  );
}
