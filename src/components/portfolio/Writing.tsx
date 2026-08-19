import { SectionHeading } from "./SectionHeading";
import { FileText } from "lucide-react";

const drafts = [
  {
    title: "Cutting GraphQL latency by 40%",
    excerpt:
      "What we changed in our resolver layer, batching strategy, and cache keys — and what we'd do differently next time.",
    tag: "Performance",
  },
  {
    title: "Self-hosting Ory Hydra at 50K users",
    excerpt:
      "A field guide to deploying Ory Hydra in production: SSO, scopes, key rotation, and the gotchas we hit at scale.",
    tag: "Security",
  },
  {
    title: "Reading your AWS bill like a detective",
    excerpt:
      "Anomaly detection, rightsizing, and the unglamorous savings hiding in CloudWatch metrics most teams never look at.",
    tag: "Cloud",
  },
];

export function Writing() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading id="writing" prompt="Writing" title="Notes & articles" />

      <p className="-mt-4 mb-8 max-w-2xl text-muted-foreground">
        Long-form notes on backend engineering, distributed systems, and the
        unglamorous details that keep production boring. Coming soon.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {drafts.map((d) => (
          <article
            key={d.title}
            className="group flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <FileText className="size-4 text-muted-foreground" />
              <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {d.tag}
              </span>
            </div>
            <h3 className="mt-5 text-base font-semibold text-foreground">{d.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {d.excerpt}
            </p>
            <p className="mt-auto pt-6 text-xs font-medium text-muted-foreground">
              Draft — coming soon
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
