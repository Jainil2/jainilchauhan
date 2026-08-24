import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useControlPlane } from "@/lib/useControlPlane";

/* ─── Protocol model ─────────────────────────────────────────────────────── */

type ActorId = "ua" | "client" | "authz" | "rs";

interface Actor {
  id: ActorId;
  label: string;
  role: string;
  x: number;
  y: number;
  color: string;
}

const ACTORS: Actor[] = [
  { id: "ua", label: "User-Agent", role: "browser", x: 60, y: 60, color: "oklch(0.78 0.16 200)" },
  {
    id: "client",
    label: "Client App",
    role: "spa / mobile",
    x: 60,
    y: 220,
    color: "oklch(0.75 0.18 310)",
  },
  {
    id: "authz",
    label: "AuthZ Server",
    role: "Ory Hydra / OIDC OP",
    x: 360,
    y: 60,
    color: "oklch(0.85 0.21 150)",
  },
  { id: "rs", label: "Resource Server", role: "API", x: 360, y: 220, color: "oklch(0.8 0.14 70)" },
];

interface Step {
  id: string;
  from: ActorId;
  to: ActorId;
  label: string;
  detail: string;
  /** Whether this step exchanges a PKCE-related value; used to show/hide verifier+challenge. */
  kind: "request" | "redirect" | "token" | "api" | "verify";
  payload?: string;
}

type FlowKind = "pkce" | "implicit" | "replay" | "tampered";

/**
 * Stepwise packet script for each scenario. Each entry is one hop of the
 * OAuth 2.0 / OIDC dance.
 */
function buildSteps(kind: FlowKind): Step[] {
  switch (kind) {
    case "pkce":
      return [
        {
          id: "s1",
          from: "client",
          to: "ua",
          label: "generate code_verifier + code_challenge",
          detail: "client picks a random 43-char verifier, then S256(verifier) → challenge.",
          kind: "verify",
          payload: "code_challenge=<S256(verifier)>",
        },
        {
          id: "s2",
          from: "ua",
          to: "authz",
          label: "GET /authorize?code_challenge_method=S256&code_challenge=…",
          detail: "redirect to the AuthZ server with the challenge (public).",
          kind: "redirect",
          payload: "response_type=code",
        },
        {
          id: "s3",
          from: "authz",
          to: "ua",
          label: "user logs in, grants consent",
          detail: "AuthZ server authenticates the user (SSO, MFA, whatever the policy says).",
          kind: "request",
        },
        {
          id: "s4",
          from: "authz",
          to: "ua",
          label: "302 → redirect_uri?code=abc123",
          detail: "short-lived authz code issued; bound to code_challenge.",
          kind: "redirect",
          payload: "code=abc123",
        },
        {
          id: "s5",
          from: "ua",
          to: "client",
          label: "callback with code",
          detail: "user-agent hands the code back to the client app.",
          kind: "redirect",
          payload: "code=abc123",
        },
        {
          id: "s6",
          from: "client",
          to: "authz",
          label: "POST /token  { code, code_verifier }",
          detail: "client exchanges code + original verifier (secret this time).",
          kind: "token",
          payload: "code_verifier=<verifier>",
        },
        {
          id: "s7",
          from: "authz",
          to: "client",
          label: "200 { access_token, id_token, refresh_token }",
          detail: "AuthZ server verifies S256(verifier) === challenge → issues tokens.",
          kind: "token",
          payload: "id_token (signed JWT)",
        },
        {
          id: "s8",
          from: "client",
          to: "rs",
          label: "GET /api/me  Authorization: Bearer …",
          detail: "access_token presented to the resource server.",
          kind: "api",
          payload: "Bearer <access_token>",
        },
        {
          id: "s9",
          from: "rs",
          to: "client",
          label: "200 { profile }",
          detail: "resource server validates signature + scope + audience.",
          kind: "api",
        },
      ];
    case "implicit":
      return [
        {
          id: "i1",
          from: "ua",
          to: "authz",
          label: "GET /authorize?response_type=token",
          detail: "legacy implicit flow — no code, no PKCE, token comes back in the URL fragment.",
          kind: "redirect",
        },
        {
          id: "i2",
          from: "authz",
          to: "ua",
          label: "302 → redirect_uri#access_token=…",
          detail: "access_token leaks into the URL fragment / browser history / referer.",
          kind: "redirect",
          payload: "#access_token=… (unsafe)",
        },
        {
          id: "i3",
          from: "ua",
          to: "client",
          label: "callback with token in fragment",
          detail: "any browser extension, analytics script, or logger can read this.",
          kind: "redirect",
        },
      ];
    case "replay":
      return [
        {
          id: "r1",
          from: "client",
          to: "authz",
          label: "POST /token  { code=abc123 }  (stolen)",
          detail: "attacker intercepted the code — but has no code_verifier.",
          kind: "token",
          payload: "code_verifier=MISSING",
        },
        {
          id: "r2",
          from: "authz",
          to: "client",
          label: "400 invalid_grant",
          detail: "S256(verifier) !== stored challenge → AuthZ rejects. PKCE saved the day.",
          kind: "token",
        },
      ];
    case "tampered":
      return [
        {
          id: "t1",
          from: "client",
          to: "authz",
          label: "POST /token  { code_verifier=WRONG }",
          detail: "client bug or MITM swapped the verifier.",
          kind: "token",
          payload: "code_verifier=WRONG",
        },
        {
          id: "t2",
          from: "authz",
          to: "client",
          label: "400 invalid_grant (PKCE mismatch)",
          detail: "challenge != S256(verifier). Same defense, different cause.",
          kind: "token",
        },
      ];
  }
}

