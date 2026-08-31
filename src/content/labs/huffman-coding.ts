import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "huffman-coding",
  title: "Huffman Coding",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "Build optimal prefix codes from character frequencies.",
  caption:
    "Merge the two lowest-frequency nodes repeatedly. Frequent symbols get shorter codes; rare symbols get longer codes.",
  skillTags: ["DSA", "Compression", "Greedy"],
  bridgesFrom: [
    {
      slug: "heap-priority-queue",
      sameness:
        "The algorithm IS repeated extract-min. Take the two least frequent symbols out of the priority queue, merge them into a node whose frequency is their sum, put it back, and repeat until one node remains.",
      delta:
        "The queue is doing the optimisation, not a clever insight — greedily merging the two rarest symbols is provably optimal because the rarest symbols must end up deepest. The consequence is that the entire cost is n heap operations, O(n log n), and that the tree is built bottom-up: you do not know the code for any symbol until the last merge is done.",
    },
    {
      slug: "binary-tree",
      sameness:
        "The codebook IS a binary tree. Left is a 0, right is a 1, and a symbol's code is the path taken to reach its node.",
      delta:
        "Every symbol sits at a leaf, and that placement is what makes the code prefix-free: no codeword can be a prefix of another because no leaf is an ancestor of another. That is why the decoder needs no delimiters and no lengths — it walks the tree bit by bit and emits a symbol whenever it lands on a leaf, which also means a single flipped bit does not corrupt one character but desynchronises the rest of the stream.",
    },
  ],
  concept:
    "Huffman coding constructs an optimal prefix-free binary code for known symbol frequencies. It repeatedly removes the two least frequent nodes from a priority queue, merges them, and pushes the combined node back.\n\nPrefix-free means no code is the prefix of another, so decoding is unambiguous. The greedy merge is optimal because the two least frequent symbols can safely be placed deepest as siblings.",
  complexity: [
    { operation: "Build tree", time: "O(n log n)", space: "O(n)" },
    { operation: "Encode/decode", time: "O(message bits)", space: "O(n)" },
  ],
  realWorld: ["DEFLATE/ZIP concepts, media codecs, column compression, and telemetry encoding."],
  pitfalls: [
    "Requires frequency model or two-pass input.",
    "Not adaptive unless rebuilt or updated.",
    "Arithmetic coding can compress closer to entropy.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Build the optimal prefix code: repeatedly merge the two rarest symbols.
type Node = { freq: number; sym?: string; left?: Node; right?: Node };

export function huffman(freqs: Record<string, number>): Map<string, string> {
  const heap: Node[] = Object.entries(freqs).map(([sym, freq]) => ({ sym, freq }));
  while (heap.length > 1) {
    heap.sort((a, b) => a.freq - b.freq); // a real impl uses a min-heap
    const [l, r] = heap.splice(0, 2);
    heap.push({ freq: l.freq + r.freq, left: l, right: r });
  }
  const codes = new Map<string, string>();
  const walk = (n: Node, path: string) => {
    if (n.sym !== undefined) return codes.set(n.sym, path || "0");
    walk(n.left!, path + "0");
    walk(n.right!, path + "1"); // prefix-free: symbols only live at leaves
  };
  if (heap[0]) walk(heap[0], "");
  return codes;
}`,
  },
  usedBy: [
    {
      company: "IETF / all major browsers",
      product: "HTTP/2 HPACK header compression",
      usage:
        "HPACK ships a static Huffman table for header strings, cutting request header bytes on every HTTP/2 request.",
      href: "https://datatracker.ietf.org/doc/html/rfc7541#appendix-B",
    },
    {
      company: "PNG / zlib (DEFLATE)",
      product: "gzip, PNG, ZIP",
      usage:
        "DEFLATE = LZ77 matching followed by Huffman coding of literals and lengths — the backbone of web compression.",
      href: "https://datatracker.ietf.org/doc/html/rfc1951",
    },
    {
      company: "Joint Photographic Experts Group",
      product: "JPEG entropy coding",
      usage:
        "Quantised DCT coefficients are entropy-coded with Huffman tables stored in the file header.",
      href: "https://www.w3.org/Graphics/JPEG/itu-t81.pdf",
    },
  ],
  references: [
    {
      label: "RFC 7541 — HPACK Huffman code table",
      href: "https://datatracker.ietf.org/doc/html/rfc7541#appendix-B",
    },
    {
      label: "RFC 1951 — DEFLATE compressed data format",
      href: "https://datatracker.ietf.org/doc/html/rfc1951",
    },
  ],
  challenge: {
    prompt:
      "Compute the total number of bits an optimal prefix code needs for a given set of symbol frequencies. Return the total rather than the codes themselves, because ties can produce different trees but the total is always the same — which is what optimal means.",
    entry: "totalBits",
    starter: `/**
 * @param {number[]} freqs - occurrence count per symbol, each positive.
 * @returns {number} total bits to encode everything. A single distinct symbol
 *   still needs one bit per occurrence.
 */
function totalBits(freqs) {
  // Repeatedly merge the two smallest frequencies. Each merge's combined
  // weight is exactly the bits that merge adds to the total.
}
`,
    tests: [
      {
        name: "two equal symbols",
        body: `assertEquals(solution([1, 1]), 2);`,
      },
      {
        name: "classic example",
        body: `assertEquals(solution([5, 9, 12, 13, 16, 45]), 224);`,
      },
      {
        name: "a single symbol still needs a bit each",
        body: `assertEquals(solution([7]), 7);`,
      },
      {
        name: "no symbols",
        body: `assertEquals(solution([]), 0);`,
      },
      {
        name: "frequent symbols get shorter codes",
        body: `assert(solution([100, 1, 1]) < solution([34, 34, 34]), 'skew should compress better');`,
      },
      {
        name: "four equal symbols need two bits each",
        body: `assertEquals(solution([1, 1, 1, 1]), 8);`,
      },
      {
        name: "handles many symbols",
        body: `var f = [];
for (var i = 1; i <= 5000; i++) f.push(i);
assert(solution(f) > 0, 'expected a positive bit count');`,
      },
    ],
    hints: [
      "Each merge of two weights adds their sum to the running total; that sum is the extra bit every symbol beneath gains.",
      "A min-heap gives the two smallest weights in log n; sorting once and re-inserting also works.",
      "The single-symbol case never merges, so handle it separately.",
    ],
    reference: `function totalBits(freqs) {
  if (freqs.length === 0) return 0;
  if (freqs.length === 1) return freqs[0]; // no merge happens, but 1 bit each

  const heap = freqs.slice();
  const up = (i) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p] <= heap[i]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const down = (i) => {
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let small = i;
      if (l < heap.length && heap[l] < heap[small]) small = l;
      if (r < heap.length && heap[r] < heap[small]) small = r;
      if (small === i) break;
      [heap[small], heap[i]] = [heap[i], heap[small]];
      i = small;
    }
  };
  for (let i = (heap.length >> 1) - 1; i >= 0; i--) down(i);
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      down(0);
    }
    return top;
  };

  let bits = 0;
  while (heap.length > 1) {
    const merged = pop() + pop();
    // Every symbol under this merge gains one bit, and that is exactly 'merged'.
    bits += merged;
    heap.push(merged);
    up(heap.length - 1);
  }
  return bits;
}
`,
  },
};
