import { SectionHeading } from "./SectionHeading";
import { Link } from "@tanstack/react-router";
import { getLabsForSkill } from "@/lib/labRegistry";

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
        {groups.map((g) => {
          // Surface "▸ try it" chips for skill items that map to a lab demo.
          const labChips = g.items.flatMap((item) =>
            getLabsForSkill(item).map((lab) => ({ skill: item, lab })),
          );
          // Dedupe by lab slug.
          const seen = new Set<string>();
          const uniqueChips = labChips.filter((c) =>
            seen.has(c.lab.slug) ? false : (seen.add(c.lab.slug), true),
          );
          return (
            <div
              key={g.title}
              className="group rounded-lg border border-border bg-card/60 p-5 transition-colors hover:border-terminal/50"
            >
              <p className="font-mono text-xs uppercase tracking-wider text-cyan-accent">
                {g.title}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <li
                    key={item}
                    className="rounded border border-border bg-secondary/50 px-2 py-1 font-mono text-xs text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              {uniqueChips.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
                  {uniqueChips.map(({ lab }) => (
                    <Link
                      key={lab.slug}
                      to="/lab/$slug"
                      params={{ slug: lab.slug }}
                      className="rounded border border-terminal/30 bg-terminal/5 px-2 py-0.5 font-mono text-[10px] text-terminal hover:bg-terminal/15"
                    >
                      Try {lab.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}