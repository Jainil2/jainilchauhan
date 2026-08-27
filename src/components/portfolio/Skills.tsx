import { SectionHeading } from "./SectionHeading";

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div
            key={g.title}
            className="group rounded-lg border border-border bg-card/60 p-5 transition-colors hover:border-foreground/20"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {g.title}
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {g.items.map((item) => (
                <li
                  key={item}
                  className="rounded border border-border bg-secondary/50 px-2.5 py-1 text-sm text-foreground"
                >
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