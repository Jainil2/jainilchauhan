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
};
