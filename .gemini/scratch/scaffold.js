const fs = require("fs");
const path = require("path");

const labs = [
  {
    slug: "gossip-protocol",
    name: "GossipProtocol",
    title: "Gossip Protocol",
    category: "Distributed Systems",
    diff: "Advanced",
    time: 5,
    blurb: "Epidemic state dissemination.",
    tags: '["Distributed Systems"]',
  },
  {
    slug: "distributed-tx",
    name: "DistributedTx",
    title: "Saga vs 2PC",
    category: "Distributed Systems",
    diff: "Advanced",
    time: 6,
    blurb: "Distributed transactions.",
    tags: '["Distributed Systems"]',
  },
  {
    slug: "snowflake-id",
    name: "SnowflakeId",
    title: "Snowflake IDs",
    category: "Distributed Systems",
    diff: "Intermediate",
    time: 4,
    blurb: "Distributed unique ID generation.",
    tags: '["Distributed Systems", "System Design"]',
  },
  {
    slug: "vector-clocks",
    name: "VectorClocks",
    title: "Vector Clocks",
    category: "Distributed Systems",
    diff: "Advanced",
    time: 6,
    blurb: "Causality and concurrent writes.",
    tags: '["Distributed Systems"]',
  },
  {
    slug: "lsm-tree",
    name: "LSMTree",
    title: "LSM Tree",
    category: "Data Structures",
    diff: "Advanced",
    time: 6,
    blurb: "MemTable, SSTables, and Compaction.",
    tags: '["DSA", "System Design"]',
  },
  {
    slug: "hyperloglog",
    name: "HyperLogLog",
    title: "HyperLogLog",
    category: "Data Structures",
    diff: "Advanced",
    time: 5,
    blurb: "Probabilistic cardinality estimation.",
    tags: '["DSA"]',
  },
  {
    slug: "quadtree",
    name: "QuadTreeLab",
    title: "QuadTree / GeoSpatial",
    category: "Data Structures",
    diff: "Intermediate",
    time: 5,
    blurb: "2D spatial partitioning.",
    tags: '["DSA"]',
  },
  {
    slug: "skip-list",
    name: "SkipList",
    title: "Skip List",
    category: "Data Structures",
    diff: "Intermediate",
    time: 4,
    blurb: "Probabilistic alternative to balanced trees.",
    tags: '["DSA", "Redis"]',
  },
  {
    slug: "trie",
    name: "TrieLab",
    title: "Trie (Prefix Tree)",
    category: "Data Structures",
    diff: "Beginner",
    time: 3,
    blurb: "Autocomplete engine.",
    tags: '["DSA"]',
  },
  {
    slug: "astar-search",
    name: "AStarSearch",
    title: "A* Search",
    category: "Algorithms",
    diff: "Intermediate",
    time: 5,
    blurb: "Heuristic-based pathfinding.",
    tags: '["DSA"]',
  },
  {
    slug: "pagerank",
    name: "PageRankLab",
    title: "PageRank",
    category: "Algorithms",
    diff: "Advanced",
    time: 6,
    blurb: "Graph centrality and link analysis.",
    tags: '["Algorithms"]',
  },
  {
    slug: "levenshtein",
    name: "LevenshteinLab",
    title: "Levenshtein Distance",
    category: "Algorithms",
    diff: "Intermediate",
    time: 4,
    blurb: "Edit distance (Dynamic Programming).",
    tags: '["Algorithms"]',
  },
  {
    slug: "rabin-karp",
    name: "RabinKarp",
    title: "Rabin-Karp",
    category: "Algorithms",
    diff: "Intermediate",
    time: 4,
    blurb: "Rolling hash string search.",
    tags: '["Algorithms"]',
  },
  {
    slug: "jwt-anatomy",
    name: "JWTAnatomy",
    title: "JWT Anatomy",
    category: "Security",
    diff: "Intermediate",
    time: 4,
    blurb: "Signing, validation, and tampering.",
    tags: '["Security"]',
  },
  {
    slug: "tls-handshake",
    name: "TLSHandshake",
    title: "TLS Handshake",
    category: "Security",
    diff: "Advanced",
    time: 6,
    blurb: "Asymmetric to symmetric key exchange.",
    tags: '["Security"]',
  },
  {
    slug: "cors-lab",
    name: "CORSLab",
    title: "CORS",
    category: "Security",
    diff: "Beginner",
    time: 4,
    blurb: "Preflight requests and Origins.",
    tags: '["Security"]',
  },
  {
    slug: "webauthn",
    name: "WebAuthnLab",
    title: "WebAuthn / Passkeys",
    category: "Security",
    diff: "Advanced",
    time: 5,
    blurb: "FIDO2 biometric authentication.",
    tags: '["Security"]',
  },
];

const compDir = path.join(__dirname, "../../src/components/system-design");

let imports = "";
let entries = "";

for (const lab of labs) {
  const compCode = `import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSimulationStore } from "@/lib/useSimulationStore";

export function ${lab.name}() {
  const { simulationsEnabled } = useSimulationStore();
  const reduce = useReducedMotion();
  const animate = simulationsEnabled && !reduce;

  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card/40">
      <p className="font-mono text-sm text-muted-foreground">
        Interactive simulation coming soon...
      </p>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(compDir, `${lab.name}.tsx`), compCode);

  imports += `import { ${lab.name} } from "@/components/system-design/${lab.name}";\n`;
  entries += `  {
    slug: "${lab.slug}",
    title: "${lab.title}",
    category: "${lab.category}",
    difficulty: "${lab.diff}",
    readingTimeMin: ${lab.time},
    blurb: "${lab.blurb}",
    caption: "Interactive demonstration of ${lab.title}.",
    component: ${lab.name},
    skillTags: ${lab.tags},
    concept: "Detailed explanation of ${lab.title} will be added here.",
  },\n`;
}

fs.writeFileSync(path.join(__dirname, "registry_additions.txt"), imports + "\n=======\n" + entries);
console.log("Done");
