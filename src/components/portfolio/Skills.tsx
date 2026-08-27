import { SectionHeading } from "./SectionHeading";
import { BrandIcon } from "@/components/brand/BrandIcon";

const groups: { title: string; items: string[] }[] = [
  { title: "Languages", items: ["Python", "JavaScript", "TypeScript", "SQL"] },
  { title: "Backend & APIs", items: ["Node.js", "FastAPI", "Express", "GraphQL", "REST"] },
  { title: "Frontend", items: ["React", "Next.js"] },
  { title: "Data", items: ["MongoDB", "PostgreSQL", "Redis", "DynamoDB"] },
  {
    title: "Cloud & DevOps",
    items: ["AWS EC2", "Lambda", "S3", "CloudWatch", "Docker", "CI/CD", "Kubernetes"],
  },
  { title: "Security", items: ["OAuth 2.0", "OIDC", "JWT", "Ory Hydra", "Zero-Trust"] },
  {
    title: "Concepts",
    items: ["Distributed Systems", "Microservices", "System Design", "DSA"],
  },
];

export function Skills() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading id="skills" prompt="What I work with" title="Skills" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div
            key={g.title}
            className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-foreground/25"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {g.title}
              </p>
              <span className="text-[0.6875rem] tabular-nums text-muted-foreground/70">
                {g.items.length}
              </span>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {g.items.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 py-1 pl-1.5 pr-2.5 text-[0.8125rem] leading-5 text-foreground transition-colors hover:border-foreground/25 hover:bg-secondary"
                >
                  <BrandIcon name={item} size={14} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}