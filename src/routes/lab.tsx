import { useMemo, useState } from "react";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { ArrowLeft, Beaker, CheckCircle2, Clock, Gauge } from "lucide-react";
import { LAB_CATEGORIES, labSummaries, type LabCategory } from "@/content/labs";
import { useKnowledge } from "@/lib/useKnowledge";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "Lab — Interactive System Design Demos · Jainil Chauhan" },
      {
        name: "description",
        content:
          "Interactive demos covering distributed systems, data structures, algorithms, and security — Bloom filters, Raft consensus, LRU cache, B-tree indexes, load balancing, circuit breakers, CRDTs, OAuth/OIDC, and more.",
      },
      { property: "og:title", content: "Lab — Interactive System Design Demos" },
      {
        property: "og:description",
        content:
          "Playable, in-depth demos for system design, DSA, distributed systems, and security.",
      },
    ],
  }),
  component: LabIndex,
});

const DIFF_COLOR: Record<string, string> = {
  Beginner: "border-terminal/40 text-terminal",
  Intermediate: "border-border text-muted-foreground",
  Advanced: "border-border text-muted-foreground",
};

function LabIndex() {
  const { pathname } = useLocation();
  const { isPlaced, placedCount, hydrated, reset } = useKnowledge();
  const [filter, setFilter] = useState<LabCategory | "All">("All");

  const grouped = useMemo(() => {
    const list =
      filter === "All" ? labSummaries : labSummaries.filter((l) => l.category === filter);
    if (filter !== "All") return [{ category: filter, labs: list }];
    return LAB_CATEGORIES.map((cat) => ({
      category: cat,
      labs: list.filter((l) => l.category === cat),
    })).filter((g) => g.labs.length > 0);
  }, [filter]);

  if (pathname !== "/lab") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-terminal"
        >
          <ArrowLeft className="size-3" />
          Back to portfolio
        </Link>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <Beaker className="size-6 text-terminal" />
            <h1 className="text-3xl font-semibold tracking-tight">Lab</h1>
          </div>
          {/*
           * Counts up, never toward a total. "12 / 93" is a wall of things you
           * have not done on the first page anyone lands on — the exact FOMO
           * this product exists to remove.
           */}
          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            {placedCount > 0 && (
              <span>
                <span className="text-terminal">{placedCount}</span>{" "}
                {placedCount === 1 ? "lab" : "labs"} under your belt
              </span>
            )}
            {placedCount > 0 && (
              <button
                onClick={reset}
                className="rounded border border-border px-2 py-0.5 hover:text-foreground"
              >
                reset
              </button>
            )}
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          {labSummaries.length} interactive demos of the system design, DSA, security, and
          distributed-systems concepts I work with daily. Each lab is a 2–6 minute play with concept
          explainer, reference implementation, production usage at named companies, pitfalls, and
          references.
        </p>

        {/* Category filter */}
        <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-muted-foreground">Filter:</span>
          {(["All", ...LAB_CATEGORIES] as const).map((cat) => {
            const active = filter === cat;
            const count =
              cat === "All"
                ? labSummaries.length
                : labSummaries.filter((l) => l.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full border px-3 py-1 transition-colors ${
                  active
                    ? "border-terminal bg-terminal/10 text-terminal"
                    : "border-border text-muted-foreground hover:border-terminal/40 hover:text-foreground"
                }`}
              >
                {cat} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-10">
          {grouped.map((group) => (
            <section key={group.category}>
              {filter === "All" && (
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {group.category}
                </h2>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.labs.map((lab) => {
                  const done = hydrated && isPlaced(lab.slug);
                  return (
                    <Link
                      key={lab.slug}
                      to="/lab/$slug"
                      params={{ slug: lab.slug }}
                      className={`group relative flex flex-col rounded-lg border p-5 transition-all ${
                        done
                          ? "border-terminal/40 bg-terminal/5 hover:border-terminal/70"
                          : "border-border bg-card/60 hover:border-terminal/50 hover:glow-terminal"
                      }`}
                    >
                      {done && (
                        <CheckCircle2
                          className="absolute right-3 top-3 size-4 text-terminal"
                          aria-label="completed"
                        />
                      )}
                      <p className="font-mono text-xs uppercase tracking-wider text-cyan-accent">
                        {lab.category}
                      </p>
                      <h3 className="mt-2 font-mono text-lg font-semibold text-foreground group-hover:text-terminal">
                        {lab.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">{lab.blurb}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span
                          className={`rounded border px-1.5 py-0.5 ${DIFF_COLOR[lab.difficulty]}`}
                        >
                          <Gauge className="mr-1 inline size-3" />
                          {lab.difficulty}
                        </span>
                        <span className="rounded border border-border px-1.5 py-0.5 text-muted-foreground">
                          <Clock className="mr-1 inline size-3" />~{lab.readingTimeMin}min
                        </span>
                        <span className="ml-auto text-terminal/80 group-hover:text-terminal">
                          {done ? "Replay →" : "Try it →"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
