#!/usr/bin/env node
/**
 * Verify the challenge editor's layers are metrically identical.
 *
 * The editor lays a transparent <textarea> over a highlighted <pre><code>. If
 * the two disagree about font, size, line-height, letter-spacing, tab-size or
 * padding by even a fraction, the caret drifts away from the glyphs: clicks
 * land in the wrong column, the caret will not cross spaces, and text deletes
 * somewhere other than where the caret appears.
 *
 * That failure is invisible to every unit test in this repo -- which is exactly
 * how it shipped broken. Tailwind Preflight styles `code` with var(--font-mono),
 * and this project aliases --font-mono to Manrope, so <code> silently rendered
 * in a proportional sans-serif while the caret used JetBrains Mono metrics.
 *
 * Requires: `npm run dev` on :8080, and Google Chrome. No dependencies --
 * Node's built-in WebSocket drives CDP directly.
 *
 *   npm run dev
 *   node scripts/check-editor-metrics.mjs
 */
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";

const APP = "http://localhost:8080/lab/lru-cache";
const PORT = 9444;
const PROFILE = "/tmp/editor-metrics-profile";
const CHROME =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/**
 * Text metrics decide where each glyph lands, so all three layers must agree —
 * including <code>, which Preflight styles directly.
 */
const TEXT_METRICS = [
  "fontFamily",
  "fontSize",
  "lineHeight",
  "letterSpacing",
  "wordSpacing",
  "fontWeight",
  "fontVariantLigatures",
  "tabSize",
  "whiteSpace",
];

/**
 * Box metrics decide where the text block *starts*, and are compared only
 * between the textarea and the <pre>. <code> is an inline child of the padded
 * <pre> and correctly has no padding of its own.
 */
const BOX_METRICS = ["paddingTop", "paddingLeft", "borderTopWidth", "borderLeftWidth", "boxSizing"];

const CRITICAL = [...TEXT_METRICS, ...BOX_METRICS];

const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exitCode = 1;
};

