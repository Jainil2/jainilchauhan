import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { Wrench, BookOpen, Sparkles } from "lucide-react";

const items = [
  {
    icon: Wrench,
    label: "building",
    body: "Auth + tenancy primitives at Tech Holding — short-lived tokens, scoped sessions, and audit-grade logging.",
  },
  {
    icon: BookOpen,
    label: "reading",
    body: "Designing Data-Intensive Applications (re-read) and Tigerbeetle's docs on deterministic state machines.",
  },
  {
    icon: Sparkles,
    label: "learning",
    body: "Rust for systems work, and going deeper on OpenTelemetry tracing across distributed services.",
  },
];

export function Now() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading id="now" prompt="Current focus" title="Now" />
      <p className="mb-8 max-w-2xl text-muted-foreground">
        A snapshot of what I&apos;m focused on this season — updated when life changes, in the
        spirit of{" "}
        <a
          href="https://nownownow.com/about"
          target="_blank"
          rel="noreferrer"
          className="text-terminal hover:underline"
        >
          /now pages
        </a>
        .
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.label} delay={i * 0.08}>
              <article className="h-full rounded-lg border border-border bg-card/60 p-5 transition-colors hover:border-terminal/40">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-cyan-accent">
                  <Icon className="size-4 text-terminal" />
                  {item.label}
                </div>
                <p className="mt-3 leading-relaxed text-foreground">{item.body}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
