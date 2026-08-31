import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "api-gateway",
  title: "API Gateway",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "A load balancer that also holds every policy your services stopped implementing.",
  caption:
    "A routing table matched against live requests. It opens with plain string-prefix matching, the default in more gateways than you would like: /api/usersearch is silently routed to the users service because its path happens to start with /api/users.",
  skillTags: ["System Design", "Networking", "Routing", "API Design"],
  bridgesFrom: [
    {
      slug: "load-balancer",
      sameness:
        "A gateway IS the reverse proxy you already built. It terminates the client connection, picks a backend, forwards the request and streams the response back — health checks, connection reuse and all. Envoy is literally the same binary running as both a load balancer and a gateway.",
      delta:
        "It picks the backend by inspecting the request rather than by rotation, so it must parse and understand HTTP, and it is where auth, rate limits, quotas and request rewriting now live. That moves policy out of every service and into one process — which is the benefit and the risk in the same sentence, because that process is now a single failure domain for every API you own.",
    },
    {
      slug: "circuit-breaker",
      sameness:
        "The outlier detection in a gateway is the breaker from that lab, one instance per upstream: count failures, trip, stop sending, probe, close. Envoy calls it outlier ejection and it is the same state machine.",
      delta:
        "The breaker now lives outside the calling service, so it protects every caller at once and it sees the aggregate failure rate rather than one client's view. The cost is that a single mis-tuned threshold can eject a healthy upstream for the whole fleet simultaneously.",
    },
  ],
  concept:
    "An API gateway is one hop that does four jobs: route the request to the right service, authenticate the caller, enforce cross-cutting policy, and shape what leaves the building. It exists because the alternative — every service implementing auth, rate limiting, CORS, TLS termination and request logging — produces twelve slightly different implementations of each, eleven of which have a bug.\n\nRouting is the part people underestimate. Real tables match on path prefix, host, header, method and sometimes weight, and the matching rules matter enormously. Plain string-prefix matching routes `/api/usersearch` to the `/api/users` service, which is a genuine production incident pattern; correct matching is on segment boundaries. Order matters too: gateways either match the longest prefix (Envoy's `prefix`, Kubernetes Ingress) or the first rule in the list (nginx `location` blocks in some configurations), and getting the model wrong means a catch-all rule at position three shadows everything after it.\n\nAuthentication at the gateway is the pattern that pays for the hop. The gateway validates the JWT once, and forwards the verified claims as internal headers — so services skip the signature check but must then be unreachable from outside the mesh, because a forged `X-User-Id` header from the public internet would otherwise be a total authentication bypass. This is why gateway deployments always come with the rule that internal services never trust headers from an untrusted network.\n\nThe cost is latency and coupling. Every request pays the gateway: typically 1–5 ms of proxying, plus whatever auth costs if it is not cached. Every deploy of the gateway is a deploy that can break all APIs at once, so config changes get their own review and rollout process. And a gateway invites 'just one more thing in the gateway' until it becomes an application — the Backends-for-Frontends pattern exists precisely because response aggregation belongs in a service per client type, not in the shared proxy.\n\nMost teams run this in two tiers: an edge proxy or CDN doing TLS, DDoS and geographic routing, then an internal gateway doing auth and service routing. The tiers fail differently, which is the point.",
  complexity: [
    {
      operation: "Longest-prefix route match",
      time: "O(routes) naive, O(path) with a trie",
      space: "O(routes)",
    },
    { operation: "JWT verification", time: "O(1), ~0.1–1 ms", space: "O(1)" },
    { operation: "Rate-limit check", time: "O(1) + optional RTT", space: "O(keys)" },
    { operation: "Proxy overhead", time: "~1–5 ms added per request", space: "O(connections)" },
  ],
  codeSnippet: {
    language: "ts",
    code: `// Envoy-style route table. Longest matching prefix wins, and the match is
// on segment boundaries -- "/api/users" must not capture "/api/usersearch".
const routes = [
  { id: "users", prefix: "/api/users", methods: ["*"], upstream: "users-svc" },
  { id: "search", prefix: "/api/usersearch", methods: ["GET"], upstream: "search-svc" },
  { id: "admin", prefix: "/api/admin", methods: ["*"], upstream: "admin-svc", requireRole: "staff" },
  { id: "fallback", prefix: "/", methods: ["*"], upstream: "monolith" },
];

function segmentMatch(path: string, prefix: string) {
  if (prefix === "/") return true;
  // The whole bug in one line: startsWith alone is not a path match.
  return path === prefix || path.startsWith(prefix + "/");
}

function pick(req: { path: string; method: string }) {
  return routes
    .filter((r) => segmentMatch(req.path, r.prefix))
    .filter((r) => r.methods.includes("*") || r.methods.includes(req.method))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0]; // longest wins
}

// Auth once, at the edge, then hand claims downstream as headers.
// This is only safe because upstreams reject these headers from outside the mesh.
async function handle(req: Request) {
  const claims = await verifyJwt(req.headers.get("authorization"));
  const route = pick(req);
  return fetch(route.upstream + req.path, {
    headers: { ...stripClientAuthHeaders(req.headers), "x-user-id": claims.sub },
  });
}`,
  },
  realWorld: [
    "Netflix built Zuul to put routing, auth and stress-testing filters in one place, then Zuul 2 to make it async so an idle upstream did not tie up a thread per connection.",
    "Envoy's route configuration supports prefix, exact and regex matching with per-route timeouts and retry policies, and is the data plane under most service meshes.",
    "Managed gateways such as AWS API Gateway fold authorization, throttling and request validation into the same hop, and bill per request because that hop is the product.",
  ],
  pitfalls: [
    "String-prefix routing instead of segment matching. /api/usersearch lands on the users service, and it looks like a service bug rather than a routing bug.",
    "Trusting identity headers on internal services. If the gateway sets X-User-Id and the service is reachable directly, anyone who can reach it is anyone they want to be.",
    "Forgetting the gateway's own timeouts. A 30-second default upstream timeout means a slow backend holds gateway connections until the gateway, not the backend, runs out.",
    "Letting business logic accumulate in gateway config. Response shaping and aggregation belong in a backend-for-frontend service where it can be tested and deployed independently.",
  ],
  usedBy: [
    {
      company: "Netflix",
      product: "Zuul 2",
      usage:
        "Async edge gateway handling routing, authentication and canary traffic for all Netflix device traffic.",
      href: "https://netflixtechblog.com/open-sourcing-zuul-2-82ea476cb2b3",
    },
    {
      company: "Envoy",
      product: "HTTP routing",
      usage:
        "Prefix, path and regex route matching with per-route timeouts, retries and outlier ejection; the data plane for Istio and most meshes.",
      href: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/http/http_routing",
    },
    {
      company: "AWS",
      product: "API Gateway",
      usage:
        "Managed gateway that terminates TLS, runs Lambda or JWT authorizers, throttles per key and forwards to private integrations.",
      href: "https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html",
    },
  ],
  references: [
    {
      label: "Envoy — HTTP routing",
      href: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/http/http_routing",
    },
    {
      label: "Netflix — Open sourcing Zuul 2",
      href: "https://netflixtechblog.com/open-sourcing-zuul-2-82ea476cb2b3",
    },
  ],
  challenge: {
    prompt:
      "Implement gateway route matching. A route matches when its prefix matches the request path on a segment boundary — the path equals the prefix, or the path starts with the prefix followed by a '/'. The prefix '/' is a catch-all. A trailing slash on a prefix is not significant. A route only applies if its methods list contains the request method or the wildcard '*'; routes that match the path but not the method are skipped entirely. Among applicable routes the longest prefix wins, ties going to the earlier route. Return the winning route's id, or null when nothing matches.",
    entry: "route",
    starter: `/**
 * @param {{path: string, method: string}} req
 * @param {Array<{id: string, prefix: string, methods: string[]}>} routes
 * @returns {string|null} id of the matching route, or null.
 */
function route(req, routes) {
  // Segment-boundary prefix match, method filter, longest prefix wins.
}
`,
    tests: [
      {
        name: "an exact path match",
        body: `var routes = [{ id: "users", prefix: "/api/users", methods: ["*"] }];
assertEquals(solution({ path: "/api/users", method: "GET" }, routes), "users");`,
      },
      {
        name: "a sub-path matches its parent prefix",
        body: `var routes = [{ id: "users", prefix: "/api/users", methods: ["*"] }];
assertEquals(solution({ path: "/api/users/42/orders", method: "GET" }, routes), "users");`,
      },
      {
        name: "prefix matching stops at segment boundaries",
        body: `// The bug this lab opens on: /api/usersearch is NOT under /api/users.
var routes = [
  { id: "users", prefix: "/api/users", methods: ["*"] },
  { id: "api", prefix: "/api", methods: ["*"] },
];
assertEquals(solution({ path: "/api/usersearch", method: "GET" }, routes), "api");`,
      },
      {
        name: "the longest matching prefix wins regardless of order",
        body: `var routes = [
  { id: "root", prefix: "/", methods: ["*"] },
  { id: "api", prefix: "/api", methods: ["*"] },
  { id: "admin", prefix: "/api/admin", methods: ["*"] },
];
assertEquals(solution({ path: "/api/admin/users", method: "GET" }, routes), "admin");`,
      },
      {
        name: "the root prefix catches everything else",
        body: `var routes = [
  { id: "api", prefix: "/api", methods: ["*"] },
  { id: "monolith", prefix: "/", methods: ["*"] },
];
assertEquals(solution({ path: "/legacy/checkout", method: "POST" }, routes), "monolith");`,
      },
      {
        name: "a method mismatch skips the route rather than winning it",
        body: `var routes = [
  { id: "read", prefix: "/api/users", methods: ["GET"] },
  { id: "api", prefix: "/api", methods: ["*"] },
];
assertEquals(solution({ path: "/api/users", method: "DELETE" }, routes), "api");`,
      },
      {
        name: "an explicit method list matches when it should",
        body: `var routes = [{ id: "write", prefix: "/api/users", methods: ["POST", "PUT"] }];
assertEquals(solution({ path: "/api/users", method: "PUT" }, routes), "write");
assertEquals(solution({ path: "/api/users", method: "GET" }, routes), null);`,
      },
      {
        name: "a trailing slash in the prefix is not significant",
        body: `var routes = [{ id: "users", prefix: "/api/users/", methods: ["*"] }];
assertEquals(solution({ path: "/api/users", method: "GET" }, routes), "users");
assertEquals(solution({ path: "/api/usersearch", method: "GET" }, routes), null);`,
      },
      {
        name: "an empty route table matches nothing",
        body: `assertEquals(solution({ path: "/api/users", method: "GET" }, []), null);`,
      },
      {
        name: "equal-length prefixes fall to the earlier route",
        body: `var routes = [
  { id: "first", prefix: "/api/x", methods: ["*"] },
  { id: "second", prefix: "/api/x", methods: ["*"] },
];
assertEquals(solution({ path: "/api/x/y", method: "GET" }, routes), "first");`,
      },
      {
        name: "matches against a large route table",
        body: `var routes = [{ id: "root", prefix: "/", methods: ["*"] }];
for (var i = 0; i < 5000; i++) {
  routes.push({ id: "svc" + i, prefix: "/svc" + i, methods: ["*"] });
}
assertEquals(solution({ path: "/svc4999/health", method: "GET" }, routes), "svc4999");
assertEquals(solution({ path: "/svc4999x", method: "GET" }, routes), "root");`,
      },
    ],
    hints: [
      "Write the match test on its own first: prefix '/' is always true, otherwise path === prefix or path starts with prefix + '/'.",
      "Normalise the prefix before comparing — strip one trailing slash, but leave the bare '/' alone since it is the catch-all.",
      "Track the best match as you scan rather than sorting, and only replace it when the new prefix is strictly longer, so equal lengths keep the earlier route.",
    ],
    reference: `function route(req, routes) {
  let bestId = null;
  let bestLen = -1;

  for (const r of routes) {
    // "/api/users/" and "/api/users" are the same route.
    let prefix = r.prefix;
    if (prefix.length > 1 && prefix.charAt(prefix.length - 1) === "/") {
      prefix = prefix.slice(0, -1);
    }

    // Segment boundary, not raw startsWith. This one condition is the
    // difference between routing /api/usersearch correctly and shipping an
    // incident.
    const pathMatches =
      prefix === "/" || req.path === prefix || req.path.startsWith(prefix + "/");
    if (!pathMatches) continue;

    // A route that matches the path but not the method does not shadow the
    // shorter routes behind it.
    if (!r.methods.includes("*") && !r.methods.includes(req.method)) continue;

    // The catch-all has length 0 so any real prefix outranks it.
    const len = prefix === "/" ? 0 : prefix.length;
    if (len > bestLen) {
      bestLen = len;
      bestId = r.id;
    }
  }

  return bestId;
}
`,
  },
};
