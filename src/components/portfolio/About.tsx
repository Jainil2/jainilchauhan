import { SectionHeading } from "./SectionHeading";

export function About() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading id="about" prompt="Introduction" title="About" />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-5 text-pretty leading-relaxed text-muted-foreground lg:col-span-2 lg:text-lg">
          <p>
            I&apos;m a software engineer who likes the parts of the stack most people
            scroll past — the queues, the auth flows, the slow query that&apos;s
            quietly costing thousands a month. My favourite outcomes are the
            invisible ones: pages that load before you notice, logins that just work,
            bills that go down.
          </p>
          <p>
            Today I work at <span className="text-foreground">Tech Holding</span>{" "}
            on distributed backend systems and cloud platforms — shipping enterprise
            OAuth 2.0 / OIDC for tens of thousands of users, cutting GraphQL
            latency by ~40%, and building tooling that helps teams understand
            what their AWS footprint is actually doing.
          </p>
          <p>
            I care about{" "}
            <span className="text-terminal">measurable performance</span>,{" "}
            <span className="text-terminal">secure-by-default architecture</span>,
            and writing code other engineers can pick up without a tour. Currently
            looking for backend / platform / distributed-systems roles where the
            hard problems are the interesting ones.
          </p>
        </div>

        <aside className="rounded-lg border border-border bg-card p-5 text-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Currently
          </p>
          <ul className="mt-3 space-y-3">
            <li>
              <span className="text-terminal">role</span>:{" "}
              <span className="text-foreground">SWE @ Tech Holding</span>
            </li>
            <li>
              <span className="text-terminal">focus</span>:{" "}
              <span className="text-foreground">backend · auth · cloud</span>
            </li>
            <li>
              <span className="text-terminal">stack</span>:{" "}
              <span className="text-foreground">Node · Python · AWS</span>
            </li>
            <li>
              <span className="text-terminal">learning</span>:{" "}
              <span className="text-foreground">large-scale system design</span>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}