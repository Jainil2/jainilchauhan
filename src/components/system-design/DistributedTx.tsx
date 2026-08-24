import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

type Strategy = "2PC" | "Saga";

export function DistributedTx() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [strategy, setStrategy] = useState<Strategy>("Saga");
  const [isPlaying, setIsPlaying] = useState(false);
  const [tick, setTick] = useState(0);

  // failure injection
  const [failPayment, setFailPayment] = useState(false);
  const [failInventory, setFailInventory] = useState(false);

  // runtime state
  const [orderState, setOrderState] = useState("idle");
  const [paymentState, setPaymentState] = useState("idle");
  const [inventoryState, setInventoryState] = useState("idle");
  const [log, setLog] = useState<string[]>([]);

  function reset() {
    setIsPlaying(false);
    setTick(0);
    setOrderState("idle");
    setPaymentState("idle");
    setInventoryState("idle");
    setLog([]);
  }

  useEffect(() => { reset(); }, [strategy, failPayment, failInventory]);

  function runTick() {
    setTick((t) => t + 1);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(runTick, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || tick === 0) return;

    if (strategy === "2PC") {
      if (tick === 1) {
        setLog(["Coordinator: Phase 1 (Prepare)"]);
        setOrderState("preparing");
        setPaymentState("preparing");
        setInventoryState("preparing");
      } else if (tick === 2) {
        setOrderState("prepared");
        if (failPayment) setPaymentState("aborted");
        else setPaymentState("prepared");
        
        if (failInventory) setInventoryState("aborted");
        else setInventoryState("prepared");

      } else if (tick === 3) {
        if (failPayment || failInventory) {
          setLog((l) => [...l, "Coordinator: Phase 2 (Abort)"]);
          setOrderState("aborted");
          setPaymentState("aborted");
          setInventoryState("aborted");
          setIsPlaying(false);
        } else {
          setLog((l) => [...l, "Coordinator: Phase 2 (Commit)"]);
          setOrderState("committing");
          setPaymentState("committing");
          setInventoryState("committing");
        }
      } else if (tick === 4 && !failPayment && !failInventory) {
        setOrderState("committed");
        setPaymentState("committed");
        setInventoryState("committed");
        setLog((l) => [...l, "Transaction Complete"]);
        setIsPlaying(false);
      }
    } else {
      // Saga
      if (tick === 1) {
        setLog(["Saga: Create Order"]);
        setOrderState("committed"); // Order created locally
      } else if (tick === 2) {
        setLog((l) => [...l, "Saga: Process Payment"]);
        if (failPayment) {
          setPaymentState("aborted");
          setLog((l) => [...l, "Payment Failed -> Trigger Compensation"]);
        } else {
          setPaymentState("committed");
        }
      } else if (tick === 3) {
        if (failPayment) {
          setLog((l) => [...l, "Compensate: Cancel Order"]);
          setOrderState("compensated");
          setIsPlaying(false);
        } else {
          setLog((l) => [...l, "Saga: Reserve Inventory"]);
          if (failInventory) {
            setInventoryState("aborted");
            setLog((l) => [...l, "Inventory Failed -> Trigger Compensation"]);
          } else {
            setInventoryState("committed");
            setLog((l) => [...l, "Transaction Complete"]);
            setIsPlaying(false);
          }
        }
      } else if (tick === 4) {
        if (failInventory && !failPayment) {
          setLog((l) => [...l, "Compensate: Refund Payment"]);
          setPaymentState("compensated");
        }
      } else if (tick === 5) {
        if (failInventory && !failPayment) {
           setLog((l) => [...l, "Compensate: Cancel Order"]);
           setOrderState("compensated");
           setIsPlaying(false);
        }
      }
    }
  }, [tick, isPlaying, strategy, failPayment, failInventory]);

  function getNodeColor(state: string) {
    switch(state) {
      case "idle": return "border-border bg-secondary/30 text-muted-foreground";
      case "preparing": 
      case "committing": return "border-amber-500/50 bg-amber-500/20 text-amber-500";
      case "prepared": 
      case "committed": return "border-terminal bg-terminal/20 text-terminal glow-terminal";
      case "aborted": return "border-destructive/50 bg-destructive/20 text-destructive";
      case "compensated": return "border-fuchsia-500/50 bg-fuchsia-500/20 text-fuchsia-400";
      default: return "border-border";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
           <button
             onClick={() => setIsPlaying(true)}
             disabled={isPlaying || orderState === "committed" || orderState === "aborted" || orderState === "compensated"}
             className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 font-mono text-xs text-terminal hover:bg-terminal/20 disabled:opacity-50"
           >
             <Play className="size-3" /> start tx
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
             strategy:
             <select 
               value={strategy} 
               onChange={(e) => setStrategy(e.target.value as Strategy)}
               className="rounded border border-border bg-background px-2 py-1 outline-none focus:border-terminal/50"
             >
               <option value="Saga">Saga (Choreography)</option>
               <option value="2PC">Two-Phase Commit</option>
             </select>
           </label>
        </div>
      </div>

      <div className="flex gap-4 font-mono text-xs">
         <label className="flex items-center gap-2 cursor-pointer">
           <input type="checkbox" checked={failPayment} onChange={e => setFailPayment(e.target.checked)} className="accent-destructive" />
           Fail Payment
         </label>
         <label className="flex items-center gap-2 cursor-pointer">
           <input type="checkbox" checked={failInventory} onChange={e => setFailInventory(e.target.checked)} className="accent-destructive" />
           Fail Inventory
         </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <NodeCard name="Order Service" state={orderState} colorClass={getNodeColor(orderState)} animate={animate} />
        <NodeCard name="Payment Service" state={paymentState} colorClass={getNodeColor(paymentState)} animate={animate} />
        <NodeCard name="Inventory Service" state={inventoryState} colorClass={getNodeColor(inventoryState)} animate={animate} />
      </div>

      <div className="rounded-lg border border-border bg-card/40 p-4 font-mono text-xs">
        <h3 className="mb-2 uppercase tracking-wider text-muted-foreground">Transaction Log</h3>
        <ul className="space-y-1">
          {log.length === 0 && <li className="text-muted-foreground">waiting to start...</li>}
          {log.map((entry, i) => (
             <motion.li 
               key={i} 
               initial={{ opacity: 0, x: -10 }} 
               animate={{ opacity: 1, x: 0 }}
               className={entry.includes("Failed") || entry.includes("Abort") ? "text-destructive" : entry.includes("Compensate") ? "text-fuchsia-400" : "text-terminal"}
             >
               &gt; {entry}
             </motion.li>
          ))}
        </ul>
      </div>

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          {strategy === "2PC" ? (
            "2PC blocks until all participants prepare. If one fails, the coordinator aborts. It provides strict consistency but is slow and blocks resources."
          ) : (
            "Saga executes sequential local transactions. If one fails, it runs compensating transactions backwards to undo the work. It provides eventual consistency and high availability."
          )}
        </p>
      </div>
    </div>
  );
}

function NodeCard({ name, state, colorClass, animate }: { name: string, state: string, colorClass: string, animate: boolean }) {
  return (
    <motion.div 
      animate={animate ? { scale: [0.98, 1] } : false}
      key={state}
      className={`flex flex-col items-center justify-center rounded-lg border p-4 text-center transition-colors duration-300 ${colorClass}`}
    >
      <span className="mb-2 font-mono text-xs font-bold uppercase tracking-wider opacity-80">{name}</span>
      <span className="font-mono text-sm">{state}</span>
    </motion.div>
  );
}
