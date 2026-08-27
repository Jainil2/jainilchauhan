import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { highlight } from "@/lib/highlight";

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
        <span className="font-code text-xs uppercase tracking-widest text-muted-foreground">
          {language}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 font-code text-xs text-muted-foreground hover:border-terminal/40 hover:text-terminal"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-code text-xs leading-relaxed">
        <code>{highlight(code, language)}</code>
      </pre>
    </div>
  );
}
