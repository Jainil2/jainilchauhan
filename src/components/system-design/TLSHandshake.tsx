import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, RotateCcw, ArrowRight, ArrowLeft, Lock, Unlock, Server, MonitorSmartphone, Key } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

const STEPS = [
  { id: 1, name: "Client Hello", from: "client", desc: "Client sends supported SSL/TLS versions, cipher suites, and a random byte string ('Client Random').", icon: <ArrowRight className="size-4 text-cyan-accent" /> },
  { id: 2, name: "Server Hello & Certificate", from: "server", desc: "Server selects the cipher suite, sends its own 'Server Random', and provides its digital Certificate (containing its Public Key).", icon: <ArrowLeft className="size-4 text-amber-500" /> },
  { id: 3, name: "Client Key Exchange", from: "client", desc: "Client verifies the certificate, generates a 'Premaster Secret', encrypts it with the server's Public Key, and sends it to the server.", icon: <ArrowRight className="size-4 text-cyan-accent" /> },
  { id: 4, name: "Change Cipher Spec (Server)", from: "server", desc: "Server decrypts the Premaster Secret using its Private Key. Both sides now compute the shared Symmetric Session Key. Server signals readiness.", icon: <ArrowLeft className="size-4 text-amber-500" /> },
  { id: 5, name: "Secure Application Data", from: "both", desc: "Handshake complete! All further HTTP communication is symmetrically encrypted using the shared Session Key.", icon: <Lock className="size-4 text-terminal" /> },
];

