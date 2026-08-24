import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, RotateCcw, Database, HardDrive, ArrowDownToLine, Layers } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

type Entry = { key: string; val: string };
type SSTable = { id: number; level: number; entries: Entry[] };

export function LSMTree() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [memTable, setMemTable] = useState<Entry[]>([]);
  const [ssTables, setSstables] = useState<SSTable[]>([]);
  const [nextId, setNextId] = useState(1);
  const [log, setLog] = useState<{ id: number; msg: string }[]>([]);
  const [logId, setLogId] = useState(0);
  
  const [keyInput, setKeyInput] = useState("");
  const [valInput, setValInput] = useState("");

  const MEMTABLE_LIMIT = 4;
  const L0_LIMIT = 3;

  function addLog(msg: string) {
    setLogId(prev => {
      setLog(l => [{ id: prev, msg }, ...l].slice(0, 6));
      return prev + 1;
    });
  }

  function insert(e: React.FormEvent) {
    e.preventDefault();
    if (!keyInput) return;
    
    setMemTable(prev => {
       const next = [...prev];
       const existing = next.findIndex(x => x.key === keyInput);
       if (existing >= 0) {
         next[existing] = { key: keyInput, val: valInput };
       } else {
         next.push({ key: keyInput, val: valInput });
         next.sort((a,b) => a.key.localeCompare(b.key));
       }
       
       if (next.length >= MEMTABLE_LIMIT) {
         flush(next);
         return [];
       }
       return next;
    });
    
    addLog(`Write: ${keyInput}=${valInput} -> MemTable`);
    setKeyInput("");
    setValInput("");
  }

  function flush(entries: Entry[]) {
     setSstables(prev => {
        const next = [{ id: nextId, level: 0, entries }, ...prev];
        setNextId(n => n + 1);
        addLog(`Flush: MemTable full -> L0 SSTable #${nextId}`);
        
        const l0s = next.filter(s => s.level === 0);
        if (l0s.length >= L0_LIMIT) {
           setTimeout(() => compact(), 800); 
        }
        return next;
     });
  }

  function compact() {
    setSstables(prev => {
       const l0s = prev.filter(s => s.level === 0);
       const others = prev.filter(s => s.level !== 0);
       
       if (l0s.length < L0_LIMIT) return prev; 

       const map = new Map<string, string>();
       for (let i = l0s.length - 1; i >= 0; i--) {
         for (const e of l0s[i].entries) {
           map.set(e.key, e.val);
         }
       }
       
       const mergedEntries = Array.from(map.entries()).map(([key, val]) => ({key, val}));
       mergedEntries.sort((a,b) => a.key.localeCompare(b.key));
       
       addLog(`Compact: Merged ${l0s.length} L0 tables -> L1 SSTable`);

       return [{ id: Date.now(), level: 1, entries: mergedEntries }, ...others];
    });
  }

  function reset() {
    setMemTable([]);
    setSstables([]);
    setLog([]);
    setKeyInput("");
    setValInput("");
    setNextId(1);
    setLogId(0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={insert} className="flex flex-wrap items-center gap-2 font-mono text-xs">
           <input 
             type="text" 
             placeholder="key" 
             maxLength={8}
             value={keyInput} 
             onChange={e => setKeyInput(e.target.value)}
             className="w-20 rounded border border-border bg-background px-2 py-1.5 outline-none focus:border-terminal/50"
             required
           />
           <span className="text-muted-foreground">=</span>
           <input 
             type="text" 
             placeholder="value" 
             maxLength={12}
             value={valInput} 
             onChange={e => setValInput(e.target.value)}
             className="w-24 rounded border border-border bg-background px-2 py-1.5 outline-none focus:border-terminal/50"
             required
           />
           <button
             type="submit"
             className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 text-terminal hover:bg-terminal/20"
           >
             <Plus className="size-3" /> Insert
           </button>
        </form>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" /> reset
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Memory Tier */}
        <div className="space-y-4 rounded-xl border border-border bg-card/40 p-4">
           <div className="flex items-center justify-between font-mono text-sm uppercase tracking-wider text-muted-foreground">
             <div className="flex items-center gap-2">
               <Database className="size-4" /> MemTable (RAM)
             </div>
             <span className="text-xs">{memTable.length} / {MEMTABLE_LIMIT}</span>
           </div>
           
           <div className="h-48 overflow-y-auto rounded border border-cyan-accent/20 bg-cyan-accent/5 p-2">
             {memTable.length === 0 ? (
                <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
                  Empty
                </div>
             ) : (
                <div className="space-y-1">
                  {memTable.map(entry => (
                    <motion.div 
                      key={entry.key}
                      initial={animate ? { opacity: 0, x: -10 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between border-b border-border/50 px-2 py-1 font-mono text-xs last:border-0"
                    >
                      <span className="text-cyan-accent">{entry.key}</span>
                      <span className="text-foreground">{entry.val}</span>
                    </motion.div>
                  ))}
                </div>
             )}
           </div>
        </div>

        {/* Disk Tier */}
        <div className="space-y-4 rounded-xl border border-border bg-card/40 p-4">
           <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-muted-foreground">
             <HardDrive className="size-4" /> SSTables (Disk)
           </div>
           
           <div className="flex h-48 flex-col gap-2 overflow-y-auto pr-2">
             {ssTables.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded border border-border bg-secondary/10 font-mono text-xs text-muted-foreground">
                  No SSTables on disk
                </div>
             ) : (
                ssTables.map(table => (
                   <motion.div
                     key={table.id}
                     initial={animate ? { opacity: 0, y: -10 } : false}
                     animate={{ opacity: 1, y: 0 }}
                     className={`rounded border p-2 ${table.level === 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-fuchsia-500/30 bg-fuchsia-500/5'}`}
                   >
                     <div className="mb-1 flex justify-between font-mono text-xs uppercase text-muted-foreground">
                       <span>SSTable #{table.id}</span>
                       <span className={table.level === 0 ? 'text-amber-500' : 'text-fuchsia-400'}>Level {table.level}</span>
                     </div>
                     <div className="flex flex-wrap gap-1">
                        {table.entries.map(e => (
                          <span key={e.key} className="rounded bg-secondary/50 px-1 py-0.5 font-mono text-xs text-foreground">
                            {e.key}={e.val}
                          </span>
                        ))}
                     </div>
                   </motion.div>
                ))
             )}
           </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/40 p-4 font-mono text-xs">
        <h3 className="mb-3 uppercase tracking-wider text-muted-foreground">Operations Log</h3>
        <ul className="space-y-1">
          {log.length === 0 && <li className="text-muted-foreground">Insert keys to begin...</li>}
          {log.map((entry) => (
             <motion.li 
               key={entry.id} 
               initial={animate ? { opacity: 0, x: -10 } : false} 
               animate={{ opacity: 1, x: 0 }}
               className={`border-b border-border/50 pb-1 last:border-0 ${
                 entry.msg.startsWith("Write") ? "text-cyan-accent" :
                 entry.msg.startsWith("Flush") ? "text-amber-500" :
                 "text-fuchsia-400"
               }`}
             >
               &gt; {entry.msg}
             </motion.li>
          ))}
        </ul>
      </div>

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          LSM Trees provide extremely fast writes by appending to an in-memory tree (MemTable) instead of randomly updating disk blocks.
          When the MemTable fills up, it flushes sequentially to disk as an immutable SSTable (Sorted String Table).
          Background compaction processes merge smaller SSTables into larger ones to clean up obsolete data and optimize read performance.
        </p>
      </div>
    </div>
  );
}
