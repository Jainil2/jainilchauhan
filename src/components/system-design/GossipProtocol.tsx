import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, Pause, RotateCcw, StepForward } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

const SIZES = [20, 50, 100];
const FANOUTS = [1, 2, 3];

export function GossipProtocol() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const [size, setSize] = useState(50);
  const [fanout, setFanout] = useState(2);
  const [nodes, setNodes] = useState<boolean[]>(() => {
    const arr = Array(50).fill(false);
    arr[0] = true;
    return arr;
  });
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const animate = simulationsEnabled && !reduce;

  function reset() {
    setIsPlaying(false);
    setTick(0);
    setNodes((prev) => {
      const arr = Array(size).fill(false);
      arr[0] = true;
      return arr;
    });
  }

  useEffect(() => {
    reset();
  }, [size, fanout]);

  function step() {
    setNodes((prev) => {
      const next = [...prev];
      const infectedIndices = [];
      for (let i = 0; i < prev.length; i++) {
        if (prev[i]) infectedIndices.push(i);
      }
      
      if (infectedIndices.length === prev.length) {
        setIsPlaying(false);
        return prev; // All infected
      }

      // Each infected node picks `fanout` random nodes to infect
      for (const idx of infectedIndices) {
        for (let f = 0; f < fanout; f++) {
          const target = Math.floor(Math.random() * size);
          next[target] = true;
        }
      }
      return next;
    });
    setTick((t) => t + 1);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(step, 600);
    return () => clearInterval(interval);
  }, [isPlaying, size, fanout]);

  const infectedCount = nodes.filter(Boolean).length;
  const coverage = (infectedCount / size) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
           <button
             onClick={() => setIsPlaying(!isPlaying)}
             disabled={infectedCount === size}
             className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 font-mono text-xs text-terminal hover:bg-terminal/20 disabled:opacity-50"
           >
             {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
             {isPlaying ? "pause" : "play"}
           </button>
           <button
             onClick={step}
             disabled={isPlaying || infectedCount === size}
             className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-3 py-1.5 font-mono text-xs text-foreground hover:bg-secondary disabled:opacity-50"
           >
             <StepForward className="size-3" /> step
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
             size:
             <select 
               value={size} 
               onChange={(e) => setSize(Number(e.target.value))}
               className="rounded border border-border bg-background px-2 py-1 outline-none focus:border-terminal/50"
             >
               {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
           </label>
           <label className="flex items-center gap-2">
             fanout:
             <select 
               value={fanout} 
               onChange={(e) => setFanout(Number(e.target.value))}
               className="rounded border border-border bg-background px-2 py-1 outline-none focus:border-terminal/50"
             >
               {FANOUTS.map(f => <option key={f} value={f}>{f}</option>)}
             </select>
           </label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/40 p-6">
         <div className="flex flex-wrap justify-center gap-2">
            {nodes.map((infected, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={animate ? { scale: infected ? [1.3, 1] : 1 } : false}
                className={`size-6 rounded-full border transition-colors duration-300 ${
                  infected 
                    ? "border-terminal bg-terminal/20 shadow-[0_0_8px_rgba(20,184,166,0.5)]" 
                    : "border-border bg-secondary/30"
                }`}
              />
            ))}
         </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="tick" value={String(tick)} />
        <Stat label="infected" value={`${infectedCount} / ${size}`} />
        <Stat label="coverage" value={`${coverage.toFixed(1)}%`} />
      </div>
      
      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          At each tick, every infected node picks <span className="font-bold text-cyan-accent">{fanout}</span> random node(s) 
          and shares the state. Notice how growth is exponential — it starts slow, but once ~10% are infected, 
          it rapidly spreads to the entire cluster in <span className="font-bold text-cyan-accent">O(log N)</span> rounds.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 px-3 py-2">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-lg text-terminal">{value}</p>
    </div>
  );
}
