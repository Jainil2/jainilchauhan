import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "vector-clocks",
  title: "Vector Clocks",
  category: "Distributed Systems",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "Detecting causality and conflicts.",
  caption:
    "Witness how distributed systems track time without a central clock. Trigger events on different nodes and watch the vectors grow. Detect 'happened-before' relationships and identify concurrent write conflicts (siblings).",
  skillTags: ["Distributed Systems", "System Design"],
  concept:
    "In a distributed system, there is no single 'now'. Physical clocks drift, making them unreliable for ordering events. Vector clocks are a logical clock mechanism used to determine the partial ordering of events and detect causality violations.\n\nEach node maintains a vector of counters (one for every node in the cluster). When a node performs an internal event, it increments its own counter. When it sends a message, it includes its vector. The receiver updates its vector by taking the element-wise maximum. \n\nIf vector A is strictly less than vector B, then A 'happened before' B. If neither is less than the other, the events happened concurrently, and we have a conflict that requires resolution (e.g., Last-Write-Wins or application-side merging).",
  complexity: [
    { operation: "Update", time: "O(1)", space: "O(N) where N = nodes" },
    { operation: "Compare", time: "O(N)", space: "—" },
  ],
  realWorld: [
    "Amazon Dynamo: the original paper popularized vector clocks for conflict detection.",
    "Riak: a distributed NoSQL DB that uses vector clocks (and later Dotted Version Vectors).",
    "Voldemort: LinkedIn's distributed key-value store.",
  ],
  pitfalls: [
    "Vector size grows linearly with the number of nodes. In large clusters, vectors can become massive ('Vector Clock Bloat').",
    "Pruning: to save space, systems eventually prune old counters, which can rarely lead to false conflict detections.",
  ],
  references: [
    {
      label: "Leslie Lamport — Time, Clocks, and the Ordering of Events (1978)",
      href: "https://lamport.azurewebsites.net/pubs/time-clocks.pdf",
    },
    {
      label: "Dynamo: Amazon’s Highly Available Key-value Store",
      href: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
    },
  ],
  codeSnippet: {
    language: "ts",
    code: `type Clock = Record<string, number>; // node -> counter

const onLocalEvent = (c: Clock, self: string): Clock => ({ ...c, [self]: (c[self] ?? 0) + 1 });

const onReceive = (mine: Clock, theirs: Clock, self: string): Clock => {
  const merged: Clock = { ...mine };
  for (const [node, n] of Object.entries(theirs)) merged[node] = Math.max(merged[node] ?? 0, n);
  merged[self] = (merged[self] ?? 0) + 1;
  return merged;
};

// a happened-before b iff every entry of a <= b and at least one is strictly <.
function compare(a: Clock, b: Clock): "before" | "after" | "concurrent" {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let lt = false, gt = false;
  for (const k of keys) {
    const x = a[k] ?? 0, y = b[k] ?? 0;
    if (x < y) lt = true;
    if (x > y) gt = true;
  }
  return lt && gt ? "concurrent" : lt ? "before" : "after"; // concurrent -> conflict to resolve
}`,
  },
  usedBy: [
    {
      company: "Amazon",
      product: "Dynamo shopping cart",
      usage:
        "Dynamo used vector clocks to detect concurrent cart writes and surfaced siblings to the application to merge.",
      href: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
    },
    {
      company: "Riak / Basho",
      product: "Dotted version vectors",
      usage:
        "Riak refined vector clocks into dotted version vectors to keep causality metadata from growing without bound.",
      href: "https://docs.riak.com/riak/kv/latest/learn/concepts/causal-context/index.html",
    },
    {
      company: "Figma",
      product: "Multiplayer conflict resolution",
      usage:
        "Concurrent edits are detected by causal metadata and resolved by documented merge rules rather than last-write-wins guesses.",
      href: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
    },
    {
      company: "Apache Cassandra",
      product: "Timestamp-based LWW (the contrast)",
      usage:
        "Cassandra deliberately chose wall-clock last-write-wins, which is why clock skew can silently drop a concurrent write.",
      href: "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html",
    },
  ],
  challenge: {
    prompt:
      "Compare two vector clocks and say how the events relate. Concurrent is the interesting answer: neither happened first, so the system has a genuine conflict to resolve rather than an ordering to discover.",
    entry: "compare",
    starter: `/**
 * @param {Record<string, number>} a
 * @param {Record<string, number>} b - a missing replica counts as 0.
 * @returns {'equal'|'before'|'after'|'concurrent'}
 */
function compare(a, b) {
  // 'before' means every entry of a is <= b AND at least one is strictly less.
  // If each clock leads somewhere, they are concurrent.
}
`,
    tests: [
      {
        name: "identical clocks are equal",
        body: `assertEquals(solution({ a: 1, b: 2 }, { a: 1, b: 2 }), 'equal');`,
      },
      {
        name: "strictly smaller is before",
        body: `assertEquals(solution({ a: 1 }, { a: 2 }), 'before');`,
      },
      {
        name: "strictly larger is after",
        body: `assertEquals(solution({ a: 3 }, { a: 2 }), 'after');`,
      },
      {
        name: "each leading somewhere is concurrent",
        body: `assertEquals(solution({ a: 2, b: 1 }, { a: 1, b: 2 }), 'concurrent');`,
      },
      {
        name: "a missing replica counts as zero",
        body: `assertEquals(solution({ a: 1 }, { a: 1, b: 1 }), 'before');`,
      },
      {
        name: "empty clocks are equal",
        body: `assertEquals(solution({}, {}), 'equal');`,
      },
      {
        name: "an empty clock precedes a populated one",
        body: `assertEquals(solution({}, { a: 1 }), 'before');`,
      },
      {
        name: "disjoint replicas are concurrent",
        body: `assertEquals(solution({ a: 1 }, { b: 1 }), 'concurrent');`,
      },
    ],
    hints: [
      "Take the union of both key sets so a replica present in only one clock still counts.",
      "Track two booleans as you scan: does a lead anywhere, and does b lead anywhere.",
      "Neither leading is equal, both leading is concurrent, otherwise whoever leads is after.",
    ],
    reference: `function compare(a, b) {
  // The union matters: a replica absent from one clock is at 0 there, which is
  // information, not a gap to skip.
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let aLeads = false;
  let bLeads = false;
  for (const key of keys) {
    const x = a[key] || 0;
    const y = b[key] || 0;
    if (x > y) aLeads = true;
    if (y > x) bLeads = true;
  }
  if (aLeads && bLeads) return 'concurrent'; // a genuine conflict
  if (aLeads) return 'after';
  if (bLeads) return 'before';
  return 'equal';
}
`,
  },
};
