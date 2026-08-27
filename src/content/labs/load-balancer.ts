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
};