export function TLSHandshake() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [currentStep, setCurrentStep] = useState(0);

  function next() {
    if (currentStep < STEPS.length) setCurrentStep(s => s + 1);
  }

  function reset() {
    setCurrentStep(0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={next}
          disabled={currentStep >= STEPS.length}
          className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-4 py-2 font-mono text-xs text-terminal hover:bg-terminal/20 disabled:opacity-50"
        >
          <Play className="size-3" /> {currentStep === 0 ? "Start Handshake" : currentStep < STEPS.length ? "Next Step" : "Handshake Complete"}
        </button>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" /> reset
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_250px]">
         <div className="rounded-xl border border-border bg-card/40 p-6 flex flex-col min-h-[400px]">
            {/* Actors */}
            <div className="flex justify-between items-center mb-8 px-4 font-mono text-sm uppercase tracking-wider text-muted-foreground">
               <div className="flex flex-col items-center gap-2">
                  <div className={`flex size-16 items-center justify-center rounded-full border-2 transition-colors duration-500 ${currentStep > 0 ? 'border-cyan-accent bg-cyan-accent/10 text-cyan-accent shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-border bg-background text-muted-foreground'}`}>
                     <MonitorSmartphone className="size-8" />
                  </div>
                  <span>Client</span>
               </div>
               
               <div className="flex items-center justify-center">
                  {currentStep >= 5 ? (
                     <motion.div initial={animate ? {scale: 0} : false} animate={{scale: 1}} className="flex items-center gap-2 rounded-full border border-terminal/50 bg-terminal/10 px-4 py-2 text-terminal shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                       <Lock className="size-4" />
                       <span className="font-mono text-xs font-bold uppercase">Encrypted Channel</span>
                     </motion.div>
                  ) : (
                     <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-muted-foreground">
                       <Unlock className="size-4" />
                       <span className="font-mono text-xs">Unencrypted</span>
                     </div>
                  )}
               </div>

               <div className="flex flex-col items-center gap-2">
                  <div className={`flex size-16 items-center justify-center rounded-full border-2 transition-colors duration-500 ${currentStep > 0 ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-border bg-background text-muted-foreground'}`}>
                     <Server className="size-8" />
                  </div>
                  <span>Server</span>
               </div>
            </div>

            {/* Sequence Diagram */}
            <div className="flex-1 relative border-l border-r border-border/30 mx-12 py-4">
               {STEPS.map((step, i) => {
                  const isActive = currentStep > i;
                  if (!isActive) return null;

                  const isClient = step.from === "client";
                  const isBoth = step.from === "both";

                  return (
                    <motion.div
                      key={step.id}
                      initial={animate ? { opacity: 0, y: -10 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative flex items-center mb-6 w-full ${isBoth ? 'justify-center' : isClient ? 'justify-start' : 'justify-end'}`}
                    >
                       {/* Arrow line */}
                       {!isBoth && (
                         <div className={`absolute top-1/2 w-full -translate-y-1/2 border-b-2 border-dashed ${isClient ? 'border-cyan-accent/50' : 'border-amber-500/50'}`} />
                       )}
                       
                       <div className={`relative z-10 flex items-center gap-2 rounded-lg border bg-background px-4 py-2 font-mono text-xs shadow-lg ${
                         isBoth ? 'border-terminal/50 text-terminal shadow-[0_0_15px_rgba(20,184,166,0.2)]' : 
                         isClient ? 'border-cyan-accent/50 text-cyan-accent shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 
                         'border-amber-500/50 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                       }`}>
                          {isClient ? step.icon : null}
                          <span className="font-bold">{step.id}. {step.name}</span>
                          {!isClient ? step.icon : null}
                       </div>
                    </motion.div>
                  )
               })}
            </div>
         </div>

         {/* Context Panel */}
         <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card/40 p-4 min-h-[150px]">
               <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Current Step Status</h3>
               {currentStep === 0 ? (
                 <p className="font-mono text-xs text-muted-foreground">Click 'Start Handshake' to begin the TLS negotiation process.</p>
               ) : (
                 <motion.div 
                   key={currentStep}
                   initial={animate ? { opacity: 0 } : false}
                   animate={{ opacity: 1 }}
                   className="font-mono text-xs text-foreground leading-relaxed"
                 >
                   <span className="text-terminal font-bold mb-1 block">Step {currentStep}: {STEPS[currentStep - 1].name}</span>
                   {STEPS[currentStep - 1].desc}
                 </motion.div>
               )}
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-4 font-mono text-xs">
               <h3 className="mb-3 uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Key className="size-3" /> Key Inventory</h3>
               
               <div className="space-y-3">
                 <div className={`flex flex-col border-l-2 pl-2 ${currentStep >= 2 ? 'border-amber-500' : 'border-border'}`}>
                   <span className="text-xs text-muted-foreground">Server Public Key</span>
                   <span className={currentStep >= 2 ? 'text-amber-500' : 'text-muted-foreground'}>{currentStep >= 2 ? 'Transmitted in Cert' : 'Unknown'}</span>
                 </div>
                 
                 <div className={`flex flex-col border-l-2 pl-2 ${currentStep >= 3 ? 'border-fuchsia-400' : 'border-border'}`}>
                   <span className="text-xs text-muted-foreground">Premaster Secret</span>
                   <span className={currentStep >= 3 ? 'text-fuchsia-400' : 'text-muted-foreground'}>{currentStep >= 3 ? 'Encrypted with PubKey' : 'Not generated'}</span>
                 </div>

                 <div className={`flex flex-col border-l-2 pl-2 ${currentStep >= 4 ? 'border-terminal' : 'border-border'}`}>
                   <span className="text-xs text-muted-foreground">Symmetric Session Key</span>
                   <span className={currentStep >= 4 ? 'text-terminal font-bold shadow-[0_0_5px_rgba(20,184,166,0.5)]' : 'text-muted-foreground'}>{currentStep >= 4 ? 'Derived & Active' : 'Not derived'}</span>
                 </div>
               </div>
            </div>
         </div>
      </div>

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          The TLS Handshake solves the chicken-and-egg problem of secure communication over an insecure network. 
          It uses slow, computationally expensive <strong>Asymmetric Encryption</strong> (Public/Private keys) to securely exchange a secret, which is then used to generate a fast <strong>Symmetric Key</strong> for all subsequent communication.
        </p>
      </div>
    </div>
  );
}
