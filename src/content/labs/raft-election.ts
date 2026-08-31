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
  bridgesFrom: [
    {
      slug: "quickselect",
      sameness:
        "Deciding what is committed IS a selection problem. Take each follower's replicated index, and the commit point is the k-th largest where k is the majority size — the same order statistic you computed without sorting the whole array.",
      delta:
        "The array is a moving target: values only ever rise, arrive asynchronously, and some entries never arrive at all, so the answer is recomputed every round rather than once. A wrong k-th element is no longer a wrong percentile but a lost acknowledged write, which is why the raw order statistic is not enough — a leader may only commit entries from its own term, so entries from earlier terms must be excluded before selecting, even when a majority already holds them.",
    },
  ],
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
  challenge: {
    prompt:
      "Implement the RequestVote rule that keeps Raft safe. A follower grants its vote only for a term at least as new as its own, only once per term, and only to a candidate whose log is at least as up to date as its own. That last condition is what stops a stale leader erasing committed entries.",
    entry: "grantVote",
    starter: `/**
 * @param {{term: number, votedFor: string|null, lastLogTerm: number, lastLogIndex: number}} voter
 * @param {{term: number, id: string, lastLogTerm: number, lastLogIndex: number}} request
 * @returns {boolean} whether the vote is granted.
 *   A log is at least as up to date when its last term is higher, or the terms
 *   match and its index is at least as large.
 */
function grantVote(voter, request) {
  // Three gates, all of which must pass: term, one-vote-per-term, log freshness.
}
`,
    tests: [
      {
        name: "grants for a newer term with an equal log",
        body: `assertEquals(solution({ term: 1, votedFor: null, lastLogTerm: 1, lastLogIndex: 5 }, { term: 2, id: 'a', lastLogTerm: 1, lastLogIndex: 5 }), true);`,
      },
      {
        name: "refuses an older term",
        body: `assertEquals(solution({ term: 3, votedFor: null, lastLogTerm: 1, lastLogIndex: 5 }, { term: 2, id: 'a', lastLogTerm: 1, lastLogIndex: 5 }), false);`,
      },
      {
        name: "refuses when it already voted this term",
        body: `assertEquals(solution({ term: 2, votedFor: 'b', lastLogTerm: 1, lastLogIndex: 5 }, { term: 2, id: 'a', lastLogTerm: 1, lastLogIndex: 5 }), false);`,
      },
      {
        name: "grants again to the same candidate",
        body: `assertEquals(solution({ term: 2, votedFor: 'a', lastLogTerm: 1, lastLogIndex: 5 }, { term: 2, id: 'a', lastLogTerm: 1, lastLogIndex: 5 }), true);`,
      },
      {
        name: "refuses a candidate with a stale log term",
        body: `assertEquals(solution({ term: 1, votedFor: null, lastLogTerm: 3, lastLogIndex: 2 }, { term: 5, id: 'a', lastLogTerm: 2, lastLogIndex: 99 }), false);`,
      },
      {
        name: "refuses a shorter log at the same term",
        body: `assertEquals(solution({ term: 1, votedFor: null, lastLogTerm: 2, lastLogIndex: 9 }, { term: 5, id: 'a', lastLogTerm: 2, lastLogIndex: 8 }), false);`,
      },
      {
        name: "grants for a higher log term even with fewer entries",
        body: `assertEquals(solution({ term: 1, votedFor: null, lastLogTerm: 1, lastLogIndex: 99 }, { term: 2, id: 'a', lastLogTerm: 2, lastLogIndex: 1 }), true);`,
      },
    ],
    hints: [
      "Reject immediately when the request's term is below the voter's term.",
      "Within the same term the voter may only support who it already supported.",
      "Compare last log term first; only when those match does the index decide.",
    ],
    reference: `function grantVote(voter, request) {
  if (request.term < voter.term) return false;

  // One vote per term -- unless it is the same candidate asking again.
  if (request.term === voter.term && voter.votedFor !== null && voter.votedFor !== request.id) {
    return false;
  }

  // Log freshness. Without this a candidate missing committed entries could
  // win and overwrite them.
  const upToDate =
    request.lastLogTerm > voter.lastLogTerm ||
    (request.lastLogTerm === voter.lastLogTerm && request.lastLogIndex >= voter.lastLogIndex);
  return upToDate;
}
`,
  },
};