const FLOW_META: Record<FlowKind, { title: string; tone: "ok" | "warn" | "bad"; note: string }> = {
  pkce: {
    title: "Authz Code + PKCE (recommended)",
    tone: "ok",
    note: "The happy path. What /authorize + /token should look like in 2024.",
  },
  implicit: {
    title: "Implicit flow (deprecated)",
    tone: "bad",
    note: "Tokens land in the URL fragment — don't use this.",
  },
  replay: {
    title: "Replay attack → defended by PKCE",
    tone: "warn",
    note: "Attacker replays a stolen authz code without the verifier.",
  },
  tampered: {
    title: "Tampered verifier → rejected",
    tone: "warn",
    note: "Same S256(verifier) === challenge check catches MITM.",
  },
};

/* ─── Component ───────────────────────────────────────────────────────────── */

interface OIDCFlowProps {
  onMeaningfulInteraction?: () => void;
}

export function OIDCFlow({ onMeaningfulInteraction }: OIDCFlowProps) {
  const reduce = useReducedMotion();
  const envMode = useControlPlane((s) => s.env);
  const [flow, setFlow] = useState<FlowKind>("pkce");
  const steps = useMemo(() => buildSteps(flow), [flow]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [log, setLog] = useState<string[]>([]);
  const [verifier, setVerifier] = useState<string>("");
  const [challenge, setChallenge] = useState<string>("");
  const [autoplay, setAutoplay] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meta = FLOW_META[flow];
  const interactionRef = useRef(0);

  const fireInteraction = useCallback(() => {
    interactionRef.current += 1;
    if (interactionRef.current === 2) onMeaningfulInteraction?.();
  }, [onMeaningfulInteraction]);

  useEffect(() => {
    // Reset when switching flow
    setStepIdx(-1);
    setLog([]);
    setVerifier("");
    setChallenge("");
  }, [flow]);

  useEffect(() => {
    if (!autoplay) return;
    if (stepIdx >= steps.length - 1) {
      setAutoplay(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      advance();
    }, 1100);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, stepIdx]);

  async function advance() {
    const next = stepIdx + 1;
    if (next >= steps.length) return;
    const step = steps[next];
    setStepIdx(next);
    setLog((prev) => [`${stepTag(step.kind)} ${step.label}`, ...prev].slice(0, 8));

    // Fill in PKCE values for the first step of the happy path
    if (flow === "pkce" && step.id === "s1") {
      const v = makeVerifier();
      const c = await s256(v);
      setVerifier(v);
      setChallenge(c);
    }
  }

  function reset() {
    setStepIdx(-1);
    setLog([]);
    setVerifier("");
    setChallenge("");
    setAutoplay(false);
  }

  function play() {
    if (stepIdx >= steps.length - 1) reset();
    fireInteraction();
    setAutoplay(true);
  }

  const activeStep = stepIdx >= 0 ? steps[stepIdx] : null;

  return (
    <div className="space-y-4">
      {/* Scenario selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FLOW_META) as FlowKind[]).map((k) => {
          const active = k === flow;
          return (
            <button
              key={k}
              onClick={() => {
                setFlow(k);
                fireInteraction();
              }}
              className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
                active
                  ? toneBorder(FLOW_META[k].tone) +
                    " " +
                    toneBg(FLOW_META[k].tone) +
                    " " +
                    toneText(FLOW_META[k].tone)
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {FLOW_META[k].title}
            </button>
          );
        })}
      </div>

      <p className="font-mono text-xs text-muted-foreground">
        <span className={toneText(meta.tone)}>// </span>
        {meta.note}
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={play}
          className="rounded-md border border-terminal/40 bg-terminal/10 px-3 py-1.5 font-mono text-xs text-terminal hover:bg-terminal/20"
        >
          ▶ play
        </button>
        <button
          onClick={advance}
          disabled={stepIdx >= steps.length - 1}
          className="rounded-md border border-border bg-secondary/50 px-3 py-1.5 font-mono text-xs text-foreground hover:bg-secondary disabled:opacity-40"
        >
          step ›
        </button>
        <button
          onClick={reset}
          className="rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          reset
        </button>
        <span className="ml-auto self-center font-mono text-xs text-muted-foreground">
          step {Math.max(0, stepIdx + 1)} / {steps.length}
        </span>
      </div>

      {/* SVG diagram */}
      <div className="rounded-md border border-border bg-background/40 p-2">
        <svg
          viewBox="0 0 440 300"
          className="h-[320px] w-full"
          role="img"
          aria-label="OAuth 2.0 / OIDC flow diagram"
        >
          {/* Wires between all actors */}
          {ACTORS.flatMap((a, i) =>
            ACTORS.slice(i + 1).map((b) => (
              <line
                key={`${a.id}-${b.id}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--border)"
                strokeDasharray="2 4"
                strokeWidth={1}
              />
            )),
          )}

          {/* Animated packet for the active step */}
          <AnimatePresence>
            {activeStep && (
              <motion.g key={`pkt-${stepIdx}-${activeStep.id}`}>
                <motion.circle
                  r={6}
                  fill={packetColor(activeStep.kind)}
                  style={{ filter: `drop-shadow(0 0 6px ${packetColor(activeStep.kind)})` }}
                  initial={{
                    cx: actorPos(activeStep.from).x,
                    cy: actorPos(activeStep.from).y,
                    opacity: 0,
                  }}
                  animate={{
                    cx: actorPos(activeStep.to).x,
                    cy: actorPos(activeStep.to).y,
                    opacity: 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.75, ease: "easeInOut" }}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Actors */}
          {ACTORS.map((a) => (
            <g key={a.id}>
              <rect
                x={a.x - 58}
                y={a.y - 22}
                width={116}
                height={44}
                rx={6}
                fill="oklch(0.20 0.02 150)"
                stroke={a.color}
                strokeWidth={1.5}
              />
              <text
                x={a.x}
                y={a.y - 4}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize={11}
                fill={a.color}
                fontWeight={600}
              >
                {a.label}
              </text>
              <text
                x={a.x}
                y={a.y + 12}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize={9}
                fill="var(--muted-foreground)"
              >
                {a.role}
              </text>
            </g>
          ))}

          {/* Step label above packet */}
          {activeStep && (
            <g>
              <rect
                x={(actorPos(activeStep.from).x + actorPos(activeStep.to).x) / 2 - 110}
                y={(actorPos(activeStep.from).y + actorPos(activeStep.to).y) / 2 - 28}
                width={220}
                height={20}
                rx={4}
                fill="oklch(0.14 0.02 150 / 90%)"
                stroke="var(--border)"
              />
              <text
                x={(actorPos(activeStep.from).x + actorPos(activeStep.to).x) / 2}
                y={(actorPos(activeStep.from).y + actorPos(activeStep.to).y) / 2 - 14}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize={9}
                fill={packetColor(activeStep.kind)}
              >
                {truncate(activeStep.label, 36)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Step detail + PKCE values */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-background/40 p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            current step
          </p>
          {activeStep ? (
            <>
              <p className="mt-1 font-mono text-sm text-foreground">{activeStep.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {activeStep.detail}
              </p>
              {activeStep.payload && (
                <p className="mt-2 rounded border border-border bg-secondary/40 px-2 py-1 font-mono text-xs text-cyan-accent">
                  {activeStep.payload}
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Press <span className="text-terminal">▶ play</span> to start the flow.
            </p>
          )}
        </div>

        <div className="rounded-md border border-border bg-background/40 p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            pkce parameters
          </p>
          <div className="mt-2 space-y-1 font-mono text-xs">
            <p>
              <span className="text-muted-foreground">verifier:</span>{" "}
              <span className="text-foreground">{verifier ? truncate(verifier, 26) : "—"}</span>
            </p>
            <p>
              <span className="text-muted-foreground">challenge:</span>{" "}
              <span className="text-terminal">{challenge ? truncate(challenge, 26) : "—"}</span>
            </p>
            <p>
              <span className="text-muted-foreground">method:</span>{" "}
              <span className="text-cyan-accent">{flow === "pkce" ? "S256" : "—"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Event log */}
      <div className="rounded-md border border-border bg-background/40 p-3">
        <p className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          event log{envMode === "staging" ? " · trace_id=a19f-0c8b" : ""}
        </p>
        <ul aria-live="polite" className="space-y-1 font-mono text-xs text-muted-foreground">
          {log.length === 0 && <li className="text-muted-foreground">no events yet</li>}
          {log.map((l, i) => (
            <li key={i} className={i === 0 ? "text-terminal" : ""}>
              &gt; {l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function actorPos(id: ActorId) {
  const a = ACTORS.find((x) => x.id === id)!;
  return { x: a.x, y: a.y };
}

function packetColor(kind: Step["kind"]) {
  switch (kind) {
    case "token":
      return "oklch(0.85 0.21 150)";
    case "redirect":
      return "oklch(0.78 0.16 200)";
    case "api":
      return "oklch(0.8 0.14 70)";
    case "verify":
      return "oklch(0.75 0.18 310)";
    default:
      return "oklch(0.68 0.02 150)";
  }
}

function stepTag(kind: Step["kind"]): string {
  const map: Record<Step["kind"], string> = {
    request: "[REQ]",
    redirect: "[302]",
    token: "[TKN]",
    api: "[API]",
    verify: "[PKCE]",
  };
  return map[kind];
}

function toneText(t: "ok" | "warn" | "bad") {
  return t === "ok" ? "text-terminal" : t === "warn" ? "text-cyan-accent" : "text-destructive";
}
function toneBorder(t: "ok" | "warn" | "bad") {
  return t === "ok"
    ? "border-terminal/50"
    : t === "warn"
      ? "border-cyan-accent/50"
      : "border-destructive/50";
}
function toneBg(t: "ok" | "warn" | "bad") {
  return t === "ok" ? "bg-terminal/15" : t === "warn" ? "bg-cyan-accent/15" : "bg-destructive/15";
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

/* ─── PKCE math (browser-only) ────────────────────────────────────────────── */

function makeVerifier(): string {
  if (typeof window === "undefined" || !window.crypto) {
    return "fallback-verifier-" + Math.random().toString(36).slice(2, 10);
  }
  const arr = new Uint8Array(32);
  window.crypto.getRandomValues(arr);
  return base64url(arr);
}

async function s256(input: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return "simulated-challenge-" + input.slice(0, 6);
  }
  const data = new TextEncoder().encode(input);
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  return base64url(new Uint8Array(hash));
}

function base64url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
