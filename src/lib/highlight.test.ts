import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { highlight } from "./highlight";

/**
 * Pull the text back out of the returned spans without rendering. React
 * elements are plain objects, so this reads props directly.
 */
function textOf(nodes: ReturnType<typeof highlight>): string {
  return nodes.map((n) => (n as ReactElement<{ children: string }>).props.children).join("");
}

function kindsOf(nodes: ReturnType<typeof highlight>): string[] {
  return nodes.map((n) => (n as ReactElement<{ className: string }>).props.className);
}

/**
 * The overlay editor lays a transparent <textarea> over these spans, so every
 * character of the input must survive tokenization in order. A dropped space or
 * swallowed newline shifts the glyphs out from under the caret — and that is
 * invisible to every other test in this repo, which is exactly how it shipped
 * broken the first time.
 */
describe("highlight — byte fidelity", () => {
  const cases: [string, string][] = [
    ["empty", ""],
    ["single space", " "],
    ["runs of spaces", "a        b"],
    ["leading indentation", "    const x = 1;"],
    ["tabs", "\tif (a) {\n\t\treturn b;\n\t}"],
    ["trailing newline", "const a = 1;\n"],
    ["multiple blank lines", "a\n\n\n\nb"],
    ["CRLF", "const a = 1;\r\nconst b = 2;\r\n"],
    ["line comment", "// a comment with 'quotes' and \"doubles\"\ncode();"],
    ["block comment", "/* multi\n   line */ const x = 1;"],
    ["template literal", "const s = `hello ${name} and ${a + b}`;"],
    ["nested quotes", `const s = "he said 'hi' to me";`],
    ["escaped quote", 'const s = "a \\" b";'],
    ["unterminated string", 'const s = "never closed'],
    ["numbers", "const a = 1.5 + 42 - 0;"],
    ["unicode", "const emoji = '🚀'; // ünïcödé"],
    ["only whitespace", "   \n\t  \n "],
    ["operators", "a>>=b; c??=d; e?.f;"],
    [
      "a real starter",
      `/**\n * @param {string[]} touched\n */\nfunction evict(touched, capacity) {\n  // your code\n}\n`,
    ],
  ];

  it.each(cases)("preserves every character: %s", (_name, input) => {
    expect(textOf(highlight(input, "ts"))).toBe(input);
  });

  it.each(cases)("preserves every character in sql mode: %s", (_name, input) => {
    expect(textOf(highlight(input, "sql"))).toBe(input);
  });

  it("never emits an empty token", () => {
    const nodes = highlight("const a = 1;\n\nreturn a;", "ts");
    for (const n of nodes) {
      expect((n as ReactElement<{ children: string }>).props.children).not.toBe("");
    }
  });
});

describe("highlight — classification", () => {
  it("colours keywords, strings, numbers and comments differently", () => {
    const classes = kindsOf(highlight(`const a = "s"; // note\nreturn 42;`, "ts"));
    expect(classes).toContain("text-code-kw");
    expect(classes).toContain("text-code-str");
    expect(classes).toContain("text-code-num");
    expect(classes).toContain("text-code-com italic");
  });

  it("marks an identifier followed by ( as a call", () => {
    const nodes = highlight("myHelper(1);", "ts");
    expect(kindsOf(nodes)[0]).toBe("text-code-fn");
  });

  it("marks a call with whitespace before the paren", () => {
    const nodes = highlight("myHelper  (1);", "ts");
    expect(kindsOf(nodes)[0]).toBe("text-code-fn");
  });

  it("does not mark a bare identifier as a call", () => {
    const nodes = highlight("myValue + 1;", "ts");
    expect(kindsOf(nodes)[0]).toBe("text-code-punct");
  });

  it("does not reclassify a keyword as a call", () => {
    // `if (` must stay a keyword, or every control-flow word turns into a
    // function name.
    const nodes = highlight("if (a) {}", "ts");
    expect(kindsOf(nodes)[0]).toBe("text-code-kw");
  });

  it("uses no colour token that resolves to grey-on-grey", () => {
    // Guards the original bug: the tokenizer used --terminal and
    // --cyan-accent, both of which the light redesign remapped to neutrals, so
    // every token rendered the same shade.
    const classes = kindsOf(highlight(`const a = "s";`, "ts")).join(" ");
    expect(classes).not.toContain("text-terminal");
    expect(classes).not.toContain("text-cyan-accent");
  });
});
