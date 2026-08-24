import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, RotateCcw, FastForward } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

export function LevenshteinLab() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [word1, setWord1] = useState("KITTEN");
  const [word2, setWord2] = useState("SITTING");
  
  const [dp, setDp] = useState<number[][]>([]);
  const [currentCell, setCurrentCell] = useState<{i: number, j: number} | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isRunning) return;
    initTable();
  }, [word1, word2]);

  function initTable() {
    const w1 = word1.substring(0, 10).toUpperCase();
    const w2 = word2.substring(0, 10).toUpperCase();
    const initialDp = Array(w1.length + 1).fill(0).map(() => Array(w2.length + 1).fill(null));
    for (let i = 0; i <= w1.length; i++) initialDp[i][0] = i;
    for (let j = 0; j <= w2.length; j++) initialDp[0][j] = j;
    setDp(initialDp);
    setCurrentCell(null);
    setIsDone(false);
  }

  const delay = (ms: number) => new Promise(res => setTimeout(res, animate ? ms : 0));

  async function calculate(fast = false) {
    if (isRunning) return;
    setIsRunning(true);
    setIsDone(false);

    const w1 = word1.substring(0, 10).toUpperCase();
    const w2 = word2.substring(0, 10).toUpperCase();

    const table = Array(w1.length + 1).fill(0).map(() => Array(w2.length + 1).fill(null));
    for (let i = 0; i <= w1.length; i++) table[i][0] = i;
    for (let j = 0; j <= w2.length; j++) table[0][j] = j;

    setDp([...table.map(r => [...r])]);

    for (let i = 1; i <= w1.length; i++) {
      for (let j = 1; j <= w2.length; j++) {
        if (!fast) setCurrentCell({ i, j });
        
        const cost = w1[i - 1] === w2[j - 1] ? 0 : 1;
        table[i][j] = Math.min(
          table[i - 1][j] + 1,      // deletion
          table[i][j - 1] + 1,      // insertion
          table[i - 1][j - 1] + cost // substitution
        );

        if (!fast) {
          setDp([...table.map(r => [...r])]);
          await delay(w1.length > 5 ? 100 : 250);
        }
      }
    }

    if (fast) setDp([...table.map(r => [...r])]);
    setCurrentCell(null);
    setIsRunning(false);
    setIsDone(true);
  }

  function reset() {
    if (isRunning) return;
    initTable();
  }

  const w1 = word1.substring(0, 10).toUpperCase();
  const w2 = word2.substring(0, 10).toUpperCase();
  const result = isDone && dp.length > 0 ? dp[w1.length][w2.length] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
           <div className="flex gap-2">
             <input
               type="text"
               value={word1}
               onChange={e => setWord1(e.target.value)}
               maxLength={10}
               disabled={isRunning}
               className="w-24 rounded border border-border bg-background px-2 py-1.5 font-mono text-xs uppercase outline-none focus:border-terminal/50 disabled:opacity-50"
             />
             <span className="flex items-center text-muted-foreground">→</span>
             <input
               type="text"
               value={word2}
               onChange={e => setWord2(e.target.value)}
               maxLength={10}
               disabled={isRunning}
               className="w-24 rounded border border-border bg-background px-2 py-1.5 font-mono text-xs uppercase outline-none focus:border-cyan-accent/50 disabled:opacity-50"
             />
           </div>

           <div className="flex items-center gap-2">
             <button
               onClick={() => calculate(false)}
               disabled={isRunning || !word1 || !word2}
               className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 font-mono text-xs text-terminal hover:bg-terminal/20 disabled:opacity-50"
             >
               <Play className="size-3" /> Animate
             </button>
             <button
               onClick={() => calculate(true)}
               disabled={isRunning || !word1 || !word2}
               className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-mono text-xs text-amber-500 hover:bg-amber-500/20 disabled:opacity-50"
             >
               <FastForward className="size-3" /> Instant
             </button>
           </div>
        </div>

        <button
          onClick={reset}
          disabled={isRunning}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <RotateCcw className="size-3" /> reset
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_200px]">
         <div className="overflow-x-auto rounded-xl border border-border bg-card/40 p-4">
            <div className="min-w-max">
               {dp.length > 0 && (
                 <table className="border-collapse font-mono text-xs">
                    <thead>
                       <tr>
                          <th className="p-2"></th>
                          <th className="p-2 text-muted-foreground">ε</th>
                          {w2.split('').map((c, i) => (
                            <th key={i} className="p-2 text-cyan-accent">{c}</th>
                          ))}
                       </tr>
                    </thead>
                    <tbody>
                       {dp.map((row, i) => (
                          <tr key={i}>
                             <th className={`p-2 text-left ${i === 0 ? 'text-muted-foreground' : 'text-terminal'}`}>
                                {i === 0 ? 'ε' : w1[i - 1]}
                             </th>
                             {row.map((val, j) => {
                                const isCurrent = currentCell?.i === i && currentCell?.j === j;
                                const isDep = currentCell && (
                                  (i === currentCell.i - 1 && j === currentCell.j) || // top
                                  (i === currentCell.i && j === currentCell.j - 1) || // left
                                  (i === currentCell.i - 1 && j === currentCell.j - 1) // top-left
                                );
                                const isDoneCell = isDone && i === w1.length && j === w2.length;
                                
                                let bgClass = "";
                                if (isCurrent) bgClass = "bg-amber-500/20 border-amber-500 text-amber-500 font-bold";
                                else if (isDep) bgClass = "bg-terminal/10 border-terminal/50";
                                else if (isDoneCell) bgClass = "bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-400 font-bold shadow-[0_0_10px_rgba(217,70,239,0.5)]";
                                else bgClass = "border-border/50";

                                return (
                                  <td key={j} className="p-1">
                                     <motion.div 
                                       initial={false}
                                       animate={animate && isCurrent ? { scale: [0.9, 1.1, 1] } : false}
                                       className={`flex size-8 items-center justify-center rounded border transition-colors duration-300 ${bgClass}`}
                                     >
                                        {val !== null ? val : ""}
                                     </motion.div>
                                  </td>
                                )
                             })}
                          </tr>
                       ))}
                    </tbody>
                 </table>
               )}
            </div>
         </div>

         <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card/40 p-4 text-center">
               <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Edit Distance</h3>
               <div className="font-mono text-4xl text-fuchsia-400">
                  {result !== null ? result : "-"}
               </div>
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-4 font-mono text-xs">
               <h3 className="mb-2 uppercase tracking-wider text-muted-foreground">Algorithm Info</h3>
               <p className="text-muted-foreground mb-2">Cost matrix computation:</p>
               <ul className="flex flex-col gap-1 text-xs">
                 <li className="flex items-center gap-2"><span className="text-amber-500">Current (i,j)</span> = min of:</li>
                 <li className="pl-2 border-l border-border/50 ml-1 text-terminal/80">Top + 1 (Delete)</li>
                 <li className="pl-2 border-l border-border/50 ml-1 text-terminal/80">Left + 1 (Insert)</li>
                 <li className="pl-2 border-l border-border/50 ml-1 text-terminal/80">Top-Left + (0 if match else 1) (Substitute)</li>
               </ul>
            </div>
         </div>
      </div>

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          The Levenshtein Distance is a classic Dynamic Programming problem used in spell checkers, DNA sequence analysis, and fuzzy search algorithms. 
          It works by breaking the problem down into smaller subproblems, building up a matrix of the minimum edit distances for all prefixes of the two words.
        </p>
      </div>
    </div>
  );
}
