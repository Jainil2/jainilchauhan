import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, RotateCcw, Zap, Hash } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

// Simple 32-bit FNV-1a hash
function fnv1a(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

export function HyperLogLog() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const BITS = 4; // 16 buckets
  const M = 1 << BITS; // 16
  const [buckets, setBuckets] = useState<number[]>(Array(M).fill(0));
  const [actualSet, setActualSet] = useState<Set<string>>(new Set());
  const [log, setLog] = useState<{id: number, str: string, hashBin: string, bucket: number, zeros: number}[]>([]);
  const [logId, setLogId] = useState(0);

  const [input, setInput] = useState("");

  function addLog(str: string, hashBin: string, bucket: number, zeros: number) {
    setLogId(prev => {
      setLog(l => [{id: prev, str, hashBin, bucket, zeros}, ...l].slice(0, 5));
      return prev + 1;
    });
  }

  function insert(val: string) {
    if (!val) return;
    
    setActualSet(prev => {
      const next = new Set(prev);
      next.add(val);
      return next;
    });

    const hash = fnv1a(val);
    const hashBin = hash.toString(2).padStart(32, '0');
    
    // First BITS bits for bucket index
    const bucketStr = hashBin.slice(0, BITS);
    const bucket = parseInt(bucketStr, 2);
    
    // Remaining bits for leading zeros
    const remaining = hashBin.slice(BITS);
    // Find first '1' (which is the same as counting leading zeros + 1)
    let zeros = 1;
    for(let i=0; i<remaining.length; i++) {
      if (remaining[i] === '0') zeros++;
      else break;
    }

    setBuckets(prev => {
       const next = [...prev];
       if (zeros > next[bucket]) {
         next[bucket] = zeros;
       }
       return next;
    });
    
    addLog(val, hashBin, bucket, zeros);
    setInput("");
  }

  function handleInsert(e: React.FormEvent) {
    e.preventDefault();
    insert(input);
  }

  function addRandom() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const len = 5;
    let str = '';
    for(let i=0; i<len; i++) str += chars.charAt(Math.floor(Math.random() * chars.length));
    insert(str);
  }

  function addBulk() {
    for(let i=0; i<50; i++) addRandom();
  }

  function reset() {
    setBuckets(Array(M).fill(0));
    setActualSet(new Set());
    setLog([]);
    setLogId(0);
    setInput("");
  }

  // Estimate calculation
  // E = alpha_m * m^2 / sum(2^-M[j])
  let sum = 0;
  let zerosCount = 0;
  for(let i=0; i<M; i++) {
    sum += Math.pow(2, -buckets[i]);
    if (buckets[i] === 0) zerosCount++;
  }
  
  let estimate = (0.673 * M * M) / sum;
  
  // Small range correction
  if (estimate <= 2.5 * M) {
    if (zerosCount > 0) {
      estimate = M * Math.log(M / zerosCount);
    }
  }
  
  const estimateVal = Math.round(estimate);
  const actualVal = actualSet.size;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleInsert} className="flex flex-wrap items-center gap-2 font-mono text-xs">
           <input 
             type="text" 
             placeholder="Item ID..." 
             maxLength={16}
             value={input} 
             onChange={e => setInput(e.target.value)}
             className="w-32 rounded border border-border bg-background px-2 py-1.5 outline-none focus:border-terminal/50"
             required
           />
           <button
             type="submit"
             className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 text-terminal hover:bg-terminal/20"
           >
             <Plus className="size-3" /> Add
           </button>
           <button
             type="button"
             onClick={addBulk}
             className="flex items-center gap-1.5 rounded-md border border-cyan-accent/40 bg-cyan-accent/10 px-3 py-1.5 text-cyan-accent hover:bg-cyan-accent/20"
           >
             <Zap className="size-3" /> Add 50
           </button>
        </form>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" /> reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="rounded-xl border border-border bg-background/50 p-4 text-center">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Actual Unique Count</h3>
            <div className="mt-1 font-mono text-3xl text-foreground">{actualVal}</div>
         </div>
         <div className="rounded-xl border border-terminal/30 bg-terminal/5 p-4 text-center shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            <h3 className="font-mono text-xs uppercase tracking-wider text-terminal/80">HyperLogLog Estimate</h3>
            <div className="mt-1 font-mono text-3xl text-terminal">{estimateVal}</div>
         </div>
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-4">
         <div className="mb-4 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground">
           <span>Buckets Array ({M})</span>
           <span>Max Leading Zeros</span>
         </div>
         
         <div className="grid grid-cols-8 gap-2 sm:grid-cols-16">
            {buckets.map((val, i) => (
              <motion.div 
                key={i}
                initial={false}
                animate={animate ? { scale: [0.95, 1], backgroundColor: val > 0 ? "rgba(20,184,166,0.2)" : "rgba(var(--secondary), 0.3)" } : false}
                className={`flex aspect-square flex-col items-center justify-center rounded border border-border text-center font-mono`}
              >
                <span className="text-[9px] text-muted-foreground">{i}</span>
                <span className={val > 0 ? "text-terminal font-bold" : "text-muted-foreground"}>{val}</span>
              </motion.div>
            ))}
         </div>
      </div>

      {log.length > 0 && (
         <div className="rounded-lg border border-border bg-card/40 p-4 font-mono text-xs">
           <h3 className="mb-3 uppercase tracking-wider text-muted-foreground">Hash Processing Log</h3>
           <ul className="space-y-2">
             {log.map((entry) => (
                <motion.li 
                  key={entry.id} 
                  initial={animate ? { opacity: 0, y: -5 } : false} 
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-1 border-b border-border/50 pb-2 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">"{entry.str}"</span>
                    <ArrowRight className="size-3 text-muted-foreground" />
                    <span className="rounded bg-secondary/50 px-1 py-0.5 text-amber-500">Bucket {entry.bucket}</span>
                    <span className="rounded bg-secondary/50 px-1 py-0.5 text-fuchsia-400">Zeros: {entry.zeros}</span>
                  </div>
                  <div className="text-xs tracking-widest text-muted-foreground break-all">
                    <span className="text-amber-500/80">{entry.hashBin.slice(0, BITS)}</span>
                    <span className="text-fuchsia-400/80">{entry.hashBin.slice(BITS)}</span>
                  </div>
                </motion.li>
             ))}
           </ul>
         </div>
      )}

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          HyperLogLog estimates cardinality using extremely little memory. It hashes inputs and records the maximum number of leading zeros seen in each bucket. 
          The probability of seeing <code>k</code> leading zeros is <code>1/2^k</code>, so the maximum zeros correlate to the log base 2 of the cardinality.
        </p>
      </div>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
