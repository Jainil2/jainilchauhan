import { SectionHeading } from "./SectionHeading";
import { GraduationCap, Trophy, Award, BookOpen } from "lucide-react";

const coursework = [
  "Distributed Systems",
  "Operating Systems",
  "DBMS",
  "Computer Networks",
  "Algorithms",
  "Software Engineering",
];

const achievements = [
  { icon: Trophy, label: "LeetCode 600+ solved (Top 7%)" },
  { icon: Trophy, label: "CodeChef 3-Star (1600+ rating)" },
  { icon: Award, label: "AWS Certified Cloud Practitioner (in progress)" },
  { icon: BookOpen, label: "Deep Learning Specialization — Coursera" },
  { icon: BookOpen, label: "System Design Fundamentals" },
];

export function Education() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading id="education" prompt="Education" title="Education & Achievements" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card/60 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-md border border-terminal/40 bg-terminal/10 p-2 text-terminal">
              <GraduationCap className="size-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-mono text-lg font-semibold text-foreground">
                B.Tech, Computer Engineering
              </h3>
              <p className="mt-1 text-sm text-cyan-accent">
                Dharmsinh Desai University · 2021 – 2025
              </p>
              <p className="mt-2 font-mono text-sm text-muted-foreground">
                GPA <span className="text-foreground">8.2 / 10</span>
              </p>

              <p className="mt-5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                // relevant coursework
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {coursework.map((c) => (
                  <li
                    key={c}
                    className="rounded border border-border bg-secondary/50 px-2 py-1 font-mono text-xs text-foreground"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card/60 p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-cyan-accent">
            Certifications &amp; Achievements
          </p>
          <ul className="mt-4 space-y-3">
            {achievements.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-terminal" />
                <span className="text-foreground">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
