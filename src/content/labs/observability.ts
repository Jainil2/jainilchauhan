import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "observability",
  title: "Observability",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "Metrics tell you something is wrong; only a trace tells you which span ate the time.",
  caption:
    "A seven-span trace ranked by self time. The slowest span by total duration is the root — it is slow because everything below it is slow — while the span that actually burned the time sits fourth in the naive ranking.",
  skillTags: ["System Design", "Observability", "Operations"],
  bridgesFrom: [
    {
      slug: "topological-sort",
      sameness:
        "A trace IS a dependency graph. Each span carries a parent id, which is a directed edge, and rebuilding the waterfall is the same parent-pointer traversal you used to order a build graph. Attributing time correctly means walking children before parents — a post-order pass over exactly that DAG.",
      delta:
        "Edges arrive out of order, late, and sometimes not at all, because each span is shipped by a different process over an unreliable channel. So the graph you sort is a partial one: a missing parent leaves an orphan subtree, and the total you compute is quietly smaller than the request actually took.",
    },
    {
      slug: "hyperloglog",
      sameness:
        "Metric cardinality IS the distinct-count problem. The number of time series a system stores is the number of distinct label tuples it has ever emitted, which is precisely the set-cardinality question HyperLogLog answers, over the same kind of high-volume stream.",
      delta:
        "Here you are not estimating the count — you are paying for it. Every distinct tuple is an allocated series with its own index entry and retention, so adding one unbounded label like user_id multiplies your bill by the number of users. The counting problem becomes a capacity problem.",
    },
  ],
  concept:
    "Monitoring answers a question you thought of in advance: is CPU above 80%, is the error rate above 1%. Observability is the ability to answer a question you did not think of in advance — why is this one customer's checkout slow on Tuesdays — without shipping new code. The difference is whether the data you already collect has enough dimensions to slice.\n\nThe three signals divide the work. Metrics are cheap, pre-aggregated numbers with fixed labels: they are what alerts fire on, and they cost roughly nothing per request. Logs are per-event text: expensive, high fidelity, and the thing that actually tells you what happened. Traces are the causal structure of one request across processes — a tree of spans, each with a start, an end and a parent — and they are the only signal that answers 'where did the 900 milliseconds go'.\n\nThe number that ruins metrics budgets is cardinality. A time series exists for every distinct combination of label values, so a counter with five labels of ten values each is 100,000 series, and one label carrying a user id or a request id is unbounded. Teams routinely discover that a single innocuous label added in a pull request tripled their observability bill; the fix is always the same — high-cardinality dimensions belong on traces and logs, which are indexed per event, never on metrics, which are indexed per series.\n\nThe number that ruins traces is sampling. Head sampling decides at the first span whether to keep the trace, usually at 1% or lower, which means 99 out of 100 slow requests leave no evidence. Tail sampling buffers spans until the request finishes and keeps the interesting ones — every error, every request over the p99 — at the cost of holding partial traces in memory across the fleet. If you only ever configure one thing, configure this: keep 100% of errors and slow requests, sample the boring ones hard.\n\nReading a trace has one trap worth naming. The longest span is almost always the root, because the root contains everything. What you want is self time: a span's duration minus the union of its children's intervals. Union, not sum — children issued in parallel overlap, and summing them makes a span look like it has negative self time. Rank by self time and the answer is usually a span nobody was looking at: a serialised lock, a DNS lookup, a retry loop inside a client library.",
  complexity: [
    { operation: "Counter increment", time: "O(1)", space: "one series per label tuple" },
    { operation: "Structured log line", time: "O(1)", space: "~1 KB per event, retained" },
    { operation: "Span emit", time: "O(1)", space: "~0.5 KB, dropped if not sampled" },
    { operation: "Self-time attribution", time: "O(n log n) over spans", space: "O(n)" },
  ],
  codeSnippet: {
    language: "py",
    code: `# The label that costs money, and the one that does not.

# WRONG: user_id is unbounded. One series per user, forever, even after
# that user churns. 2M users = 2M series from a single counter.
requests.labels(route="/checkout", status=200, user_id=user.id).inc()

# RIGHT: metrics carry only bounded dimensions.
requests.labels(route="/checkout", status=200).inc()

# High-cardinality context goes on the span, which is indexed per event
# and dropped entirely when the trace is not sampled.
span.set_attribute("user.id", user.id)
span.set_attribute("cart.items", len(cart))

# Tail sampling: decide AFTER the request finishes, so the decision can
# depend on the outcome. This is the config that makes traces useful.
policies = [
    {"type": "status_code", "status_codes": ["ERROR"]},   # keep every error
    {"type": "latency", "threshold_ms": 800},              # keep every slow one
    {"type": "probabilistic", "sampling_percentage": 1},   # 1% of the rest
]`,
  },
  realWorld: [
    "Google's Dapper established the span/parent-id model that OpenTelemetry, Jaeger and Zipkin all still use.",
    "Prometheus documents the cardinality rule directly: every unique label combination is a new time series, so labels must be bounded.",
    "Uber runs Jaeger with adaptive sampling, raising the rate on low-traffic endpoints so rare routes still produce traces.",
  ],
  pitfalls: [
    "Putting a request id, user id, or full URL in a metric label. It is one line in a pull request and a permanent multiplier on your storage bill.",
    "Ranking spans by total duration. The root span always wins, and it tells you nothing — self time is the column that names the culprit.",
    "Head sampling at 1% and then wondering why the incident has no trace. The decision was made before anything went wrong.",
    "Alerting on averages. A 200ms mean hides a 4s p99, and the p99 is the experience your loudest customers are describing.",
  ],
  usedBy: [
    {
      company: "Google",
      product: "Dapper",
      usage:
        "The original always-on distributed tracer: spans carry a trace id and parent id, sampled aggressively, and the model every modern tracer inherited.",
      href: "https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/",
    },
    {
      company: "Uber",
      product: "Jaeger",
      usage:
        "Open-source tracing backend running across thousands of microservices, with adaptive per-endpoint sampling so low-traffic routes are not sampled into invisibility.",
      href: "https://www.jaegertracing.io/docs/latest/architecture/",
    },
    {
      company: "Prometheus",
      product: "Metric labelling",
      usage:
        "Documents the cardinality contract explicitly — each distinct key/value label set is a separate time series — and warns against unbounded label values.",
      href: "https://prometheus.io/docs/practices/naming/",
    },
  ],
  references: [
    {
      label: "OpenTelemetry — Traces",
      href: "https://opentelemetry.io/docs/concepts/signals/traces/",
    },
    {
      label: "Dapper, a Large-Scale Distributed Systems Tracing Infrastructure",
      href: "https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/",
    },
  ],
  challenge: {
    prompt:
      "Attribute latency to the span that actually caused it. Given spans with an id, a parent id, a start and an end, return each span's self time: its own duration minus the time covered by its children. Children run in parallel, so cover the union of their intervals rather than the sum, and clip any child that runs past its parent. Return one entry per span, ordered by self time descending, ties broken by ascending id.",
    entry: "spanSelfTime",
    starter: `/**
 * @param {Array<{id: number, parent: number|null, start: number, end: number}>} spans
 * @returns {Array<{id: number, self: number}>} sorted by self desc, then id asc.
 */
function spanSelfTime(spans) {
  // Group children by parent, merge their intervals, subtract the covered
  // time from the parent's duration. Overlapping children count once.
}
`,
    tests: [
      {
        name: "a leaf span's self time is its whole duration",
        body: `assertEquals(solution([{ id: 1, parent: null, start: 0, end: 40 }]), [{ id: 1, self: 40 }]);`,
      },
      {
        name: "a single child is subtracted from its parent",
        body: `var s = [
  { id: 1, parent: null, start: 0, end: 100 },
  { id: 2, parent: 1, start: 20, end: 90 },
];
assertEquals(solution(s), [{ id: 2, self: 70 }, { id: 1, self: 30 }]);`,
      },
      {
        name: "parallel children are unioned, not summed",
        body: `// Both children run 10..60 and 30..80. Summed that is 100ms and the
// parent would look negative; unioned it is 70ms, so self time is 30.
var s = [
  { id: 1, parent: null, start: 0, end: 100 },
  { id: 2, parent: 1, start: 10, end: 60 },
  { id: 3, parent: 1, start: 30, end: 80 },
];
var out = solution(s);
assertEquals(out[out.length - 1], { id: 1, self: 30 });`,
      },
      {
        name: "sequential children are effectively summed",
        body: `var s = [
  { id: 1, parent: null, start: 0, end: 100 },
  { id: 2, parent: 1, start: 0, end: 30 },
  { id: 3, parent: 1, start: 40, end: 70 },
];
var byId = {};
solution(s).forEach(function (r) { byId[r.id] = r.self; });
assertEquals(byId[1], 40);`,
      },
      {
        name: "a child that overruns its parent is clipped",
        body: `var s = [
  { id: 1, parent: null, start: 0, end: 50 },
  { id: 2, parent: 1, start: 30, end: 500 },
];
var byId = {};
solution(s).forEach(function (r) { byId[r.id] = r.self; });
assertEquals(byId[1], 30);
assertEquals(byId[2], 470);`,
      },
      {
        name: "a grandchild is charged to its own parent only",
        body: `var s = [
  { id: 1, parent: null, start: 0, end: 100 },
  { id: 2, parent: 1, start: 10, end: 90 },
  { id: 3, parent: 2, start: 20, end: 80 },
];
assertEquals(solution(s), [{ id: 3, self: 60 }, { id: 1, self: 20 }, { id: 2, self: 20 }]);`,
      },
      {
        name: "the naive ranking and the honest ranking disagree",
        body: `// Span 1 is the longest span in the trace, and span 3 is where the
// time went. Self time must put span 3 first.
var s = [
  { id: 1, parent: null, start: 0, end: 900 },
  { id: 2, parent: 1, start: 0, end: 880 },
  { id: 3, parent: 2, start: 10, end: 860 },
];
assertEquals(solution(s)[0].id, 3);`,
      },
      {
        name: "no spans",
        body: `assertEquals(solution([]), []);`,
      },
      {
        name: "a zero-duration span reports zero",
        body: `assertEquals(solution([{ id: 7, parent: null, start: 5, end: 5 }]), [{ id: 7, self: 0 }]);`,
      },
      {
        name: "handles a wide trace",
        body: `var s = [{ id: 0, parent: null, start: 0, end: 10000 }];
for (var i = 1; i <= 4999; i++) s.push({ id: i, parent: 0, start: i * 2, end: i * 2 + 1 });
var out = solution(s);
assertEquals(out.length, 5000);
// Root covers 10000ms, children cover 4999 disjoint milliseconds.
assertEquals(out[0], { id: 0, self: 5001 });
assertEquals(out[1], { id: 1, self: 1 });`,
      },
    ],
    hints: [
      "Build a map from parent id to the list of that parent's spans in one pass, then handle each span independently.",
      "Clip each child to [parent.start, parent.end] and drop anything that becomes empty, otherwise a child that overran the parent subtracts time the parent never spent.",
      "Merge the clipped intervals: sort by start, keep a running end, and only add the new span of coverage when a child extends past the end you already counted.",
    ],
    reference: `function spanSelfTime(spans) {
  // One pass to build the parent -> children index. This is the same
  // parent-pointer graph a topological sort walks.
  const children = new Map();
  for (const s of spans) {
    if (s.parent === null || s.parent === undefined) continue;
    const list = children.get(s.parent);
    if (list) list.push(s);
    else children.set(s.parent, [s]);
  }

  const result = spans.map((span) => {
    const kids = children.get(span.id) || [];

    // Clip to the parent's window first: a child that overran its parent
    // cannot subtract time the parent never spent.
    const intervals = [];
    for (const k of kids) {
      const start = Math.max(k.start, span.start);
      const end = Math.min(k.end, span.end);
      if (end > start) intervals.push([start, end]);
    }
    intervals.sort((a, b) => a[0] - b[0]);

    // Union, not sum. Two children issued in parallel occupy one stretch
    // of wall clock, and summing them invents time that never elapsed.
    let covered = 0;
    let reach = -Infinity;
    for (const [start, end] of intervals) {
      if (end <= reach) continue;
      covered += end - Math.max(start, reach);
      reach = end;
    }

    const duration = Math.max(0, span.end - span.start);
    return { id: span.id, self: Math.max(0, duration - covered) };
  });

  return result.sort((a, b) => b.self - a.self || a.id - b.id);
}
`,
  },
};
