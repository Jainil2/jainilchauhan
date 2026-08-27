import {
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type UIEvent,
} from "react";
import { highlight } from "@/lib/highlight";

interface CodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const INDENT = "  ";

/**
 * Typography shared by the gutter, the highlighted layer, and the textarea.
 *
 * Applied as an INLINE STYLE on every layer, deliberately, rather than through
 * classes. Tailwind Preflight ships `code, pre, kbd, samp { font-family:
 * var(--font-mono) }`, and this project aliases --font-mono to Manrope on
 * purpose (mono is opt-in via .font-code). That rule targets <code> directly,
 * so it beat the .font-code class on the parent <pre> and rendered the code in
 * a proportional sans-serif: the same line measured 273px in the textarea and
 * 209.81px in the <code>, and eight spaces measured 62.41px against 20.81px.
 * The caret is positioned with textarea metrics and the glyphs were painted
 * with Manrope's, which is what made the caret drift, refuse to cross spaces,
 * and delete in the wrong place.
 *
 * One object, inline, on all layers. They cannot diverge again.
 * Ligatures are off because a ligature substitution can alter advance width,
 * and any width difference between the layers reintroduces the same bug.
 */
const TYPE: CSSProperties = {
  fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: "13px",
  lineHeight: "22px",
  letterSpacing: "normal",
  wordSpacing: "normal",
  fontWeight: 400,
  fontVariantLigatures: "none",
  fontFeatureSettings: "normal",
  fontKerning: "none",
  tabSize: 2,
  whiteSpace: "pre",
  overflowWrap: "normal",
  wordBreak: "normal",
  boxSizing: "border-box",
  textRendering: "auto",
};

/** Padding must match exactly too, or line one starts at a different x/y. */
const PAD: CSSProperties = { paddingTop: 12, paddingBottom: 12, paddingLeft: 12, paddingRight: 12 };

/**
 * A transparent <textarea> laid over a syntax-highlighted <pre>.
 *
 * ponytail: no bracket matching, no autocomplete, no multi-line Tab. Fine for
 * 10-30 line challenges. CodeMirror 6 behind a lazy import is the upgrade path
 * if challenges ever outgrow this.
 *
 * If you change any type or spacing value here, change it in TYPE/PAD only,
 * and re-run `node scripts/check-editor-metrics.mjs` — layer drift is invisible
 * to unit tests and obvious to anyone trying to type.
 */
export function CodeEditor({ value, onChange, disabled, ariaLabel }: CodeEditorProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const lines = value.split("\n");

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Tab") return;
    // Tab indents rather than moving focus. Losing your place mid-solution is
    // the kind of small hostility that makes people quit.
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;
    onChange(value.slice(0, start) + INDENT + value.slice(end));
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + INDENT.length;
    });
  }

  function syncScroll(e: UIEvent<HTMLTextAreaElement>) {
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

  return (
    <div
      className="flex overflow-hidden rounded-md border border-border bg-background focus-within:ring-1 focus-within:ring-ring"
      onClick={() => taRef.current?.focus()}
    >
      <div
        ref={gutterRef}
        aria-hidden
        className="select-none overflow-hidden border-r border-border bg-card/50 text-right text-muted-foreground"
        style={{ ...TYPE, ...PAD, paddingLeft: 8, paddingRight: 8, minWidth: "2.75rem" }}
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      <div className="relative flex-1">
        <pre
          ref={preRef}
          aria-hidden
          className="pointer-events-none overflow-auto"
          style={{ ...TYPE, ...PAD, minHeight: "16rem", margin: 0 }}
        >
          {/*
           * TYPE is repeated on <code> on purpose: Preflight styles `code`
           * directly, so inheriting from the <pre> is not enough.
           */}
          <code style={TYPE}>{highlight(value, "ts")}</code>
          {"\n"}
        </pre>
        <textarea
          ref={taRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          disabled={disabled}
          aria-label={ariaLabel ?? "Your solution"}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          className="absolute inset-0 h-full w-full resize-none overflow-auto border-0 bg-transparent text-transparent caret-foreground outline-none disabled:opacity-60"
          style={{ ...TYPE, ...PAD, margin: 0 }}
        />
      </div>
    </div>
  );
}
