import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, Lightbulb, Play, RotateCcw, TimerOff, X } from "lucide-react";
import type { Challenge } from "@/content/types";
import { CodeBlock } from "@/components/system-design/CodeBlock";
import { CodeEditor } from "./CodeEditor";
import { runChallenge, TIMEOUT_MS, type RunResult } from "@/lib/challenge/runner";
import { useKnowledge } from "@/lib/useKnowledge";

interface ChallengePanelProps {
  slug: string;
  challenge: Challenge;
}

/** Per-lab draft, so a reload or a wander to another lab does not lose work. */
const draftKey = (slug: string) => `challenge-draft-v1:${slug}`;

function readDraft(slug: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(draftKey(slug));
  } catch {
    return null;
  }
}

function writeDraft(slug: string, code: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(draftKey(slug), code);
  } catch {
    // ignore
  }
}

/**
 * The core mechanic: write an implementation, run real tests, watch them go
 * green. Everything else on the page supports this moment.
 *
 * Deliberately not gated. The whole lab is readable without touching this, and
 * the reference can be revealed at any time — someone who reads the answer,
 * understands it, and makes the tests pass has still learned the thing, and
 * shaming them would contradict the point of the product.
 */
export function ChallengePanel({ slug, challenge }: ChallengePanelProps) {
  const [code, setCode] = useState(challenge.starter);
  const [hydrated, setHydrated] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [showReference, setShowReference] = useState(false);
  const { knowledge, add } = useKnowledge();

  // Server renders the starter; the draft loads after mount so SSR HTML and the
  // first client render agree.
  useEffect(() => {
    const draft = readDraft(slug);
    if (draft !== null) setCode(draft);
    setHydrated(true);
  }, [slug]);

  const update = useCallback(
    (next: string) => {
      setCode(next);
      writeDraft(slug, next);
    },
    [slug],
  );

  async function run() {
    setRunning(true);
    add("attempted", slug);
    try {
      const outcome = await runChallenge(challenge, code);
      setResult(outcome);
      if (outcome.status === "pass") add("solved", slug);
    } finally {
      setRunning(false);
    }
  }

  function reset() {
    update(challenge.starter);
    setResult(null);
  }

  function reveal() {
    setShowReference(true);
    add("revealed", slug);
  }

  const solved = knowledge.solved.has(slug);
  const tests = result && "tests" in result ? result.tests : [];

  return (
    <section className="mt-8 rounded-lg border border-border bg-card/60" aria-labelledby="ch-h">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 id="ch-h" className="text-sm font-semibold">
          Build it yourself
        </h2>
        {solved && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/30 px-2.5 py-0.5 text-xs font-medium">
            <Check className="size-3.5" /> Solved
          </span>
        )}
      </header>

      <div className="space-y-4 px-4 py-4">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {challenge.prompt}
        </p>

        <CodeEditor
          value={code}
          onChange={update}
          disabled={running || !hydrated}
          ariaLabel={`Your solution for ${slug}`}
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={run}
            disabled={running || !hydrated}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Play className="size-4" />
            {running ? "Running…" : "Run tests"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={running}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RotateCcw className="size-3.5" /> Reset
          </button>
          {hintsShown < challenge.hints.length && (
            <button
              type="button"
              onClick={() => setHintsShown((n) => n + 1)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Lightbulb className="size-3.5" />
              {hintsShown === 0 ? "Hint" : "Another hint"}
            </button>
          )}
          {!showReference && (
            <button
              type="button"
              onClick={reveal}
              className="ml-auto text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Show me the answer
            </button>
          )}
        </div>

        {hintsShown > 0 && (
          <ul className="space-y-2">
            {challenge.hints.slice(0, hintsShown).map((hint, i) => (
              <li
                key={i}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed"
              >
                <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hint {i + 1}
                </span>
                {hint}
              </li>
            ))}
          </ul>
        )}

        {result && <Outcome result={result} tests={tests} />}

        {showReference && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reference implementation
            </p>
            <CodeBlock code={challenge.reference} language="ts" />
          </div>
        )}
      </div>
    </section>
  );
}

function Outcome({
  result,
  tests,
}: {
  result: RunResult;
  tests: { name: string; pass: boolean; message?: string }[];
}) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      {result.status === "pass" && (
        <p className="rounded-md border border-foreground/25 bg-secondary px-3 py-2.5 text-sm font-medium">
          All {tests.length} tests pass. You just built it.
        </p>
      )}

      {result.status === "timeout" && (
        <p className="flex items-start gap-2 rounded-md border border-destructive/40 px-3 py-2.5 text-sm">
          <TimerOff className="mt-0.5 size-4 shrink-0" />
          <span>
            Your code ran for more than {TIMEOUT_MS / 1000} seconds and was stopped. That is almost
            always a loop that never exits &mdash; check your loop condition actually changes.
          </span>
        </p>
      )}

      {result.status === "error" && (
        <p className="flex items-start gap-2 rounded-md border border-destructive/40 px-3 py-2.5 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            Your code could not run: <span className="font-code">{result.message}</span>
          </span>
        </p>
      )}

      {tests.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
          {tests.map((t) => (
            <li key={t.name} className="flex items-start gap-2.5 bg-background px-3 py-2.5 text-sm">
              {t.pass ? (
                <Check className="mt-0.5 size-4 shrink-0" aria-label="passed" />
              ) : (
                <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-label="failed" />
              )}
              <span className="min-w-0">
                <span className={t.pass ? "text-muted-foreground" : "font-medium"}>{t.name}</span>
                {t.message && (
                  <span className="mt-1 block break-words font-code text-xs text-destructive">
                    {t.message}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {result.logs.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            console.log
          </p>
          <pre className="overflow-x-auto rounded-md border border-border bg-background px-3 py-2 font-code text-xs leading-relaxed">
            {result.logs.join("\n")}
          </pre>
        </div>
      )}
    </div>
  );
}
