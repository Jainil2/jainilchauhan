import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, RotateCcw, Search, Type } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

type TrieNode = {
  char: string;
  isEnd: boolean;
  children: Record<string, TrieNode>;
};

export function TrieLab() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [root, setRoot] = useState<TrieNode>({ char: "", isEnd: false, children: {} });
  
  const [inputVal, setInputVal] = useState("");
  const [searchVal, setSearchVal] = useState("");
  
  const [activePath, setActivePath] = useState<string[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  function insert(e: React.FormEvent) {
    e.preventDefault();
    const word = inputVal.toLowerCase().trim();
    if (!word) return;
    if (words.includes(word)) return;
    
    setRoot(prev => {
      const next = JSON.parse(JSON.stringify(prev)); 
      let curr = next;
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (!curr.children[char]) {
          curr.children[char] = { char, isEnd: false, children: {} };
        }
        curr = curr.children[char];
      }
      curr.isEnd = true;
      return next;
    });
    
    setWords(prev => [...prev, word]);
    setInputVal("");
    
    // re-trigger search to update suggestions
    if (searchVal) {
      setTimeout(() => triggerSearch(searchVal, root), 0); // Need to use updated root, so rely on next render. Actually just clear search for simplicity
    }
    setSearchVal("");
    setActivePath([]);
    setSuggestions([]);
  }

  function triggerSearch(prefix: string, currentRoot: TrieNode) {
    if (!prefix) {
      setActivePath([]);
      setSuggestions([]);
      return;
    }
    
    let curr = currentRoot;
    const path: string[] = [];
    let found = true;
    
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      if (curr.children[char]) {
        path.push(char);
        curr = curr.children[char];
      } else {
        found = false;
        break;
      }
    }
    
    setActivePath(path);
    
    if (found) {
      const sugs: string[] = [];
      function dfs(node: TrieNode, currentWord: string) {
        if (node.isEnd) sugs.push(currentWord);
        for (const c of Object.keys(node.children).sort()) {
          dfs(node.children[c], currentWord + c);
        }
      }
      dfs(curr, prefix);
      setSuggestions(sugs);
    } else {
      setSuggestions([]);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const prefix = e.target.value.toLowerCase().trim();
    setSearchVal(prefix);
    triggerSearch(prefix, root);
  }

  function reset() {
    setRoot({ char: "", isEnd: false, children: {} });
    setWords([]);
    setInputVal("");
    setSearchVal("");
    setActivePath([]);
    setSuggestions([]);
  }

  function renderNode(node: TrieNode, depth: number, currentPath: string): React.ReactNode {
     const keys = Object.keys(node.children).sort();
     if (keys.length === 0) return null;
     
     return (
       <div className="flex flex-col gap-2 border-l-2 border-border/30 pl-4 ml-4 mt-2">
         {keys.map(k => {
            const child = node.children[k];
            const nodePath = currentPath + k;
            
            const isActive = activePath.length > 0 && activePath.join("").startsWith(nodePath);
            
            return (
              <div key={k} className="flex flex-col items-start">
                 <div className="flex items-center gap-2">
                   <div className="w-4 border-t-2 border-border/30" />
                   <motion.div 
                     initial={animate ? { scale: 0 } : false}
                     animate={{ scale: 1 }}
                     className={`flex size-8 items-center justify-center rounded-lg border-2 font-mono text-sm font-bold uppercase transition-colors ${
                       isActive ? 'border-amber-500 bg-amber-500/20 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                       child.isEnd ? 'border-terminal bg-terminal/10 text-terminal' : 
                       'border-border bg-card text-muted-foreground'
                     }`}
                   >
                     {k}
                   </motion.div>
                   {child.isEnd && (
                     <span className="rounded bg-terminal/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-terminal">
                       end
                     </span>
                   )}
                 </div>
                 {renderNode(child, depth + 1, nodePath)}
              </div>
            )
         })}
       </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={insert} className="flex items-center gap-2 font-mono text-xs">
           <div className="relative">
             <Type className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
             <input 
               type="text"
               placeholder="new word" 
               maxLength={12}
               value={inputVal} 
               onChange={e => setInputVal(e.target.value)}
               className="w-32 rounded border border-border bg-background py-1.5 pl-8 pr-2 outline-none focus:border-terminal/50"
               required
             />
           </div>
           <button
             type="submit"
             className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 text-terminal hover:bg-terminal/20"
           >
             <Plus className="size-3" /> Add
           </button>
        </form>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" /> reset
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
         {/* Tree Visualization */}
         <div className="rounded-xl border border-border bg-card/40 p-6 overflow-x-auto">
            <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Trie Structure</h3>
            
            {Object.keys(root.children).length === 0 ? (
               <div className="flex h-32 items-center justify-center font-mono text-sm text-muted-foreground">
                 Empty Trie
               </div>
            ) : (
               <div className="min-w-max pb-4">
                 <div className="flex items-center gap-2">
                   <div className="flex size-8 items-center justify-center rounded-lg border-2 border-border bg-secondary/50 font-mono text-xs text-muted-foreground">
                     *
                   </div>
                   <span className="font-mono text-xs uppercase text-muted-foreground">Root</span>
                 </div>
                 {renderNode(root, 0, "")}
               </div>
            )}
         </div>

         {/* Search & Autocomplete */}
         <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
               <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-amber-500">Autocomplete</h3>
               <div className="relative">
                 <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-amber-500/50" />
                 <input 
                   type="text"
                   placeholder="Search prefix..." 
                   value={searchVal} 
                   onChange={handleSearchChange}
                   className="w-full rounded border border-amber-500/30 bg-background py-2 pl-9 pr-3 font-mono text-sm outline-none focus:border-amber-500"
                 />
               </div>
               
               {searchVal && (
                 <div className="mt-4">
                   <h4 className="mb-2 font-mono text-xs uppercase text-muted-foreground">Suggestions ({suggestions.length})</h4>
                   <div className="flex flex-wrap gap-2">
                     {suggestions.length === 0 ? (
                       <span className="font-mono text-xs text-destructive">No matches</span>
                     ) : (
                       suggestions.map(sug => (
                         <span key={sug} className="rounded bg-amber-500/20 px-2 py-1 font-mono text-xs text-amber-500 border border-amber-500/30">
                           {sug}
                         </span>
                       ))
                     )}
                   </div>
                 </div>
               )}
            </div>
            
            <div className="rounded-xl border border-border bg-card/40 p-4 font-mono text-xs">
              <h3 className="mb-2 uppercase tracking-wider text-muted-foreground">Dictionary ({words.length})</h3>
              <div className="flex flex-wrap gap-1">
                {words.length === 0 ? (
                  <span className="text-muted-foreground">Empty</span>
                ) : (
                  words.map(w => (
                    <span key={w} className="text-foreground after:content-[','] last:after:content-['']">{w}</span>
                  ))
                )}
              </div>
            </div>
         </div>
      </div>

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          A Trie (Prefix Tree) is highly efficient for autocomplete and dictionary searches. Unlike Hash Maps which only do exact matches, Tries can instantly find all words sharing a common prefix. Searching takes <code>O(L)</code> time where <code>L</code> is the length of the prefix.
        </p>
      </div>
    </div>
  );
}
