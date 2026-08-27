import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "cors-lab",
  title: "CORS",
  category: "Security",
  difficulty: "Beginner",
  readingTimeMin: 4,
  blurb: "Origins and Preflights.",
  caption:
    "Demystify the most common web error. Simulate requests between different domains, watch the browser trigger 'Preflight' OPTIONS requests, and learn how to configure your headers to safely share resources.",
  skillTags: ["Security", "Web Development", "Backend"],
  concept:
    "Cross-Origin Resource Sharing (CORS) is a browser security mechanism that allows or restricts a web page from making requests to a domain different from the one that served it.\n\nBy default, browsers follow the **Same-Origin Policy**. If `app.com` tries to fetch from `api.com`, the browser blocks it unless `api.com` explicitly sends an `Access-Control-Allow-Origin` header.\n\nFor 'non-simple' requests (like those with JSON bodies or custom headers), the browser first sends a **Preflight** request (OPTIONS method) to ask the server for permission before sending the actual data.",
  realWorld: [
    "Frontend apps talking to a separate API server.",
    "Loading fonts or scripts from a CDN.",
    "Embedding third-party widgets or maps.",
  ],
  pitfalls: [
    "Access-Control-Allow-Origin: *: While easy, this allows ANY site to read your API data. Never use this for authenticated endpoints.",
    "Misconfigured Credential Support: If you allow credentials (cookies), you cannot use the wildcard `*`.",
    "Opaque Errors: Browsers don't always explain why a CORS request failed for security reasons; check the Network tab carefully.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// CORS is a browser policy, not server security. It relaxes the same-origin rule.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin); // echo, never "*" with credentials
    res.setHeader("Vary", "Origin");                      // or caches will poison responses
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "content-type,authorization");
    res.setHeader("Access-Control-Max-Age", "600");       // cache the preflight
    return res.status(204).end();
  }
  next();
});`,
  },
  usedBy: [
    {
      company: "Stripe",
      product: "Stripe.js / browser SDKs",
      usage:
        "Public-key browser calls are explicitly CORS-enabled while secret-key endpoints are server-only by design.",
      href: "https://docs.stripe.com/api",
    },
    {
      company: "Amazon",
      product: "S3 bucket CORS configuration",
      usage:
        "Direct browser uploads require an explicit CORS policy per bucket listing origins, methods and exposed headers.",
      href: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html",
    },
    {
      company: "Mozilla",
      product: "Fetch / browser enforcement",
      usage:
        "The browser (not the server) blocks the response; preflights and credential rules are specified in the Fetch standard.",
      href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS",
    },
    {
      company: "Cloudflare",
      product: "Workers & CDN header handling",
      usage:
        "Edge middleware injects CORS headers and must Vary on Origin so one origin's response isn't served to another.",
      href: "https://developers.cloudflare.com/workers/examples/cors-header-proxy/",
    },
  ],
  references: [
    {
      label: "MDN — Cross-Origin Resource Sharing (CORS)",
      href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS",
    },
    {
      label: "Fetch standard — CORS protocol",
      href: "https://fetch.spec.whatwg.org/#http-cors-protocol",
    },
  ],
};
