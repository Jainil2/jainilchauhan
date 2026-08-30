import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "load-balancer",
  title: "Load Balancing",
  category: "Distributed Systems",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "Route requests with round-robin, least-connections, and weighted strategies.",
  caption:
    "Send requests into three backend nodes and compare routing policies. Complete active requests to see why least-connections reacts better to slow servers than simple round-robin.",
  skillTags: ["Distributed Systems", "System Design", "Backend"],
  bridgesFrom: [
    {
      slug: "heap-priority-queue",
      sameness:
        "Least-connections IS extract-min. Backends are keyed by in-flight count, you pop the smallest, hand it the request, increment its key and put it back — the same heap operation you used for scheduling and Dijkstra.",
      delta:
        "The keys change without anyone telling you. A backend's count drops whenever a request finishes anywhere, and with several balancers there is no shared heap at all, so the minimum you popped was true a moment ago and is not now. Every balancer stampedes the same 'least busy' node and overwhelms it — which is why production picks two backends at random and takes the better of the pair rather than trusting a global minimum.",
    },
  ],
  concept:
    "A load balancer spreads traffic across healthy backend instances so one machine does not become the bottleneck. The policy matters: round-robin is simple but ignores current load, least-connections tracks in-flight work, weighted routing sends more traffic to larger instances, and hash-based routing keeps related requests stable.\n\nReal production balancers also perform health checks, connection draining, TLS termination, sticky sessions, retries, outlier detection, and circuit breaking. The goal is not only even traffic; it is predictable latency during failure, deploys, and uneven workloads.",
  complexity: [
    { operation: "Round-robin route", time: "O(1)", space: "O(1)" },
    { operation: "Least-connections route", time: "O(n servers)", space: "O(n)" },
    { operation: "Weighted route", time: "O(1) to O(log n)", space: "O(n)" },
  ],
  realWorld: [
    "Nginx, HAProxy, Envoy, AWS ALB/NLB, and Cloudflare Load Balancing.",
    "Service meshes use local load balancing plus retries and outlier detection.",
  ],
  pitfalls: [
    "Retries can amplify overload if every client retries at once.",
    "Sticky sessions simplify state but reduce balancing quality.",
    "Health checks must detect partial failure, not just process liveness.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// "Power of two choices": sample 2 backends, send to the less loaded one.
// Near-optimal balance without global state — what Envoy/NGINX least-request does.
function pick(backends: { id: string; inflight: number; healthy: boolean }[]) {
  const live = backends.filter((b) => b.healthy);
  if (live.length <= 1) return live[0];
  const a = live[Math.floor(Math.random() * live.length)];
  const b = live[Math.floor(Math.random() * live.length)];
  return a.inflight <= b.inflight ? a : b;
}

// Round robin ignores request cost; least-request tracks it;
// consistent hashing trades balance for cache affinity (session/shard stickiness).`,
  },
  usedBy: [
    {
      company: "Google / CNCF",
      product: "Envoy least-request policy",
      usage:
        "Envoy implements power-of-two-choices as its default least-request load balancer for HTTP upstreams.",
      href: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers",
    },
    {
      company: "NGINX / F5",
      product: "upstream least_conn & hash",
      usage:
        "NGINX exposes round-robin, least-connections and hash-based (sticky) balancing per upstream block.",
      href: "https://nginx.org/en/docs/http/load_balancing.html",
    },
    {
      company: "AWS",
      product: "Application Load Balancer",
      usage:
        "ALB spreads requests across targets in multiple AZs with health checks and connection draining on deploys.",
      href: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html",
    },
    {
      company: "Cloudflare",
      product: "Anycast + PoP-level balancing",
      usage:
        "Traffic reaches the nearest PoP by anycast routing, then is balanced across machines inside that PoP.",
      href: "https://blog.cloudflare.com/unimog-cloudflares-edge-load-balancer/",
    },
  ],
  references: [
    {
      label: "Mitzenmacher — The power of two choices in randomized load balancing",
      href: "https://www.eecs.harvard.edu/~michaelm/postscripts/handbook2001.pdf",
    },
    {
      label: "Envoy — load balancing architecture overview",
      href: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers",
    },
    {
      label: "Cloudflare — Unimog, the edge load balancer",
      href: "https://blog.cloudflare.com/unimog-cloudflares-edge-load-balancer/",
    },
  ],
  challenge: {
    prompt:
      "Route requests with least-connections, the policy that actually respects how long work takes. Round-robin assumes every request costs the same; least-connections notices when one backend is still busy and sends the next request elsewhere.",
    entry: "route",
    starter: `/**
 * @param {number} nodes - backends 0..nodes-1, all starting idle.
 * @param {Array<['start']|['done', number]>} events
 *   ['start'] routes a request; ['done', node] frees one connection there.
 * @returns {number[]} the backend chosen for each 'start', in order.
 *   Ties go to the lowest index.
 */
function route(nodes, events) {
  // Send each request to whichever backend currently holds the fewest open
  // connections.
}
`,
    tests: [
      {
        name: "spreads across idle backends",
        body: `assertEquals(solution(3, [['start'], ['start'], ['start']]), [0, 1, 2]);`,
      },
      {
        name: "wraps once everyone is equal",
        body: `assertEquals(solution(2, [['start'], ['start'], ['start']]), [0, 1, 0]);`,
      },
      {
        name: "a freed backend is chosen again",
        body: `assertEquals(solution(2, [['start'], ['start'], ['done', 0], ['start']]), [0, 1, 0]);`,
      },
      {
        name: "avoids a backend still busy",
        body: `assertEquals(solution(2, [['start'], ['done', 0], ['start'], ['start']]), [0, 0, 1]);`,
      },
      {
        name: "ties go to the lowest index",
        body: `assertEquals(solution(3, [['start'], ['done', 0], ['start']]), [0, 0]);`,
      },
      {
        name: "no requests",
        body: `assertEquals(solution(2, []), []);`,
      },
      {
        name: "stays balanced over many requests",
        body: `var events = [];
for (var i = 0; i < 900; i++) events.push(['start']);
var out = solution(3, events);
var counts = [0, 0, 0];
for (var j = 0; j < out.length; j++) counts[out[j]]++;
assertEquals(counts, [300, 300, 300]);`,
      },
    ],
    hints: [
      "Keep an array of open connection counts, one per backend.",
      "For a start, scan for the smallest count and take the first index that holds it.",
      "A done event decrements that backend, never below zero.",
    ],
    reference: `function route(nodes, events) {
  const open = new Array(nodes).fill(0);
  const out = [];
  for (const [kind, node] of events) {
    if (kind === 'done') {
      if (open[node] > 0) open[node]--;
      continue;
    }
    // Strict < keeps the earliest index on a tie.
    let best = 0;
    for (let i = 1; i < nodes; i++) if (open[i] < open[best]) best = i;
    open[best]++;
    out.push(best);
  }
  return out;
}
`,
  },
};
