import type { Challenge } from "@/content/types";
import { buildWorkerSource, type TestResult, type WorkerMessage } from "./harness";

/** How long a submission may run before we assume it will never finish. */
export const TIMEOUT_MS = 3000;

export type RunResult =
  | { status: "pass"; tests: TestResult[]; logs: string[] }
  | { status: "fail"; tests: TestResult[]; logs: string[] }
  /** Syntax error, or a throw outside any test (e.g. a missing entry function). */
  | { status: "error"; message: string; logs: string[] }
  | { status: "timeout"; logs: string[] };

/**
 * Minimal surface of Worker this module uses. Narrower than lib.dom's Worker so
 * a test can supply a fake without reimplementing the whole interface.
 */
export interface WorkerLike {
  onmessage: ((e: { data: unknown }) => void) | null;
  onerror: ((e: { message?: string }) => void) | null;
  terminate(): void;
}

export interface RunOptions {
  /** Injection point for tests. Defaults to a real Blob-URL Worker. */
  createWorker?: (source: string) => WorkerLike;
  timeoutMs?: number;
}

/**
 * Run a challenge submission and report what happened.
 *
 * A Worker rather than an iframe or direct eval, for one reason that matters:
 * `terminate()` can stop an infinite loop. Nothing else can — a `while(true)`
 * on the main thread freezes the tab, and for a product whose whole promise is
 * "try it, you'll be fine", freezing someone's browser on their first attempt
 * is the worst possible failure.
 *
 * Note for later: no CSP is served today. If one is ever added, it must allow
 * `worker-src blob:` or every challenge silently stops running.
 */
export async function runChallenge(
  challenge: Challenge,
  userCode: string,
  options: RunOptions = {},
): Promise<RunResult> {
  const timeoutMs = options.timeoutMs ?? TIMEOUT_MS;
  const source = buildWorkerSource(challenge, userCode);
  const logs: string[] = [];

  let worker: WorkerLike;
  try {
    worker = options.createWorker ? options.createWorker(source) : defaultCreateWorker(source);
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : String(e), logs };
  }

  return new Promise<RunResult>((resolve) => {
    let settled = false;
    // A box rather than a bare `let`: `finish` has to clear the timer, and the
    // timer's callback is `finish`, so one of the two must be reachable through
    // an indirection.
    const timer: { id?: ReturnType<typeof setTimeout> } = {};

    // Every exit path goes through here: the worker must always be terminated
    // and the object URL always revoked, or a page full of attempts leaks both.
    const finish = (result: RunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer.id);
      try {
        worker.terminate();
      } catch {
        // already gone
      }
      resolve(result);
    };

    worker.onmessage = (e) => {
      const msg = e.data as WorkerMessage;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "log") {
        logs.push(msg.text);
        return;
      }
      if (msg.type === "done") {
        const tests = msg.results ?? [];
        const allPass = tests.length > 0 && tests.every((t) => t.pass);
        finish({ status: allPass ? "pass" : "fail", tests, logs });
      }
    };

    worker.onerror = (e) => {
      finish({ status: "error", message: e?.message || "Your code could not run.", logs });
    };

    timer.id = setTimeout(() => finish({ status: "timeout", logs }), timeoutMs);
  });
}

function defaultCreateWorker(source: string): WorkerLike {
  if (typeof Worker === "undefined" || typeof Blob === "undefined") {
    throw new Error("Challenges run in the browser — this environment has no Worker.");
  }
  const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
  const worker = new Worker(url);
  const terminate = worker.terminate.bind(worker);
  // Revoke as soon as the worker is torn down; the worker has already been
  // fetched from the URL by then, so this is safe and keeps blob memory bounded.
  return Object.assign(worker as unknown as WorkerLike, {
    terminate() {
      terminate();
      URL.revokeObjectURL(url);
    },
  });
}
