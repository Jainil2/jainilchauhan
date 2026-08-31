import { useMemo, useState } from "react";
import { Bar, Slider, Stat } from "./ai-primitives";

/* ─── shared maths ─────────────────────────────────────────────────────────── */

type Vec = readonly number[];

function dot(a: Vec, b: Vec) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function norm(a: Vec) {
  return Math.sqrt(dot(a, a));
}

function cosine(a: Vec, b: Vec) {
  const denom = norm(a) * norm(b);
  return denom === 0 ? 0 : dot(a, b) / denom;
}

function sqDist(a: Vec, b: Vec) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return sum;
}

/* ─── embeddings ───────────────────────────────────────────────────────────── */

/** Two dimensions instead of 1536, so the angle is visible rather than asserted. */
const EMBEDDING_DOCS: { id: number; label: string; vec: readonly [number, number] }[] = [
  { id: 1, label: "restarting the pods", vec: [0.97, 0.26] },
  { id: 2, label: "rolling a deployment (long essay)", vec: [8.2, 3.4] },
  { id: 3, label: "rotating an API key", vec: [0.5, 0.87] },
  { id: 4, label: "invoice not delivered", vec: [-0.34, 0.94] },
  { id: 5, label: "refund policy", vec: [-0.87, 0.5] },
];

/**
 * A query vector swept by angle against a fixed corpus. The point of the demo
 * is the pair of documents 1 and 2: one short, one enormous, nearly the same
 * direction — cosine ranks them together because length is divided out.
 */
