import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "stack",
  title: "Stack",
  category: "Data Structures",
  difficulty: "Beginner",
  readingTimeMin: 3,
  blurb: "Last-in, first-out storage for nested work.",
  caption:
    "Push and pop call frames from the top. The newest item is always removed first, matching recursion and parser behavior.",
  skillTags: ["DSA", "Algorithms"],
  concept:
    "A stack is a LIFO structure: push adds to the top, pop removes from the top, and peek reads the top without removing it. It can be implemented with an array or linked list.\n\nStacks model nested work. Function calls, expression parsing, undo history, DFS, browser navigation, and bracket matching all rely on the idea that the most recent unfinished item should be handled first.",
  complexity: [
    { operation: "Push", time: "O(1)", space: "O(1)" },
    { operation: "Pop/peek", time: "O(1)", space: "O(1)" },
  ],
  realWorld: [
    "Call stacks, DFS traversal, expression evaluators, undo stacks, and monotonic stacks.",
  ],
  pitfalls: [
    "Recursive algorithms can overflow the process call stack.",
    "Popping from an empty stack must be handled explicitly.",
    "A stack reverses order; this is useful but easy to misuse.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Bracket matching: the classic LIFO check behind every parser.
const PAIRS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

export function balanced(src: string): boolean {
  const stack: string[] = [];
  for (const ch of src) {
    if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
    else if (ch in PAIRS) {
      if (stack.pop() !== PAIRS[ch]) return false; // wrong closer
    }
  }
  return stack.length === 0; // nothing left unclosed
}`,
  },
  usedBy: [
    {
      company: "Google",
      product: "V8 call stack / Error.stack",
      usage:
        "Each JS call pushes a frame; the stack trace you read in DevTools is that stack unwound, and deep recursion pops out as RangeError.",
      href: "https://v8.dev/docs/stack-trace-api",
    },
    {
      company: "Mozilla",
      product: "WebAssembly value stack",
      usage:
        "Wasm is a stack machine: instructions push and pop operands, and validation checks the stack shape ahead of time.",
      href: "https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Understanding_the_text_format",
    },
    {
      company: "Figma",
      product: "Undo / redo history",
      usage:
        "Editing tools keep an undo stack of inverse operations, popping the most recent edit first.",
    },
  ],
  references: [
    { label: "V8 — Stack trace API", href: "https://v8.dev/docs/stack-trace-api" },
    {
      label: "MDN — Call stack",
      href: "https://developer.mozilla.org/en-US/docs/Glossary/Call_stack",
    },
  ],
};
