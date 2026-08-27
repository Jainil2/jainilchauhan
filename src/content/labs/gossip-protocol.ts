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
};
