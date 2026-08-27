import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "raft-election",
  title: "Raft Leader Election",
  category: "Distributed Systems",
  difficulty: "Advanced",
  readingTimeMin: 6,
  blurb: "5-node consensus with crash recovery.",
  caption:
    "Click the leader to crash it. Followers time out, vote, and elect a new leader with animated RequestVote RPCs.",
  whereUsed: { label: "Distributed coordination work", href: "/#experience" },
  skillTags: ["Distributed Systems", "System Design"],
  concept:
    "Raft is a consensus algorithm designed to be understandable. A cluster of nodes elects exactly one leader; all writes flow through that leader and are replicated to followers via AppendEntries RPCs. If the leader fails, followers detect the missing heartbeat (election timeout, randomized 150–300ms), increment their term, and call RequestVote.\n\nA candidate wins if it collects votes from a majority — that's why odd cluster sizes are standard (3, 5, 7). Once elected, the leader pushes its log to followers; conflicting entries are overwritten. The 'commit' point is the highest log index replicated on a majority.\n\nRaft cleanly separates leader election, log replication, and safety, making it the consensus algorithm of choice for etcd, Consul, CockroachDB, and TiKV.",
  complexity: [
    { operation: "Election", time: "~1 RTT × log(N)", space: "O(N) RPCs" },
    { operation: "Replicate", time: "1 RTT to majority", space: "O(N)" },
  ],
  codeSnippet: {
    language: "go",
    code: `// Simplified Raft election loop
func (r *Raft) run() {
  for {
    switch r.state {
    case Follower:
      select {
      case <-r.heartbeat:        // got AppendEntries, stay follower
      case <-r.electionTimeout(): // 150-300ms randomized
        r.state = Candidate
      }
    case Candidate:
      r.term++
      r.votedFor = r.id
      votes := r.requestVotes()
      if votes > len(r.peers)/2 {
        r.state = Leader
      }
    case Leader:
      r.broadcastAppendEntries() // every 50ms
    }
  }
}`,
  },
  realWorld: [
    "etcd — Kubernetes' control-plane store runs Raft.",
    "Consul, Nomad — HashiCorp's coordination services.",
    "CockroachDB / TiKV — Raft per range/region for sharded SQL.",
    "MongoDB replica sets use a Raft-like protocol since 3.2.",
  ],
  pitfalls: [
    "Even cluster sizes (2, 4) are worse than odd — no majority advantage but more failure modes.",
    "Network partitions can elect two leaders briefly; Raft resolves on heal but writes during the split may be lost.",
    "Election storms: tune heartbeat / election timeouts so they don't overlap on flaky networks.",
  ],
  references: [
    { label: "Diego Ongaro — Raft paper (2014)", href: "https://raft.github.io/raft.pdf" },
    { label: "raft.github.io — visualizations", href: "https://raft.github.io/" },
  ],
  usedBy: [
    {
      company: "CNCF",
      product: "etcd (Kubernetes control plane store)",
      usage:
        "Every Kubernetes cluster's state lives in etcd, whose leader election and log replication are Raft.",
      href: "https://etcd.io/docs/latest/learning/design-learner/",
    },
    {
      company: "HashiCorp",
      product: "Consul & Nomad",
      usage:
        "Server clusters elect a leader via Raft; only the leader commits writes to the replicated state store.",
      href: "https://developer.hashicorp.com/consul/docs/architecture/consensus",
    },
    {
      company: "MongoDB",
      product: "Replica set elections",
      usage:
        "Replica sets use a Raft-derived protocol to elect a primary and roll back uncommitted writes after failover.",
      href: "https://www.mongodb.com/docs/manual/core/replica-set-elections/",
    },
    {
      company: "CockroachDB",
      product: "Per-range consensus groups",
      usage:
        "Each data range is its own Raft group, so leadership and replication are sharded across the cluster.",
      href: "https://www.cockroachlabs.com/docs/stable/architecture/replication-layer.html",
    },
  ],
};