export function EmbeddingsLab() {
  const [angle, setAngle] = useState(20);

  const query = useMemo<readonly [number, number]>(() => {
    const rad = (angle * Math.PI) / 180;
    return [Math.cos(rad), Math.sin(rad)];
  }, [angle]);

  const ranked = useMemo(
    () =>
      EMBEDDING_DOCS.map((doc) => ({ ...doc, score: cosine(query, doc.vec) })).sort(
        (a, b) => b.score - a.score || a.id - b.id,
      ),
    [query],
  );

  // Everything is drawn as a unit-length arrow: the plot shows direction only,
  // which is exactly what cosine compares.
  const project = (v: Vec) => {
    const len = norm(v) || 1;
    return { x: 100 + (v[0] / len) * 78, y: 100 - (v[1] / len) * 78 };
  };

  return (
    <div className="space-y-4">
      <Slider
        label="query direction"
        value={angle}
        min={-90}
        max={180}
        suffix="°"
        onChange={setAngle}
      />

      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <svg
          viewBox="0 0 200 200"
          className="w-full max-w-[200px] justify-self-center"
          role="img"
          aria-label="Query and document directions in a two-dimensional embedding space"
        >
          <circle cx="100" cy="100" r="78" className="fill-none stroke-border" strokeWidth="1" />
          {EMBEDDING_DOCS.map((doc) => {
            const p = project(doc.vec);
            return (
              <g key={doc.id}>
                <line
                  x1="100"
                  y1="100"
                  x2={p.x}
                  y2={p.y}
                  className="stroke-muted-foreground/50"
                  strokeWidth="1.5"
                />
                <circle cx={p.x} cy={p.y} r="3" className="fill-muted-foreground" />
                <text
                  x={p.x}
                  y={p.y - 6}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px]"
                >
                  {doc.id}
                </text>
              </g>
            );
          })}
          <line
            x1="100"
            y1="100"
            x2={project(query).x}
            y2={project(query).y}
            className="stroke-foreground"
            strokeWidth="2.5"
          />
        </svg>

        <ol className="space-y-1.5">
          {ranked.map((doc, i) => (
            <li key={doc.id} className="flex items-center gap-3">
              <span className="w-4 font-code text-xs text-muted-foreground">{i + 1}</span>
              <span className="flex-1 truncate text-sm">{doc.label}</span>
              <span className="w-16">
                <Bar fraction={(doc.score + 1) / 2} muted={doc.score <= 0} />
              </span>
              <span className="w-12 text-right font-code text-xs tabular-nums text-muted-foreground">
                {doc.score.toFixed(2)}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Documents 1 and 2 point almost the same way and their vectors differ in length by roughly
        nine times. They rank together anyway — cosine divides length out, so a one-line note and a
        long essay on the same subject compete on topic alone.
      </p>
    </div>
  );
}

/* ─── ANN search ───────────────────────────────────────────────────────────── */

interface AnnNode {
  id: number;
  vec: readonly [number, number];
  near: number[];
  /** The sparse upper-layer edges. Removing these is what strands the walk. */
  far: number[];
}

const ANN_NODES: AnnNode[] = [
  { id: 0, vec: [10, 80], near: [1, 2], far: [7] },
  { id: 1, vec: [26, 62], near: [0, 2, 3], far: [] },
  { id: 2, vec: [20, 34], near: [0, 1, 3], far: [8] },
  { id: 3, vec: [40, 46], near: [1, 2, 4], far: [] },
  { id: 4, vec: [56, 60], near: [3, 5], far: [] },
  { id: 5, vec: [62, 30], near: [4, 6], far: [] },
  { id: 6, vec: [78, 44], near: [5, 7], far: [] },
  { id: 7, vec: [88, 72], near: [6, 8], far: [0] },
  { id: 8, vec: [84, 16], near: [7], far: [2] },
];

/**
 * The greedy walk, with the long-range layer as a toggle. With it on the walk
 * crosses the space in a few hops; with it off the same query strands on a
 * local minimum, and nothing in the result says so.
 */
export function AnnSearchLab() {
  const [qx, setQx] = useState(86);
  const [qy, setQy] = useState(20);
  const [layers, setLayers] = useState(true);

  const query = useMemo<readonly [number, number]>(() => [qx, qy], [qx, qy]);

  const { path, landed, truth } = useMemo(() => {
    const byId = new Map(ANN_NODES.map((n) => [n.id, n]));
    let current = byId.get(0)!;
    let best = sqDist(current.vec, query);
    const walked = [current.id];

    for (let step = 0; step < ANN_NODES.length * 2; step++) {
      let next: AnnNode | null = null;
      const links = layers ? [...current.near, ...current.far] : current.near;
      for (const id of links) {
        const nbr = byId.get(id);
        if (!nbr) continue;
        const d = sqDist(nbr.vec, query);
        if (d < best) {
          best = d;
          next = nbr;
        }
      }
      if (!next) break;
      current = next;
      walked.push(current.id);
    }

    const exact = ANN_NODES.reduce((a, b) =>
      sqDist(a.vec, query) <= sqDist(b.vec, query) ? a : b,
    );
    return { path: walked, landed: current, truth: exact };
  }, [query, layers]);

  const hit = landed.id === truth.id;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="query x" value={qx} min={0} max={100} onChange={setQx} />
        <Slider label="query y" value={qy} min={0} max={100} onChange={setQy} />
      </div>

      <label className="flex items-center gap-2 font-code text-xs">
        <input
          type="checkbox"
          checked={layers}
          onChange={(e) => setLayers(e.target.checked)}
          className="accent-foreground"
        />
        long-range links (the sparse upper layers)
      </label>

      <svg
        viewBox="0 0 100 100"
        className="mx-auto w-full max-w-[380px] rounded-lg border border-border bg-card/60"
        role="img"
        aria-label="Greedy walk across a proximity graph"
      >
        {ANN_NODES.flatMap((n) =>
          [...n.near, ...(layers ? n.far : [])]
            .filter((id) => id > n.id)
            .map((id) => {
              const other = ANN_NODES.find((o) => o.id === id)!;
              const isFar = n.far.includes(id);
              return (
                <line
                  key={`${n.id}-${id}`}
                  x1={n.vec[0]}
                  y1={100 - n.vec[1]}
                  x2={other.vec[0]}
                  y2={100 - other.vec[1]}
                  className={isFar ? "stroke-muted-foreground/70" : "stroke-border"}
                  strokeWidth={isFar ? 0.8 : 0.5}
                  strokeDasharray={isFar ? "2 1.5" : undefined}
                />
              );
            }),
        )}
        {path.slice(0, -1).map((id, i) => {
          const from = ANN_NODES.find((n) => n.id === id)!;
          const to = ANN_NODES.find((n) => n.id === path[i + 1])!;
          return (
            <line
              key={`walk-${id}`}
              x1={from.vec[0]}
              y1={100 - from.vec[1]}
              x2={to.vec[0]}
              y2={100 - to.vec[1]}
              className="stroke-foreground"
              strokeWidth="1.4"
            />
          );
        })}
        {ANN_NODES.map((n) => (
          <circle
            key={n.id}
            cx={n.vec[0]}
            cy={100 - n.vec[1]}
            r={n.id === landed.id ? 3 : 2}
            className={n.id === landed.id ? "fill-foreground" : "fill-muted-foreground/60"}
          />
        ))}
        <circle
          cx={qx}
          cy={100 - qy}
          r="2.5"
          className="fill-none stroke-foreground"
          strokeWidth="1"
        />
        <circle
          cx={qx}
          cy={100 - qy}
          r="5"
          className="fill-none stroke-foreground/40"
          strokeWidth="0.6"
        />
      </svg>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="hops" value={String(path.length - 1)} hint={path.join(" → ")} />
        <Stat label="landed on" value={`node ${landed.id}`} />
        <Stat
          label="recall"
          value={hit ? "hit" : "miss"}
          hint={hit ? "this is the true nearest" : `true nearest is node ${truth.id}`}
        />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Turn the long-range links off and the walk still terminates, still reports a result, and
        still looks successful. A miss is not an error here — it is a slightly worse answer nobody
        can see without a brute-force scan to compare against.
      </p>
    </div>
  );
}

/* ─── vector index ─────────────────────────────────────────────────────────── */

/**
 * Fixed offsets rather than a modular formula: anything of the form (i * a) % b
 * lands the points on a diagonal streak, which reads as a line rather than a
 * cluster. Every offset stays inside the radius the demo draws.
 */
const IVF_JITTER = [
  [-6, 3],
  [4, -7],
  [-2, -4],
  [8, 2],
  [-9, -1],
  [1, 8],
  [6, 6],
  [-4, -8],
  [3, 1],
  [-7, 7],
] as const;

/**
 * Twelve clusters of ten, packed tightly enough that adjacent cells overlap.
 * That overlap is the whole demo: with well-separated clusters the first probe
 * already finds everything and the recall curve is a cliff, which is not what
 * the tradeoff looks like on real data.
 */
const IVF_RING = 22;
const IVF_CLUSTERS = Array.from({ length: 12 }, (_, c) => {
  const cx = Math.cos((c / 12) * Math.PI * 2) * IVF_RING;
  const cy = Math.sin((c / 12) * Math.PI * 2) * IVF_RING;
  return {
    id: c,
    centroid: [cx, cy] as const,
    docs: IVF_JITTER.map(([dx, dy], i) => ({
      id: c * 10 + i,
      vec: [cx + dx, cy + dy] as const,
    })),
  };
});

const IVF_TOTAL_DOCS = IVF_CLUSTERS.reduce((n, c) => n + c.docs.length, 0);

/**
 * The one knob. nprobe against recall@10 and documents scanned, computed
 * against a real brute-force baseline rather than a stated one.
 */
export function VectorIndexLab() {
  const [nprobe, setNprobe] = useState(1);
  const [angle, setAngle] = useState(15);

  const query = useMemo<readonly [number, number]>(() => {
    const rad = (angle * Math.PI) / 180;
    return [Math.cos(rad) * (IVF_RING - 2), Math.sin(rad) * (IVF_RING - 2)];
  }, [angle]);

  const { recall, scanned, opened } = useMemo(() => {
    const K = 10;
    const all = IVF_CLUSTERS.flatMap((c) => c.docs);
    const truth = new Set(
      all
        .map((d) => ({ id: d.id, s: sqDist(d.vec, query) }))
        .sort((a, b) => a.s - b.s || a.id - b.id)
        .slice(0, K)
        .map((d) => d.id),
    );

    const probed = IVF_CLUSTERS.map((c) => ({ c, s: sqDist(c.centroid, query) }))
      .sort((a, b) => a.s - b.s)
      .slice(0, nprobe)
      .map((p) => p.c);

    const candidates = probed.flatMap((c) => c.docs);
    const got = candidates
      .map((d) => ({ id: d.id, s: sqDist(d.vec, query) }))
      .sort((a, b) => a.s - b.s || a.id - b.id)
      .slice(0, K)
      .map((d) => d.id);

    return {
      recall: got.filter((id) => truth.has(id)).length / K,
      scanned: candidates.length,
      opened: new Set(probed.map((c) => c.id)),
    };
  }, [query, nprobe]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="nprobe"
          value={nprobe}
          min={1}
          max={IVF_CLUSTERS.length}
          onChange={setNprobe}
        />
        <Slider
          label="query direction"
          value={angle}
          min={0}
          max={359}
          suffix="°"
          onChange={setAngle}
        />
      </div>

      <svg
        viewBox="-36 -36 72 72"
        className="mx-auto w-full max-w-[380px] rounded-lg border border-border bg-card/60"
        role="img"
        aria-label="Clusters opened by the current nprobe setting"
      >
        {IVF_CLUSTERS.map((c) => (
          <g key={c.id}>
            {/* Only opened cells are outlined. Twelve overlapping outlines at
                once is noise, and the unopened points already show the corpus. */}
            {opened.has(c.id) && (
              <circle
                cx={c.centroid[0]}
                cy={-c.centroid[1]}
                r="10"
                className="fill-foreground/10 stroke-foreground"
                strokeWidth="0.4"
              />
            )}
            {c.docs.map((d) => (
              <circle
                key={d.id}
                cx={d.vec[0]}
                cy={-d.vec[1]}
                r="0.9"
                className={opened.has(c.id) ? "fill-foreground" : "fill-muted-foreground/30"}
              />
            ))}
          </g>
        ))}
        <circle
          cx={query[0]}
          cy={-query[1]}
          r="1.8"
          className="fill-none stroke-foreground"
          strokeWidth="0.8"
        />
      </svg>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="recall@10"
          value={`${Math.round(recall * 100)}%`}
          hint="against a brute-force scan"
        />
        <Stat
          label="docs scanned"
          value={`${scanned} / ${IVF_TOTAL_DOCS}`}
          hint={`${Math.round((scanned / IVF_TOTAL_DOCS) * 100)}% of the corpus`}
        />
        <Stat label="clusters opened" value={`${opened.size} / ${IVF_CLUSTERS.length}`} />
      </div>

      <div>
        <div className="mb-1 flex justify-between font-code text-xs text-muted-foreground">
          <span>recall</span>
          <span>work</span>
        </div>
        <div className="grid gap-1.5">
          <Bar fraction={recall} />
          <Bar fraction={scanned / IVF_TOTAL_DOCS} muted />
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Watch where the top bar stops climbing. Past the knee, each extra cluster costs a full share
        of the corpus and buys almost nothing — and the only way to know where the knee is for your
        data is to measure recall against an exact scan.
      </p>
    </div>
  );
}

/* ─── reranking ────────────────────────────────────────────────────────────── */

/**
 * Candidates whose cheap and exact scores deliberately disagree — the document
 * the cross-encoder likes best sits well down the first-stage ranking.
 */
const RERANK_QUERY = "I've lost access to my account";

const RERANK_CANDIDATES = [
  // Keyword-shaped near-misses rank highest on the cheap score, which is
  // exactly how a bi-encoder fails: it never saw the query and the document
  // together, so "changelog" and "SSH" look as relevant as the real answer.
  { id: 1, title: "changelog: password reset flow", cheap: 0.91, exact: 0.18 },
  { id: 2, title: "how to reset your password", cheap: 0.88, exact: 0.9 },
  { id: 3, title: "password requirements", cheap: 0.86, exact: 0.24 },
  { id: 4, title: "reset a forgotten passphrase (SSH)", cheap: 0.84, exact: 0.09 },
  { id: 5, title: "account recovery without email access", cheap: 0.71, exact: 0.97 },
  { id: 6, title: "why was my password rejected", cheap: 0.68, exact: 0.31 },
  { id: 7, title: "support: I cannot sign in at all", cheap: 0.52, exact: 0.88 },
  { id: 8, title: "billing address change", cheap: 0.41, exact: 0.04 },
];

const RERANK_MS_PER_PAIR = 11;

/** Shortlist size against final quality and latency. */
export function RerankingLab() {
  const [shortlist, setShortlist] = useState(3);

  const { passed, final, ceiling } = useMemo(() => {
    const byCheap = [...RERANK_CANDIDATES].sort((a, b) => b.cheap - a.cheap || a.id - b.id);
    const kept = byCheap.slice(0, shortlist);
    const ranked = [...kept].sort((a, b) => b.exact - a.exact || a.id - b.id).slice(0, 3);
    const bestPossible = [...RERANK_CANDIDATES].sort((a, b) => b.exact - a.exact)[0];
    return { passed: kept, final: ranked, ceiling: bestPossible };
  }, [shortlist]);

  const reachedCeiling = final.some((d) => d.id === ceiling.id);

  return (
    <div className="space-y-4">
      <p className="font-code text-xs text-muted-foreground">
        query: <span className="text-foreground">“{RERANK_QUERY}”</span>
      </p>

      <Slider
        label="shortlist"
        value={shortlist}
        min={1}
        max={RERANK_CANDIDATES.length}
        suffix=" docs"
        onChange={setShortlist}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-code text-xs uppercase tracking-wider text-muted-foreground">
            stage 1 — vector index
          </p>
          <ul className="space-y-1">
            {[...RERANK_CANDIDATES]
              .sort((a, b) => b.cheap - a.cheap || a.id - b.id)
              .map((doc) => {
                const kept = passed.some((p) => p.id === doc.id);
                return (
                  <li
                    key={doc.id}
                    className={`flex items-center gap-2 rounded border p-1.5 text-xs ${
                      kept ? "border-border bg-card/60" : "border-dashed border-border opacity-40"
                    }`}
                  >
                    <span className="flex-1 truncate">{doc.title}</span>
                    <span className="font-code tabular-nums text-muted-foreground">
                      {doc.cheap.toFixed(2)}
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>

        <div>
          <p className="mb-2 font-code text-xs uppercase tracking-wider text-muted-foreground">
            stage 2 — cross-encoder
          </p>
          <ul className="space-y-1">
            {final.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center gap-2 rounded border border-border bg-card/60 p-1.5 text-xs"
              >
                <span className="flex-1 truncate">{doc.title}</span>
                <span className="font-code tabular-nums text-muted-foreground">
                  {doc.exact.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="rerank cost"
          value={`${shortlist * RERANK_MS_PER_PAIR} ms`}
          hint="≈11ms per pair"
        />
        <Stat label="model calls" value={String(shortlist)} hint="one per shortlisted doc" />
        <Stat
          label="best doc"
          value={reachedCeiling ? "returned" : "missed"}
          hint={
            reachedCeiling
              ? `#${ceiling.id} made the shortlist`
              : `#${ceiling.id} never reached stage 2`
          }
        />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        At a shortlist of three, “account recovery without email access” — the one document that
        actually answers the question — is still sitting in stage one, beaten there by a changelog
        entry that merely shares vocabulary. No improvement to the reranker fixes that. It is a
        ceiling set by first-stage recall, which is why that is the number to measure before buying
        a better model.
      </p>
    </div>
  );
}

/* ─── semantic cache ───────────────────────────────────────────────────────── */

/**
 * Cached questions and incoming ones, with a `topic` used only to judge the
 * outcome: a hit against another topic is a wrong answer served confidently.
 */
const CACHE_ENTRIES = [
  { id: 1, text: "how do I reset my password", topic: "password", vec: [1, 0] as const },
  { id: 2, text: "how do I cancel my order", topic: "order", vec: [0.62, 0.78] as const },
  { id: 3, text: "what is your refund policy", topic: "refund", vec: [0, 1] as const },
];

const CACHE_QUERIES = [
  { text: "password reset steps?", topic: "password", vec: [0.995, 0.1] as const },
  { text: "I forgot my login password", topic: "password", vec: [0.97, 0.24] as const },
  { text: "how do I cancel my subscription", topic: "subscription", vec: [0.72, 0.69] as const },
  { text: "can I get my money back", topic: "refund", vec: [0.17, 0.985] as const },
  { text: "what are your office hours", topic: "hours", vec: [-0.6, 0.8] as const },
];

const LLM_MS = 940;
const CACHE_MS = 4;

/** The threshold as a correctness setting: loosen it and a wrong hit appears. */
export function SemanticCacheLab() {
  const [threshold, setThreshold] = useState(0.95);

  const results = useMemo(
    () =>
      CACHE_QUERIES.map((q) => {
        let best: (typeof CACHE_ENTRIES)[number] | null = null;
        let bestScore = 0;
        for (const entry of CACHE_ENTRIES) {
          const score = cosine(q.vec, entry.vec);
          if (score >= threshold && (best === null || score > bestScore)) {
            best = entry;
            bestScore = score;
          }
        }
        return {
          query: q,
          hit: best,
          score: best ? bestScore : Math.max(...CACHE_ENTRIES.map((e) => cosine(q.vec, e.vec))),
          wrong: best !== null && best.topic !== q.topic,
        };
      }),
    [threshold],
  );

  const hits = results.filter((r) => r.hit).length;
  const wrong = results.filter((r) => r.wrong).length;
  const latency = (hits * CACHE_MS + (results.length - hits) * LLM_MS) / results.length;

  return (
    <div className="space-y-4">
      <Slider
        label="similarity threshold"
        value={threshold}
        min={0.8}
        max={1}
        step={0.01}
        onChange={setThreshold}
      />

      <ul className="space-y-1.5">
        {results.map((r) => (
          <li
            key={r.query.text}
            className={`flex items-center gap-3 rounded-md border p-2.5 text-sm ${
              r.wrong
                ? "border-foreground bg-card"
                : r.hit
                  ? "border-border bg-card/60"
                  : "border-dashed border-border"
            }`}
          >
            <span className="flex-1 truncate">{r.query.text}</span>
            <span className="font-code text-xs tabular-nums text-muted-foreground">
              {r.score.toFixed(3)}
            </span>
            <span className="w-28 text-right font-code text-xs">
              {r.wrong ? (
                <span className="font-semibold">wrong answer</span>
              ) : r.hit ? (
                <span className="text-muted-foreground">hit → #{r.hit.id}</span>
              ) : (
                <span className="text-muted-foreground">miss → LLM</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="hit rate" value={`${Math.round((hits / results.length) * 100)}%`} />
        <Stat
          label="avg latency"
          value={`${Math.round(latency)} ms`}
          hint="4ms cached, 940ms cold"
        />
        <Stat
          label="wrong answers"
          value={String(wrong)}
          hint={wrong ? "served as a hit, no error raised" : "none at this threshold"}
        />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        At the default threshold the two metrics anyone reports look good — high hit rate, low
        average latency — and “cancel my subscription” is already being answered from “cancel my
        order”. Tighten the threshold and that wrong hit disappears, taking some real hits with it.
        Nothing errors in either direction, so the only signal is the third tile.
      </p>
    </div>
  );
}
