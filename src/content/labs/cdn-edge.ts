import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "cdn-edge",
  title: "CDN & Edge Caching",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "Two hundred copies of your LRU, one per city — and each one misses independently.",
  caption:
    "One object requested from eight points of presence with a 60-second TTL. The demo opens with tiered caching off, which is the default nearly everyone ships: eight edges each miss separately, so a single origin object serves eight fetches per TTL window instead of one.",
  skillTags: ["System Design", "Caching", "CDN", "Performance"],
  bridgesFrom: [
    {
      slug: "lru-cache",
      sameness:
        "A CDN point of presence is an LRU cache with a URL for a key and a response body for a value. Cloudflare and Fastly nodes evict by recency under a disk budget exactly like the one you implemented — the interesting part of a CDN is not the cache, it is that there are three hundred of them.",
      delta:
        "Copies are independent, so a miss is not one miss — it is one per location, and origin load scales with your PoP count rather than your traffic. And entries now expire on time as well as on capacity, which introduces a failure your LRU never had: a value that is present, returnable, and wrong.",
    },
    {
      slug: "consistent-hashing",
      sameness:
        "Inside a single PoP the cache is sharded across machines with the same hash ring you built, and the tiered-cache 'shield' is the same idea applied one level up: hash the URL to pick which upper-tier data centre owns it, so one machine on earth is responsible for fetching that object from your origin.",
      delta:
        "The ring is now global and the cost of a remap is a transatlantic origin fetch rather than a local one. That is why CDNs pin the upper tier by object rather than by request — the whole benefit is that exactly one node ever talks to your origin for a given URL.",
    },
  ],
  concept:
    "A CDN is a cache you did not write, deployed in places you do not operate. Cloudflare is in 300+ cities, Fastly in ~100 POPs, Akamai in thousands of networks. Each one is a recency-evicting cache keyed on the request URL, and the reason it works is physics: 150 ms of round-trip time to a single origin becomes 10 ms to a machine in the same metro.\n\nThe consequence people miss is that these caches do not share. Eight PoPs seeing the same new object produce eight origin fetches; three hundred produce three hundred. A viral object with a 60-second TTL can hit your origin thousands of times an hour despite a 99.9% global hit ratio. Tiered caching — Cloudflare's Argo tiered cache, Fastly's shielding, Akamai's parent-child hierarchy — inserts an upper tier that owns each URL, so the edges miss into the shield and only the shield misses into you. It is a straightforward hash-ring assignment and it commonly cuts origin traffic by an order of magnitude.\n\nControl of the cache is entirely in your response headers, and this is where most bugs live. `Cache-Control: max-age` governs browsers, `s-maxage` governs shared caches, `stale-while-revalidate` lets the edge serve an expired copy while it refreshes in the background, and `Vary` tells the cache which request headers create separate entries. `Vary: User-Agent` is the classic self-inflicted wound: it fragments one object into thousands of cache entries and destroys the hit ratio you were paying for.\n\nInvalidation is the other half. TTL expiry is passive and simple; purge is active and fast but has to reach every PoP, which is why CDNs implement it as a broadcast that lands in a few hundred milliseconds. Surrogate keys — tagging a response with 'product-123' and purging by tag — are what make purge usable, because real pages assemble many objects and you rarely know all the URLs affected by one database write. The safest deployment does both: long TTLs with tag-based purge, plus versioned URLs for static assets so they never need purging at all.\n\nEdge compute changes the shape again. A worker at the edge can assemble a personalised page from cached fragments, so the uncacheable 5% of a page no longer makes the other 95% uncacheable. That is the actual reason edge functions exist — not latency, but rescuing cacheability from personalisation.",
  complexity: [
    { operation: "Edge hit", time: "~10 ms RTT", space: "O(objects per PoP)" },
    { operation: "Edge miss, no shield", time: "~150 ms + origin", space: "O(1)" },
    { operation: "Origin fetches per TTL window", time: "O(PoPs) without a shield", space: "—" },
    { operation: "With tiered cache", time: "O(1) per object per window", space: "O(objects)" },
  ],
  codeSnippet: {
    language: "ts",
    code: `// The headers are the API. Everything about CDN behaviour is set here.
function cacheHeaders(res: Response, product: Product) {
  res.set(
    "Cache-Control",
    [
      "public",
      "max-age=60", // browsers: short, they cannot be purged
      "s-maxage=86400", // shared caches: long, because we CAN purge them
      "stale-while-revalidate=600", // serve stale for 10 min while refreshing
      "stale-if-error=86400", // serve stale for a day if the origin is down
    ].join(", "),
  );

  // Tag the response so one database write can purge every page that used it,
  // without anyone having to enumerate URLs.
  res.set("Surrogate-Key", \`product-\${product.id} category-\${product.categoryId}\`);

  // Vary only on what genuinely changes the body. Each distinct value of each
  // listed header multiplies the number of cache entries for this URL.
  res.set("Vary", "Accept-Encoding");
  // NOT "Vary: User-Agent" -- that is thousands of copies of one object.
}

// On write: purge by tag, not by URL.
await cdn.purge({ surrogateKeys: [\`product-\${id}\`] });`,
  },
  realWorld: [
    "Cloudflare's tiered cache assigns each URL an upper-tier data centre, so edge misses collapse into one origin fetch instead of one per PoP.",
    "Fastly's surrogate keys let a single database write purge every cached page tagged with that object, globally, in about 150 ms.",
    "Netflix's Open Connect goes further than caching and places the appliances inside ISP networks, pre-filling them overnight with what the region is predicted to watch.",
  ],
  pitfalls: [
    "Assuming a high global hit ratio means low origin load. Independent PoPs multiply every miss by the number of locations, and the ratio barely moves.",
    "Vary on a high-cardinality header. Vary: User-Agent or Vary: Cookie splits one hot object into thousands of near-identical entries that each have to be fetched.",
    "One max-age for browsers and CDNs alike. Browser caches cannot be purged, so a long max-age locks a bad asset onto users' machines for its full duration.",
    "Caching a response that carries a Set-Cookie or a personalised body. A shared cache will happily serve one user's session to the next requester.",
  ],
  usedBy: [
    {
      company: "Cloudflare",
      product: "Tiered Cache",
      usage:
        "Routes edge misses through an upper-tier data centre chosen per URL, so the origin sees one fetch per object per TTL rather than one per PoP.",
      href: "https://developers.cloudflare.com/cache/how-to/tiered-cache/",
    },
    {
      company: "Fastly",
      product: "Surrogate keys",
      usage:
        "Tags responses with content identifiers so a write purges every affected object worldwide without enumerating URLs.",
      href: "https://docs.fastly.com/en/guides/working-with-surrogate-keys",
    },
    {
      company: "Netflix",
      product: "Open Connect",
      usage:
        "Places caching appliances inside ISP networks and pre-populates them during off-peak hours, so peak traffic is served from inside the last mile.",
      href: "https://openconnect.netflix.com/en/",
    },
  ],
  references: [
    {
      label: "RFC 5861 — stale-while-revalidate and stale-if-error",
      href: "https://www.rfc-editor.org/rfc/rfc5861",
    },
    {
      label: "Cloudflare — Tiered Cache",
      href: "https://developers.cloudflare.com/cache/how-to/tiered-cache/",
    },
  ],
  challenge: {
    prompt:
      "Count origin fetches for a request trace spread across CDN points of presence. Each PoP caches an object for `ttl` seconds from the moment it fetches it; a request at time t is an edge hit when t is strictly before that PoP's expiry for the key. On an edge miss the request goes upstream. With `shield` false it goes straight to the origin. With `shield` true it goes through one shared upper tier that caches with the same TTL, so several PoPs missing in the same window produce one origin fetch. Return the number of origin fetches.",
    entry: "originFetches",
    starter: `/**
 * @param {Array<{key: string, pop: string, t: number}>} requests - in time order.
 * @param {number} ttl - seconds an entry stays fresh, at every tier.
 * @param {boolean} shield - whether a shared upper tier sits in front of the origin.
 * @returns {number} how many requests reach the origin.
 */
function originFetches(requests, ttl, shield) {
  // Per-PoP expiry keyed by (pop, key). On an edge miss, either hit the origin
  // directly or let the shield absorb it -- then refresh the edge either way.
}
`,
    tests: [
      {
        name: "the first request always reaches the origin",
        body: `assertEquals(solution([{ key: "a", pop: "lhr", t: 0 }], 60, false), 1);`,
      },
      {
        name: "a second request to the same PoP inside the TTL is an edge hit",
        body: `var r = [
  { key: "a", pop: "lhr", t: 0 },
  { key: "a", pop: "lhr", t: 30 },
];
assertEquals(solution(r, 60, false), 1);`,
      },
      {
        name: "every PoP misses independently without a shield",
        body: `// One object, one instant, eight cities: eight origin fetches.
var pops = ["lhr", "cdg", "fra", "iad", "sfo", "nrt", "syd", "gru"];
var r = pops.map(function (p) {
  return { key: "a", pop: p, t: 0 };
});
assertEquals(solution(r, 60, false), 8);`,
      },
      {
        name: "a shield collapses those eight misses into one",
        body: `var pops = ["lhr", "cdg", "fra", "iad", "sfo", "nrt", "syd", "gru"];
var r = pops.map(function (p) {
  return { key: "a", pop: p, t: 0 };
});
assertEquals(solution(r, 60, true), 1);`,
      },
      {
        name: "expiry is exclusive at the boundary",
        body: `// Fetched at t=0 with ttl=60, so t=59 is fresh and t=60 is not.
var fresh = [
  { key: "a", pop: "lhr", t: 0 },
  { key: "a", pop: "lhr", t: 59 },
];
assertEquals(solution(fresh, 60, false), 1);
var stale = [
  { key: "a", pop: "lhr", t: 0 },
  { key: "a", pop: "lhr", t: 60 },
];
assertEquals(solution(stale, 60, false), 2);`,
      },
      {
        name: "keys are cached independently",
        body: `var r = [
  { key: "a", pop: "lhr", t: 0 },
  { key: "b", pop: "lhr", t: 0 },
  { key: "a", pop: "lhr", t: 1 },
];
assertEquals(solution(r, 60, false), 2);`,
      },
      {
        name: "a zero TTL makes the CDN a very expensive proxy",
        body: `var r = [
  { key: "a", pop: "lhr", t: 0 },
  { key: "a", pop: "lhr", t: 0 },
  { key: "a", pop: "lhr", t: 1 },
];
assertEquals(solution(r, 0, false), 3);`,
      },
      {
        name: "no requests",
        body: `assertEquals(solution([], 60, true), 0);`,
      },
      {
        name: "the shield expires too, so a long trace refetches per window",
        body: `// 5 windows of 60s, 4 PoPs each: one origin fetch per window.
var r = [];
for (var w = 0; w < 5; w++) {
  var pops = ["lhr", "cdg", "fra", "iad"];
  for (var i = 0; i < pops.length; i++) r.push({ key: "a", pop: pops[i], t: w * 60 });
}
assertEquals(solution(r, 60, true), 5);
assertEquals(solution(r, 60, false), 20);`,
      },
      {
        name: "handles a large trace over many PoPs and objects",
        body: `// 200 PoPs, 50 objects, 100k requests, a TTL long enough that nothing expires.
var r = [];
for (var i = 0; i < 100000; i++) {
  r.push({ key: "obj" + (i % 50), pop: "pop" + (i % 200), t: i });
}
// Without a shield: one fetch per (pop, key) pair that ever appears.
assertEquals(solution(r, 1000000, false), 200);
// With one: one fetch per object, full stop. That ratio is the whole feature.
assertEquals(solution(r, 1000000, true), 50);`,
      },
    ],
    hints: [
      "Two maps: one keyed by pop and key for the edges, one keyed by key alone for the shield. Store the expiry timestamp, not the value.",
      "An entry is fresh when t < expiry, so use a strict comparison — an entry fetched at 0 with ttl 60 is stale at exactly 60.",
      "On an edge miss you always refresh that PoP's expiry, but you only count an origin fetch when the shield is absent or its own entry has expired.",
    ],
    reference: `function originFetches(requests, ttl, shield) {
  const edge = new Map(); // "pop\\u0000key" -> expiry
  const upper = new Map(); // "key" -> expiry
  let fetches = 0;

  for (const req of requests) {
    const edgeId = req.pop + "\\u0000" + req.key;
    const edgeExp = edge.get(edgeId);

    // Fresh at the edge: nothing upstream ever hears about this request.
    if (edgeExp !== undefined && req.t < edgeExp) continue;

    if (!shield) {
      // Every PoP is on its own, so origin load scales with the PoP count.
      fetches += 1;
    } else {
      const upExp = upper.get(req.key);
      if (upExp === undefined || req.t >= upExp) {
        fetches += 1;
        upper.set(req.key, req.t + ttl);
      }
      // Otherwise the shield serves it and the origin never sees it.
    }

    edge.set(edgeId, req.t + ttl);
  }

  return fetches;
}
`,
  },
};
