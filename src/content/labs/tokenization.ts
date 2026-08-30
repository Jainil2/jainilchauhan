import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "tokenization",
  title: "Tokenization & BPE",
  category: "AI Systems",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "A trie walk over merges a corpus voted for — and the unit you are billed in.",
  caption:
    "Type anything and watch it split. Common words survive whole, rare ones shatter into pieces, and the character count stops predicting the bill the moment you leave English.",
  skillTags: ["AI Systems", "Text Processing", "Compression"],
  bridgesFrom: [
    {
      slug: "trie",
      sameness:
        "Encoding is a longest-match walk over a prefix structure — the same operation you implemented for autocomplete. Feed characters, follow the longest sequence the vocabulary knows, emit it, continue from there.",
      delta:
        "The entries were not defined by anyone; they were learned by counting pairs in a training corpus. So the vocabulary reflects that corpus's habits: ' the' is one token, an uncommon surname is five, and the same sentence in Hindi or Thai can cost three times what it costs in English. Your trie was a data structure. This one is a pricing model.",
    },
    {
      slug: "huffman-coding",
      sameness:
        "Identical greedy loop: count frequencies, repeatedly combine the pair that pays best, and end with common things encoded short and rare things encoded long. Both are frequency-driven compression built bottom-up.",
      delta:
        "Huffman merges the two least frequent symbols and runs to optimality. BPE merges the most frequent adjacent pair and stops at a fixed vocabulary size — usually 32k to 200k — because the output is not a bitstream but a symbol table an embedding matrix must have a row for. That cap is why rare words fragment: there was no budget left for them.",
    },
  ],
  concept:
    "A model cannot read text. It reads integers indexing an embedding matrix, and tokenization is the step that turns one into the other. Byte-pair encoding is how nearly every current model does it.\n\nTraining is a greedy loop over a corpus: start with individual bytes, count every adjacent pair, merge the most frequent one into a new symbol, and repeat until the vocabulary hits its target size. The output is an ordered list of merges. Encoding replays that list against new text — repeatedly apply the lowest-ranked merge that still matches, until none do.\n\nThe order is the algorithm. Merge rank encodes the order the merges were learned, so applying a later merge first produces different tokens for the same input, which is why two implementations that disagree on tie-breaking disagree on token counts.\n\nEverything downstream inherits the consequences. Context windows are measured in tokens, so a fragmenting language buys fewer words per window. Billing is per token, so identical content costs different amounts in different languages. Models are notoriously bad at counting letters in a word because they never saw the letters — 'strawberry' arrived as two or three opaque symbols. And appending text can retokenize a boundary, so a prompt prefix that was cached may not match after a small edit.",
  complexity: [
    { operation: "Encode (naive replay)", time: "O(n · m)", space: "O(n)" },
    { operation: "Encode (priority queue)", time: "O(n log n)", space: "O(n)" },
    { operation: "Train (per merge)", time: "O(corpus)", space: "O(pairs)" },
    { operation: "Vocabulary storage", time: "—", space: "O(vocab · d) embedding rows" },
  ],
  codeSnippet: {
    language: "py",
    code: `def encode(text, merges):
    """merges: [(a, b), ...] in the order they were learned. Rank IS the order."""
    rank = {pair: i for i, pair in enumerate(merges)}
    tokens = list(text)
    while True:
        pairs = [(rank[p], i) for i, p in enumerate(zip(tokens, tokens[1:])) if p in rank]
        if not pairs:
            return tokens
        _, i = min(pairs)                  # lowest rank == learned earliest
        a, b = tokens[i], tokens[i + 1]
        tokens = merge_all(tokens, a, b)   # every occurrence, not just this one

# The cost this hides:
#   "hello world"          -> 2 tokens
#   "unconstitutionally"   -> 5 tokens
#   the same sentence in Thai -> often 3-4x the English count, same meaning`,
  },
  realWorld: [
    "GPT-4 and Llama use byte-level BPE, so any byte sequence encodes — no unknown-token path to fall over.",
    "Anthropic, OpenAI and Google all bill per token, which makes the tokenizer a direct input to unit economics.",
    "Multilingual models add merges for other scripts specifically to stop non-English text from fragmenting.",
  ],
  pitfalls: [
    "Estimating cost from character or word count. The ratio is language- and domain-dependent; code and JSON tokenize very differently from prose.",
    "Assuming a token is a word. Leading spaces are usually part of the token, so ' the' and 'the' are different entries.",
    "Expecting letter-level reasoning. The model never saw the characters inside a token, which is the real reason letter-counting questions fail.",
    "Trusting a truncation at a character offset. Cutting mid-token produces a byte sequence that retokenizes into something else entirely.",
  ],
  usedBy: [
    {
      company: "OpenAI",
      product: "tiktoken",
      usage:
        "The BPE encoder used by GPT models, published so callers can count tokens before paying for them.",
      href: "https://github.com/openai/tiktoken",
    },
    {
      company: "Google",
      product: "SentencePiece",
      usage:
        "Trains BPE or unigram vocabularies directly on raw text with no pre-tokenisation, which is what makes it language-agnostic.",
      href: "https://github.com/google/sentencepiece",
    },
    {
      company: "Hugging Face",
      product: "tokenizers",
      usage:
        "Rust implementation behind most open models, with the merge list shipped alongside the weights.",
      href: "https://github.com/huggingface/tokenizers",
    },
  ],
  references: [
    {
      label: "Sennrich et al. — Neural Machine Translation of Rare Words with Subword Units",
      href: "https://arxiv.org/abs/1508.07909",
    },
    { label: "OpenAI — tiktoken", href: "https://github.com/openai/tiktoken" },
  ],
  challenge: {
    prompt:
      "Implement BPE encoding. Start from the individual characters of the text, then repeatedly apply the merge with the lowest rank that still matches somewhere, replacing every non-overlapping occurrence of that pair at once, until no merge applies. Return the token list. Rank is position in the merges array, and it is the whole algorithm — applying a later merge first gives different tokens for the same input.",
    entry: "encode",
    starter: `/**
 * @param {string} text
 * @param {Array<[string, string]>} merges - learned merges, earliest first.
 * @returns {string[]} tokens
 */
function encode(text, merges) {
  // Each round: find the lowest-ranked pair present, merge ALL of its
  // non-overlapping occurrences, and look again. Stop when none match.
}
`,
    tests: [
      {
        name: "no merges leaves individual characters",
        body: `assertEquals(solution("cat", []), ["c", "a", "t"]);`,
      },
      {
        name: "applies a single merge",
        body: `assertEquals(solution("cat", [["c", "a"]]), ["ca", "t"]);`,
      },
      {
        name: "rank decides which merge runs first",
        body: `// ["b","c"] was learned earlier, so it wins even though ["a","b"] also matches.
assertEquals(solution("abc", [["b", "c"], ["a", "b"]]), ["a", "bc"]);`,
      },
      {
        name: "the same merges in the other order give different tokens",
        body: `assertEquals(solution("abc", [["a", "b"], ["b", "c"]]), ["ab", "c"]);`,
      },
      {
        name: "merges every occurrence in one round",
        body: `assertEquals(solution("abab", [["a", "b"]]), ["ab", "ab"]);`,
      },
      {
        name: "merges the results of earlier merges",
        body: `assertEquals(solution("abab", [["a", "b"], ["ab", "ab"]]), ["abab"]);`,
      },
      {
        name: "occurrences do not overlap",
        body: `// "aaa" contains two overlapping "aa" pairs; only the left one may merge.
assertEquals(solution("aaa", [["a", "a"]]), ["aa", "a"]);`,
      },
      {
        name: "characters with no merge pass through untouched",
        body: `assertEquals(solution("hi!", [["h", "i"]]), ["hi", "!"]);`,
      },
      {
        name: "a merge that matches nothing changes nothing",
        body: `assertEquals(solution("cat", [["z", "q"]]), ["c", "a", "t"]);`,
      },
      { name: "empty text", body: `assertEquals(solution("", [["a", "b"]]), []);` },
      {
        name: "a single character has no pair to merge",
        body: `assertEquals(solution("a", [["a", "a"]]), ["a"]);`,
      },
      {
        name: "compresses a long repetitive string without stalling",
        body: `var text = "";
for (var i = 0; i < 1024; i++) text += "ab";
var out = solution(text, [["a", "b"], ["ab", "ab"], ["abab", "abab"]]);
assertEquals(out.length, 256);
assertEquals(out[0], "abababab");`,
      },
    ],
    hints: [
      "Build a Map from the pair to its rank once, keyed on something like a + '\\u0000' + b, so the scan is a lookup rather than a search through the merges array.",
      "Each round: scan adjacent positions for the lowest rank found anywhere, then rebuild the token list applying that one merge everywhere it occurs.",
      "When rebuilding, skip the next index after a merge — otherwise 'aaa' merges twice on overlapping pairs.",
    ],
    reference: `function encode(text, merges) {
  if (!text) return [];

  // Rank is position in the list: the order the merges were learned.
  const rank = new Map();
  merges.forEach(([a, b], i) => rank.set(a + "\\u0000" + b, i));

  let tokens = Array.from(text);

  for (;;) {
    let bestRank = Infinity;
    for (let i = 0; i + 1 < tokens.length; i++) {
      const r = rank.get(tokens[i] + "\\u0000" + tokens[i + 1]);
      if (r !== undefined && r < bestRank) bestRank = r;
    }
    if (bestRank === Infinity) return tokens;

    const [a, b] = merges[bestRank];
    const next = [];
    for (let i = 0; i < tokens.length; i++) {
      // Non-overlapping: consume both halves, so "aaa" yields ["aa", "a"].
      if (i + 1 < tokens.length && tokens[i] === a && tokens[i + 1] === b) {
        next.push(a + b);
        i++;
      } else {
        next.push(tokens[i]);
      }
    }
    tokens = next;
  }
}
`,
  },
};
