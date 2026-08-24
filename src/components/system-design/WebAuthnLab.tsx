import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw, Fingerprint, ShieldCheck, ShieldAlert, KeySquare, User, Server, Smartphone } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

type Phase = "idle" | "register" | "register_challenge" | "register_key" | "register_done" | "auth" | "auth_challenge" | "auth_sign" | "auth_done" | "auth_fail";

export function WebAuthnLab() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [phase, setPhase] = useState<Phase>("idle");
  const [username, setUsername] = useState("alice@example.com");
  const [registered, setRegistered] = useState(false);
  const [signWithWrongKey, setSignWithWrongKey] = useState(false);
  const [serverState, setServerState] = useState<{ challenge: string; publicKey: string } | null>(null);

  function mockHex(len: number) {
    return Array.from({ length: len }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  }

  async function register() {
    setPhase("register");
    await sleep(600);

    const challenge = mockHex(16);
    setServerState({ challenge, publicKey: "" });
    setPhase("register_challenge");
    await sleep(1200);

    const pubKey = mockHex(32);
    setServerState({ challenge, publicKey: pubKey });
    setPhase("register_key");
    await sleep(1000);

    setRegistered(true);
    setPhase("register_done");
  }

  async function authenticate() {
    if (!registered || !serverState) return;
    setPhase("auth");
    await sleep(600);

    const newChallenge = mockHex(16);
    setPhase("auth_challenge");
    await sleep(1200);

    setPhase("auth_sign");
    await sleep(1000);

    if (signWithWrongKey) {
      setPhase("auth_fail");
    } else {
      setPhase("auth_done");
    }
  }

  function reset() {
    setPhase("idle");
    setRegistered(false);
    setServerState(null);
    setSignWithWrongKey(false);
  }

  function sleep(ms: number) {
    return new Promise(r => setTimeout(r, animate ? ms : 0));
  }

  const isIdle = phase === "idle";
  const isRegistered = phase === "register_done" || registered;
  const isAuthDone = phase === "auth_done" || phase === "auth_fail";

  const logEntries: { msg: string; color: string }[] = [];
  if (phase !== "idle") {
    logEntries.push({ msg: `User: ${username}`, color: "text-muted-foreground" });
    if (phase === "register" || phase === "register_challenge" || phase === "register_key" || phase === "register_done") {
      logEntries.push({ msg: "→ Registration: Server sends challenge", color: "text-amber-500" });
      if (phase !== "register") logEntries.push({ msg: `← Challenge: ${serverState?.challenge}`, color: "text-fuchsia-400" });
      if (phase === "register_key" || phase === "register_done") logEntries.push({ msg: "→ Authenticator generates key pair", color: "text-cyan-accent" });
      if (phase === "register_done") {
        logEntries.push({ msg: `→ Public key sent to server: ${serverState?.publicKey.slice(0, 16)}...`, color: "text-terminal" });
        logEntries.push({ msg: "✓ Registration complete. Private key stays on device.", color: "text-terminal font-bold" });
      }
    }
    if (phase === "auth" || phase === "auth_challenge" || phase === "auth_sign" || phase === "auth_done" || phase === "auth_fail") {
      logEntries.push({ msg: "→ Authentication: Server sends new challenge", color: "text-amber-500" });
      if (phase !== "auth") logEntries.push({ msg: "← Authenticator signs challenge with private key", color: "text-cyan-accent" });
      if (phase === "auth_sign" || phase === "auth_done" || phase === "auth_fail") logEntries.push({ msg: "→ Signed assertion sent to server", color: "text-fuchsia-400" });
      if (phase === "auth_done") logEntries.push({ msg: "✓ Server verifies signature with stored public key.", color: "text-terminal font-bold" });
      if (phase === "auth_fail") logEntries.push({ msg: "✗ Signature verification FAILED. Wrong private key.", color: "text-destructive font-bold" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
           <input
             type="text"
             value={username}
             onChange={e => setUsername(e.target.value)}
             disabled={phase !== "idle" && phase !== "register_done" && phase !== "auth_done" && phase !== "auth_fail"}
             className="rounded border border-border bg-background px-2 py-1.5 font-mono text-xs outline-none focus:border-terminal/50 disabled:opacity-50 w-44"
             placeholder="username@example.com"
           />

           <button
             onClick={register}
             disabled={phase !== "idle"}
             className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-mono text-xs text-amber-500 hover:bg-amber-500/20 disabled:opacity-50"
           >
             <KeySquare className="size-3" /> Register
           </button>

           <button
             onClick={authenticate}
             disabled={!registered || (phase !== "register_done" && phase !== "auth_done" && phase !== "auth_fail")}
             className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 font-mono text-xs text-terminal hover:bg-terminal/20 disabled:opacity-50"
           >
             <Fingerprint className="size-3" /> Authenticate
           </button>
        </div>

        <div className="flex items-center gap-4">
           <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-muted-foreground hover:text-foreground">
             <div
               onClick={() => setSignWithWrongKey(v => !v)}
               className={`relative h-4 w-8 rounded-full transition-colors ${signWithWrongKey ? 'bg-destructive' : 'bg-muted-foreground/30'}`}
             >
               <div className={`absolute top-0.5 left-0.5 size-3 rounded-full bg-white transition-transform ${signWithWrongKey ? 'translate-x-4' : ''}`} />
             </div>
             Simulate wrong key
           </label>
           
           <button
             onClick={reset}
             className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
           >
             <RotateCcw className="size-3" /> reset
           </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_250px]">
        {/* Flow Diagram */}
        <div className="rounded-xl border border-border bg-card/40 p-6 min-h-[360px]">
           <div className="flex justify-between mb-8 px-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
             <div className="flex flex-col items-center gap-2">
               <div className={`flex size-14 items-center justify-center rounded-full border-2 transition-all duration-500 ${phase !== 'idle' ? 'border-cyan-accent text-cyan-accent bg-cyan-accent/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-border text-muted-foreground'}`}>
                 <Smartphone className="size-7" />
               </div>
               <span>Device</span>
               <span className="text-xs text-cyan-accent/70">(Authenticator)</span>
             </div>

             <div className="flex flex-col items-center gap-2">
               <div className={`flex size-14 items-center justify-center rounded-full border-2 transition-all duration-500 ${phase !== 'idle' ? 'border-amber-500 text-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-border text-muted-foreground'}`}>
                 <Server className="size-7" />
               </div>
               <span>Server</span>
               <span className="text-xs text-amber-500/70">(Relying Party)</span>
             </div>
           </div>

           <div className="relative mx-12 space-y-4">
             {phase === "idle" && (
               <div className="flex h-24 items-center justify-center font-mono text-xs text-muted-foreground">
                 Click "Register" to begin the WebAuthn flow
               </div>
             )}
             
             {logEntries.map((entry, i) => (
               <motion.div 
                 key={i}
                 initial={animate ? { opacity: 0, y: -8 } : false}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className={`flex items-center gap-3 font-mono text-xs ${entry.color}`}
               >
                 <div className="h-0.5 w-full border-b border-border/30" />
                 <span className="shrink-0 rounded bg-background/80 border border-border/50 px-2 py-1 text-center min-w-max">{entry.msg}</span>
                 <div className="h-0.5 w-full border-b border-border/30" />
               </motion.div>
             ))}

             {phase === "auth_done" && (
               <motion.div initial={animate ? { scale: 0.8, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} className="flex justify-center pt-2">
                 <div className="flex items-center gap-2 rounded-full border border-terminal/50 bg-terminal/10 px-6 py-3 font-mono text-sm font-bold text-terminal shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                   <ShieldCheck className="size-4" /> Authentication Successful
                 </div>
               </motion.div>
             )}

             {phase === "auth_fail" && (
               <motion.div initial={animate ? { x: [-8, 8, -8, 8, 0] } : false} animate={{ x: 0 }} className="flex justify-center pt-2">
                 <div className="flex items-center gap-2 rounded-full border border-destructive/50 bg-destructive/10 px-6 py-3 font-mono text-sm font-bold text-destructive shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                   <ShieldAlert className="size-4" /> Authentication Failed
                 </div>
               </motion.div>
             )}
           </div>
        </div>

        {/* Key Store */}
        <div className="space-y-4 font-mono text-xs">
           <div className="rounded-xl border border-border bg-card/40 p-4">
             <h3 className="mb-3 flex items-center gap-2 uppercase tracking-wider text-cyan-accent">
               <Smartphone className="size-3" /> Device Key Store
             </h3>
             <div className={`space-y-2 border rounded p-2 ${registered ? 'border-cyan-accent/30 bg-cyan-accent/5' : 'border-border bg-background/50'}`}>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Private Key</span>
                 <span className={registered ? 'text-cyan-accent' : 'text-muted-foreground'}>{registered ? "Stored (secure)" : "—"}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Biometric</span>
                 <span className={registered ? 'text-cyan-accent' : 'text-muted-foreground'}>{registered ? "Required" : "—"}</span>
               </div>
             </div>
             <p className="mt-2 text-xs text-muted-foreground">Private key never leaves the device hardware.</p>
           </div>

           <div className="rounded-xl border border-border bg-card/40 p-4">
             <h3 className="mb-3 flex items-center gap-2 uppercase tracking-wider text-amber-500">
               <Server className="size-3" /> Server Credential DB
             </h3>
             <div className={`space-y-2 border rounded p-2 ${serverState?.publicKey ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-background/50'}`}>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Username</span>
                 <span className={serverState ? 'text-amber-500' : 'text-muted-foreground'}>{serverState ? username : "—"}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-muted-foreground">Public Key</span>
                 <span className={serverState?.publicKey ? 'text-amber-500/80 break-all text-xs' : 'text-muted-foreground'}>{serverState?.publicKey ? serverState.publicKey.slice(0, 24) + "..." : "—"}</span>
               </div>
             </div>
             <p className="mt-2 text-xs text-muted-foreground">Server only stores the public key — never passwords.</p>
           </div>
        </div>
      </div>

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          WebAuthn eliminates passwords entirely. During <strong>Registration</strong>, the authenticator generates a key pair on-device and sends only the public key to the server. During <strong>Authentication</strong>, the server sends a challenge, the authenticator signs it with the private key (requiring biometric confirmation), and the server verifies the signature. Even if the server is breached, there is no password hash to crack.
        </p>
      </div>
    </div>
  );
}
