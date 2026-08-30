#!/usr/bin/env node
/**
 * Drive the core mechanic end to end, in a real browser.
 *
 * The runner and the assert harness have unit tests, and every authored
 * challenge is proved to pass from its reference and fail from its starter.
 * None of that touches the panel: the button wiring, the failing-test list, the
 * hints, the reveal, the Solved badge, or the write into knowledge-v1 that the
 * bridge map reads. That is the entire product loop, and it had no coverage —
 * the same shape of gap that let the editor ship with a drifting caret.
 *
 * This walks a visitor's actual path:
 *   run the starter        -> tests fail, and failures are listed
 *   ask for a hint         -> the first hint appears
 *   reveal the answer      -> the reference implementation appears
 *   paste it back and run  -> every test passes, the lab is marked solved
 *   go to /lab             -> the bridge map has moved on to what that unlocks
 *
 * Requires: `npm run dev` on :8080, and Google Chrome. No dependencies --
 * Node's built-in WebSocket drives CDP directly.
 *
 *   npm run dev
 *   node scripts/check-challenge-flow.mjs
 */
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";

const BASE = "http://localhost:8080";
/** lru-cache is the bridge source for kv-cache, so step 5 has something to assert. */
const SLUG = "lru-cache";
const UNLOCKS = "KV Cache";
const PORT = 9445;
const PROFILE = "/tmp/challenge-flow-profile";
const CHROME =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const checks = [];
const ok = (msg, detail = "") => checks.push({ pass: true, msg, detail });
const bad = (msg, detail = "") => checks.push({ pass: false, msg, detail });

async function main() {
  try {
    await fetch(`${BASE}/lab/${SLUG}`, { signal: AbortSignal.timeout(4000) });
  } catch {
    console.error(`Cannot reach ${BASE} — start the dev server first (npm run dev).`);
    process.exit(1);
  }

  rmSync(PROFILE, { recursive: true, force: true });
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${PROFILE}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    const target = await waitForTarget();
    await walk(target);
  } finally {
    chrome.kill();
    try {
      rmSync(PROFILE, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {
      // Chrome may still be flushing its profile; a leftover temp dir is harmless.
    }
  }

  report();
}

async function waitForTarget() {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = targets.find((t) => t.type === "page");
      if (page) return page;
    } catch {
      // chrome still starting
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error("Chrome did not expose a debugging target");
}

function connect(target) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let id = 0;

  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  };

  const ready = new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  const send = (method, params = {}) => {
    const msgId = ++id;
    ws.send(JSON.stringify({ id: msgId, method, params }));
    return new Promise((r) => pending.set(msgId, r));
  };

  /** Evaluate in the page and return the value, throwing on a page-side throw. */
  const evaluate = async (expression) => {
    const res = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.result?.exceptionDetails) {
      throw new Error(res.result.exceptionDetails.exception?.description ?? "page threw");
    }
    return res.result?.result?.value;
  };

  /**
   * Poll an expression until it is truthy, or give up.
   *
   * A throw counts as "not yet": mid-navigation the document is being replaced,
   * so `document.body` is briefly null and any probe against it explodes. That
   * is a race to wait out, not a failure to report.
   */
  const waitFor = async (expression, { timeout = 20000, label = expression } = {}) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      try {
        const v = await evaluate(expression);
        if (v) return v;
      } catch {
        // document not ready
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error(`timed out waiting for: ${label}`);
  };

  return { ws, ready, send, evaluate, waitFor };
}

/** Find a button by its visible text. The panel has no test ids, on purpose. */
const buttonBy = (text) =>
  `[...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(${JSON.stringify(text)}))`;

