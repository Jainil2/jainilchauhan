import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, RotateCcw, ShieldCheck, ShieldAlert } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

function base64urlDecode(str: string) {
  try {
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  } catch (e) {
    return null;
  }
}

function base64urlEncode(str: string) {
  try {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    return "";
  }
}

export function JWTAnatomy() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const defaultHeader = { alg: "HS256", typ: "JWT" };
  const defaultPayload = { sub: "1234567890", name: "John Doe", admin: false, iat: 1516239022 };
  
  const h = base64urlEncode(JSON.stringify(defaultHeader));
  const p = base64urlEncode(JSON.stringify(defaultPayload));
  const s = "mock_signature_SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  
  const defaultToken = `${h}.${p}.${s}`;

  const [token, setToken] = useState(defaultToken);
  const [headerJson, setHeaderJson] = useState(JSON.stringify(defaultHeader, null, 2));
  const [payloadJson, setPayloadJson] = useState(JSON.stringify(defaultPayload, null, 2));
  const [signature, setSignature] = useState(s);
  
  const [isValid, setIsValid] = useState(true);

  function handleTokenChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
     const val = e.target.value;
     setToken(val);
     
     const parts = val.split('.');
     if (parts.length === 3) {
        const decodedHeader = base64urlDecode(parts[0]);
        if (decodedHeader) {
           try { setHeaderJson(JSON.stringify(JSON.parse(decodedHeader), null, 2)); } catch(e) { setHeaderJson(decodedHeader); }
        } else setHeaderJson("");
        
        const decodedPayload = base64urlDecode(parts[1]);
        if (decodedPayload) {
           try { setPayloadJson(JSON.stringify(JSON.parse(decodedPayload), null, 2)); } catch(e) { setPayloadJson(decodedPayload); }
        } else setPayloadJson("");
        
        setSignature(parts[2]);
        setIsValid(val === defaultToken);
     } else {
        setIsValid(false);
     }
  }

  function handlePayloadChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
     const val = e.target.value;
     setPayloadJson(val);
     
     const newP = base64urlEncode(val);
     const parts = token.split('.');
     const newToken = `${parts[0] || h}.${newP}.${parts[2] || signature}`;
     setToken(newToken);
     setIsValid(newToken === defaultToken);
  }

  function reset() {
    setToken(defaultToken);
    setHeaderJson(JSON.stringify(defaultHeader, null, 2));
    setPayloadJson(JSON.stringify(defaultPayload, null, 2));
    setSignature(s);
    setIsValid(true);
  }

  const parts = token.split('.');
  const p1 = parts[0] || "";
  const p2 = parts[1] || "";
  const p3 = parts[2] || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           {isValid ? (
             <div className="flex items-center gap-2 rounded-md bg-terminal/10 px-3 py-1.5 font-mono text-xs text-terminal border border-terminal/30">
               <ShieldCheck className="size-4" /> Signature Verified
             </div>
           ) : (
             <motion.div 
               initial={false}
               animate={animate ? { x: [-5, 5, -5, 5, 0] } : false}
               className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-1.5 font-mono text-xs text-destructive border border-destructive/30"
             >
               <ShieldAlert className="size-4" /> Invalid Signature
             </motion.div>
           )}
        </div>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" /> reset
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* Token Input */}
         <div className="rounded-xl border border-border bg-card/40 p-4">
            <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Encoded Token</h3>
            <div className="relative h-48 w-full overflow-hidden rounded-md border border-border/50 bg-background/50 font-mono text-sm leading-relaxed break-all">
               <textarea
                 value={token}
                 onChange={handleTokenChange}
                 className="absolute inset-0 size-full resize-none bg-transparent p-4 text-transparent outline-none caret-foreground z-10"
                 spellCheck="false"
               />
               <div className="absolute inset-0 size-full p-4 pointer-events-none">
                 <span className="text-fuchsia-400">{p1}</span>
                 {p2 && <span className="text-muted-foreground">.</span>}
                 <span className="text-amber-500">{p2}</span>
                 {p3 && <span className="text-muted-foreground">.</span>}
                 <span className="text-cyan-accent">{p3}</span>
               </div>
            </div>
         </div>

         {/* Decoded Output */}
         <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card/40 p-4">
               <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-fuchsia-400">Header: Algorithm & Token Type</h3>
               <textarea
                 value={headerJson}
                 readOnly
                 className="w-full resize-none rounded bg-background/50 p-2 font-mono text-xs text-fuchsia-400/80 outline-none"
                 rows={3}
               />
            </div>
            
            <div className="rounded-xl border border-border bg-card/40 p-4 relative group">
               <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-amber-500 flex items-center justify-between">
                 <span>Payload: Data</span>
                 <span className="text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded opacity-0 transition-opacity group-hover:opacity-100">Editable!</span>
               </h3>
               <textarea
                 value={payloadJson}
                 onChange={handlePayloadChange}
                 className="w-full resize-none rounded border border-transparent bg-background/50 p-2 font-mono text-xs text-amber-500/80 outline-none focus:border-amber-500/30 transition-colors"
                 rows={6}
               />
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-4">
               <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-cyan-accent">Verify Signature</h3>
               <p className="font-mono text-xs text-cyan-accent/80 break-all leading-tight">
                 {signature}
               </p>
            </div>
         </div>
      </div>

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          A JSON Web Token (JWT) consists of three base64-url encoded parts separated by dots: Header, Payload, and Signature. 
          The data in the payload is <strong>publicly readable</strong>. 
          If a malicious user modifies the payload (try editing the JSON above!), the cryptographic signature will no longer match the hashed content, allowing the server to reject the tampered token.
        </p>
      </div>
    </div>
  );
}
