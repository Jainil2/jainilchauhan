import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

/**
 * Lightweight syntax-highlighted code block. Tokenization is intentionally
 * minimal — we only color keywords, strings, numbers, comments — to avoid
 * pulling in a heavy highlighter for a portfolio page.
 */
export function CodeBlock({ code, language = "ts" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-background/80">
      <div className="flex items-center justify-between border-b border-border bg-card/60 px-3 py-1.5">
        <span className="font-code text-[10px] uppercase tracking-widest text-muted-foreground">
          {language}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 font-code text-[10px] text-muted-foreground hover:border-terminal/40 hover:text-terminal"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-code text-[12px] leading-relaxed">
        <code>{highlight(code, language)}</code>
      </pre>
    </div>
  );
}

const KEYWORDS = new Set([
  "const","let","var","function","return","if","else","for","while","do",
  "import","from","export","default","class","new","this","typeof","instanceof",
  "true","false","null","undefined","async","await","try","catch","finally","throw",
  "interface","type","enum","extends","implements","public","private","protected",
  "def","lambda","pass","yield","with","as","in","is","not","and","or",
  "package","func","go","chan","select","map","range","struct","defer","goroutine",
  "select","insert","update","delete","from","where","values","into","table","index","create","alter","join","on","group","by","order","limit",
]);

function highlight(src: string, lang: string) {
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
      return <span key={i} className="text-cyan-accent">{tok.t}</span>;
    if (tok.k === "str")
      return <span key={i} className="text-terminal">{tok.t}</span>;
    if (tok.k === "num")
      return <span key={i} className="text-amber-300">{tok.t}</span>;
    if (tok.k === "com")
      return <span key={i} className="text-muted-foreground/70 italic">{tok.t}</span>;
    return <span key={i} className="text-foreground/85">{tok.t}</span>;
  });
}
