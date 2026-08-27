import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "trie",
  title: "Trie (Prefix Tree)",
  category: "Data Structures",
  difficulty: "Beginner",
  readingTimeMin: 3,
  blurb: "The engine of autocomplete.",
  caption:
    "Store and search strings by their common prefixes. Watch as words like 'CAT' and 'CART' share the same initial nodes. Perfect for dictionaries, IP routing, and predictive text.",
  skillTags: ["DSA", "Strings"],
  concept:
    "A Trie (from 'retrieval') is a tree-based data structure used for storing a set of strings where each node represents a single character. Words with common prefixes share the same path from the root.\n\nUnlike a hash map, a Trie allows for efficient prefix-based queries ('find all words starting with 'tra''). Searching for a word of length L takes O(L) time, regardless of how many millions of words are in the Trie.\n\nWhile space-intensive for small sets, Tries become very efficient as the overlap between strings increases.",
  complexity: [
    { operation: "Insert", time: "O(L) where L = length", space: "O(L * alphabet_size)" },
    { operation: "Search", time: "O(L)", space: "O(1)" },
    { operation: "Prefix Search", time: "O(L + K) where K = matches", space: "O(1)" },
  ],
  realWorld: [
    "Search Engines: for 'as-you-type' suggestions (autocomplete).",
    "IP Routing: Longest Prefix Match (LPM) in network routers.",
    "T9 Predictive Text: on older mobile phones.",
    "Spell Checkers: for identifying valid word completions.",
  ],
  pitfalls: [
    "High Memory: for large datasets with little prefix overlap, a Trie can use much more memory than a sorted list or hash set. Use a **Radix Tree** (compressed Trie) to solve this.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Prefix tree: lookup cost depends on key length, not dictionary size.
class TrieNode {
  children = new Map<string, TrieNode>();
  terminal = false;
  top: string[] = []; // cached best completions for this prefix
}

function insert(root: TrieNode, word: string) {
  let node = root;
  for (const ch of word) {
    if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
    node = node.children.get(ch)!;
  }
  node.terminal = true;
}

function complete(root: TrieNode, prefix: string): string[] {
  let node: TrieNode | undefined = root;
  for (const ch of prefix) node = node?.children.get(ch);
  return node?.top ?? []; // precomputed top-k keeps typeahead O(len(prefix))
}`,
  },
  usedBy: [
    {
      company: "Google",
      product: "Search autocomplete",
      usage:
        "Prefix structures with precomputed top completions are how a suggestion list returns within a keystroke budget.",
      href: "https://blog.google/products/search/how-google-autocomplete-works-search/",
    },
    {
      company: "Elastic",
      product: "Elasticsearch completion suggester (FST)",
      usage:
        "Lucene stores the term dictionary as a finite state transducer — a compressed trie — for prefix and fuzzy lookups.",
      href: "https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html",
    },
    {
      company: "Cloudflare / router vendors",
      product: "IP routing tables (radix trie)",
      usage: "Longest-prefix-match forwarding uses a compressed radix trie over address bits.",
      href: "https://datatracker.ietf.org/doc/html/rfc1519",
    },
  ],
  references: [
    {
      label: "Elasticsearch — suggesters (FST-backed completion)",
      href: "https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html",
    },
    {
      label: "Google — how autocomplete works",
      href: "https://blog.google/products/search/how-google-autocomplete-works-search/",
    },
  ],
};
