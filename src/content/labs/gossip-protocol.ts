import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "gossip-protocol",
  title: "Gossip Protocol",
  category: "Distributed Systems",
  difficulty: "Advanced",
  readingTimeMin: 5,
  blurb: "Epidemic state dissemination.",
  caption:
    "A cluster of nodes spreads state like a virus. Adjust the fanout and watch how a single update infects the entire network in O(log N) steps. Perfect for decentralized systems without a single point of failure.",
  skillTags: ["Distributed Systems", "System Design"],
  concept:
    "Gossip protocols (or epidemic protocols) are a family of decentralized communication patterns inspired by the way social gossip or viruses spread. In a cluster, each node periodically picks a random peer and 'gossips' its latest state. \n\nThe beauty of gossip is its resilience: it requires no central coordinator, and even if half the network fails, the message will still eventually reach every surviving node. It converges in O(log N) rounds, where N is the number of nodes. \n\nModern systems use gossip for failure detection (detecting when a node goes down), membership (knowing who is in the cluster), and metadata synchronization.",
  complexity: [
    { operation: "Convergence", time: "O(log N)", space: "O(1) local state" },
    { operation: "Message Load", time: "O(1) per node per tick", space: "O(fanout)" },
  ],
  realWorld: [
    "Apache Cassandra: uses gossip for cluster membership and failure detection.",
    "HashiCorp Consul: uses the Serf library (Swim-based gossip) for health checking.",
    "Amazon S3: spreads bucket metadata across thousands of nodes using gossip.",
    "Bitcoin: nodes discover peers and announce new transactions via gossip.",
  ],
  pitfalls: [
    "High fanout = faster convergence but higher network bandwidth usage.",
    "Network partitions can cause 'split brain' if not combined with a consensus layer.",
    "Zombie nodes: if a node is silent for too long, it's hard to distinguish 'dead' from 'partitioned'.",
  ],
  references: [
    {
      label: "SWIM: Scalable Weakly-consistent Infection-style Process Group Membership",
      href: "https://www.cs.cornell.edu/projects/Quicksilver/public_pdfs/SWIM.pdf",
    },
  ],
  codeSnippet: {
    language: "ts",
    code: `// Each node periodically pushes its view to a few random peers.
// Information spreads in O(log N) rounds without any coordinator.
setInterval(() => {
  const peers = pickRandom(members, 3); // fanout
  for (const peer of peers) {
    send(peer, { heartbeats: myView, incarnation: myIncarnation });
  }
}, 1000);

function onGossip(msg: { heartbeats: Map<string, number> }) {
  for (const [node, counter] of msg.heartbeats) {
    if (counter > (myView.get(node) ?? -1)) {
      myView.set(node, counter);       // take the fresher heartbeat
      lastSeen.set(node, Date.now());
    }
  }
  for (const [node, at] of lastSeen) {
    if (Date.now() - at > suspectTimeout) markSuspect(node); // SWIM-style suspicion
  }
}`,
  },
  usedBy: [
    {
      company: "HashiCorp",
      product: "Consul / Serf (SWIM gossip)",
      usage:
        "Membership, failure detection and event broadcast run over a SWIM-based gossip layer instead of a central registry.",
      href: "https://www.serf.io/docs/internals/gossip.html",
    },
    {
      company: "Apache Cassandra",
      product: "Cluster membership & schema propagation",
      usage:
        "Nodes gossip state once per second so topology and schema changes converge without a master.",
      href: "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html",
    },
    {
      company: "Amazon",
      product: "Dynamo-style ring membership",
      usage:
        "The Dynamo paper uses gossip for membership and failure detection to avoid a single coordination point.",
      href: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
    },
    {
      company: "Redis",
      product: "Redis Cluster bus",
      usage:
        "The cluster bus gossips node health and slot ownership; failover starts when enough nodes mark a master as failing.",
      href: "https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/",
    },
  ],
  challenge: {
    prompt:
      "Count the rounds an epidemic takes to reach every node. Each infected node contacts its listed peers each round, so the spread is exponential and the round count grows logarithmically with the cluster — which is why gossip scales where broadcast does not.",
    entry: "roundsToSpread",
    starter: `/**
 * @param {number[][]} peers - peers[i] is who node i contacts each round.
 * @param {number} start - the first node to know.
 * @returns {number} rounds until every node knows, or -1 if some never do.
 *   Zero rounds when there is only the starting node to inform.
 */
function roundsToSpread(peers, start) {
  // Every currently-informed node spreads in the same round, so a round is one
  // whole layer -- this is breadth-first search counting layers.
}
`,
    tests: [
      {
        name: "one node needs no rounds",
        body: `assertEquals(solution([[]], 0), 0);`,
      },
      {
        name: "a direct peer takes one round",
        body: `assertEquals(solution([[1], []], 0), 1);`,
      },
      {
        name: "a chain takes one round per hop",
        body: `assertEquals(solution([[1], [2], []], 0), 2);`,
      },
      {
        name: "fanout spreads in parallel",
        body: `assertEquals(solution([[1, 2], [], []], 0), 1);`,
      },
      {
        name: "unreachable nodes never learn",
        body: `assertEquals(solution([[1], [], []], 0), -1);`,
      },
      {
        name: "doubling reaches many nodes quickly",
        body: `var n = 64;
var peers = [];
for (var i = 0; i < n; i++) peers.push(i * 2 + 1 < n ? [i * 2 + 1, i * 2 + 2].filter(function (x) { return x < n; }) : []);
assert(solution(peers, 0) <= 6, 'expected logarithmic spread');`,
      },
    ],
    hints: [
      "Track who knows, and process the newly informed as one whole layer per round.",
      "Stop as soon as everyone knows; if a layer comes up empty first, some nodes are unreachable.",
      "Starting alone with everyone already informed is zero rounds, not one.",
    ],
    reference: `function roundsToSpread(peers, start) {
  const n = peers.length;
  const knows = new Array(n).fill(false);
  knows[start] = true;
  let informed = 1;
  let frontier = [start];
  let rounds = 0;

  while (informed < n) {
    const next = [];
    // One round infects an entire layer at once.
    for (const node of frontier) {
      for (const peer of peers[node]) {
        if (knows[peer]) continue;
        knows[peer] = true;
        informed++;
        next.push(peer);
      }
    }
    if (next.length === 0) return -1; // nobody new: the rest are unreachable
    frontier = next;
    rounds++;
  }
  return rounds;
}
`,
  },
};
