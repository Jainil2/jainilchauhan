import { useMemo, useState } from "react";

const nodeClass = "rounded border border-border bg-background/50 px-3 py-2 font-mono text-xs";
const controlClass =
  "rounded border border-border px-2 py-1 font-mono text-xs text-muted-foreground hover:border-terminal/50 hover:text-terminal";
const activeClass = "border-terminal text-terminal bg-terminal/10";

function hash(input: string, mod: number) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h % mod;
}

export function LoadBalancerLab() {
  const [strategy, setStrategy] = useState<"round-robin" | "least-connections" | "weighted">(
    "round-robin",
  );
  const [cursor, setCursor] = useState(0);
  const [servers, setServers] = useState([
    { id: "api-a", weight: 3, active: 0, handled: 0 },
    { id: "api-b", weight: 2, active: 0, handled: 0 },
    { id: "api-c", weight: 1, active: 0, handled: 0 },
  ]);
  const [log, setLog] = useState<string[]>([]);

  function route() {
    setServers((current) => {
      let index = 0;
      if (strategy === "round-robin") index = cursor % current.length;
      if (strategy === "least-connections") {
        index = current.reduce((best, s, i) => (s.active < current[best].active ? i : best), 0);
      }
      if (strategy === "weighted") {
        const expanded = current.flatMap((s, i) => Array.from({ length: s.weight }, () => i));
        index = expanded[cursor % expanded.length];
      }
      const request = `req-${cursor + 1}`;
      setCursor((v) => v + 1);
      setLog((l) => [`${request} -> ${current[index].id}`, ...l].slice(0, 6));
      return current.map((s, i) =>
        i === index ? { ...s, active: s.active + 1, handled: s.handled + 1 } : s,
      );
    });
  }

  function complete(id: string) {
    setServers((s) =>
      s.map((server) =>
        server.id === id ? { ...server, active: Math.max(0, server.active - 1) } : server,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["round-robin", "least-connections", "weighted"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStrategy(s)}
            className={`${controlClass} ${strategy === s ? activeClass : ""}`}
          >
            {s}
          </button>
        ))}
        <button
          onClick={route}
          className="ml-auto rounded border border-terminal/40 px-3 py-1 font-mono text-xs text-terminal"
        >
          send request
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {servers.map((server) => (
          <div key={server.id} className={nodeClass}>
            <div className="flex items-center justify-between">
              <span className="text-foreground">{server.id}</span>
              <span className="text-cyan-accent">w:{server.weight}</span>
            </div>
            <div className="mt-3 h-2 rounded bg-card">
              <div
                className="h-full rounded bg-terminal"
                style={{ width: `${Math.min(100, server.active * 22)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-muted-foreground">
              <span>active {server.active}</span>
              <span>total {server.handled}</span>
            </div>
            <button
              onClick={() => complete(server.id)}
              className="mt-3 w-full rounded border border-border py-1 text-muted-foreground hover:text-terminal"
            >
              complete one
            </button>
          </div>
        ))}
      </div>
      <div className="rounded border border-border bg-background/40 p-3 font-mono text-xs text-muted-foreground">
        {log.length
          ? log.map((line) => <div key={line}>{line}</div>)
          : "Send requests to compare routing decisions."}
      </div>
    </div>
  );
}

export function CircuitBreakerLab() {
  const [failureRate, setFailureRate] = useState(40);
  const [state, setState] = useState<"closed" | "open" | "half-open">("closed");
  const [failures, setFailures] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  function callService() {
    if (state === "open") {
      setLog((l) => ["blocked fast: circuit is open", ...l].slice(0, 7));
      setState("half-open");
      return;
    }
    const ok = Math.random() * 100 >= failureRate;
    if (ok) {
      setFailures(0);
      setState("closed");
      setLog((l) => ["success: response returned, breaker closed", ...l].slice(0, 7));
      return;
    }
    const nextFailures = failures + 1;
    setFailures(nextFailures);
    setState(nextFailures >= 3 ? "open" : state);
    setLog((l) =>
      [`failure ${nextFailures}/3${nextFailures >= 3 ? " -> open circuit" : ""}`, ...l].slice(0, 7),
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
        <div className={nodeClass}>
          <label className="text-muted-foreground">dependency failure rate: {failureRate}%</label>
          <input
            className="mt-3 w-full accent-terminal"
            type="range"
            min="0"
            max="100"
            value={failureRate}
            onChange={(e) => setFailureRate(Number(e.target.value))}
          />
          <button
            onClick={callService}
            className="mt-4 w-full rounded border border-terminal/40 py-2 text-terminal"
          >
            call downstream
          </button>
        </div>
        <div className="rounded border border-border bg-background/40 p-4">
          <div className="flex items-center justify-between font-mono text-xs">
            {(["closed", "open", "half-open"] as const).map((s) => (
              <div
                key={s}
                className={`rounded border px-3 py-2 ${state === s ? "border-terminal text-terminal" : "border-border text-muted-foreground"}`}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="mt-4 h-1 rounded bg-card">
            <div
              className="h-full rounded bg-destructive"
              style={{ width: `${(failures / 3) * 100}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            failure threshold: {failures}/3
          </p>
        </div>
      </div>
      <div className="rounded border border-border bg-background/40 p-3 font-mono text-xs text-muted-foreground">
        {log.length
          ? log.map((line, i) => <div key={`${line}-${i}`}>{line}</div>)
          : "Call the service until the breaker trips."}
      </div>
    </div>
  );
}

export function CRDTLab() {
  const [a, setA] = useState({ local: 0, seenB: 0 });
  const [b, setB] = useState({ local: 0, seenA: 0 });
  const valueA = a.local + a.seenB;
  const valueB = b.local + b.seenA;

  function merge() {
    setA((left) => ({ ...left, seenB: Math.max(left.seenB, b.local) }));
    setB((right) => ({ ...right, seenA: Math.max(right.seenA, a.local) }));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className={nodeClass}>
          <div className="flex items-center justify-between">
            <span>replica A</span>
            <span className="text-terminal text-lg">{valueA}</span>
          </div>
          <button
            onClick={() => setA((x) => ({ ...x, local: x.local + 1 }))}
            className="mt-3 w-full rounded border border-border py-2 hover:text-terminal"
          >
            increment A
          </button>
          <p className="mt-2 text-muted-foreground">
            vector [A:{a.local}, B:{a.seenB}]
          </p>
        </div>
        <div className={nodeClass}>
          <div className="flex items-center justify-between">
            <span>replica B</span>
            <span className="text-terminal text-lg">{valueB}</span>
          </div>
          <button
            onClick={() => setB((x) => ({ ...x, local: x.local + 1 }))}
            className="mt-3 w-full rounded border border-border py-2 hover:text-terminal"
          >
            increment B
          </button>
          <p className="mt-2 text-muted-foreground">
            vector [A:{b.seenA}, B:{b.local}]
          </p>
        </div>
      </div>
      <button
        onClick={merge}
        className="w-full rounded border border-terminal/40 py-2 font-mono text-xs text-terminal"
      >
        gossip merge
      </button>
      <p className="rounded border border-border bg-background/40 p-3 font-mono text-xs text-muted-foreground">
        A G-Counter CRDT stores one grow-only counter per replica. Merge takes max per slot, so
        concurrent increments converge without coordination.
      </p>
    </div>
  );
}

export function ShardingReplicationLab() {
  const [key, setKey] = useState("user:42");
  const [replication, setReplication] = useState<"async" | "quorum">("quorum");
  const [writes, setWrites] = useState<string[]>([]);
  const shard = useMemo(() => hash(key, 4), [key]);
  const replicas = [`s${shard}-primary`, `s${shard}-r1`, `s${shard}-r2`];

  function write() {
    const ack =
      replication === "quorum"
        ? "2/3 replicas ack before success"
        : "primary ack now, replicas catch up later";
    setWrites((w) => [`${key} -> shard ${shard}: ${ack}`, ...w].slice(0, 5));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="min-w-48 flex-1 rounded border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-terminal"
        />
        {(["quorum", "async"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setReplication(mode)}
            className={`${controlClass} ${replication === mode ? activeClass : ""}`}
          >
            {mode}
          </button>
        ))}
        <button
          onClick={write}
          className="rounded border border-terminal/40 px-3 py-1 font-mono text-xs text-terminal"
        >
          write
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((s) => (
          <div
            key={s}
            className={`rounded border p-3 font-mono text-xs ${s === shard ? "border-terminal bg-terminal/10" : "border-border bg-background/40"}`}
          >
            <div className="text-foreground">shard {s}</div>
            <div className="mt-2 space-y-1 text-muted-foreground">
              {(s === shard ? replicas : [`s${s}-primary`, `s${s}-r1`, `s${s}-r2`]).map((r, i) => (
                <div key={r} className={i === 0 ? "text-cyan-accent" : ""}>
                  {r}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded border border-border bg-background/40 p-3 font-mono text-xs text-muted-foreground">
        {writes.length
          ? writes.map((line) => <div key={line}>{line}</div>)
          : "Choose a key and write to see routing plus replication semantics."}
      </div>
    </div>
  );
}

export function BackpressureLab() {
  const [producer, setProducer] = useState(7);
  const [consumer, setConsumer] = useState(4);
  const [policy, setPolicy] = useState<"buffer" | "drop" | "throttle">("buffer");
  const delta = producer - consumer;
  const queued =
    policy === "drop" ? Math.min(6, Math.max(0, delta)) : Math.min(12, Math.max(0, delta * 2));
  const dropped = policy === "drop" ? Math.max(0, delta - 6) : 0;
  const effectiveProducer = policy === "throttle" && delta > 0 ? consumer : producer;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className={nodeClass}>
          <label>producer rate: {producer}/s</label>
          <input
            className="mt-2 w-full accent-terminal"
            type="range"
            min="1"
            max="12"
            value={producer}
            onChange={(e) => setProducer(Number(e.target.value))}
          />
        </div>
        <div className={nodeClass}>
          <label>consumer rate: {consumer}/s</label>
          <input
            className="mt-2 w-full accent-cyan-accent"
            type="range"
            min="1"
            max="12"
            value={consumer}
            onChange={(e) => setConsumer(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["buffer", "drop", "throttle"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPolicy(p)}
            className={`${controlClass} ${policy === p ? activeClass : ""}`}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="rounded border border-border bg-background/40 p-4">
        <div className="mb-2 flex justify-between font-mono text-xs text-muted-foreground">
          <span>effective producer {effectiveProducer}/s</span>
          <span>
            queued {queued} dropped {dropped}
          </span>
        </div>
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={`h-8 rounded border ${i < queued ? "border-terminal bg-terminal/30" : "border-border bg-card/30"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TopologicalSortLab() {
  const [done, setDone] = useState<string[]>([]);
  const tasks = [
    { id: "schema", deps: [] },
    { id: "api", deps: ["schema"] },
    { id: "auth", deps: ["schema"] },
    { id: "ui", deps: ["api", "auth"] },
    { id: "deploy", deps: ["ui"] },
  ];
  const ready = tasks
    .filter((t) => !done.includes(t.id) && t.deps.every((d) => done.includes(d)))
    .map((t) => t.id);

  function run(id: string) {
    if (ready.includes(id)) setDone((d) => [...d, id]);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-5">
        {tasks.map((task) => {
          const isDone = done.includes(task.id);
          const isReady = ready.includes(task.id);
          return (
            <button
              key={task.id}
              onClick={() => run(task.id)}
              className={`rounded border p-3 text-left font-mono text-xs ${isDone ? "border-terminal bg-terminal/10 text-terminal" : isReady ? "border-cyan-accent text-cyan-accent" : "border-border text-muted-foreground"}`}
            >
              <div>{task.id}</div>
              <div className="mt-2 text-xs">deps: {task.deps.join(", ") || "none"}</div>
            </button>
          );
        })}
      </div>
      <div className="rounded border border-border bg-background/40 p-3 font-mono text-xs">
        <p className="text-muted-foreground">
          ready queue: <span className="text-cyan-accent">{ready.join(", ") || "empty"}</span>
        </p>
        <p className="mt-1 text-muted-foreground">
          result: <span className="text-terminal">{done.join(" -> ") || "run ready nodes"}</span>
        </p>
      </div>
    </div>
  );
}
