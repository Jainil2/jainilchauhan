import { useEffect, useRef, useState } from "react";

type Strategy = "naive" | "ordered" | "asymmetric";
type PState = "thinking" | "hungry-left" | "hungry-right" | "eating" | "done";

interface Phil {
  id: number;
  state: PState;
  meals: number;
  holdingLeft: boolean;
  holdingRight: boolean;
}

const N = 5;

function init(): Phil[] {
  return Array.from({ length: N }, (_, i) => ({
    id: i,
    state: "thinking",
    meals: 0,
    holdingLeft: false,
    holdingRight: false,
  }));
}

export function DeadlockLab() {
  const [strategy, setStrategy] = useState<Strategy>("naive");
  const [phils, setPhils] = useState<Phil[]>(init);
  const [forks, setForks] = useState<(number | null)[]>(() => Array(N).fill(null));
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [deadlock, setDeadlock] = useState(false);
  const stratRef = useRef(strategy);
  stratRef.current = strategy;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setPhils((ps) => {
        setForks((fs) => {
          const fcopy = [...fs];
          const next = ps.map((p) => ({ ...p }));
          for (const p of next) {
            const left = p.id;
            const right = (p.id + 1) % N;
            const useReverse = stratRef.current === "asymmetric" && p.id === N - 1;
            const firstFork =
              stratRef.current === "ordered" ? Math.min(left, right) : useReverse ? right : left;
            const secondFork =
              stratRef.current === "ordered" ? Math.max(left, right) : useReverse ? left : right;

            if (p.state === "thinking" && Math.random() < 0.5) {
              p.state = "hungry-left";
            }
            if (p.state === "hungry-left") {
              if (fcopy[firstFork] === null) {
                fcopy[firstFork] = p.id;
                if (firstFork === left) p.holdingLeft = true;
                else p.holdingRight = true;
                p.state = "hungry-right";
              }
            } else if (p.state === "hungry-right") {
              if (fcopy[secondFork] === null) {
                fcopy[secondFork] = p.id;
                if (secondFork === left) p.holdingLeft = true;
                else p.holdingRight = true;
                p.state = "eating";
              }
            } else if (p.state === "eating") {
              if (Math.random() < 0.4) {
                fcopy[left] = null;
                fcopy[right] = null;
                p.holdingLeft = false;
                p.holdingRight = false;
                p.meals++;
                p.state = "thinking";
              }
            }
          }
          // detect deadlock: every philosopher hungry-right and holds exactly one fork
          const dl = next.every(
            (p) =>
              p.state === "hungry-right" &&
              (p.holdingLeft || p.holdingRight) &&
              !(p.holdingLeft && p.holdingRight),
          );
          if (dl) {
            setDeadlock(true);
            setRunning(false);
          }
          return fcopy;
        });
        return ps;
      });
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  function reset() {
    setPhils(init());
    setForks(Array(N).fill(null));
    setDeadlock(false);
    setTick(0);
  }

  const totalMeals = phils.reduce((s, p) => s + p.meals, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-muted-foreground">strategy:</span>
        {(["naive", "ordered", "asymmetric"] as Strategy[]).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStrategy(s);
              reset();
            }}
            className={`rounded border px-2 py-1 ${strategy === s ? "border-terminal text-terminal" : "border-border text-muted-foreground"}`}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => setRunning((r) => !r)}
          className="rounded border border-border px-2 py-1 hover:border-terminal/50 hover:text-terminal"
        >
          {running ? "pause" : "run"}
        </button>
        <button
          onClick={reset}
          className="ml-auto rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground"
        >
          reset
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="rounded border border-border bg-background/40 p-3">
          <svg viewBox="0 0 220 220" className="w-full">
            <circle cx="110" cy="110" r="80" fill="none" stroke="oklch(0.30 0.02 150 / 30%)" />
            {phils.map((p) => {
              const a = (p.id / N) * Math.PI * 2 - Math.PI / 2;
              const x = 110 + 80 * Math.cos(a);
              const y = 110 + 80 * Math.sin(a);
              const color =
                p.state === "eating"
                  ? "oklch(0.85 0.21 150)"
                  : p.state.startsWith("hungry")
                    ? "oklch(0.80 0.18 60)"
                    : "oklch(0.68 0.02 150)";
              return (
                <g key={p.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={16}
                    fill="oklch(0.20 0.02 150)"
                    stroke={color}
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    fill={color}
                  >
                    P{p.id}
                  </text>
                  <text
                    x={x}
                    y={y + 28}
                    textAnchor="middle"
                    fontSize="7"
                    fontFamily="JetBrains Mono"
                    fill="oklch(0.68 0.02 150)"
                  >
                    {p.meals}🍝
                  </text>
                </g>
              );
            })}
            {forks.map((owner, i) => {
              const a = (i / N) * Math.PI * 2 - Math.PI / 2 + Math.PI / N;
              const x = 110 + 50 * Math.cos(a);
              const y = 110 + 50 * Math.sin(a);
              return (
                <g key={i}>
                  <rect
                    x={x - 4}
                    y={y - 8}
                    width="8"
                    height="16"
                    fill={owner !== null ? "oklch(0.85 0.21 150)" : "oklch(0.30 0.02 150)"}
                  />
                  <text
                    x={x}
                    y={y + 22}
                    textAnchor="middle"
                    fontSize="6"
                    fontFamily="JetBrains Mono"
                    fill="oklch(0.68 0.02 150)"
                  >
                    f{i}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="rounded border border-border bg-background/40 p-3 font-mono text-xs">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">stats</p>
          <p>
            tick: <span className="text-terminal">{tick}</span>
          </p>
          <p>
            meals served: <span className="text-terminal">{totalMeals}</span>
          </p>
          <p className={`mt-2 ${deadlock ? "text-destructive" : "text-muted-foreground"}`}>
            {deadlock ? "💀 DEADLOCK — wait-for cycle" : running ? "running…" : "paused"}
          </p>
          <hr className="my-2 border-border" />
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground">naive:</span> all grab left first → cycle
            <br />
            <span className="text-foreground">ordered:</span> always lower fork first → no cycle
            <br />
            <span className="text-foreground">asymmetric:</span> last philosopher reverses → breaks
            cycle
          </p>
        </div>
      </div>
    </div>
  );
}
