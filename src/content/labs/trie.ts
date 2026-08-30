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
  bridgesFrom: [
    {
      slug: "binary-tree",
      sameness:
        "It IS a tree. Nodes, children, a root, and a descent from the root to find something — every traversal instinct you built on binary trees transfers.",
      delta:
        "Two things change and both follow from the same decision. The branching factor becomes the alphabet rather than two, and the key stops being stored in the node: a node's key is the path taken to reach it. That is why a prefix query costs the length of the prefix rather than the log of the collection size, and why memory explodes on sparse alphabets — an unused child slot still occupies space in every node unless you switch to a map per node.",
    },
  ],
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
  challenge: {
    prompt:
      "Build a prefix tree over a word list and return every completion of a prefix, alphabetically, capped at a limit. A tokenizer does the same longest-prefix walk over its vocabulary for every piece of text it encodes.",
    entry: "autocomplete",
    starter: `/**
 * @param {string[]} words - the vocabulary. May contain duplicates.
 * @param {string} prefix - the typed prefix. An empty prefix matches everything.
 * @param {number} limit - maximum results.
 * @returns {string[]} matching words, alphabetical, at most 'limit'.
 */
function autocomplete(words, prefix, limit) {
  // Walk the prefix once. If the walk falls off the tree, there are no matches.
  // Otherwise collect the words beneath the node you landed on.
}
`,
    tests: [
      {
        name: "returns words sharing the prefix",
        body: `assertEquals(solution(['cat', 'car', 'dog'], 'ca', 10), ['car', 'cat']);`,
      },
      {
        name: "results are alphabetical",
        body: `assertEquals(solution(['cart', 'car', 'cab'], 'ca', 10), ['cab', 'car', 'cart']);`,
      },
      {
        name: "respects the limit",
        body: `assertEquals(solution(['ca', 'cab', 'cat', 'car'], 'ca', 2), ['ca', 'cab']);`,
      },
      {
        name: "a word is its own completion",
        body: `assertEquals(solution(['cat'], 'cat', 10), ['cat']);`,
      },
      {
        name: "unknown prefix returns nothing",
        body: `assertEquals(solution(['cat', 'car'], 'z', 10), []);`,
      },
      {
        name: "empty prefix matches everything",
        body: `assertEquals(solution(['b', 'a'], '', 10), ['a', 'b']);`,
      },
      {
        name: "duplicates appear once",
        body: `assertEquals(solution(['cat', 'cat'], 'c', 10), ['cat']);`,
      },
      {
        name: "scales to a large vocabulary",
        body: `var words = [];
for (var i = 0; i < 5000; i++) words.push('w' + i);
var out = solution(words, 'w1', 5);
assertEquals(out.length, 5);
assertEquals(out[0], 'w1');`,
      },
    ],
    hints: [
      "Each node is a map from character to child node, plus a flag marking the end of a word.",
      "Walk the prefix character by character. A missing child means no matches at all.",
      "Collect with a depth-first walk, visiting children in sorted key order so results come out alphabetically.",
    ],
    reference: `function autocomplete(words, prefix, limit) {
  const root = { children: new Map(), end: false };
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), end: false });
      node = node.children.get(ch);
    }
    node.end = true; // a duplicate word just sets the same flag again
  }

  let node = root;
  for (const ch of prefix) {
    node = node.children.get(ch);
    if (!node) return []; // the walk fell off the tree
  }

  const out = [];
  (function collect(n, built) {
    if (out.length >= limit) return;
    if (n.end) out.push(built);
    // Sorted keys give alphabetical output without a final sort.
    for (const ch of [...n.children.keys()].sort()) {
      if (out.length >= limit) return;
      collect(n.children.get(ch), built + ch);
    }
  })(node, prefix);
  return out;
}
`,
  },
};
