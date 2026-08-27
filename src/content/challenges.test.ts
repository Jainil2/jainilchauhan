import { describe, expect, it } from "vitest";
import { buildWorkerSource, type WorkerMessage } from "@/lib/challenge/harness";
import type { LabMeta } from "@/content/types";

/**
 * Contract every authored challenge must satisfy.
 *
 * Two failures this catches, both of which are worse than a broken build:
 *   - a reference solution that does not pass its own tests, so "show me the
 *     answer" hands someone code that goes red
 *   - a starter that already passes, so the challenge is solved on arrival and
 *     the solved-set placement signal is meaningless
 *
 * Runs the real generated worker source in-process, so it exercises the same
 * harness the browser does.
 */
const modules = import.meta.glob<{ lab: LabMeta }>(["./labs/*.ts", "!./labs/index.ts"], {
  eager: true,
});

const labs = Object.values(modules)
  .map((m) => m.lab)
  .filter((lab): lab is LabMeta & { challenge: NonNullable<LabMeta["challenge"]> } =>
    Boolean(lab?.challenge),
  );

function runAgainstTests(lab: (typeof labs)[number], code: string) {
  const source = buildWorkerSource(lab.challenge, code);
  const messages: WorkerMessage[] = [];
  // `console` is passed in so the harness's console.log capture shadows the
  // real one instead of polluting the test runner's output.
  new Function("self", "postMessage", "console", source)(
    {},
    (m: WorkerMessage) => messages.push(m),
    { log: () => {} },
  );

  const done = messages.find((m) => m.type === "done");
  return done?.type === "done" ? done.results : [];
}

it("finds authored challenges to check", () => {
  expect(labs.length).toBeGreaterThan(0);
});

describe.each(labs.map((lab) => [lab.slug, lab] as const))("%s", (_slug, lab) => {
  it("declares an entry function that both starter and reference define", () => {
    expect(lab.challenge.entry).toBeTruthy();
    expect(lab.challenge.starter).toContain(lab.challenge.entry);
    expect(lab.challenge.reference).toContain(lab.challenge.entry);
  });

  it("has a reference solution that passes every test", () => {
    const results = runAgainstTests(lab, lab.challenge.reference);
    expect(results).toHaveLength(lab.challenge.tests.length);
    const failures = results.filter((r) => !r.pass);
    expect(
      failures,
      `reference failed: ${failures.map((f) => `${f.name} — ${f.message}`).join("; ")}`,
    ).toEqual([]);
  });

  it("has a starter that does not already pass", () => {
    let results;
    try {
      results = runAgainstTests(lab, lab.challenge.starter);
    } catch {
      // A starter that throws (e.g. no entry defined yet) is a fine starting
      // point — it certainly has not solved anything.
      return;
    }
    expect(results.every((r) => r.pass)).toBe(false);
  });

  it("offers at least one hint", () => {
    expect(lab.challenge.hints.length).toBeGreaterThan(0);
  });
});
