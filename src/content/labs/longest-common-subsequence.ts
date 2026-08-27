import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "longest-common-subsequence",
  title: "Longest Common Subsequence",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "Find shared order between two sequences.",
  caption:
    "Fill the DP matrix row by row. Matching characters extend the diagonal; mismatches take the best neighbor.",
  skillTags: ["DSA", "Dynamic Programming"],
  concept:
    "LCS finds the longest sequence that appears in both inputs in the same order, not necessarily contiguously. If characters match, dp[i][j] = 1 + dp[i-1][j-1]. Otherwise it takes max(dp[i-1][j], dp[i][j-1]).\n\nIt is the foundation for diff tools and sequence similarity because it preserves relative ordering.",
  complexity: [
    { operation: "LCS length", time: "O(mn)", space: "O(mn)" },
    { operation: "Space optimized length", time: "O(mn)", space: "O(min(m,n))" },
  ],
  realWorld: ["Git diff, document comparison, DNA/protein sequence analysis, and merge tools."],
  pitfalls: [
    "LCS differs from longest common substring.",
    "Reconstructing the sequence needs backtracking or parent data.",
    "Large strings require memory optimization.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// LCS table — the core of line-based diffs.
export function lcs(a: string[], b: string[]): number[][] {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1              // matched line -> context
        : Math.max(dp[i - 1][j], dp[i][j - 1]); // deletion or insertion
    }
  }
  return dp; // backtrack from dp[a.length][b.length] to emit the patch
}`,
  },
  usedBy: [
    {
      company: "Git / Linux Foundation",
      product: "git diff (Myers algorithm)",
      usage:
        "Diff output is the complement of a longest common subsequence between the two file versions.",
      href: "https://git-scm.com/docs/git-diff",
    },
    {
      company: "GitHub",
      product: "Pull request diff views",
      usage:
        "Side-by-side and unified PR diffs render the LCS-derived edit script produced by the diff engine.",
      href: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-comparing-branches-in-pull-requests",
    },
    {
      company: "Google",
      product: "diff-match-patch (Docs revision history)",
      usage:
        "Character-level diffing for collaborative editing and revision playback is built on the same LCS/edit-script machinery.",
      href: "https://github.com/google/diff-match-patch",
    },
  ],
  references: [
    {
      label: "Myers — An O(ND) difference algorithm",
      href: "http://www.xmailserver.org/diff2.pdf",
    },
    { label: "Google — diff-match-patch", href: "https://github.com/google/diff-match-patch" },
  ],
};
