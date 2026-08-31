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
  challenge: {
    prompt:
      "Decide whether a string of brackets is balanced. Supports (), [] and {}. Every agent framework parses tool-call arguments this way before it can trust them.",
    entry: "isBalanced",
    starter: `/**
 * @param {string} s - a string of brackets, possibly with other characters.
 * @returns {boolean} true when every bracket is closed in the right order.
 */
function isBalanced(s) {
  // A closing bracket must match the most recent unclosed opening bracket.
  // That is exactly what a stack is for.
}
`,
    tests: [
      {
        name: "simple pair",
        body: `assertEquals(solution('()'), true);`,
      },
      {
        name: "nested pairs",
        body: `assertEquals(solution('{[()]}'), true);`,
      },
      {
        name: "mismatched types",
        body: `assertEquals(solution('(]'), false);`,
      },
      {
        name: "wrong closing order",
        body: `assertEquals(solution('([)]'), false);`,
      },
      {
        name: "unclosed opening",
        body: `assertEquals(solution('((('), false);`,
      },
      {
        name: "stray closing",
        body: `assertEquals(solution('())'), false);`,
      },
      {
        name: "empty string is balanced",
        body: `assertEquals(solution(''), true);`,
      },
      {
        name: "ignores non-bracket characters",
        body: `assertEquals(solution('a(b[c]d)e'), true);`,
      },
    ],
    hints: [
      "Push every opening bracket. On a closing bracket, pop and check the pair matches.",
      "Popping an empty stack means a closing bracket arrived with nothing open — that is unbalanced.",
      "After the whole string, anything still on the stack was never closed.",
    ],
    reference: `function isBalanced(s) {
  const PAIRS = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (PAIRS[ch]) {
      // pop() on an empty array gives undefined, which never matches a bracket
      if (stack.pop() !== PAIRS[ch]) return false;
    }
  }
  return stack.length === 0;
}
`,
  },
};
