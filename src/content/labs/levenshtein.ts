import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "levenshtein",
  title: "Levenshtein Distance",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Calculating the cost of change.",
  caption:
    "Find the minimum number of edits to turn one string into another. Watch the Dynamic Programming matrix fill up as it calculates the cost of Insertions, Deletions, and Substitutions. The foundation of diffing and spell-check.",
  skillTags: ["Algorithms", "Strings", "Dynamic Programming"],
  concept:
    "Levenshtein Distance (or Edit Distance) measures the minimum number of single-character edits required to change one string into another. Edits include: Insertion, Deletion, and Substitution.\n\nIt is a classic application of **Dynamic Programming**. We build a 2D matrix where `dp[i][j]` represents the distance between the first `i` characters of string A and the first `j` characters of string B. \n\nEach cell is calculated from its neighbors: a match costs 0 + diagonal, while a mismatch costs 1 + the minimum of the three adjacent cells.",
  complexity: [
    { operation: "Compute", time: "O(M * N)", space: "O(M * N)" },
    { operation: "Optimized Space", time: "O(M * N)", space: "O(min(M, N))" },
  ],
  realWorld: [
    "Spell Checkers: suggesting the closest valid word to a typo.",
    "Git Diff: helping calculate which lines were modified.",
    "Bioinformatics: comparing DNA sequences to find mutations.",
    "NLP: fuzzy string matching for entity resolution.",
  ],
  pitfalls: [
    "Performance: O(M*N) is too slow for very long strings (e.g., full books). Use the **Wagner–Fischer** algorithm optimization or bit-parallelism for better performance.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Edit distance with a rolling row: O(n*m) time, O(min(n,m)) memory.
export function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,          // deletion
        cur[j - 1] + 1,       // insertion
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1), // substitution
      );
    }
    prev = cur;
  }
  return prev[b.length];
}`,
  },
  usedBy: [
    {
      company: "Elastic",
      product: "Elasticsearch fuzzy queries",
      usage:
        "`fuzziness: AUTO` matches terms within a Levenshtein distance using a Levenshtein automaton over the term dictionary.",
      href: "https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html",
    },
    {
      company: "Google",
      product: '"Did you mean" spelling correction',
      usage:
        "Candidate corrections are generated within a small edit distance and then re-ranked by language models and click data.",
      href: "https://blog.google/products/search/how-google-autocomplete-works-search/",
    },
    {
      company: "Git / Linux Foundation",
      product: "Command suggestions",
      usage:
        "`git: 'comit' is not a git command` suggestions come from edit distance against the known command list.",
      href: "https://git-scm.com/docs/git-config#Documentation/git-config.txt-helpautoCorrect",
    },
  ],
  references: [
    {
      label: "Elasticsearch — fuzzy query (edit distance)",
      href: "https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html",
    },
    {
      label: "Schulz & Mihov — fast string correction with Levenshtein automata",
      href: "https://link.springer.com/article/10.1007/s10032-002-0082-8",
    },
  ],
};
