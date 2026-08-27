import { MapPin, Github, Linkedin, Mail, Beaker } from "lucide-react";
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";

function useDaysSince(iso: string) {
  return useMemo(() => {
    const start = new Date(iso).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - start) / 86_400_000));
  }, [iso]);
}

export function Hero() {
  const days = useDaysSince("2025-01-15");

  return (
    <section id="top" className="relative mx-auto max-w-6xl px-4 pt-32 pb-20 sm:px-6">
      <div className="grid items-start gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Software Engineer · Backend &amp; Distributed Systems
          </p>

          <h1 className="mt-4 text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-6xl">
            Jainil Chauhan
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-[1.0625rem] leading-[1.7] text-muted-foreground">
            I build{" "}
            <span className="text-foreground">
              low-latency, high-trust systems that scale quietly
            </span>{" "}
            — backend services, secure authentication platforms, and cloud infrastructure that stays
            calm under load.
          </p>

          <div
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground"
            title="Days since I joined Tech Holding"
          >
            <span className="size-1.5 rounded-full bg-foreground" />
            <span>
              <span className="text-foreground">{days.toLocaleString()} days</span> at Tech Holding
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              View projects
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Get in touch
            </a>
            <Link
              to="/lab"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Beaker className="size-4" />
              Interactive lab
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            This site is interactive — press{" "}
            <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs text-foreground">
              ⌘K
            </kbd>{" "}
            to search or{" "}
            <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs text-foreground">
              ⌘J
            </kbd>{" "}
            for the terminal.
          </p>
        </div>

        <aside className="rounded-xl border border-border bg-card p-6 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:mt-2">
          <p className="border-b border-border pb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            At a glance
          </p>

          <ul className="mt-4 space-y-3 text-muted-foreground">
            <li className="flex items-center gap-3">
              <MapPin className="size-4 text-foreground" />
              <span>Nadiad, India</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex size-4 items-center justify-center">
                <span className="inline-flex size-2 rounded-full bg-foreground" />
              </span>
              <span>
                <span className="text-foreground">Available</span> for new roles
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="size-4 text-foreground" />
              <a href="mailto:jainil.chauhan@example.com" className="hover:text-foreground">
                jainil.chauhan@example.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Linkedin className="size-4 text-foreground" />
              <a
                href="https://www.linkedin.com/in/jainil-chauhan"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                linkedin.com/in/jainil-chauhan
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Github className="size-4 text-foreground" />
              <a
                href="https://github.com/jainil-chauhan"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                github.com/jainil-chauhan
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
