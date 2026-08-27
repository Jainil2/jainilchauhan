import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, TerminalSquare } from "lucide-react";
import { labSummaries } from "@/content/labs";
import { useSimulationStore } from "@/lib/useSimulationStore";
import { useControlPlane, type EnvMode } from "@/lib/useControlPlane";
import { useTheme } from "@/lib/useTheme";

const SECTIONS = [
  "top",
  "about",
  "skills",
  "experience",
  "projects",
  "now",
  "education",
  "writing",
  "contact",
];

const HELP_LINES = [
  "Available commands:",
  "  help                    this message",
  "  ls [path]               list sections, labs, or files",
  "  cat <file>              print about.md, resume, status.json, …",
  "  goto <section>          smooth-scroll to a section",
  "  cd /lab | /             navigate routes",
  "  open <lab-slug>         open a /lab demo",
  "  whoami                  identity",
  "  ping <target>           synthetic latency probe",
  "  curl <url>              synthetic HTTP request",
  "  dig <domain>            synthetic DNS lookup",
  "  env [prod|staging|chaos]  read or switch the env",
  "  kill node-<n>           crash a simulated node",
  "  restore node-<n>        restore a simulated node",
  "  tokens +N | -N          adjust the token bucket",
  "  theme [light|dark|system]  read or switch the theme",
  "  clear                   clear the buffer",
  "  exit                    close the shell (Esc works too)",
  "",
  "Shortcuts: ↑/↓ history · Tab complete · Ctrl-L clear",
];

interface Line {
  kind: "in" | "out" | "err" | "hint";
  text: string;
}

