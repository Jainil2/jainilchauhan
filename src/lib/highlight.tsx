import type { ReactNode } from "react";

/**
 * Minimal syntax tokenizer, shared by the read-only CodeBlock and the challenge
 * editor. Deliberately not a real highlighter — keywords, strings, numbers and
 * comments only — to avoid pulling a heavy dependency onto content pages.
 *
 * One property the challenge editor depends on: the token regex ends in a
 * `[\s\S]` catch-all, so every character of the input lands in exactly one
 * token and the concatenated token text equals the input byte for byte. That is
 * what lets a transparent <textarea> sit flush over the highlighted <pre>. Do
 * not "optimise" by skipping whitespace — the overlay would drift out of
 * alignment on the first blank line.
 */
const KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "do",
  "import",
  "from",
  "export",
  "default",
  "class",
  "new",
  "this",
  "typeof",
  "instanceof",
  "true",
  "false",
  "null",
  "undefined",
  "async",
  "await",
  "try",
  "catch",
  "finally",
  "throw",
  "interface",
  "type",
  "enum",
  "extends",
  "implements",
  "public",
  "private",
  "protected",
  "def",
  "lambda",
  "pass",
  "yield",
  "with",
  "as",
  "in",
  "is",
  "not",
  "and",
  "or",
  "package",
  "func",
  "go",
  "chan",
  "select",
  "map",
  "range",
  "struct",
  "defer",
  "goroutine",
  "select",
  "insert",
  "update",
  "delete",
  "from",
  "where",
  "values",
  "into",
  "table",
  "index",
  "create",
  "alter",
  "join",
  "on",
  "group",
  "by",
  "order",
  "limit",
]);

export function highlight(src: string, lang: string): ReactNode[] {
  // Token regex: comments | strings | numbers | identifiers | other
  const isSql = lang === "sql";
  const tokens: { t: string; k: "kw" | "str" | "num" | "com" | "fn" | "txt" }[] = [];
  const re = isSql
    ? /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z_0-9]*\b)|([\s\S])/g
    : /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z_0-9]*\b)|([\s\S])/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (m[1]) tokens.push({ t: m[1], k: "com" });
    else if (m[2]) tokens.push({ t: m[2], k: "str" });
    else if (m[3]) tokens.push({ t: m[3], k: "num" });
    else if (m[4]) {
      const w = isSql ? m[4].toLowerCase() : m[4];
      if (KEYWORDS.has(w)) tokens.push({ t: m[4], k: "kw" });
      else tokens.push({ t: m[4], k: "txt" });
    } else tokens.push({ t: m[5], k: "txt" });
  }

  return tokens.map((tok, i) => {
    if (tok.k === "kw")
      return (
        <span key={i} className="text-cyan-accent">
          {tok.t}
        </span>
      );
    if (tok.k === "str")
      return (
        <span key={i} className="text-terminal">
          {tok.t}
        </span>
      );
    if (tok.k === "num")
      return (
        <span key={i} className="text-amber-300">
          {tok.t}
        </span>
      );
    if (tok.k === "com")
      return (
        <span key={i} className="text-muted-foreground italic">
          {tok.t}
        </span>
      );
    return (
      <span key={i} className="text-foreground">
        {tok.t}
      </span>
    );
  });
}
