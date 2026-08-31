import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "semantic-cache",
  title: "Semantic Cache",
  category: "AI Systems",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "A cache whose key is a vector — so a hit is a judgement call, and it can be wrong.",
  caption:
    "Drag the similarity threshold. Loosen it and the hit rate climbs, until a question that only resembles a cached one gets served its answer — a wrong result the cache reports as a hit.",
  skillTags: ["AI Systems", "Caching", "Retrieval"],
  bridgesFrom: [
    {
      slug: "lru-cache",
      sameness:
        "Same cache you already built. Keyed store in front of an expensive call, hit and miss counters, and least-recently-used eviction when it fills — nothing about that changes.",
      delta:
        "The key is an embedding and the comparison is a similarity threshold, so a hit is a decision rather than a fact. An LRU cache that misses costs you latency; a semantic cache that hits too loosely returns another question's answer, confidently, with no error anywhere. The failure mode moves from performance to correctness.",
    },
    {
      slug: "consistent-hashing",
      sameness:
        "Same machinery as the hash ring: hash the content, and let where it lands decide what happens to it. Both systems live or die on how the hash distributes.",
      delta:
        "The goal is inverted. Consistent hashing wants similar keys spread evenly across the ring — that uniformity is the whole point, and two nearly identical keys landing on the same node would be a flaw. Locality-sensitive hashing wants the opposite: near-identical inputs must collide on purpose, because a collision is the cache hit. Same tool, requirements reversed.",
    },
  ],
  concept:
    "An LLM call costs money and roughly a second. Many production queries are near-duplicates of earlier ones — the same question asked in different words — so caching them is worth real money. An exact-string cache catches almost none of them, because 'how do I reset my password' and 'password reset steps?' share almost no characters.\n\nA semantic cache embeds the query, searches the cache for the nearest stored query, and serves its answer when the similarity clears a threshold. Storage is just a vector index over cached questions, so everything from the retrieval labs applies: nearest-neighbour search, recall, eviction.\n\nThe threshold is the entire risk surface. Set it high and the cache rarely hits, which is merely disappointing. Set it low and the cache confidently serves the wrong answer — 'how do I cancel my subscription' answered from 'how do I cancel my order'. Nothing errors, no alert fires, and the metric that looks great is the hit rate. Teams calibrate the threshold on a labelled set of query pairs rather than by feel, and usually keep it deliberately conservative.\n\nWhat cannot be cached matters as much. Anything personalised, time-sensitive, or permission-scoped must key on the user or the tenant as well as the vector, or the cache turns into a data-leak path: user A's question is close to user B's, and B receives A's answer. Practical deployments partition per tenant, exclude anything containing personal data, and attach a TTL, because a semantically identical question can have a different correct answer today.",
  complexity: [
    { operation: "Lookup (brute force)", time: "O(n·d)", space: "O(n·d)" },
    { operation: "Lookup (vector index)", time: "~O(log n · d)", space: "O(n·d)" },
    { operation: "Insert on miss", time: "O(1) + embed call", space: "O(d)" },
    { operation: "Eviction", time: "O(1) amortised", space: "O(1)" },
  ],
  codeSnippet: {
    language: "py",
    code: `THRESHOLD = 0.93        # calibrated on labelled pairs, never guessed

def ask(query, user):
    q = embed(query)
    # Tenant is part of the key, not a filter applied afterwards -- otherwise
    # one user's answer can be served to another.
    hit, score = cache.nearest(q, namespace=user.tenant_id)
    if hit and score >= THRESHOLD and not hit.expired:
        return hit.answer                 # ~1ms instead of ~1000ms

    answer = llm(query)
    cache.put(q, answer, namespace=user.tenant_id, ttl=3600)
    return answer

# Hit rate is the tempting metric and the wrong one on its own. Sample hits
# and check they were actually the same question -- a loose threshold looks
# like a win right up until someone reads the answers.`,
  },
  realWorld: [
    "GPTCache popularised the pattern as a drop-in layer in front of an LLM API.",
    "Support and FAQ bots see the highest hit rates, because real user questions cluster tightly around a few dozen intents.",
    "Prompt caching at the provider is the adjacent trick: it reuses KV state for a shared prefix rather than reusing a whole answer, and it is exact rather than semantic.",
  ],
  pitfalls: [
    "Tuning the threshold by hit rate. Hit rate always improves as the threshold drops; correctness is the thing that quietly degrades.",
    "One shared namespace across tenants or users, turning a cache hit into a cross-account disclosure.",
    "Caching answers that depend on time or account state. 'What is my balance' has no cacheable answer, however similar the question.",
    "Embedding a different way at write and read time. A model version bump changes the space, so old entries stop matching or match wrongly.",
  ],
  usedBy: [
    {
      company: "Zilliz",
      product: "GPTCache",
      usage:
        "Open-source semantic cache in front of LLM APIs, with pluggable embedding, vector store and eviction policy.",
      href: "https://github.com/zilliztech/GPTCache",
    },
    {
      company: "Redis",
      product: "LangCache / vector sets",
      usage:
        "Semantic caching over Redis vector search, keyed per application namespace with TTLs.",
      href: "https://redis.io/docs/latest/develop/interact/search-and-query/advanced-concepts/vectors/",
    },
    {
      company: "Anthropic",
      product: "Prompt caching",
      usage:
        "The exact-prefix cousin: reuses KV state for an identical prompt prefix, so there is no similarity threshold and no wrong-answer risk.",
      href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
    },
  ],
  references: [
    { label: "GPTCache", href: "https://github.com/zilliztech/GPTCache" },
    {
      label: "Redis — Semantic caching",
      href: "https://redis.io/docs/latest/develop/get-started/vector-database/",
    },
  ],
  challenge: {
    prompt:
      "Implement the lookup half of a semantic cache. Score the query against every cached entry with cosine similarity and return the id of the best entry whose similarity is at least the threshold — or null when nothing clears it. Two entries can tie: prefer the more recently used one, since that is what eviction would have kept. A returned null is a miss the caller pays for; a returned id the caller trusts completely, which is why the threshold is a correctness setting and not a tuning one.",
    entry: "semanticLookup",
    starter: `/**
 * @param {Array<{id: number, vec: number[], lastUsed: number}>} entries
 * @param {number[]} query
 * @param {number} threshold - minimum cosine similarity to count as a hit.
 * @returns {number|null} id of the hit, or null on a miss.
 */
function semanticLookup(entries, query, threshold) {
  // cosine >= threshold is a hit. On equal similarity the more recently
  // used entry wins.
}
`,
    tests: [
      {
        name: "an identical query is a hit",
        body: `var e = [{ id: 1, vec: [3, 4], lastUsed: 1 }];
assertEquals(solution(e, [3, 4], 0.9), 1);`,
      },
      {
        name: "direction matters, length does not",
        body: `// Same direction, ten times the magnitude -- cosine is still 1.
var e = [{ id: 1, vec: [30, 40], lastUsed: 1 }];
assertEquals(solution(e, [3, 4], 0.99), 1);`,
      },
      {
        name: "a near query clears a loose threshold",
        body: `// cosine([1,0], [1,1]) = 0.7071...
var e = [{ id: 1, vec: [1, 1], lastUsed: 1 }];
assertEquals(solution(e, [1, 0], 0.7), 1);`,
      },
      {
        name: "the same near query misses a strict threshold",
        body: `var e = [{ id: 1, vec: [1, 1], lastUsed: 1 }];
assertEquals(solution(e, [1, 0], 0.8), null);`,
      },
      {
        name: "picks the most similar entry, not the first one over the line",
        body: `var e = [
  { id: 1, vec: [1, 1], lastUsed: 9 },
  { id: 2, vec: [1, 0], lastUsed: 1 },
];
assertEquals(solution(e, [1, 0], 0.5), 2);`,
      },
      {
        name: "equal similarity breaks toward the more recently used entry",
        body: `var e = [
  { id: 1, vec: [2, 0], lastUsed: 3 },
  { id: 2, vec: [5, 0], lastUsed: 8 },
];
assertEquals(solution(e, [1, 0], 0.9), 2);`,
      },
      {
        name: "an unrelated query is a miss, not the least-bad entry",
        body: `var e = [
  { id: 1, vec: [0, 1], lastUsed: 1 },
  { id: 2, vec: [0, 5], lastUsed: 2 },
];
assertEquals(solution(e, [1, 0], 0.5), null);`,
      },
      {
        name: "an empty cache always misses",
        body: `assertEquals(solution([], [1, 0], 0.5), null);`,
      },
      {
        name: "a zero vector never counts as a hit",
        body: `var e = [{ id: 1, vec: [0, 0], lastUsed: 1 }];
assertEquals(solution(e, [1, 0], 0.5), null);`,
      },
      {
        name: "an opposite query does not sneak past a zero threshold as a negative",
        body: `// cosine = -1, which is below 0, so this must miss.
var e = [{ id: 1, vec: [-1, 0], lastUsed: 1 }];
assertEquals(solution(e, [1, 0], 0), null);`,
      },
      {
        name: "scans a realistic cache",
        body: `var e = [];
for (var i = 1; i <= 5000; i++) e.push({ id: i, vec: [1, i], lastUsed: i });
// [1, 1] is the closest in angle to [1, 0] of everything stored.
assertEquals(solution(e, [1, 0], 0.7), 1);`,
      },
    ],
    hints: [
      "Cosine is dot(a, b) / (norm(a) * norm(b)); guard the divide so a zero vector scores 0 rather than NaN.",
      "Keep a running best: replace it when the similarity is strictly higher, or when it is equal and lastUsed is greater.",
      "Compare against the threshold with >=, and return null rather than the best miss — a near-miss served as a hit is the exact failure this cache is famous for.",
    ],
    reference: `function semanticLookup(entries, query, threshold) {
  function cosine(a, b) {
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom === 0 ? 0 : dot / denom;
  }

  let best = null;
  let bestScore = 0;
  for (const entry of entries) {
    const score = cosine(query, entry.vec);
    if (score < threshold) continue;
    // Equal similarity falls to recency: that is the entry eviction would
    // have kept, so it is the one most likely still warm.
    if (best === null || score > bestScore || (score === bestScore && entry.lastUsed > best.lastUsed)) {
      best = entry;
      bestScore = score;
    }
  }
  return best === null ? null : best.id;
}
`,
  },
};
