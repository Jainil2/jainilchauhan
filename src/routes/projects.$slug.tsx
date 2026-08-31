import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { absoluteUrl, isPlatform } from "@/lib/site";
import { ArrowLeft, ExternalLink } from "lucide-react";

/* ─── Static project data ──────────────────────────────────────────────────── */
// In a future iteration this would come from a loader + Supabase/MDX.
const projectData: Record<
  string,
  {
    title: string;
    summary: string;
    stack: string[];
    problem: string;
    approach: string[];
    outcome: string[];
  }
> = {
  "ngo-platform": {
    title: "Distributed NGO Volunteer Management Platform",
    summary:
      "Real-time coordination platform that scales to thousands of concurrent volunteers without breaking a sweat.",
    stack: ["React", "Node.js", "MongoDB", "Redis", "S3", "Docker"],
    problem:
      "NGOs were coordinating thousands of volunteers across spreadsheets and group chats — assignments got lost, real-time status was impossible, and the platform had to stay up during high-stakes events.",
    approach: [
      "Stateless Node.js services behind a load balancer for horizontal scale.",
      "Redis pub/sub + WebSockets to broadcast assignment changes in real time.",
      "MongoDB sharded by region; S3 for file uploads with signed URLs.",
      "Containerized deploys (Docker) with health checks and graceful shutdown.",
    ],
    outcome: [
      "Sustained 10K+ concurrent volunteers with sub-200ms p95 response times.",
      "Cut coordination overhead for organisers by an estimated 60%.",
      "85% test coverage across services — confident weekly deploys.",
    ],
  },
  "healthcare-records": {
    title: "Healthcare Records Management System",
    summary:
      "Serverless, accessible-first platform for managing patient records with strong auth and audit trails.",
    stack: ["TypeScript", "Next.js", "PostgreSQL", "JWT", "AWS Lambda", "Docker"],
    problem:
      "Clinics were running record-keeping on always-on VMs that idled most of the day, with weak auth and no audit trail — expensive and risky.",
    approach: [
      "Next.js on AWS Lambda for pay-per-request scaling and zero idle cost.",
      "PostgreSQL with row-level security; JWT auth with short-lived tokens.",
      "Append-only audit log table for every read/write on patient data.",
      "Accessibility-first UI: semantic landmarks, keyboard nav, AA contrast.",
    ],
    outcome: [
      "60% reduction in monthly infra spend vs the previous VM setup.",
      "Lighthouse 98+ on performance, SEO, best-practices and 100 on a11y.",
      "Full audit trail satisfied compliance review on first pass.",
    ],
  },
  "cloud-cost-optimizer": {
    title: "Cloud Cost Optimization Platform",
    summary:
      "Anomaly detection, rightsizing recommendations, and security posture monitoring across multi-account AWS setups.",
    stack: ["Python", "AWS SDK", "PostgreSQL", "Redis", "React", "Grafana"],
    problem:
      "Engineering teams had no visibility into runaway AWS spend, misconfigured resources, or drifting security posture across accounts.",
    approach: [
      "AWS Cost Explorer + CloudWatch integration for spend signal collection.",
      "Z-score anomaly detection to flag spend spikes within minutes.",
      "Rightsizing engine comparing actual utilization vs provisioned capacity.",
      "CIS Benchmark checks mapped to live resource configs.",
    ],
    outcome: [
      "15–30% average monthly savings identified per account audited.",
      "Security findings surfaced before quarterly review cycles.",
      "Teams adopted a cost-aware engineering culture with weekly digests.",
    ],
  },
};

/* ─── Route ─────────────────────────────────────────────────────────────────── */

export const Route = createFileRoute("/projects/$slug")({
  // Portfolio-only. The route tree is shared by both Workers, so without this
  // the platform domain would serve Jainil's project pages — duplicate content
  // Google would have to pick a winner for, on the wrong product.
  beforeLoad: () => {
    if (isPlatform) throw notFound();
  },
  head: ({ params }) => {
    const p = projectData[params.slug];
    const url = p ? absoluteUrl(`/projects/${params.slug}`) : undefined;
    return {
      meta: p
        ? [
            { title: `${p.title} — Jainil Chauhan` },
            { name: "description", content: p.summary },
            { property: "og:title", content: p.title },
            { property: "og:description", content: p.summary },
            ...(url ? [{ property: "og:url", content: url }] : []),
          ]
        : [{ title: "Project Not Found — Jainil Chauhan" }],
      links: url ? [{ rel: "canonical", href: url }] : [],
    };
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const p = projectData[slug];

  if (!p) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background font-mono text-foreground">
        <p className="text-terminal text-4xl font-bold">404</p>
        <p className="text-muted-foreground">
          project not found: <span className="text-terminal">/{slug}</span>
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
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-terminal"
          >
            <ArrowLeft className="size-4" /> cd ..
          </Link>
          <span className="font-mono text-xs text-border">/</span>
          <span className="font-mono text-xs text-muted-foreground">projects/{slug}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {/* Hero */}
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-accent">
          // case-study
        </p>
        <h1 className="mt-2 font-mono text-3xl font-bold text-foreground sm:text-4xl">{p.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{p.summary}</p>

        {/* Stack */}
        <ul className="mt-6 flex flex-wrap gap-2">
          {p.stack.map((s) => (
            <li
              key={s}
              className="rounded border border-border bg-secondary/50 px-2 py-1 font-mono text-xs text-cyan-accent"
            >
              {s}
            </li>
          ))}
        </ul>

        <div className="mt-12 space-y-10">
          {/* Problem */}
          <section aria-labelledby="problem-heading">
            <h2
              id="problem-heading"
              className="mb-3 font-mono text-xs uppercase tracking-widest text-terminal"
            >
              // the problem
            </h2>
            <p className="leading-relaxed text-muted-foreground">{p.problem}</p>
          </section>

          {/* Approach */}
          <section aria-labelledby="approach-heading">
            <h2
              id="approach-heading"
              className="mb-3 font-mono text-xs uppercase tracking-widest text-terminal"
            >
              // approach
            </h2>
            <ul className="space-y-3">
              {p.approach.map((a, i) => (
                <li key={i} className="flex gap-3 text-muted-foreground">
                  <span className="mt-1 font-mono text-terminal">▹</span>
                  <span className="leading-relaxed">{a}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Outcome */}
          <section aria-labelledby="outcome-heading">
            <h2
              id="outcome-heading"
              className="mb-3 font-mono text-xs uppercase tracking-widest text-terminal"
            >
              // outcome
            </h2>
            <ul className="space-y-3">
              {p.outcome.map((o, i) => (
                <li key={i} className="flex gap-3 text-foreground">
                  <span className="font-mono text-terminal">✓</span>
                  <span className="leading-relaxed">{o}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 flex flex-wrap gap-4 border-t border-border pt-8">
          <Link
            to="/"
            className="flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-terminal"
          >
            <ArrowLeft className="size-4" /> back to all projects
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
