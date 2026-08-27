import { useRef, type ChangeEvent, type KeyboardEvent, type UIEvent } from "react";
import { highlight } from "@/lib/highlight";

interface CodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const INDENT = "  ";

/**
 * A transparent <textarea> laid over a syntax-highlighted <pre>.
 *
 * Chosen over a real editor component because the highlighting already exists
 * in this repo (`@/lib/highlight`) and challenges are 10-30 lines, so ~200KB of
 * CodeMirror buys very little. Both layers must share font, size, line-height,
 * padding, and border width exactly, or the caret drifts from the glyphs.
 *
 * ponytail: no bracket matching, no autocomplete, no multi-line indent on Tab.
 * Swap in CodeMirror 6 behind a lazy import if challenges ever get long enough
 * that people miss those.
 */
export function CodeEditor({ value, onChange, disabled, ariaLabel }: CodeEditorProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Trailing newline keeps the highlighted layer as tall as the textarea when
  // the code ends on a blank line, so the last line never clips.
  const lines = value.split("\n");

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Tab") return;
    // Tab must indent, not move focus — losing your place mid-solution is the
    // kind of small hostility that makes people give up.
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;
    const next = value.slice(0, start) + INDENT + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + INDENT.length;
    });
  }

  function handleScroll(e: UIEvent<HTMLTextAreaElement>) {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
  }

  const shared = "font-code text-[13px] leading-6";

  return (
    <div className="flex overflow-hidden rounded-md border border-border bg-background">
      <div
        ref={gutterRef}
        aria-hidden
        className={`${shared} select-none overflow-hidden border-r border-border bg-card/50 py-3 text-right text-muted-foreground`}
        style={{ minWidth: "3rem" }}
      >
        {lines.map((_, i) => (
          <div key={i} className="px-2">
            {i + 1}
          </div>
        ))}
      </div>

      <div className="relative flex-1">
        <pre
          ref={preRef}
          aria-hidden
          className={`${shared} pointer-events-none overflow-auto px-3 py-3`}
          style={{ minHeight: "16rem", whiteSpace: "pre", tabSize: 2 }}
        >
          <code>{highlight(value, "ts")}</code>
          {"\n"}
        </pre>
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          disabled={disabled}
          aria-label={ariaLabel ?? "Your solution"}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          className={`${shared} absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent px-3 py-3 text-transparent caret-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60`}
          style={{ whiteSpace: "pre", tabSize: 2 }}
        />
      </div>
    </div>
  );
}
