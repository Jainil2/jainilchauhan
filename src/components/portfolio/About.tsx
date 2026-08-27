import { SectionHeading } from "./SectionHeading";

export function About() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading id="about" prompt="Introduction" title="About" />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-5 text-pretty leading-relaxed text-muted-foreground lg:col-span-2 lg:text-[1.0625rem]">
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
            <span className="font-medium text-foreground">measurable performance</span>,{" "}
            <span className="font-medium text-foreground">secure-by-default architecture</span>,
            and writing code other engineers can pick up without a tour. Currently
            looking for backend / platform / distributed-systems roles where the
            hard problems are the interesting ones.
          </p>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-5 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="border-b border-border pb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Currently
          </p>
          <dl className="mt-4 space-y-3.5">
            {[
              { k: "Role", v: "SWE @ Tech Holding" },
              { k: "Focus", v: "Backend · Auth · Cloud" },
              { k: "Stack", v: "Node · Python · AWS" },
              { k: "Learning", v: "Large-scale system design" },
            ].map((row) => (
              <div key={row.k} className="flex items-baseline justify-between gap-4">
                <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {row.k}
                </dt>
                <dd className="text-right text-[0.8125rem] font-medium text-foreground">
                  {row.v}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}