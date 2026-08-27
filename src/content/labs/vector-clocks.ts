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
};
