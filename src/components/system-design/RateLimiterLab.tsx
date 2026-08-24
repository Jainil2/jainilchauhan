import { useEffect, useRef, useState } from "react";

type Strategy = "token" | "leaky" | "fixed" | "sliding";

interface State {
  // Token bucket
  tokens: number;
  // Leaky bucket queue (request timestamps still draining)
  leakyQueue: number[];
  // Fixed window
  fixedWindowStart: number;
  fixedCount: number;
  // Sliding window log
  slidingLog: number[];
  // Counters
  allowed: Record<Strategy, number>;
  denied: Record<Strategy, number>;
}

const CAPACITY = 5; // 5 req capacity / window
const WINDOW_MS = 2000;
const REFILL_PER_SEC = 2.5;
const LEAK_PER_SEC = 2.5;

const STRATEGY_META: Record<Strategy, { label: string; color: string; blurb: string }> = {
  token: { label: "Token Bucket", color: "oklch(0.85 0.21 150)", blurb: "Burst-friendly. Bucket holds tokens; refills steadily." },
  leaky: { label: "Leaky Bucket", color: "oklch(0.78 0.16 200)", blurb: "Smooth output. FIFO queue drains at fixed rate." },
  fixed: { label: "Fixed Window", color: "oklch(0.80 0.18 60)", blurb: "Simple counter, resets every N seconds. Edge bursts possible." },
  sliding: { label: "Sliding Log", color: "oklch(0.75 0.18 310)", blurb: "Rolling N-second window. Most accurate, costs memory." },
};

export function RateLimiterLab() {
  const [state, setState] = useState<State>({
    tokens: CAPACITY,
    leakyQueue: [],
    fixedWindowStart: Date.now(),
    fixedCount: 0,
    slidingLog: [],
    allowed: { token: 0, leaky: 0, fixed: 0, sliding: 0 },
    denied: { token: 0, leaky: 0, fixed: 0, sliding: 0 },
  });
  const [lastResult, setLastResult] = useState<Record<Strategy, "allow" | "deny" | null>>({
    token: null, leaky: null, fixed: null, sliding: null,
  });
  const lastTickRef = useRef(Date.now());

  // Background refill / leak loop
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      setState((s) => ({
        ...s,
        tokens: Math.min(CAPACITY, s.tokens + dt * REFILL_PER_SEC),
        leakyQueue: s.leakyQueue.filter((t) => now - t < (CAPACITY / LEAK_PER_SEC) * 1000),
        slidingLog: s.slidingLog.filter((t) => now - t < WINDOW_MS),
      }));
    }, 100);
    return () => clearInterval(id);
  }, []);

  function fire(count = 1) {
    const now = Date.now();
    setState((prev) => {
      const next = { ...prev, allowed: { ...prev.allowed }, denied: { ...prev.denied } };
      const result: Record<Strategy, "allow" | "deny"> = { token: "deny", leaky: "deny", fixed: "deny", sliding: "deny" };
      for (let i = 0; i < count; i++) {
        // Token bucket
        if (next.tokens >= 1) { next.tokens -= 1; next.allowed.token++; result.token = "allow"; }
        else { next.denied.token++; }
        // Leaky bucket — accept if queue has slot
        if (next.leakyQueue.length < CAPACITY) { next.leakyQueue = [...next.leakyQueue, now]; next.allowed.leaky++; result.leaky = "allow"; }
        else { next.denied.leaky++; }
        // Fixed window
        if (now - next.fixedWindowStart >= WINDOW_MS) { next.fixedWindowStart = now; next.fixedCount = 0; }
        if (next.fixedCount < CAPACITY) { next.fixedCount++; next.allowed.fixed++; result.fixed = "allow"; }
        else { next.denied.fixed++; }
        // Sliding log
        next.slidingLog = next.slidingLog.filter((t) => now - t < WINDOW_MS);
        if (next.slidingLog.length < CAPACITY) { next.slidingLog = [...next.slidingLog, now]; next.allowed.sliding++; result.sliding = "allow"; }
        else { next.denied.sliding++; }
      }
      setLastResult(result);
      return next;
    });
  }

  function reset() {
    setState({
      tokens: CAPACITY,
      leakyQueue: [],
      fixedWindowStart: Date.now(),
      fixedCount: 0,
      slidingLog: [],
      allowed: { token: 0, leaky: 0, fixed: 0, sliding: 0 },
      denied: { token: 0, leaky: 0, fixed: 0, sliding: 0 },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-muted-foreground">capacity {CAPACITY}/{WINDOW_MS / 1000}s</span>
        <button onClick={() => fire(1)} className="rounded border border-border px-2 py-1 hover:border-terminal/50 hover:text-terminal">+1 req</button>
        <button onClick={() => fire(10)} className="rounded border border-amber-500/40 px-2 py-1 text-amber-300 hover:border-amber-400">burst 10</button>
        <button onClick={() => fire(20)} className="rounded border border-destructive/40 px-2 py-1 text-destructive hover:border-destructive">burst 20</button>
        <button onClick={reset} className="ml-auto rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">reset</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(STRATEGY_META) as Strategy[]).map((s) => {
          const meta = STRATEGY_META[s];
          const total = state.allowed[s] + state.denied[s];
          const allowRate = total ? (state.allowed[s] / total) * 100 : 0;
          let levelLabel = "";
          let levelPct = 0;
          if (s === "token") { levelLabel = `${state.tokens.toFixed(1)} / ${CAPACITY} tokens`; levelPct = (state.tokens / CAPACITY) * 100; }
          else if (s === "leaky") { levelLabel = `${state.leakyQueue.length} / ${CAPACITY} in queue`; levelPct = (state.leakyQueue.length / CAPACITY) * 100; }
          else if (s === "fixed") { levelLabel = `${state.fixedCount} / ${CAPACITY} this window`; levelPct = (state.fixedCount / CAPACITY) * 100; }
          else { levelLabel = `${state.slidingLog.length} / ${CAPACITY} in last ${WINDOW_MS / 1000}s`; levelPct = (state.slidingLog.length / CAPACITY) * 100; }

          return (
            <div key={s} className="rounded-lg border border-border bg-background/40 p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                {lastResult[s] && (
                  <span className={`rounded border px-1.5 py-0.5 font-mono text-xs ${lastResult[s] === "allow" ? "border-terminal/50 text-terminal" : "border-destructive/50 text-destructive"}`}>
                    {lastResult[s] === "allow" ? "200 OK" : "429"}
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{meta.blurb}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded bg-card">
                <div className="h-full transition-all duration-200" style={{ width: `${levelPct}%`, background: meta.color }} />
              </div>
              <div className="mt-1 flex justify-between font-mono text-xs text-muted-foreground">
                <span>{levelLabel}</span>
                <span><span className="text-terminal">{state.allowed[s]}</span> / <span className="text-destructive">{state.denied[s]}</span> ({allowRate.toFixed(0)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