async function walk(target) {
  const { ws, ready, send, evaluate, waitFor } = connect(target);
  await ready;

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 1600,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await send("Page.navigate", { url: `${BASE}/lab/${SLUG}` });
  await waitFor(`!!document.querySelector('textarea[aria-label^="Your solution"]')`, {
    label: "the challenge editor",
  });

  // A previous run's localStorage would make "already solved" look like a pass.
  await evaluate(`localStorage.clear()`);
  await send("Page.navigate", { url: `${BASE}/lab/${SLUG}` });
  await waitFor(`!!document.querySelector('textarea[aria-label^="Your solution"]')`, {
    label: "the challenge editor after reset",
  });

  const startsUnsolved = await evaluate(
    `!document.body.textContent.includes('Solved') && !localStorage.getItem('knowledge-v1')`,
  );
  startsUnsolved
    ? ok("starts unsolved, with no stored placement")
    : bad("the lab already looked solved before anything ran");

  /* 1 — the starter must fail, and say how ------------------------------- */

  await evaluate(`${buttonBy("Run tests")}.click()`);
  await waitFor(`!!document.querySelector('[role="status"]')`, { label: "a result" });
  await waitFor(`!document.body.textContent.includes('Running…')`, { label: "the run to finish" });

  const firstRun = await evaluate(`(() => {
    const status = document.querySelector('[role="status"]');
    const rows = [...status.querySelectorAll('li')];
    return {
      passed: status.textContent.includes('tests pass'),
      total: rows.length,
      failed: rows.filter(li => li.querySelector('[aria-label="failed"]')).length,
      named: rows.every(li => li.textContent.trim().length > 0),
      attempted: JSON.parse(localStorage.getItem('knowledge-v1') || '{}').attempted || [],
    };
  })()`);

  firstRun.total > 0
    ? ok(`the starter run lists all ${firstRun.total} tests`)
    : bad("no test rows rendered after running the starter");
  !firstRun.passed && firstRun.failed > 0
    ? ok(`${firstRun.failed} of them fail, as the starter should`)
    : bad("the untouched starter reported a pass", JSON.stringify(firstRun));
  firstRun.named ? ok("every row is labelled") : bad("a test row rendered with no name");
  firstRun.attempted.includes(SLUG)
    ? ok("running marked the lab attempted")
    : bad("running did not record an attempt", JSON.stringify(firstRun.attempted));

  /* 2 — hints ------------------------------------------------------------ */

  await evaluate(`${buttonBy("Hint")}.click()`);
  const hint = await evaluate(`(() => {
    const li = [...document.querySelectorAll('li')].find(e => e.textContent.includes('Hint 1'));
    return li ? li.textContent.replace(/^\\s*Hint 1\\s*/, '').trim() : null;
  })()`);
  hint && hint.length > 10
    ? ok("the first hint appears", `${hint.slice(0, 56)}…`)
    : bad("no hint text appeared after clicking Hint");

  /* 3 — reveal ----------------------------------------------------------- */

  await evaluate(`${buttonBy("Show me the answer")}.click()`);
  await waitFor(`document.body.textContent.includes('Reference implementation')`, {
    label: "the reference implementation",
  });

  const reference = await evaluate(`(() => {
    const heads = [...document.querySelectorAll('p')];
    const head = heads.find(p => p.textContent.trim() === 'Reference implementation');
    const pre = head?.parentElement?.querySelector('pre');
    return pre ? pre.textContent : null;
  })()`);

  reference && reference.includes("function")
    ? ok("the reference implementation is revealed")
    : bad("could not read a reference implementation from the page");

  const revealed = await evaluate(
    `(JSON.parse(localStorage.getItem('knowledge-v1') || '{}').revealed || []).includes(${JSON.stringify(SLUG)})`,
  );
  revealed ? ok("revealing is recorded") : bad("revealing the answer was not recorded");

  /* 4 — paste the reference back and pass -------------------------------- */

  // React owns the textarea's value, so assigning to .value is ignored on the
  // next render. The native setter plus a bubbling input event is what a real
  // keystroke looks like from React's side.
  await evaluate(`(() => {
    const ta = document.querySelector('textarea[aria-label^="Your solution"]');
    const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    set.call(ta, ${JSON.stringify(reference ?? "")});
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);

  const typed = await evaluate(
    `document.querySelector('textarea[aria-label^="Your solution"]').value.includes('function')`,
  );
  typed ? ok("the editor accepts a pasted solution") : bad("the editor did not take the solution");

  await evaluate(`${buttonBy("Run tests")}.click()`);
  await waitFor(`!document.body.textContent.includes('Running…')`, {
    label: "the second run to finish",
  });
  await waitFor(`document.querySelector('[role="status"]')?.textContent.includes('tests pass')`, {
    label: "a passing run",
    timeout: 15000,
  }).catch(() => {});

  const secondRun = await evaluate(`(() => {
    const status = document.querySelector('[role="status"]');
    const rows = [...status.querySelectorAll('li')];
    const store = JSON.parse(localStorage.getItem('knowledge-v1') || '{}');
    return {
      passed: status.textContent.includes('tests pass'),
      failed: rows.filter(li => li.querySelector('[aria-label="failed"]')).length,
      badge: document.body.textContent.includes('Solved'),
      solved: store.solved || [],
      copy: status.textContent.trim().slice(0, 60),
    };
  })()`);

  secondRun.passed && secondRun.failed === 0
    ? ok("the revealed reference makes every test pass", secondRun.copy)
    : bad("the reference did not pass from inside the browser", JSON.stringify(secondRun));
  secondRun.badge ? ok("the Solved badge appears") : bad("no Solved badge after passing");
  secondRun.solved.includes(SLUG)
    ? ok("passing writes the lab into placement")
    : bad("passing did not record the lab as solved", JSON.stringify(secondRun.solved));

  /* 5 — the work survives a reload, and Reset gives the starter back ----- */

  const marker = "// still here after a reload";
  await evaluate(`(() => {
    const ta = document.querySelector('textarea[aria-label^="Your solution"]');
    const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    set.call(ta, ${JSON.stringify(`${marker}\n`)} + ta.value);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);

  await send("Page.navigate", { url: `${BASE}/lab/${SLUG}` });
  await waitFor(`!!document.querySelector('textarea[aria-label^="Your solution"]')`, {
    label: "the editor after a reload",
  });
  // The draft loads in an effect, so it lands a tick after the editor exists.
  const kept = await waitFor(
    `document.querySelector('textarea[aria-label^="Your solution"]').value.includes(${JSON.stringify(marker)})`,
    { label: "the draft to be restored", timeout: 8000 },
  ).catch(() => false);
  kept
    ? ok("a reload keeps your unfinished code")
    : bad("the draft was lost on reload — work typed into the editor did not survive");

  await evaluate(`${buttonBy("Reset")}.click()`);
  const afterReset = await evaluate(`(() => {
    const ta = document.querySelector('textarea[aria-label^="Your solution"]');
    return { hasMarker: ta.value.includes(${JSON.stringify(marker)}), len: ta.value.length };
  })()`);
  !afterReset.hasMarker && afterReset.len > 0
    ? ok("Reset restores the starter")
    : bad("Reset did not restore the starter", JSON.stringify(afterReset));

  /* 6 — the loop closes: the bridge map moves on ------------------------- */

  await send("Page.navigate", { url: `${BASE}/lab` });
  await waitFor(
    `document.body.textContent.includes('next three') ||
                 document.body.textContent.includes('Start here')`,
    {
      label: "the bridge map",
    },
  );

  const map = await evaluate(`(() => {
    const heading = [...document.querySelectorAll('h2')].find(h =>
      h.textContent.includes('next three') || h.textContent.includes('Start here'));
    const section = heading?.closest('section');
    return {
      personal: !!heading?.textContent.includes('next three'),
      unlocks: !!section?.textContent.includes(${JSON.stringify(UNLOCKS)}),
      offersSolved: !!section?.textContent.includes('LRU Cache'),
    };
  })()`);

  map.personal
    ? ok('the map switches to "Your next three"')
    : bad("the map still shows the first-time state after solving a lab");
  map.unlocks
    ? ok(`solving ${SLUG} surfaces ${UNLOCKS}`)
    : bad(`${UNLOCKS} did not appear after solving its prerequisite`);
  !map.offersSolved
    ? ok("the lab just solved is no longer offered")
    : bad("the map still offers a lab that was just solved");

  ws.close();
}

function report() {
  console.log("\nChallenge flow — a visitor's path, in a real browser\n");
  for (const c of checks) {
    console.log(`  ${c.pass ? "✓" : "✗"} ${c.msg}${c.detail ? `\n      ${c.detail}` : ""}`);
  }
  const failed = checks.filter((c) => !c.pass).length;
  console.log(
    failed === 0
      ? `\n✓ The core loop works end to end (${checks.length} checks).\n`
      : `\n✗ ${failed} of ${checks.length} checks failed.\n`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
