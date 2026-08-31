import { describe, expect, it, vi } from "vitest";
import { runChallenge, type WorkerLike } from "./runner";
import type { Challenge } from "@/content/types";

const challenge: Challenge = {
  prompt: "Return the sum of two numbers.",
  entry: "add",
  starter: "function add(a, b) {}",
  tests: [{ name: "adds", body: "assertEquals(solution(2, 3), 5);" }],
  reference: "function add(a, b) { return a + b; }",
  hints: [],
};

/**
 * A Worker that never posts anything back, standing in for code that hangs.
 * `terminated` is what the timeout test actually asserts on: resolving with a
 * timeout status while leaving a runaway worker alive would still burn the
 * visitor's CPU.
 */
function makeFakeWorker() {
  const worker: WorkerLike & { terminated: boolean } = {
    onmessage: null,
    onerror: null,
    terminated: false,
    terminate() {
      this.terminated = true;
    },
  };
  return worker;
}

describe("runChallenge", () => {
  it("reports pass when every test passes", async () => {
    const worker = makeFakeWorker();
    const promise = runChallenge(challenge, "", { createWorker: () => worker });
    worker.onmessage?.({ data: { type: "done", results: [{ name: "adds", pass: true }] } });
    await expect(promise).resolves.toMatchObject({ status: "pass" });
  });

  it("reports fail when any test fails", async () => {
    const worker = makeFakeWorker();
    const promise = runChallenge(challenge, "", { createWorker: () => worker });
    worker.onmessage?.({
      data: {
        type: "done",
        results: [
          { name: "a", pass: true },
          { name: "b", pass: false, message: "nope" },
        ],
      },
    });
    const result = await promise;
    expect(result.status).toBe("fail");
  });

  it("does not report pass for a run with no tests", async () => {
    const worker = makeFakeWorker();
    const promise = runChallenge(challenge, "", { createWorker: () => worker });
    worker.onmessage?.({ data: { type: "done", results: [] } });
    await expect(promise).resolves.toMatchObject({ status: "fail" });
  });

  it("collects logs and attaches them to the result", async () => {
    const worker = makeFakeWorker();
    const promise = runChallenge(challenge, "", { createWorker: () => worker });
    worker.onmessage?.({ data: { type: "log", text: "first" } });
    worker.onmessage?.({ data: { type: "log", text: "second" } });
    worker.onmessage?.({ data: { type: "done", results: [{ name: "adds", pass: true }] } });
    await expect(promise).resolves.toMatchObject({ logs: ["first", "second"] });
  });

  it("terminates a worker that never finishes, and reports a timeout", async () => {
    vi.useFakeTimers();
    try {
      const worker = makeFakeWorker();
      const promise = runChallenge(challenge, "while (true) {}", {
        createWorker: () => worker,
        timeoutMs: 3000,
      });
      expect(worker.terminated).toBe(false);
      await vi.advanceTimersByTimeAsync(3000);
      await expect(promise).resolves.toMatchObject({ status: "timeout" });
      expect(worker.terminated).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("maps a worker error to an error result", async () => {
    const worker = makeFakeWorker();
    const promise = runChallenge(challenge, "", { createWorker: () => worker });
    worker.onerror?.({ message: "Unexpected token }" });
    await expect(promise).resolves.toMatchObject({
      status: "error",
      message: "Unexpected token }",
    });
  });

  it("returns an error result when the worker cannot be constructed", async () => {
    const result = await runChallenge(challenge, "", {
      createWorker: () => {
        throw new Error("no Worker here");
      },
    });
    expect(result).toMatchObject({ status: "error", message: "no Worker here" });
  });

  it("terminates the worker on every settled path", async () => {
    const passing = makeFakeWorker();
    const p1 = runChallenge(challenge, "", { createWorker: () => passing });
    passing.onmessage?.({ data: { type: "done", results: [{ name: "a", pass: true }] } });
    await p1;
    expect(passing.terminated).toBe(true);

    const erroring = makeFakeWorker();
    const p2 = runChallenge(challenge, "", { createWorker: () => erroring });
    erroring.onerror?.({ message: "boom" });
    await p2;
    expect(erroring.terminated).toBe(true);
  });

  it("ignores messages arriving after the run has settled", async () => {
    const worker = makeFakeWorker();
    const promise = runChallenge(challenge, "", { createWorker: () => worker });
    worker.onmessage?.({ data: { type: "done", results: [{ name: "a", pass: true }] } });
    const first = await promise;
    // A late message must not throw or change the already-resolved result.
    expect(() =>
      worker.onmessage?.({ data: { type: "done", results: [{ name: "a", pass: false }] } }),
    ).not.toThrow();
    expect(first.status).toBe("pass");
  });
});
