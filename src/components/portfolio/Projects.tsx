import { useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConsistentHashRing } from "@/components/system-design/ConsistentHashRing";
import { useSimulationStore } from "@/lib/useSimulationStore";

type Project = {
  id: string;
  title: string;
  summary: string;
  metrics: string[];
  stack: string[];
  problem: string;
  approach: string[];
  outcome: string[];
};

const projects: Project[] = [
  {
    id: "ngo-platform",
    title: "Distributed NGO Volunteer Management Platform",
    summary:
      "Real-time coordination platform that scales to thousands of concurrent volunteers without breaking a sweat.",
    metrics: ["10K+ concurrent users", "Sub-200ms response times", "85% test coverage"],
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
  {
    id: "healthcare-records",
    title: "Healthcare Records Management System",
    summary:
      "Serverless, accessible-first platform for managing patient records with strong auth and audit trails.",
    metrics: [
      "60% lower infra cost via serverless",
      "Lighthouse 98+ across the board",
      "100% accessibility score",
    ],
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
  {
    id: "cloud-cost-optimizer",
    title: "Cloud Cost Optimization Platform",
    summary:
      "Anomaly detection, rightsizing recommendations, and security posture monitoring across multi-account AWS setups.",
    metrics: [
      "Multi-account AWS monitoring",
      "Real-time anomaly alerts",
      "Security posture scoring",
    ],
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
];

export function Projects() {
  const [active, setActive] = useState<Project | null>(null);
  const { simulationsEnabled } = useSimulationStore();

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading id="projects" prompt="Selected work" title="Projects" />

      <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
        {/* Project cards */}
        <div className="grid gap-6 sm:grid-cols-1">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <button
                type="button"
                onClick={() => setActive(p)}
                aria-label={`Open details for ${p.title}`}
                className="group flex h-full w-full flex-col rounded-lg border border-border bg-card/60 p-6 text-left transition-all hover:-translate-y-0.5 hover:border-terminal/50 hover:shadow-lg hover:shadow-terminal/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-terminal"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-mono text-lg font-semibold text-foreground transition-colors group-hover:text-terminal">
                    {p.title}
                  </h3>
                  <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-terminal" />
                </div>

                <p className="mt-3 leading-relaxed text-muted-foreground">{p.summary}</p>

                <ul className="mt-4 space-y-1.5 font-mono text-sm">
                  {p.metrics.map((m) => (
                    <li key={m} className="flex items-center gap-2 text-foreground">
                      <span className="text-terminal">▹</span> {m}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5">
                  <ul className="flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <li
                        key={s}
                        className="rounded border border-border bg-secondary/50 px-2 py-1 font-mono text-xs text-cyan-accent"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 font-mono text-xs text-muted-foreground group-hover:text-terminal">
                    Read case study →
                  </p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        {/* Consistent Hash Ring sidebar */}
        {simulationsEnabled && (
          <Reveal delay={0.2}>
            <aside className="sticky top-24 rounded-lg border border-border bg-card/60 p-4">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-cyan-accent">
                // load balancer · consistent hashing
              </p>
              <ConsistentHashRing projects={projects.map((p) => ({ id: p.id, title: p.title }))} />
            </aside>
          </Reveal>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card sm:max-w-2xl">
          {active && (
            <>
              <DialogHeader>
                <p className="font-mono text-xs uppercase tracking-wider text-cyan-accent">
                  // case-study
                </p>
                <DialogTitle className="font-mono text-xl text-foreground">
                  {active.title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {active.summary}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 space-y-6">
                <Block label="problem">
                  <p className="leading-relaxed text-muted-foreground">{active.problem}</p>
                </Block>

                <Block label="approach">
                  <ul className="space-y-2 font-mono text-sm">
                    {active.approach.map((a) => (
                      <li key={a} className="flex gap-2 text-foreground">
                        <span className="text-terminal">▹</span>
                        <span className="font-sans text-muted-foreground">{a}</span>
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block label="outcome">
                  <ul className="space-y-2 font-mono text-sm">
                    {active.outcome.map((o) => (
                      <li key={o} className="flex gap-2 text-foreground">
                        <span className="text-terminal">✓</span>
                        <span className="font-sans">{o}</span>
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block label="stack">
                  <ul className="flex flex-wrap gap-2">
                    {active.stack.map((s) => (
                      <li
                        key={s}
                        className="rounded border border-border bg-secondary/50 px-2 py-1 font-mono text-xs text-cyan-accent"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </Block>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase tracking-wider text-terminal">// {label}</p>
      {children}
    </div>
  );
}
