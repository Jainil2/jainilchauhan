import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw, ArrowRight, Activity, Mail } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

type NodeId = "A" | "B" | "C";

export function VectorClocks() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [clocks, setClocks] = useState({
    A: [0, 0, 0],
    B: [0, 0, 0],
    C: [0, 0, 0],
  });

  const [log, setLog] = useState<{ id: number; node: string; event: string; clock: number[] }[]>([]);
  const [logCounter, setLogCounter] = useState(0);

  function getIdx(node: NodeId) {
    if (node === "A") return 0;
    if (node === "B") return 1;
    return 2;
  }

  function localEvent(node: NodeId) {
    const idx = getIdx(node);
    setClocks((prev) => {
      const next = { ...prev };
      next[node] = [...prev[node]];
      next[node][idx] += 1;
      
      setLogCounter(c => {
         setLog((l) => [{ id: c, node, event: "Local event", clock: next[node] }, ...l].slice(0, 8));
         return c + 1;
      });
      return next;
    });
  }

  function sendMessage(from: NodeId, to: NodeId) {
    const fromIdx = getIdx(from);
    const toIdx = getIdx(to);
    
    setClocks((prev) => {
       const next = { ...prev };
       // Sender increments its clock
       next[from] = [...prev[from]];
       next[from][fromIdx] += 1;
       const sentClock = [...next[from]];
       
       // Receiver takes max and increments its own
       next[to] = [...prev[to]];
       for(let i=0; i<3; i++) {
         next[to][i] = Math.max(next[to][i], sentClock[i]);
       }
       next[to][toIdx] += 1;

       setLogCounter(c => {
         setLog((l) => [
           { id: c + 1, node: to, event: `Received from ${from}`, clock: next[to] }, 
           { id: c, node: from, event: `Sent to ${to}`, clock: sentClock }, 
           ...l
         ].slice(0, 8));
         return c + 2;
       });

       return next;
    });
  }

  function reset() {
    setClocks({ A: [0,0,0], B: [0,0,0], C: [0,0,0] });
    setLog([]);
    setLogCounter(0);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
         <button
           onClick={reset}
           className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
         >
           <RotateCcw className="size-3" /> reset
         </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         {(["A", "B", "C"] as NodeId[]).map((node) => {
            const colorClass = node === "A" ? "border-cyan-accent/50 bg-cyan-accent/10" : 
                               node === "B" ? "border-amber-500/50 bg-amber-500/10" : 
                               "border-fuchsia-500/50 bg-fuchsia-500/10";
            const textClass = node === "A" ? "text-cyan-accent" : 
                              node === "B" ? "text-amber-500" : 
                              "text-fuchsia-400";
            return (
              <motion.div 
                key={node}
                initial={false}
                animate={animate ? { scale: [0.98, 1] } : false}
                className={`flex flex-col items-center gap-4 rounded-xl border p-5 ${colorClass}`}
              >
                 <div className="text-center font-mono">
                    <h3 className={`text-xl font-bold ${textClass}`}>Node {node}</h3>
                    <div className="mt-2 text-2xl tracking-widest text-foreground bg-background/50 rounded-md py-2 px-4 shadow-inner">
                      [{clocks[node].join(", ")}]
                    </div>
                 </div>

                 <div className="mt-2 flex w-full flex-col gap-2">
                    <button
                      onClick={() => localEvent(node)}
                      className="flex w-full items-center justify-center gap-2 rounded border border-border bg-background/50 px-3 py-2 font-mono text-xs text-foreground transition-colors hover:bg-background"
                    >
                      <Activity className="size-3" /> Local Event
                    </button>
                    <div className="flex gap-2">
                      {(["A", "B", "C"] as NodeId[]).filter(n => n !== node).map(target => (
                        <button
                          key={target}
                          onClick={() => sendMessage(node, target)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded border border-border bg-background/50 px-2 py-2 font-mono text-xs text-foreground transition-colors hover:bg-background"
                        >
                          <Mail className="size-3" /> To {target}
                        </button>
                      ))}
                    </div>
                 </div>
              </motion.div>
            )
         })}
      </div>

      <div className="rounded-lg border border-border bg-card/40 p-4 font-mono text-xs">
        <h3 className="mb-3 uppercase tracking-wider text-muted-foreground">Event Log</h3>
        <ul className="space-y-2">
          {log.length === 0 && <li className="text-muted-foreground">Perform an event to see vector clocks update...</li>}
          {log.map((entry) => {
             const textClass = entry.node === "A" ? "text-cyan-accent" : 
                               entry.node === "B" ? "text-amber-500" : 
                               "text-fuchsia-400";
             return (
               <motion.li 
                 key={entry.id} 
                 initial={animate ? { opacity: 0, x: -10 } : false} 
                 animate={{ opacity: 1, x: 0 }}
                 className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0"
               >
                 <span className="flex items-center gap-2 text-foreground">
                   <span className={`font-bold ${textClass}`}>Node {entry.node}</span>
                   <span className="text-muted-foreground">|</span>
                   <span>{entry.event}</span>
                 </span>
                 <span className="rounded bg-secondary/50 px-2 py-1 tracking-widest text-muted-foreground">
                   [{entry.clock.join(", ")}]
                 </span>
               </motion.li>
             )
          })}
        </ul>
      </div>

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          Vector Clocks track causality in distributed systems where absolute time is impossible to determine.
          By looking at two vector clocks, we can tell if Event X caused Event Y, Event Y caused Event X, or if they were concurrent.
          <br/><br/>
          <strong>Rule 1:</strong> On any event, increment your own index.<br/>
          <strong>Rule 2:</strong> On receive, take the pairwise maximum of the incoming clock and your own, then increment your own index.
        </p>
      </div>
    </div>
  );
}
