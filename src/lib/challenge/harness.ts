import type { Challenge } from "@/content/types";

export interface TestResult {
  name: string;
  pass: boolean;
  /** Assertion or thrown-error message. Absent when the test passed. */
  message?: string;
}

/** What the worker posts back. Kept flat so it survives structured clone. */
export type WorkerMessage = { type: "log"; text: string } | { type: "done"; results: TestResult[] };

/**
 * JS-literal-escape a string for embedding in generated source.
 *
 * Test bodies and the visitor's code are embedded as *code*, not data, so they
 * are not escaped. This is only for the few places a value must be a literal
 * (test names, the entry identifier), where an unescaped quote would produce a
 * syntax error and take down the whole run.
 */
function quote(s: string): string {
  return JSON.stringify(s);
}

/**
 * Build the source for the challenge worker.
 *
 * Pure on purpose: executing untrusted code is the part that resists testing,
 * so everything decidable lives here as a string and gets unit-tested by
 * running the real output, while `runner.ts` keeps only the Worker plumbing.
 *
 * Shape of the emitted program:
 *   1. assert helpers + console.log capture
 *   2. the visitor's code verbatim
 *   3. `const __solution = <entry>` — one indirection so tests can be authored
 *      against a stable name
 *   4. one try/catch per test, so a throw fails that test instead of the run
 *   5. postMessage({ type: "done", results })
 *
 * Emitted as a *classic* worker script: no imports, so no module resolution and
 * no bundler involvement at runtime.
 */
export function buildWorkerSource(challenge: Challenge, userCode: string): string {
  const tests = challenge.tests
    .map(
      (t) => `
try {
  __t = ${quote(t.name)};
  ${t.body}
  __results.push({ name: __t, pass: true });
} catch (e) {
  __results.push({ name: __t, pass: false, message: __msg(e) });
}`,
    )
    .join("\n");

  return `"use strict";
var __results = [];
var __t = "";

function __msg(e) {
  if (e && typeof e.message === "string") return e.message;
  return String(e);
}

function assert(cond, message) {
  if (!cond) throw new Error(message || "Expected condition to be true");
}

function assertEquals(actual, expected, message) {
  var a = JSON.stringify(actual);
  var b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error(
      (message ? message + " — " : "") + "expected " + b + " but got " + a
    );
  }
}

function assertThrows(fn, message) {
  try {
    fn();
  } catch (e) {
    return;
  }
  throw new Error(message || "Expected the call to throw, but it did not");
}

// Surface the visitor's own console.log in the panel. Debugging a red test
// without being able to print is needlessly hostile.
console.log = function () {
  var parts = [];
  for (var i = 0; i < arguments.length; i++) {
    var v = arguments[i];
    parts.push(typeof v === "string" ? v : (function () {
      try { return JSON.stringify(v); } catch (e) { return String(v); }
    })());
  }
  postMessage({ type: "log", text: parts.join(" ") });
};

// ---- visitor code ----
${userCode}
// ---- end visitor code ----

var __solution = typeof ${challenge.entry} === "function" ? ${challenge.entry} : undefined;
if (!__solution) {
  throw new Error(
    "Could not find a function named '${challenge.entry}'. Keep that name — the tests call it."
  );
}
var solution = __solution;
${tests}

postMessage({ type: "done", results: __results });
`;
}
