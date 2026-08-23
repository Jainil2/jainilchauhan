import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSimulationStore } from "@/lib/useSimulationStore";
import { Server, Database, Globe, Network, Cpu } from "lucide-react";

export function InfrastructureMap() {
  const { simulationsEnabled } = useSimulationStore();
  const [packets, setPackets] = useState<{ id: number; path: string; progress: number }[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  useEffect(() => {
    if (!simulationsEnabled) return;
    
    // Simple animation loop for packets moving across the SVG
    let id = 0;
    const interval = setInterval(() => {
      id++;
      const paths = ["client-lb", "lb-api", "api-auth", "api-db"];
      const randomPath = paths[Math.floor(Math.random() * paths.length)];
      
      setPackets((prev) => [...prev.slice(-10), { id, path: randomPath, progress: 0 }]);
    }, 800);

    return () => clearInterval(interval);
  }, [simulationsEnabled]);

  const Node = ({ id, icon: Icon, label, x, y }: { id: string; icon: any; label: string; x: string; y: string }) => {
    const isActive = activeNode === id;
    
    return (
      <motion.div
        className={`absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10`}
        style={{ left: x, top: y }}
        onMouseEnter={() => setActiveNode(id)}
        onMouseLeave={() => setActiveNode(null)}
        whileHover={{ scale: 1.1 }}
      >
        <div className={`relative flex items-center justify-center rounded-lg border p-3 backdrop-blur-md transition-colors ${
          isActive ? "border-terminal bg-terminal/20 shadow-[0_0_15px_rgba(20,184,166,0.3)] text-terminal" : "border-border bg-card/80 text-foreground"
        }`}>
          <Icon className="size-5" />
          {isActive && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-terminal"></span>
            </span>
          )}
        </div>
        <p className={`mt-2 font-mono text-[9px] uppercase tracking-wider ${isActive ? "text-terminal" : "text-muted-foreground"}`}>
          {label}
        </p>
      </motion.div>
    );
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border bg-card/30 p-8">
      <p className="absolute left-4 top-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Global infrastructure topology
      </p>

      <div className="relative mx-auto mt-8 h-64 w-full max-w-2xl">
        
        {/* Connection Lines */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--border)" />
              <stop offset="50%" stopColor="var(--terminal)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--border)" />
            </linearGradient>
          </defs>
          
          {/* Client to LB */}
          <line x1="10%" y1="50%" x2="30%" y2="50%" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4" className={activeNode === "lb" || activeNode === "client" ? "opacity-100" : "opacity-30"} />
          
          {/* LB to API */}
          <line x1="30%" y1="50%" x2="55%" y2="50%" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4" className={activeNode === "lb" || activeNode === "api" ? "opacity-100" : "opacity-30"} />
          
          {/* API to Auth */}
          <line x1="55%" y1="50%" x2="75%" y2="25%" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4" className={activeNode === "api" || activeNode === "auth" ? "opacity-100" : "opacity-30"} />
          
          {/* API to DB */}
          <line x1="55%" y1="50%" x2="75%" y2="75%" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4" className={activeNode === "api" || activeNode === "db" ? "opacity-100" : "opacity-30"} />
          
          {/* API to Cache */}
          <line x1="55%" y1="50%" x2="85%" y2="50%" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4" className={activeNode === "api" || activeNode === "cache" ? "opacity-100" : "opacity-30"} />

          {/* Animated Packets (Simplified for SVG rendering limits) */}
          {simulationsEnabled && (
            <>
              <circle cx="20%" cy="50%" r="2" fill="var(--terminal)" className="animate-ping" style={{ animationDuration: '2s' }} />
              <circle cx="42%" cy="50%" r="2" fill="var(--cyan-accent)" className="animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
              <circle cx="65%" cy="37.5%" r="2" fill="var(--terminal)" className="animate-ping" style={{ animationDuration: '1s', animationDelay: '0.2s' }} />
              <circle cx="65%" cy="62.5%" r="2" fill="var(--cyan-accent)" className="animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0.8s' }} />
              <circle cx="70%" cy="50%" r="2" fill="var(--terminal)" className="animate-ping" style={{ animationDuration: '0.8s', animationDelay: '0.1s' }} />
            </>
          )}
        </svg>

        {/* Nodes */}
        <Node id="client" icon={Globe} label="Client" x="10%" y="50%" />
        <Node id="lb" icon={Network} label="L7 Balancer" x="30%" y="50%" />
        <Node id="api" icon={Server} label="API Gateway" x="55%" y="50%" />
        <Node id="auth" icon={Cpu} label="Ory Hydra" x="75%" y="25%" />
        <Node id="db" icon={Database} label="PostgreSQL" x="75%" y="75%" />
        <Node id="cache" icon={Database} label="Redis Cache" x="85%" y="50%" />

      </div>

      <div className="absolute bottom-4 right-4 text-right">
        <p className="font-mono text-[9px] text-muted-foreground/60">
          Status: <span className="text-terminal">Optimal</span>
        </p>
        <p className="font-mono text-[9px] text-muted-foreground/60">
          Latency: <span className="text-cyan-accent">12ms</span>
        </p>
      </div>
    </div>
  );
}