/** Full-screen terminal — opened with ⌘J / Ctrl+J, accepts a small real command vocabulary. */
export function TerminalShell() {
  const [open, setOpen] = useState(false);
  const [buffer, setBuffer] = useState<Line[]>(() => bootBanner());
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const env = useControlPlane((s) => s.env);
  const setEnv = useControlPlane((s) => s.setEnv);
  const status = useControlPlane((s) => s.status);
  const vitals = useControlPlane((s) => s.vitals);
  const { killNode, restoreNode, drainTokens, replenishTokens } = useSimulationStore();
  const { choice: themeChoice, resolved: resolvedTheme, setChoice: setThemeChoice } = useTheme();

  const labSlugs = useMemo(() => labSummaries.map((l) => l.slug), []);

  // Global open-shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "j" || e.key === "J") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [buffer, open]);

  const out = useCallback((line: Line | Line[]) => {
    setBuffer((prev) => prev.concat(Array.isArray(line) ? line : [line]).slice(-200));
  }, []);

  function completeTab(current: string): string {
    const tokens = current.split(/\s+/);
    const known = [
      "help",
      "ls",
      "cat",
      "cd",
      "goto",
      "open",
      "whoami",
      "ping",
      "curl",
      "dig",
      "env",
      "kill",
      "restore",
      "tokens",
      "theme",
      "clear",
      "exit",
    ];
    if (tokens.length === 1) {
      const matches = known.filter((c) => c.startsWith(tokens[0]));
      return matches.length === 1 ? matches[0] + " " : current;
    }
    const cmd = tokens[0];
    const last = tokens[tokens.length - 1];
    const pool =
      cmd === "cat"
        ? ["about.md", "status.json", "resume.md", "now.txt"]
        : cmd === "goto"
          ? SECTIONS
          : cmd === "open"
            ? labSlugs
            : cmd === "cd"
              ? ["/", "/lab"]
              : cmd === "env"
                ? ["prod", "staging", "chaos"]
                : cmd === "theme"
                  ? ["light", "dark", "system"]
                  : [];
    const matches = pool.filter((p) => p.startsWith(last));
    if (matches.length === 1) {
      tokens[tokens.length - 1] = matches[0];
      return tokens.join(" ");
    }
    return current;
  }

  function run(raw: string) {
    const line = raw.trim();
    if (!line) return;
    out({ kind: "in", text: line });
    setHistory((h) => (h[h.length - 1] === line ? h : [...h, line]).slice(-50));
    setHistoryIdx(-1);

    const [cmd, ...rest] = line.split(/\s+/);
    const args = rest.join(" ");

    switch (cmd) {
      case "help":
        out(HELP_LINES.map((t) => ({ kind: "out" as const, text: t })));
        break;

      case "clear":
        setBuffer([]);
        break;

      case "exit":
        setOpen(false);
        break;

      case "whoami":
        out([
          { kind: "out", text: "jainil" },
          { kind: "out", text: "Software Engineer · Distributed Systems & Backend" },
          { kind: "out", text: "Nadiad, IN · available for new roles" },
        ]);
        break;

      case "ls": {
        const target = rest[0] ?? "";
        if (target === "/lab" || target === "lab") {
          out(
            labSummaries.map((l) => ({ kind: "out" as const, text: `  ${l.slug}  — ${l.title}` })),
          );
        } else {
          out([
            { kind: "out", text: "sections/" },
            ...SECTIONS.map((s) => ({ kind: "out" as const, text: `  ${s}` })),
            { kind: "out", text: "labs/" },
            ...labSummaries.map((l) => ({ kind: "out" as const, text: `  ${l.slug}` })),
          ]);
        }
        break;
      }

      case "cat": {
        const target = rest[0] ?? "";
        if (!target) {
          out({ kind: "err", text: "cat: missing operand" });
          break;
        }
        if (target === "about.md" || target === "about") {
          out([
            { kind: "out", text: "# About" },
            {
              kind: "out",
              text: "Backend & distributed systems engineer building low-latency,",
            },
            { kind: "out", text: "high-trust systems that scale quietly. Today @ Tech Holding." },
          ]);
        } else if (target === "status.json") {
          out([
            { kind: "out", text: "{" },
            { kind: "out", text: `  "commit": "${status.commit}",` },
            {
              kind: "out",
              text: `  "builtAt": ${status.builtAt ? `"${status.builtAt}"` : "null"},`,
            },
            {
              kind: "out",
              text: `  "bundleKb": ${status.bundleKb ?? "null"},`,
            },
            {
              kind: "out",
              text: `  "vitals": { "lcp": ${vitals.lcp ?? "null"}, "inp": ${vitals.inp ?? "null"} }`,
            },
            { kind: "out", text: "}" },
          ]);
        } else if (target === "resume.md" || target === "resume") {
          out([
            { kind: "out", text: "→ /jainil-chauhan-resume.pdf" },
            { kind: "hint", text: "   (opening in a new tab…)" },
          ]);
          if (typeof window !== "undefined")
            window.open("/jainil-chauhan-resume.pdf", "_blank", "noopener");
        } else if (target === "now.txt" || target === "now") {
          out([
            { kind: "out", text: "# Now" },
            { kind: "out", text: "- shipping backend primitives at Tech Holding" },
            { kind: "out", text: "- reading: Designing Data-Intensive Applications (2nd read)" },
          ]);
        } else {
          out({ kind: "err", text: `cat: ${target}: No such file` });
        }
        break;
      }

      case "cd": {
        const target = rest[0] ?? "/";
        if (target === "/lab" || target === "lab") {
          navigate({ to: "/lab" });
          out({ kind: "out", text: "→ /lab" });
          setOpen(false);
        } else if (target === "/" || target === "~") {
          navigate({ to: "/" });
          out({ kind: "out", text: "→ /" });
          setOpen(false);
        } else {
          out({ kind: "err", text: `cd: ${target}: No such directory` });
        }
        break;
      }

      case "goto": {
        const id = rest[0];
        if (!id || !SECTIONS.includes(id)) {
          out({ kind: "err", text: `goto: unknown section '${id ?? ""}'` });
          break;
        }
        if (typeof window !== "undefined") {
          if (window.location.pathname !== "/") {
            navigate({ to: "/", hash: id });
          } else {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          }
        }
        out({ kind: "out", text: `scrolling → #${id}` });
        setOpen(false);
        break;
      }

      case "open": {
        const slug = rest[0];
        if (!slug || !labSlugs.includes(slug)) {
          out({ kind: "err", text: `open: unknown lab '${slug ?? ""}'` });
          out({ kind: "hint", text: `try: ${labSlugs.join(", ")}` });
          break;
        }
        navigate({ to: "/lab/$slug", params: { slug } });
        out({ kind: "out", text: `→ /lab/${slug}` });
        setOpen(false);
        break;
      }

      case "ping": {
        const target = rest[0] ?? "jainil";
        const rtt = Math.round(12 + Math.random() * 28);
        out([
          { kind: "out", text: `PING ${target} (127.0.0.1): 56 data bytes` },
          { kind: "out", text: `64 bytes from ${target}: icmp_seq=0 ttl=64 time=${rtt}ms` },
          {
            kind: "hint",
            text:
              target === "jainil"
                ? "— for real pings, use the contact form or mailto."
                : "— synthetic response (the shell doesn't actually send packets)",
          },
        ]);
        break;
      }

      case "curl": {
        const url = rest[0] ?? "https://api.jainilchauhan.com/metrics";
        const rps = (1200 + Math.random() * 500).toFixed(0);
        const mem = (240 + Math.random() * 20).toFixed(1);
        out([
          { kind: "out", text: `HTTP/2 200 OK` },
          { kind: "out", text: `content-type: application/json` },
          { kind: "out", text: `{` },
          { kind: "out", text: `  "status": "healthy",` },
          { kind: "out", text: `  "rps": ${rps},` },
          { kind: "out", text: `  "memory_mb": ${mem},` },
          { kind: "out", text: `  "cache_hit_rate": "98.4%"` },
          { kind: "out", text: `}` },
        ]);
        break;
      }

      case "dig": {
        const domain = rest[0] ?? "jainilchauhan.com";
        out([
          { kind: "out", text: `; <<>> DiG 9.10.6 <<>> ${domain}` },
          { kind: "out", text: `;; global options: +cmd` },
          { kind: "out", text: `;; Got answer:` },
          {
            kind: "out",
            text: `;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: ${Math.floor(Math.random() * 65000)}`,
          },
          {
            kind: "out",
            text: `;; flags: qr rd ra; QUERY: 1, ANSWER: 4, AUTHORITY: 0, ADDITIONAL: 1`,
          },
          { kind: "out", text: `` },
          { kind: "out", text: `;; ANSWER SECTION:` },
          { kind: "out", text: `${domain}.		300	IN	A	104.21.34.12` },
          { kind: "out", text: `${domain}.		300	IN	A	172.67.14.8` },
          { kind: "out", text: `` },
          { kind: "out", text: `;; Query time: ${Math.floor(Math.random() * 30 + 10)} msec` },
          { kind: "out", text: `;; SERVER: 1.1.1.1#53(1.1.1.1)` },
        ]);
        break;
      }

      case "env": {
        const target = rest[0] as EnvMode | undefined;
        if (!target) {
          out({ kind: "out", text: `env=${env}` });
        } else if (target === "prod" || target === "staging" || target === "chaos") {
          setEnv(target);
          out({ kind: "out", text: `env → ${target}` });
        } else {
          out({ kind: "err", text: `env: invalid mode '${target}' (try prod|staging|chaos)` });
        }
        break;
      }

      case "kill": {
        const target = rest[0];
        if (!target || !/^node-[1-3]$/.test(target)) {
          out({ kind: "err", text: "kill: expected node-1 | node-2 | node-3" });
          break;
        }
        killNode(target);
        out({ kind: "out", text: `${target} crashed.` });
        break;
      }

      case "restore": {
        const target = rest[0];
        if (!target || !/^node-[1-3]$/.test(target)) {
          out({ kind: "err", text: "restore: expected node-1 | node-2 | node-3" });
          break;
        }
        restoreNode(target);
        out({ kind: "out", text: `${target} restored.` });
        break;
      }

      case "tokens": {
        const m = args.match(/^([+-]?\d+)$/);
        if (!m) {
          out({ kind: "err", text: "tokens: expected +N or -N" });
          break;
        }
        const n = parseInt(m[1], 10);
        if (n < 0) drainTokens(-n);
        else replenishTokens(n, 100);
        out({ kind: "out", text: `tokens: ${n >= 0 ? "+" : ""}${n}` });
        break;
      }

      case "theme": {
        const want = args.trim().toLowerCase();
        if (!want) {
          out({ kind: "out", text: `theme: ${themeChoice} (resolved: ${resolvedTheme})` });
          break;
        }
        if (want !== "light" && want !== "dark" && want !== "system") {
          out({ kind: "err", text: "theme: expected light | dark | system" });
          break;
        }
        setThemeChoice(want);
        out({ kind: "out", text: `theme set to ${want}` });
        break;
      }

      default:
        out({ kind: "err", text: `command not found: ${cmd}  (try 'help')` });
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-background/60 backdrop-blur-sm sm:items-center"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-label="Terminal shell"
            className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-card/95 shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="flex items-center gap-2 font-code text-xs">
                <TerminalSquare className="size-3.5 text-terminal" />
                <span className="text-terminal">jc-shell</span>
                <span className="text-muted-foreground">— type 'help'</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close shell"
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </header>

            <div
              ref={bodyRef}
              className="h-96 flex-1 overflow-y-auto px-3 py-2 font-code text-xs leading-relaxed"
            >
              {buffer.map((l, i) => (
                <Row key={i} line={l} />
              ))}
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-terminal">$</span>
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const cmd = value;
                      setValue("");
                      run(cmd);
                    } else if (e.key === "Tab") {
                      e.preventDefault();
                      setValue((v) => completeTab(v));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      if (history.length === 0) return;
                      const next =
                        historyIdx < 0 ? history.length - 1 : Math.max(0, historyIdx - 1);
                      setHistoryIdx(next);
                      setValue(history[next] ?? "");
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (historyIdx < 0) return;
                      const next = historyIdx + 1;
                      if (next >= history.length) {
                        setHistoryIdx(-1);
                        setValue("");
                      } else {
                        setHistoryIdx(next);
                        setValue(history[next]);
                      }
                    } else if ((e.key === "l" || e.key === "L") && e.ctrlKey) {
                      e.preventDefault();
                      setBuffer([]);
                    }
                  }}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  className="flex-1 bg-transparent text-foreground outline-none"
                  aria-label="Shell input"
                />
              </div>
            </div>

            <footer className="border-t border-border px-3 py-1.5 font-code text-xs text-muted-foreground">
              <kbd className="rounded border border-border bg-background/60 px-1">⌘J</kbd> toggle ·{" "}
              <kbd className="rounded border border-border bg-background/60 px-1">Tab</kbd> complete
              · <kbd className="rounded border border-border bg-background/60 px-1">↑↓</kbd> history
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ line }: { line: Line }) {
  if (line.kind === "in") {
    return (
      <div className="flex gap-1.5">
        <span className="text-terminal">$</span>
        <span className="text-foreground">{line.text}</span>
      </div>
    );
  }
  const color =
    line.kind === "err"
      ? "text-destructive"
      : line.kind === "hint"
        ? "text-cyan-accent/80"
        : "text-muted-foreground";
  return <div className={`whitespace-pre ${color}`}>{line.text}</div>;
}

function bootBanner(): Line[] {
  return [
    { kind: "hint", text: "jc-shell 1.0 — safe sandbox, no real network I/O" },
    { kind: "hint", text: "type `help` to see commands · press Esc to close" },
  ];
}
