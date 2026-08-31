import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, SearchCode, Fingerprint } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

// Pseudo-SHA256 for visual realism
const sha256Mock = async (message: string) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};

interface MerkleNode {
  id: string;
  hash: string;
  isMutated: boolean;
  isLeaf?: boolean;
  value?: string;
}

const INITIAL_DATA = [
  "Alice->Bob: 5 BTC",
  "Bob->Charlie: 2 BTC",
  "Dave->Eve: 10 BTC",
  "Eve->Frank: 1 BTC",
];

export function MerkleTree() {
  const { simulationsEnabled } = useSimulationStore();
  const [dataBlocks, setDataBlocks] = useState<string[]>([...INITIAL_DATA]);
  const [nodes, setNodes] = useState<Record<string, MerkleNode>>({});
  const [proofTarget, setProofTarget] = useState<number | null>(null);

  // Recompute the tree whenever dataBlocks change
  useEffect(() => {
    const computeTree = async () => {
      // Leaves (Level 2)
      const leaves = await Promise.all(
        dataBlocks.map(async (val, idx) => ({
          id: `leaf-${idx}`,
          hash: await sha256Mock(val),
          isMutated: val !== INITIAL_DATA[idx],
          isLeaf: true,
          value: val,
        })),
      );

      // Intermediates (Level 1)
      const int0Hash = await sha256Mock(leaves[0].hash + leaves[1].hash);
      const int0 = {
        id: "int-0",
        hash: int0Hash,
        isMutated: leaves[0].isMutated || leaves[1].isMutated,
      };

      const int1Hash = await sha256Mock(leaves[2].hash + leaves[3].hash);
      const int1 = {
        id: "int-1",
        hash: int1Hash,
        isMutated: leaves[2].isMutated || leaves[3].isMutated,
      };

      // Root (Level 0)
      const rootHash = await sha256Mock(int0.hash + int1.hash);
      const root = {
        id: "root",
        hash: rootHash,
        isMutated: int0.isMutated || int1.isMutated,
      };

      const newNodes: Record<string, MerkleNode> = {};
      leaves.forEach((l) => (newNodes[l.id] = l));
      newNodes[int0.id] = int0;
      newNodes[int1.id] = int1;
      newNodes[root.id] = root;

      setNodes(newNodes);
    };

    computeTree();
  }, [dataBlocks]);

  function updateBlock(index: number, value: string) {
    if (!simulationsEnabled) return;
    setDataBlocks((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function reset() {
    setDataBlocks([...INITIAL_DATA]);
    setProofTarget(null);
  }

  // Determine if a node is part of the required proof path
  const isProofRequired = (id: string) => {
    if (proofTarget === null) return false;

    // For Leaf 0: Needs Leaf 1, Int 1
    // For Leaf 1: Needs Leaf 0, Int 1
    // For Leaf 2: Needs Leaf 3, Int 0
    // For Leaf 3: Needs Leaf 2, Int 0

    if (proofTarget === 0 && (id === "leaf-1" || id === "int-1")) return true;
    if (proofTarget === 1 && (id === "leaf-0" || id === "int-1")) return true;
    if (proofTarget === 2 && (id === "leaf-3" || id === "int-0")) return true;
    if (proofTarget === 3 && (id === "leaf-2" || id === "int-0")) return true;

    return false;
  };

  const NodeView = ({ id, label }: { id: string; label?: string }) => {
    const node = nodes[id];
    if (!node) return null;

    const isTarget = proofTarget !== null && id === `leaf-${proofTarget}`;
    const isRequired = isProofRequired(id);

    let borderClass = node.isMutated
      ? "border-destructive bg-destructive/10 text-destructive shadow-[0_0_10px_rgba(239,68,68,0.2)]"
      : "border-terminal/40 bg-card/60 text-terminal";

    if (proofTarget !== null) {
      if (isTarget) {
        borderClass =
          "border-cyan-accent bg-cyan-accent/20 text-cyan-accent shadow-[0_0_15px_rgba(34,211,238,0.4)]";
      } else if (isRequired) {
        borderClass = "border-terminal bg-terminal/20 text-terminal border-dashed";
      } else if (id !== "root") {
        borderClass = "border-border/50 bg-card/20 text-muted-foreground opacity-40";
      }
    }

    return (
      <div className="group relative">
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`flex flex-col items-center justify-center rounded border p-2 transition-all ${borderClass}`}
        >
          <span className="font-mono text-xs uppercase tracking-wider opacity-70">
            {label || id} {isRequired && "(PROOF)"}
          </span>
          <span className={`font-mono text-xs font-semibold`}>{node.hash.substring(0, 8)}...</span>
        </motion.div>

        {/* Full Hash Tooltip */}
        <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 flex-col rounded border border-border bg-card p-2 text-left shadow-xl group-hover:flex w-[280px]">
          <p className="font-mono text-xs text-muted-foreground break-all">
            <span className="text-terminal">SHA256:</span>
            <br />
            {node.hash}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-xs text-muted-foreground">
          // edit data blocks to invalidate hashes, or select a block to visualize its Merkle Proof
          path
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded border border-border px-2 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <RefreshCw className="size-3" /> reset
        </button>
      </div>

      <div className="relative rounded-lg border border-border bg-card/40 p-6 flex flex-col items-center gap-8 overflow-hidden">
        {/* Level 0: Root */}
        <div className="relative z-10 w-48">
          <div className="absolute -top-4 -left-4 text-muted-foreground">
            <Fingerprint className="size-24" />
          </div>
          <NodeView id="root" label="Root Hash" />
        </div>

        {/* SVG Lines */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 0 }}>
          {/* Root to Intermediates */}
          <line
            x1="50%"
            y1="18%"
            x2="30%"
            y2="45%"
            stroke={
              nodes["root"]?.isMutated && nodes["int-0"]?.isMutated
                ? "var(--destructive)"
                : "var(--border)"
            }
            strokeWidth="2"
            strokeDasharray="4"
            className={
              proofTarget !== null && proofTarget <= 1
                ? "opacity-100"
                : proofTarget !== null
                  ? "opacity-20"
                  : "opacity-100"
            }
          />
          <line
            x1="50%"
            y1="18%"
            x2="70%"
            y2="45%"
            stroke={
              nodes["root"]?.isMutated && nodes["int-1"]?.isMutated
                ? "var(--destructive)"
                : "var(--border)"
            }
            strokeWidth="2"
            strokeDasharray="4"
            className={
              proofTarget !== null && proofTarget > 1
                ? "opacity-100"
                : proofTarget !== null
                  ? "opacity-20"
                  : "opacity-100"
            }
          />

          {/* Intermediates to Leaves */}
          <line
            x1="30%"
            y1="55%"
            x2="15%"
            y2="80%"
            stroke={
              nodes["int-0"]?.isMutated && nodes["leaf-0"]?.isMutated
                ? "var(--destructive)"
                : "var(--border)"
            }
            strokeWidth="2"
            strokeDasharray="4"
            className={
              proofTarget !== null && proofTarget === 0
                ? "opacity-100"
                : proofTarget !== null
                  ? "opacity-20"
                  : "opacity-100"
            }
          />
          <line
            x1="30%"
            y1="55%"
            x2="45%"
            y2="80%"
            stroke={
              nodes["int-0"]?.isMutated && nodes["leaf-1"]?.isMutated
                ? "var(--destructive)"
                : "var(--border)"
            }
            strokeWidth="2"
            strokeDasharray="4"
            className={
              proofTarget !== null && proofTarget === 1
                ? "opacity-100"
                : proofTarget !== null
                  ? "opacity-20"
                  : "opacity-100"
            }
          />

          <line
            x1="70%"
            y1="55%"
            x2="55%"
            y2="80%"
            stroke={
              nodes["int-1"]?.isMutated && nodes["leaf-2"]?.isMutated
                ? "var(--destructive)"
                : "var(--border)"
            }
            strokeWidth="2"
            strokeDasharray="4"
            className={
              proofTarget !== null && proofTarget === 2
                ? "opacity-100"
                : proofTarget !== null
                  ? "opacity-20"
                  : "opacity-100"
            }
          />
          <line
            x1="70%"
            y1="55%"
            x2="85%"
            y2="80%"
            stroke={
              nodes["int-1"]?.isMutated && nodes["leaf-3"]?.isMutated
                ? "var(--destructive)"
                : "var(--border)"
            }
            strokeWidth="2"
            strokeDasharray="4"
            className={
              proofTarget !== null && proofTarget === 3
                ? "opacity-100"
                : proofTarget !== null
                  ? "opacity-20"
                  : "opacity-100"
            }
          />
        </svg>

        {/* Level 1: Intermediates */}
        <div className="relative z-10 flex w-full justify-around px-8">
          <div className="w-40">
            <NodeView id="int-0" label="Hash 0-1" />
          </div>
          <div className="w-40">
            <NodeView id="int-1" label="Hash 2-3" />
          </div>
        </div>

        {/* Level 2: Leaves (Data Blocks) */}
        <div className="relative z-10 flex w-full justify-between gap-2 mt-4">
          {dataBlocks.map((block, i) => (
            <div key={`data-${i}`} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full relative">
                <NodeView id={`leaf-${i}`} label={`Hash ${i}`} />
              </div>

              <input
                type="text"
                value={block}
                onChange={(e) => updateBlock(i, e.target.value)}
                className={`w-full truncate rounded border p-2 font-mono text-xs transition-colors outline-none focus:ring-1 focus:ring-terminal ${
                  block !== INITIAL_DATA[i]
                    ? "border-destructive bg-destructive/10 text-destructive focus:border-destructive focus:ring-destructive"
                    : "border-border bg-background/50 text-foreground"
                }`}
                title="Edit data to invalidate hash"
              />

              <button
                onClick={() => setProofTarget(proofTarget === i ? null : i)}
                className={`w-full flex items-center justify-center gap-1 rounded border p-1.5 font-mono text-xs transition-colors ${
                  proofTarget === i
                    ? "border-cyan-accent bg-cyan-accent/20 text-cyan-accent"
                    : "border-border bg-background text-muted-foreground hover:border-cyan-accent/50 hover:text-cyan-accent"
                }`}
              >
                <SearchCode className="size-3" />
                {proofTarget === i ? "CLEAR PROOF" : "VERIFY PROOF"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
