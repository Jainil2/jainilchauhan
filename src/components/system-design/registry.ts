import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/**
 * Slug -> lazily-loaded lab component.
 *
 * Kept apart from the lab metadata in `src/content/labs/` on purpose: metadata
 * must stay importable by Node build scripts (sitemap, bridge graph) and by
 * pages that only list labs, without pulling 93 React components into the
 * bundle. Only `/lab/$slug` resolves an entry here.
 */
export const labComponents: Record<string, LazyExoticComponent<ComponentType>> = {
  array: lazy(() =>
    import("@/components/system-design/CoreDataStructureLabs").then((m) => ({
      default: m.ArrayLab,
    })),
  ),
  "dynamic-array": lazy(() =>
    import("@/components/system-design/CoreDataStructureLabs").then((m) => ({
      default: m.DynamicArrayLab,
    })),
  ),
  "linked-list": lazy(() =>
    import("@/components/system-design/CoreDataStructureLabs").then((m) => ({
      default: m.LinkedListLab,
    })),
  ),
  stack: lazy(() =>
    import("@/components/system-design/CoreDataStructureLabs").then((m) => ({
      default: m.StackLab,
    })),
  ),
  queue: lazy(() =>
    import("@/components/system-design/CoreDataStructureLabs").then((m) => ({
      default: m.QueueLab,
    })),
  ),
  deque: lazy(() =>
    import("@/components/system-design/CoreDataStructureLabs").then((m) => ({
      default: m.DequeLab,
    })),
  ),
  "circular-buffer": lazy(() =>
    import("@/components/system-design/CoreDataStructureLabs").then((m) => ({
      default: m.CircularBufferLab,
    })),
  ),
  "hash-table": lazy(() =>
    import("@/components/system-design/CoreDataStructureLabs").then((m) => ({
      default: m.HashTableLab,
    })),
  ),
  bitset: lazy(() =>
    import("@/components/system-design/CoreDataStructureLabs").then((m) => ({
      default: m.BitsetLab,
    })),
  ),
  "sparse-matrix": lazy(() =>
    import("@/components/system-design/CoreDataStructureLabs").then((m) => ({
      default: m.SparseMatrixLab,
    })),
  ),
  "binary-tree": lazy(() =>
    import("@/components/system-design/CoreTreeLabs").then((m) => ({ default: m.BinaryTreeLab })),
  ),
  "binary-search-tree": lazy(() =>
    import("@/components/system-design/CoreTreeLabs").then((m) => ({ default: m.BSTLab })),
  ),
  "avl-tree": lazy(() =>
    import("@/components/system-design/CoreTreeLabs").then((m) => ({ default: m.AVLTreeLab })),
  ),
  "red-black-tree": lazy(() =>
    import("@/components/system-design/CoreTreeLabs").then((m) => ({ default: m.RedBlackTreeLab })),
  ),
  "heap-priority-queue": lazy(() =>
    import("@/components/system-design/CoreTreeLabs").then((m) => ({ default: m.HeapLab })),
  ),
  "segment-tree": lazy(() =>
    import("@/components/system-design/CoreTreeLabs").then((m) => ({ default: m.SegmentTreeLab })),
  ),
  "fenwick-tree": lazy(() =>
    import("@/components/system-design/CoreTreeLabs").then((m) => ({ default: m.FenwickTreeLab })),
  ),
  "disjoint-set-union": lazy(() =>
    import("@/components/system-design/CoreTreeLabs").then((m) => ({ default: m.DisjointSetLab })),
  ),
  "b-plus-tree": lazy(() =>
    import("@/components/system-design/CoreTreeLabs").then((m) => ({ default: m.BPlusTreeLab })),
  ),
  "bloom-filter": lazy(() =>
    import("@/components/system-design/BloomFilter").then((m) => ({ default: m.BloomFilter })),
  ),
  "graph-representations": lazy(() =>
    import("@/components/system-design/CoreGraphLabs").then((m) => ({
      default: m.GraphRepresentationLab,
    })),
  ),
  "connected-components": lazy(() =>
    import("@/components/system-design/CoreGraphLabs").then((m) => ({
      default: m.ConnectedComponentsLab,
    })),
  ),
  "cycle-detection": lazy(() =>
    import("@/components/system-design/CoreGraphLabs").then((m) => ({
      default: m.CycleDetectionLab,
    })),
  ),
  "strongly-connected-components": lazy(() =>
    import("@/components/system-design/CoreGraphLabs").then((m) => ({
      default: m.StronglyConnectedComponentsLab,
    })),
  ),
  "bipartite-check": lazy(() =>
    import("@/components/system-design/CoreGraphLabs").then((m) => ({
      default: m.BipartiteCheckLab,
    })),
  ),
  "graph-union-find": lazy(() =>
    import("@/components/system-design/CoreGraphLabs").then((m) => ({
      default: m.GraphUnionFindLab,
    })),
  ),
  "lru-cache": lazy(() =>
    import("@/components/system-design/LRUCache").then((m) => ({ default: m.LRUCache })),
  ),
  "bellman-ford": lazy(() =>
    import("@/components/system-design/GraphOptimizationLabs").then((m) => ({
      default: m.BellmanFordLab,
    })),
  ),
  "floyd-warshall": lazy(() =>
    import("@/components/system-design/GraphOptimizationLabs").then((m) => ({
      default: m.FloydWarshallLab,
    })),
  ),
  "prim-mst": lazy(() =>
    import("@/components/system-design/GraphOptimizationLabs").then((m) => ({
      default: m.PrimLab,
    })),
  ),
  "kruskal-mst": lazy(() =>
    import("@/components/system-design/GraphOptimizationLabs").then((m) => ({
      default: m.KruskalLab,
    })),
  ),
  "max-flow": lazy(() =>
    import("@/components/system-design/GraphOptimizationLabs").then((m) => ({
      default: m.MaxFlowLab,
    })),
  ),
  "edmonds-karp": lazy(() =>
    import("@/components/system-design/GraphOptimizationLabs").then((m) => ({
      default: m.EdmondsKarpLab,
    })),
  ),
  "min-cut": lazy(() =>
    import("@/components/system-design/GraphOptimizationLabs").then((m) => ({
      default: m.MinCutLab,
    })),
  ),
  "bipartite-matching": lazy(() =>
    import("@/components/system-design/GraphOptimizationLabs").then((m) => ({
      default: m.BipartiteMatchingLab,
    })),
  ),
  "raft-election": lazy(() =>
    import("@/components/system-design/RaftCluster").then((m) => ({ default: m.RaftCluster })),
  ),
  "binary-search": lazy(() =>
    import("@/components/system-design/SearchSortLabs").then((m) => ({
      default: m.BinarySearchLab,
    })),
  ),
  quickselect: lazy(() =>
    import("@/components/system-design/SearchSortLabs").then((m) => ({
      default: m.QuickselectLab,
    })),
  ),
  "heap-sort": lazy(() =>
    import("@/components/system-design/SearchSortLabs").then((m) => ({ default: m.HeapSortLab })),
  ),
  "counting-sort": lazy(() =>
    import("@/components/system-design/SearchSortLabs").then((m) => ({
      default: m.CountingSortLab,
    })),
  ),
  "radix-sort": lazy(() =>
    import("@/components/system-design/SearchSortLabs").then((m) => ({ default: m.RadixSortLab })),
  ),
  "bucket-sort": lazy(() =>
    import("@/components/system-design/SearchSortLabs").then((m) => ({ default: m.BucketSortLab })),
  ),
  timsort: lazy(() =>
    import("@/components/system-design/SearchSortLabs").then((m) => ({ default: m.TimSortLab })),
  ),
  "external-merge-sort": lazy(() =>
    import("@/components/system-design/SearchSortLabs").then((m) => ({
      default: m.ExternalMergeSortLab,
    })),
  ),
  "sorting-race": lazy(() =>
    import("@/components/system-design/SortingRace").then((m) => ({ default: m.SortingRace })),
  ),
  "fibonacci-memoization": lazy(() =>
    import("@/components/system-design/DynamicProgrammingLabs").then((m) => ({
      default: m.FibonacciMemoLab,
    })),
  ),
  knapsack: lazy(() =>
    import("@/components/system-design/DynamicProgrammingLabs").then((m) => ({
      default: m.KnapsackLab,
    })),
  ),
  "coin-change": lazy(() =>
    import("@/components/system-design/DynamicProgrammingLabs").then((m) => ({
      default: m.CoinChangeLab,
    })),
  ),
  "longest-increasing-subsequence": lazy(() =>
    import("@/components/system-design/DynamicProgrammingLabs").then((m) => ({
      default: m.LISLab,
    })),
  ),
  "longest-common-subsequence": lazy(() =>
    import("@/components/system-design/DynamicProgrammingLabs").then((m) => ({
      default: m.LCSLab,
    })),
  ),
  "matrix-chain-multiplication": lazy(() =>
    import("@/components/system-design/DynamicProgrammingLabs").then((m) => ({
      default: m.MatrixChainLab,
    })),
  ),
  "grid-dp": lazy(() =>
    import("@/components/system-design/DynamicProgrammingLabs").then((m) => ({
      default: m.GridDPLab,
    })),
  ),
  "tree-dp": lazy(() =>
    import("@/components/system-design/DynamicProgrammingLabs").then((m) => ({
      default: m.TreeDPLab,
    })),
  ),
  dijkstra: lazy(() =>
    import("@/components/system-design/DijkstraGrid").then((m) => ({ default: m.DijkstraGrid })),
  ),
  "interval-scheduling": lazy(() =>
    import("@/components/system-design/GreedyBacktrackingLabs").then((m) => ({
      default: m.IntervalSchedulingLab,
    })),
  ),
  "activity-selection": lazy(() =>
    import("@/components/system-design/GreedyBacktrackingLabs").then((m) => ({
      default: m.ActivitySelectionLab,
    })),
  ),
  "huffman-coding": lazy(() =>
    import("@/components/system-design/GreedyBacktrackingLabs").then((m) => ({
      default: m.HuffmanCodingLab,
    })),
  ),
  "n-queens": lazy(() =>
    import("@/components/system-design/GreedyBacktrackingLabs").then((m) => ({
      default: m.NQueensLab,
    })),
  ),
  "permutations-subsets": lazy(() =>
    import("@/components/system-design/GreedyBacktrackingLabs").then((m) => ({
      default: m.PermutationsSubsetsLab,
    })),
  ),
  "branch-and-bound": lazy(() =>
    import("@/components/system-design/GreedyBacktrackingLabs").then((m) => ({
      default: m.BranchAndBoundLab,
    })),
  ),
  "merge-sort-recursion": lazy(() =>
    import("@/components/system-design/GreedyBacktrackingLabs").then((m) => ({
      default: m.MergeSortRecursionLab,
    })),
  ),
  "oidc-flow": lazy(() =>
    import("@/components/system-design/OIDCFlow").then((m) => ({ default: m.OIDCFlow })),
  ),
  "message-queue": lazy(() =>
    import("@/components/system-design/MessageQueue").then((m) => ({ default: m.MessageQueue })),
  ),
  "merkle-tree": lazy(() =>
    import("@/components/system-design/MerkleTree").then((m) => ({ default: m.MerkleTree })),
  ),
  "consistent-hashing": lazy(() =>
    import("@/components/system-design/ConsistentHashLab").then((m) => ({
      default: m.ConsistentHashLab,
    })),
  ),
  "rate-limiter": lazy(() =>
    import("@/components/system-design/RateLimiterLab").then((m) => ({
      default: m.RateLimiterLab,
    })),
  ),
  "btree-index": lazy(() =>
    import("@/components/system-design/BTreeIndexLab").then((m) => ({ default: m.BTreeIndexLab })),
  ),
  "graph-traversal": lazy(() =>
    import("@/components/system-design/GraphTraversalLab").then((m) => ({
      default: m.GraphTraversalLab,
    })),
  ),
  "cap-theorem": lazy(() =>
    import("@/components/system-design/CapTheoremLab").then((m) => ({ default: m.CapTheoremLab })),
  ),
  deadlock: lazy(() =>
    import("@/components/system-design/DeadlockLab").then((m) => ({ default: m.DeadlockLab })),
  ),
  "gossip-protocol": lazy(() =>
    import("@/components/system-design/GossipProtocol").then((m) => ({
      default: m.GossipProtocol,
    })),
  ),
  "distributed-tx": lazy(() =>
    import("@/components/system-design/DistributedTx").then((m) => ({ default: m.DistributedTx })),
  ),
  "snowflake-id": lazy(() =>
    import("@/components/system-design/SnowflakeId").then((m) => ({ default: m.SnowflakeId })),
  ),
  "vector-clocks": lazy(() =>
    import("@/components/system-design/VectorClocks").then((m) => ({ default: m.VectorClocks })),
  ),
  "lsm-tree": lazy(() =>
    import("@/components/system-design/LSMTree").then((m) => ({ default: m.LSMTree })),
  ),
  hyperloglog: lazy(() =>
    import("@/components/system-design/HyperLogLog").then((m) => ({ default: m.HyperLogLog })),
  ),
  quadtree: lazy(() =>
    import("@/components/system-design/QuadTreeLab").then((m) => ({ default: m.QuadTreeLab })),
  ),
  "skip-list": lazy(() =>
    import("@/components/system-design/SkipList").then((m) => ({ default: m.SkipList })),
  ),
  trie: lazy(() =>
    import("@/components/system-design/TrieLab").then((m) => ({ default: m.TrieLab })),
  ),
  "astar-search": lazy(() =>
    import("@/components/system-design/AStarSearch").then((m) => ({ default: m.AStarSearch })),
  ),
  pagerank: lazy(() =>
    import("@/components/system-design/PageRankLab").then((m) => ({ default: m.PageRankLab })),
  ),
  levenshtein: lazy(() =>
    import("@/components/system-design/LevenshteinLab").then((m) => ({
      default: m.LevenshteinLab,
    })),
  ),
  "rabin-karp": lazy(() =>
    import("@/components/system-design/RabinKarp").then((m) => ({ default: m.RabinKarp })),
  ),
  "jwt-anatomy": lazy(() =>
    import("@/components/system-design/JWTAnatomy").then((m) => ({ default: m.JWTAnatomy })),
  ),
  "tls-handshake": lazy(() =>
    import("@/components/system-design/TLSHandshake").then((m) => ({ default: m.TLSHandshake })),
  ),
  "cors-lab": lazy(() =>
    import("@/components/system-design/CORSLab").then((m) => ({ default: m.CORSLab })),
  ),
  webauthn: lazy(() =>
    import("@/components/system-design/WebAuthnLab").then((m) => ({ default: m.WebAuthnLab })),
  ),
  "load-balancer": lazy(() =>
    import("@/components/system-design/AdvancedSystemLabs").then((m) => ({
      default: m.LoadBalancerLab,
    })),
  ),
  "circuit-breaker": lazy(() =>
    import("@/components/system-design/AdvancedSystemLabs").then((m) => ({
      default: m.CircuitBreakerLab,
    })),
  ),
  "crdt-counter": lazy(() =>
    import("@/components/system-design/AdvancedSystemLabs").then((m) => ({ default: m.CRDTLab })),
  ),
  "sharding-replication": lazy(() =>
    import("@/components/system-design/AdvancedSystemLabs").then((m) => ({
      default: m.ShardingReplicationLab,
    })),
  ),
  backpressure: lazy(() =>
    import("@/components/system-design/AdvancedSystemLabs").then((m) => ({
      default: m.BackpressureLab,
    })),
  ),
  "topological-sort": lazy(() =>
    import("@/components/system-design/AdvancedSystemLabs").then((m) => ({
      default: m.TopologicalSortLab,
    })),
  ),
  "kv-cache": lazy(() =>
    import("@/components/system-design/AiInferenceLabs").then((m) => ({
      default: m.KVCacheLab,
    })),
  ),
  "continuous-batching": lazy(() =>
    import("@/components/system-design/AiInferenceLabs").then((m) => ({
      default: m.ContinuousBatchingLab,
    })),
  ),
  "speculative-decoding": lazy(() =>
    import("@/components/system-design/AiInferenceLabs").then((m) => ({
      default: m.SpeculativeDecodingLab,
    })),
  ),
  "inference-cost": lazy(() =>
    import("@/components/system-design/AiInferenceLabs").then((m) => ({
      default: m.InferenceCostLab,
    })),
  ),
  quantization: lazy(() =>
    import("@/components/system-design/AiInferenceLabs").then((m) => ({
      default: m.QuantizationLab,
    })),
  ),
  embeddings: lazy(() =>
    import("@/components/system-design/AiRetrievalLabs").then((m) => ({
      default: m.EmbeddingsLab,
    })),
  ),
  "ann-search": lazy(() =>
    import("@/components/system-design/AiRetrievalLabs").then((m) => ({
      default: m.AnnSearchLab,
    })),
  ),
  "vector-index": lazy(() =>
    import("@/components/system-design/AiRetrievalLabs").then((m) => ({
      default: m.VectorIndexLab,
    })),
  ),
  reranking: lazy(() =>
    import("@/components/system-design/AiRetrievalLabs").then((m) => ({
      default: m.RerankingLab,
    })),
  ),
  "semantic-cache": lazy(() =>
    import("@/components/system-design/AiRetrievalLabs").then((m) => ({
      default: m.SemanticCacheLab,
    })),
  ),
};