async function main() {
  try {
    await fetch(APP, { signal: AbortSignal.timeout(4000) });
  } catch {
    console.error(`Cannot reach ${APP} — start the dev server first (npm run dev).`);
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
    const result = await inspect(target);
    report(result);
  } finally {
    chrome.kill();
    try {
      rmSync(PROFILE, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {
      // Chrome may still be flushing its profile; a leftover temp dir is harmless.
    }
  }
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

async function inspect(target) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => {
    ws.onopen = r;
    ws.onerror = j;
  });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  };
  const send = (method, params = {}) => {
    const msgId = ++id;
    ws.send(JSON.stringify({ id: msgId, method, params }));
    return new Promise((r) => pending.set(msgId, r));
  };

  await send("Page.enable");
  await send("Runtime.enable");
  // The editor sits far below the fold. Without a tall viewport a dispatched
  // click lands outside the page and silently hits nothing, which looks
  // identical to a misaligned caret.
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 1400,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: APP });

  const deadline = Date.now() + 30000;
  let value = null;
  while (Date.now() < deadline) {
    const res = await send("Runtime.evaluate", {
      expression: buildProbe(CRITICAL),
      returnByValue: true,
      awaitPromise: true,
    });
    const v = res.result?.result?.value;
    if (v && !v.pending) {
      value = v;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  value.caret = await caretTest(send);
  ws.close();
  if (!value) throw new Error("Editor never appeared on the page");
  return value;
}

/**
 * The decisive test: click at a computed character cell and assert the caret
 * lands on that exact character.
 *
 * Everything else here is a proxy. This is the symptom itself — "the cursor
 * just appears wherever we click" — so it is measured directly, by dispatching
 * a real mouse event through the browser and reading back selectionStart.
 */
async function caretTest(send) {
  // The editor sits well below the fold, and a mouse event dispatched outside
  // the viewport hits nothing — which reads as "caret at index 0" and looks
  // exactly like a real misalignment. Scroll it into view first.
  await send("Runtime.evaluate", {
    expression: `document.querySelector('textarea[aria-label^="Your solution"]')
      .scrollIntoView({ block: "center" })`,
  });
  await new Promise((r) => setTimeout(r, 600));

  const geometry = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const ta = document.querySelector('textarea[aria-label^="Your solution"]');
      const code = ta.parentElement.querySelector('pre code');
      const cs = getComputedStyle(ta);
      const s = document.createElement('span');
      s.textContent = "0";
      s.style.whiteSpace = 'pre';
      code.appendChild(s);
      const charW = s.getBoundingClientRect().width;
      s.remove();
      const r = ta.getBoundingClientRect();
      const lines = ta.value.split("\\n");
      // The longest visible line: the most room for drift to show up in.
      let target = 0;
      for (let i = 0; i < lines.length; i++) {
        const fits = lines[i].length * charW < r.width - parseFloat(cs.paddingLeft) * 2;
        if (fits && lines[i].length > lines[target].length) target = i;
      }
      let index = 0;
      for (let i = 0; i < target; i++) index += lines[i].length + 1;
      const len = lines[target].length;
      // Aim a quarter into the cell, not the centre: a click exactly on the
      // midpoint rounds to the right-hand boundary and reads as off-by-one.
      const at = (col) => ({
        col,
        x: r.left + parseFloat(cs.paddingLeft) + (col + 0.25) * charW - ta.scrollLeft,
        y:
          r.top +
          parseFloat(cs.paddingTop) +
          (target + 0.5) * parseFloat(cs.lineHeight) -
          ta.scrollTop,
        expected: index + col,
      });
      return {
        line: target,
        text: lines[target],
        charW: Math.round(charW * 1000) / 1000,
        points: [at(2), at(Math.max(3, Math.min(40, len - 2)))],
      };
    })()`,
  });
  const g = geometry.result?.result?.value;
  if (!g) return null;

  const results = [];
  for (const p of g.points) {
    for (const type of ["mousePressed", "mouseReleased"]) {
      await send("Input.dispatchMouseEvent", {
        type,
        x: p.x,
        y: p.y,
        button: "left",
        clickCount: 1,
      });
    }
    const after = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `document.querySelector('textarea[aria-label^="Your solution"]').selectionStart`,
    });
    results.push({ ...p, actual: after.result?.result?.value });
  }
  return { ...g, results };
}

function buildProbe(props) {
  return `(() => {
    const ta = document.querySelector('textarea[aria-label^="Your solution"]');
    if (!ta) return { pending: true };
    const pre = ta.parentElement.querySelector('pre');
    const code = pre && pre.querySelector('code');
    if (!pre || !code) return { pending: true };
    const props = ${JSON.stringify(props)};
    const pick = (el) => Object.fromEntries(props.map((p) => [p, getComputedStyle(el)[p]]));
    // Measure INSIDE the live <code>. A detached clone styled from
    // getComputedStyle(el).font is unreliable -- that shorthand serialises to ""
    // for some elements, so the clone silently falls back to a default font and
    // you end up comparing two identically-wrong numbers.
    const widthInCode = (text) => {
      const s = document.createElement('span');
      s.textContent = text;
      s.style.whiteSpace = 'pre';
      code.appendChild(s);
      const w = s.getBoundingClientRect().width;
      s.remove();
      return Math.round(w * 1000) / 1000;
    };
    // In a monospace face every glyph advances the same width. That property is
    // what actually guarantees the caret cannot drift along a line -- and a
    // space matching a letter is precisely the "caret will not cross spaces"
    // symptom.
    const widths = {
      "8 letters": widthInCode("aaaaaaaa"),
      "8 spaces": widthInCode("        "),
      "8 wide (W)": widthInCode("WWWWWWWW"),
      "8 narrow (i)": widthInCode("iiiiiiii"),
    };
    const colours = {};
    for (const s of code.querySelectorAll('span')) {
      const c = getComputedStyle(s).color;
      colours[c] = (colours[c] || 0) + 1;
    }
    return { textarea: pick(ta), pre: pick(pre), code: pick(code), widths, colours };
  })()`;
}

function report({ textarea, pre, code, widths, colours, caret }) {
  console.log("Text metrics — must match across textarea, pre and code\n");
  for (const prop of TEXT_METRICS) {
    const [a, b, c] = [textarea[prop], pre[prop], code[prop]];
    const ok = a === b && b === c;
    console.log(`  ${ok ? "✓" : "✗"} ${prop.padEnd(22)} ${a}`);
    if (!ok) {
      console.log(`      pre : ${b}`);
      console.log(`      code: ${c}`);
      fail(`${prop} differs between layers — the caret will drift`);
    }
  }

  console.log("\nBox metrics — must match between textarea and pre\n");
  for (const prop of BOX_METRICS) {
    const [a, b] = [textarea[prop], pre[prop]];
    const ok = a === b;
    console.log(`  ${ok ? "✓" : "✗"} ${prop.padEnd(22)} ${a}`);
    if (!ok) {
      console.log(`      pre : ${b}`);
      fail(`${prop} differs — the first line starts at a different offset`);
    }
  }

  console.log("\nMonospace — every glyph must advance identically\n");
  const advances = Object.values(widths);
  const base = advances[0];
  for (const [name, w] of Object.entries(widths)) {
    const ok = Math.abs(w - base) < 0.01;
    console.log(`  ${ok ? "✓" : "✗"} ${name.padEnd(14)} ${w}px  (${(w / 8).toFixed(3)}px/char)`);
    if (!ok) {
      fail(`"${name}" advances differently — the caret drifts along the line`);
    }
  }

  const distinct = Object.keys(colours);
  // A chromatic colour has non-zero a/b in lab() — greys are lab(L 0 0).
  const chromatic = distinct.filter((c) => !/^lab\([^)]*?\s0\s+0\s*\)/.test(c));
  console.log(`\nSyntax colours in use: ${distinct.length}`);
  for (const [c, n] of Object.entries(colours)) console.log(`    ${c}  ×${n}`);
  if (distinct.length < 3) {
    fail(`only ${distinct.length} distinct colour(s) — highlighting is effectively greyscale`);
  } else {
    console.log(`  ✓ ${chromatic.length} distinct token colours`);
  }

  if (caret?.results?.length === 2) {
    console.log("\nCaret — click a character cell, land on that character\n");
    console.log(`    line ${caret.line}: ${JSON.stringify(caret.text.slice(0, 60))}`);
    for (const r of caret.results) {
      const ok = r.actual === r.expected;
      console.log(
        `  ${ok ? "✓" : "✗"} column ${String(r.col).padStart(2)} → expected index ${r.expected}, got ${r.actual}`,
      );
      if (!ok) fail(`clicking column ${r.col} placed the caret ${r.actual - r.expected} away`);
    }
    // The decisive number. A constant offset is harmless boundary rounding;
    // drift that grows with distance is the misalignment bug, and only the
    // delta between two far-apart columns can tell them apart.
    const [a, b] = caret.results;
    const wantDelta = b.expected - a.expected;
    const gotDelta = b.actual - a.actual;
    const ok = wantDelta === gotDelta;
    console.log(
      `  ${ok ? "✓" : "✗"} span of ${wantDelta} columns measured as ${gotDelta} characters — no drift`,
    );
    if (!ok) fail(`caret drifts ${gotDelta - wantDelta} characters over ${wantDelta} columns`);
  }

  if (!process.exitCode) console.log("\n✓ Editor layers are metrically identical.");
}

await main();
