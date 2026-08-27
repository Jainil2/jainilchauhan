import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { isPlatform } from "@/lib/site";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";

/* ─── Static writing data ──────────────────────────────────────────────────── */
// Scaffold — swap for a real loader (Supabase, MDX, etc.) in a future phase.
const writingData: Record<
  string,
  {
    title: string;
    summary: string;
    date: string;
    readingTime: string;
    tags: string[];
    content: { heading?: string; body: string }[];
  }
> = {
  "oauth-oidc-deep-dive": {
    title: "OAuth 2.0 & OIDC — A Deep Dive for Backend Engineers",
    summary:
      "Most engineers use OAuth daily without truly understanding it. Here's the mental model that changes how you think about auth.",
    date: "2025-03-12",
    readingTime: "12 min",
    tags: ["Auth", "OAuth2", "OIDC", "Backend"],
    content: [
      {
        heading: "Why most OAuth explanations fail",
        body: "They focus on the protocol dance — authorization codes, redirect URIs, token endpoints — without explaining the trust model underneath. OAuth is fundamentally a delegation protocol, not an authentication protocol.",
      },
      {
        heading: "The mental model",
        body: "Think of OAuth like a valet key. You give the valet a key that only opens the car door and starts the engine — not your house, not your mailbox. The access token is that valet key: scoped, time-limited, and revocable.",
      },
      {
        heading: "Where OIDC fits in",
        body: "OAuth 2.0 tells you *what* a user can do. OpenID Connect tells you *who* the user is. OIDC is a thin identity layer on top of OAuth — it adds the ID token (a JWT) that carries verified claims about the user.",
      },
    ],
  },
  "k6-load-testing-patterns": {
    title: "Production Load Testing Patterns with k6",
    summary:
      "How to write k6 scripts that actually model production traffic — not just hammer an endpoint and hope for the best.",
    date: "2025-01-28",
    readingTime: "8 min",
    tags: ["Performance", "k6", "Load Testing", "Backend"],
    content: [
      {
        heading: "The problem with naive load tests",
        body: "Sending 1,000 concurrent requests to GET /health tells you nothing useful. Real production traffic has think time, session state, realistic data distributions, and mixed workloads.",
      },
      {
        heading: "Model traffic, not load",
        body: "Use k6 scenarios to represent distinct user journeys — login flow, data fetch, write operations — each with realistic pacing (sleep() between steps). Add ramping-vus executors to simulate gradual traffic growth.",
      },
      {
        heading: "What 3,600 RPS taught me",
        body: "At scale, the bottlenecks are almost never where you think. Connection pool exhaustion, DNS TTL issues, and Redis pipeline contention showed up long before CPU did.",
      },
    ],
  },
};

/* ─── Route ─────────────────────────────────────────────────────────────────── */

export const Route = createFileRoute("/writing/$slug")({
  // Portfolio-only — see the note in projects.$slug.tsx.
  beforeLoad: () => {
    if (isPlatform) throw notFound();
  },
  head: ({ params }) => {
    const post = writingData[params.slug];
    return {
      meta: post
        ? [
            { title: `${post.title} — Jainil Chauhan` },
            { name: "description", content: post.summary },
            { property: "og:title", content: post.title },
            { property: "og:description", content: post.summary },
            { property: "article:published_time", content: post.date },
          ]
        : [{ title: "Post Not Found — Jainil Chauhan" }],
    };
  },
  component: WritingDetail,
});

function WritingDetail() {
  const { slug } = Route.useParams();
  const post = writingData[slug];

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background font-mono text-foreground">
        <p className="text-4xl font-bold text-terminal">404</p>
        <p className="text-muted-foreground">
          post not found: <span className="text-terminal">/{slug}</span>
        </p>
        <Link
          to="/"
          className="mt-4 flex items-center gap-2 rounded border border-terminal/40 bg-terminal/10 px-4 py-2 text-terminal transition-all hover:glow-terminal"
        >
          <ArrowLeft className="size-4" /> back to portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav strip */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-terminal"
          >
            <ArrowLeft className="size-4" /> cd ..
          </Link>
          <span className="font-mono text-xs text-border">/</span>
          <span className="font-mono text-xs text-muted-foreground">writing/{slug}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-cyan-accent">
            // {post.date}
          </p>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <Clock className="size-3" /> {post.readingTime} read
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-3 font-mono text-3xl font-bold text-foreground sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{post.summary}</p>

        {/* Tags */}
        <ul className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <li
              key={t}
              className="rounded border border-border bg-secondary/50 px-2 py-1 font-mono text-xs text-cyan-accent"
            >
              #{t}
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="my-10 border-t border-border" />

        {/* Article body */}
        <article className="space-y-8 prose-invert">
          {post.content.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="mb-3 font-mono text-lg font-semibold text-terminal">
                  {section.heading}
                </h2>
              )}
              <p className="leading-7 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </article>

        {/* Footer CTA */}
        <div className="mt-16 flex flex-wrap gap-4 border-t border-border pt-8">
          <Link
            to="/"
            className="flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-terminal"
          >
            <ArrowLeft className="size-4" /> back to writing
          </Link>
          <a
            href="https://github.com/jainil-chauhan"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-terminal"
          >
            <ExternalLink className="size-4" /> view on GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
