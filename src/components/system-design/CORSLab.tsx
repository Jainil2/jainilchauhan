import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Globe,
  Server,
} from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

type Method = "GET" | "POST" | "PUT" | "DELETE";

const METHODS: Method[] = ["GET", "POST", "PUT", "DELETE"];
const SIMPLE_METHODS: Method[] = ["GET", "POST"];

export function CORSLab() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [originA, setOriginA] = useState("https://myapp.com");
  const [originB, setOriginB] = useState("https://api.myapp.com");
  const [method, setMethod] = useState<Method>("GET");
  const [allowedOrigin, setAllowedOrigin] = useState("https://myapp.com");
  const [serverAllowsCors, setServerAllowsCors] = useState(true);

  const [step, setStep] = useState<
    "idle" | "preflight" | "response" | "request" | "blocked" | "allowed"
  >("idle");

  function reset() {
    setStep("idle");
  }

  function simulate() {
    reset();
    const isCrossOrigin = originA !== originB;
    const needsPreflight = !SIMPLE_METHODS.includes(method) || method === "POST"; // simplified
    const allowed = allowedOrigin === originA || allowedOrigin === "*";

    if (!isCrossOrigin) {
      setStep("allowed");
      return;
    }

    // Cross origin path
    if (needsPreflight && !SIMPLE_METHODS.includes(method)) {
      setStep("preflight");
      setTimeout(() => {
        if (allowed && serverAllowsCors) {
          setStep("response");
          setTimeout(() => {
            setStep("request");
            setTimeout(() => {
              setStep("allowed");
            }, 800);
          }, 800);
        } else {
          setStep("blocked");
        }
      }, 1200);
    } else {
      setStep("request");
      setTimeout(() => {
        if (allowed && serverAllowsCors) {
          setStep("allowed");
        } else {
          setStep("blocked");
        }
      }, 1000);
    }
  }

  const isCrossOrigin = originA !== originB;
  const needsPreflight = !SIMPLE_METHODS.includes(method);
  const isAllowed = (allowedOrigin === originA || allowedOrigin === "*") && serverAllowsCors;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={simulate}
          disabled={step !== "idle" && step !== "allowed" && step !== "blocked"}
          className="flex items-center gap-1.5 rounded-md border border-terminal/40 bg-terminal/10 px-4 py-2 font-mono text-xs text-terminal hover:bg-terminal/20 disabled:opacity-50"
        >
          <Play className="size-3" /> Simulate Request
        </button>

        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" /> reset
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        {/* Config Panel */}
        <div className="space-y-4 font-mono text-xs">
          <div className="rounded-xl border border-border bg-card/40 p-4">
            <h3 className="mb-3 uppercase tracking-wider text-muted-foreground">Browser Origin</h3>
            <input
              type="text"
              value={originA}
              onChange={(e) => {
                setOriginA(e.target.value);
                reset();
              }}
              className="w-full rounded border border-border bg-background px-2 py-1.5 outline-none focus:border-cyan-accent/50"
            />
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-4">
            <h3 className="mb-3 uppercase tracking-wider text-muted-foreground">
              API Server Origin
            </h3>
            <input
              type="text"
              value={originB}
              onChange={(e) => {
                setOriginB(e.target.value);
                reset();
              }}
              className="w-full rounded border border-border bg-background px-2 py-1.5 outline-none focus:border-amber-500/50 mb-3"
            />
            <h4 className="mb-1 text-muted-foreground text-xs">Request Method</h4>
            <div className="flex flex-wrap gap-1">
              {METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMethod(m);
                    reset();
                  }}
                  className={`rounded px-2 py-1 text-xs font-bold transition-colors ${method === m ? "bg-amber-500/20 text-amber-500 border border-amber-500/40" : "bg-secondary/50 text-muted-foreground"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-4">
            <h3 className="mb-3 uppercase tracking-wider text-terminal flex items-center gap-2">
              <Server className="size-3" /> Server CORS Config
            </h3>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <div
                onClick={() => {
                  setServerAllowsCors((v) => !v);
                  reset();
                }}
                className={`relative h-5 w-9 rounded-full transition-colors ${serverAllowsCors ? "bg-terminal" : "bg-muted-foreground/30"}`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${serverAllowsCors ? "translate-x-4" : ""}`}
                />
              </div>
              <span className={serverAllowsCors ? "text-terminal" : "text-muted-foreground"}>
                CORS Enabled
              </span>
            </label>

            <h4 className="mb-1 text-muted-foreground text-xs">Access-Control-Allow-Origin</h4>
            <input
              type="text"
              value={allowedOrigin}
              onChange={(e) => {
                setAllowedOrigin(e.target.value);
                reset();
              }}
              className="w-full rounded border border-border bg-background px-2 py-1.5 outline-none focus:border-terminal/50"
            />
          </div>
        </div>

        {/* Sequence Visualization */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card/40 p-6 min-h-[300px]">
            <div className="flex justify-between mb-8 font-mono text-sm uppercase tracking-wider text-muted-foreground px-4">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex size-14 items-center justify-center rounded-full border-2 transition-all ${step !== "idle" ? "border-cyan-accent text-cyan-accent bg-cyan-accent/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "border-border text-muted-foreground"}`}
                >
                  <Globe className="size-7" />
                </div>
                <span className="text-xs">Browser</span>
                <span className="text-xs text-cyan-accent/80 break-all text-center max-w-[120px]">
                  {originA}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex size-14 items-center justify-center rounded-full border-2 transition-all ${step !== "idle" ? "border-amber-500 text-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "border-border text-muted-foreground"}`}
                >
                  <Server className="size-7" />
                </div>
                <span className="text-xs">API Server</span>
                <span className="text-xs text-amber-500/80 break-all text-center max-w-[120px]">
                  {originB}
                </span>
              </div>
            </div>

            <div className="relative mx-12 space-y-4">
              {step !== "idle" && (
                <>
                  {/* Same origin short-circuit */}
                  {!isCrossOrigin && (
                    <motion.div
                      initial={animate ? { opacity: 0 } : false}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center"
                    >
                      <div className="rounded-full border border-terminal/50 bg-terminal/10 px-6 py-2 font-mono text-xs text-terminal">
                        Same-Origin — No CORS required
                      </div>
                    </motion.div>
                  )}

                  {/* Preflight */}
                  {isCrossOrigin &&
                    (step === "preflight" ||
                      step === "response" ||
                      step === "request" ||
                      step === "allowed" ||
                      step === "blocked") &&
                    needsPreflight && (
                      <motion.div
                        initial={animate ? { opacity: 0, x: -20 } : false}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                      >
                        <div className="h-0.5 flex-1 border-b-2 border-dashed border-fuchsia-400/50" />
                        <div className="rounded-lg border border-fuchsia-400/50 bg-background px-3 py-1.5 font-mono text-xs text-fuchsia-400">
                          OPTIONS Preflight →
                        </div>
                      </motion.div>
                    )}

                  {/* Server response to preflight */}
                  {isCrossOrigin &&
                    (step === "response" || step === "request" || step === "allowed") &&
                    needsPreflight && (
                      <motion.div
                        initial={animate ? { opacity: 0, x: 20 } : false}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 justify-end"
                      >
                        <div className="rounded-lg border border-terminal/50 bg-background px-3 py-1.5 font-mono text-xs text-terminal">
                          ← 200 OK + CORS Headers
                        </div>
                        <div className="h-0.5 flex-1 border-b-2 border-dashed border-terminal/50" />
                      </motion.div>
                    )}

                  {/* Actual request */}
                  {(step === "request" || step === "allowed") && (
                    <motion.div
                      initial={animate ? { opacity: 0, x: -20 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3"
                    >
                      <div className="h-0.5 flex-1 border-b-2 border-solid border-cyan-accent/60" />
                      <div className="rounded-lg border border-cyan-accent/50 bg-background px-3 py-1.5 font-mono text-xs text-cyan-accent">
                        {method} Actual Request →
                      </div>
                    </motion.div>
                  )}

                  {/* Final result */}
                  {(step === "allowed" || step === "blocked") && (
                    <motion.div
                      initial={animate ? { scale: 0.8, opacity: 0 } : false}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center justify-center pt-2"
                    >
                      {step === "allowed" ? (
                        <div className="flex items-center gap-2 rounded-full border border-terminal/50 bg-terminal/10 px-6 py-3 font-mono text-sm font-bold text-terminal shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                          <ShieldCheck className="size-4" /> Request Allowed
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-full border border-destructive/50 bg-destructive/10 px-6 py-3 font-mono text-sm font-bold text-destructive shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                          <ShieldAlert className="size-4" /> CORS Blocked by Browser
                        </div>
                      )}
                    </motion.div>
                  )}
                </>
              )}

              {step === "idle" && (
                <div className="flex h-24 items-center justify-center font-mono text-xs text-muted-foreground">
                  Configure and click "Simulate Request"
                </div>
              )}
            </div>
          </div>

          {/* Analysis */}
          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div
              className={`rounded-xl border p-3 ${isCrossOrigin ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card/40"}`}
            >
              <span className="text-muted-foreground text-xs uppercase tracking-wider">
                Cross-Origin?
              </span>
              <div
                className={`font-bold mt-1 ${isCrossOrigin ? "text-amber-500" : "text-terminal"}`}
              >
                {isCrossOrigin ? "Yes ⚡" : "No ✓"}
              </div>
            </div>
            <div
              className={`rounded-xl border p-3 ${needsPreflight && isCrossOrigin ? "border-fuchsia-400/30 bg-fuchsia-400/5" : "border-border bg-card/40"}`}
            >
              <span className="text-muted-foreground text-xs uppercase tracking-wider">
                Preflight Needed?
              </span>
              <div
                className={`font-bold mt-1 ${needsPreflight && isCrossOrigin ? "text-fuchsia-400" : "text-muted-foreground"}`}
              >
                {isCrossOrigin && needsPreflight ? "Yes (non-simple method)" : "No"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          CORS (Cross-Origin Resource Sharing) is enforced by the <strong>browser</strong>, not the
          server. For "complex" requests (like <code>PUT</code>, <code>DELETE</code>, or custom
          headers), the browser first sends an <code>OPTIONS</code> preflight to ask the server what
          it allows. The server responds with <code>Access-Control-Allow-Origin</code>, and the
          browser decides whether to proceed.
        </p>
      </div>
    </div>
  );
}
