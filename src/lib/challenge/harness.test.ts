import { describe, expect, it } from "vitest";
import { buildWorkerSource, type WorkerMessage } from "./harness";
import type { Challenge } from "@/content/types";

/**
 * Execute the *real* generated source in-process.
 *
 * The point of these tests is that the harness itself is correct, so nothing
 * here is mocked: the actual emitted program runs, with `postMessage` and
 * `console` passed in as parameters. Passing `console` matters — the harness
 * reassigns `console.log` to capture output, and as a parameter it shadows the
 * global so the test process's console is left alone.
 *
 * `self` is supplied because a classic worker script may reference it.
 */
function run(challenge: Challenge, userCode: string) {
  const source = buildWorkerSource(challenge, userCode);
  const messages: WorkerMessage[] = [];
  const post = (m: WorkerMessage) => messages.push(m);
  const consoleShim = { log: (..._args: unknown[]) => {} };

  const fn = new Function("self", "postMessage", "console", source);
  fn({}, post, consoleShim);

  const done = messages.find((m) => m.type === "done");
  return {
    logs: messages.filter((m) => m.type === "log").map((m) => m.text),
    results: done?.type === "done" ? done.results : [],
  };
}

const challenge: Challenge = {
  prompt: "Return the sum of two numbers.",
  entry: "add",
  starter: "function add(a, b) {}",
  tests: [
    { name: "adds positives", body: "assertEquals(solution(2, 3), 5);" },
    { name: "adds negatives", body: "assertEquals(solution(-2, -3), -5);" },
  ],
  reference: "function add(a, b) { return a + b; }",
  hints: [],
};

describe("buildWorkerSource", () => {
  it("reports every test passing for a correct solution", () => {
    const { results } = run(challenge, "function add(a, b) { return a + b; }");
    expect(results).toEqual([
      { name: "adds positives", pass: true },
      { name: "adds negatives", pass: true },
    ]);
  });

  it("reports which test failed, and why", () => {
    const { results } = run(challenge, "function add(a, b) { return a - b; }");
    expect(results[0].pass).toBe(false);
    expect(results[0].message).toContain("expected 5");
    expect(results[0].message).toContain("got -1");
    // The second test happens to pass for subtraction of two negatives; what
    // matters is that one failure does not abort the remaining tests.
    expect(results).toHaveLength(2);
  });

  it("catches a throw inside one test without killing the rest of the run", () => {
    const { results } = run(
      challenge,
      "function add(a, b) { if (a > 0) throw new Error('boom'); return a + b; }",
    );
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ pass: false, message: "boom" });
    expect(results[1].pass).toBe(true);
  });

  it("binds the entry function to `solution` whatever it is named", () => {
    const renamed: Challenge = { ...challenge, entry: "mySum" };
    const { results } = run(renamed, "function mySum(a, b) { return a + b; }");
    expect(results.every((r) => r.pass)).toBe(true);
  });

  it("throws a directive message when the entry function is missing", () => {
    expect(() => run(challenge, "function somethingElse(a, b) { return a + b; }")).toThrow(
      /Could not find a function named 'add'/,
    );
  });

  it("captures console.log from the visitor's code", () => {
    const { logs, results } = run(
      challenge,
      "function add(a, b) { console.log('got', a, b); return a + b; }",
    );
    expect(results.every((r) => r.pass)).toBe(true);
    expect(logs).toContain("got 2 3");
  });

  it("serialises non-string log arguments", () => {
    const { logs } = run(challenge, "function add(a, b) { console.log({ a: a }); return a + b; }");
    expect(logs[0]).toBe('{"a":2}');
  });

  it("escapes test names so a quote cannot break the generated program", () => {
    const quoted: Challenge = {
      ...challenge,
      tests: [{ name: 'handles "quoted" names', body: "assertEquals(solution(1, 1), 2);" }],
    };
    const { results } = run(quoted, "function add(a, b) { return a + b; }");
    expect(results).toEqual([{ name: 'handles "quoted" names', pass: true }]);
  });

  it("supports assert and assertThrows", () => {
    const c: Challenge = {
      ...challenge,
      tests: [
        { name: "assert", body: "assert(solution(1, 1) === 2, 'should be two');" },
        { name: "assertThrows", body: "assertThrows(function () { solution(null, null); });" },
      ],
    };
    const { results } = run(
      c,
      "function add(a, b) { if (a === null) throw new Error('nope'); return a + b; }",
    );
    expect(results.every((r) => r.pass)).toBe(true);
  });
});
