import { useMemo, useState } from "react";
import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Gauge } from "lucide-react";
import { LAB_CATEGORIES, labSummaries, type LabCategory } from "@/content/labs";
import { NextThree } from "@/components/bridge/NextThree";
import { TrackCard } from "@/components/path/TrackCard";
import { trackSummaries } from "@/content/labs.gen";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { categoryAnchor } from "@/components/platform/categories";
import { SITE_NAME, absoluteUrl, isPlatform, isPortfolio, migratedLabUrl } from "@/lib/site";
import { useKnowledge } from "@/lib/useKnowledge";

export const Route = createFileRoute("/lab")({
  // See lab.$slug.tsx — inert until the platform domain exists.
  beforeLoad: () => {
    const moved = migratedLabUrl("/lab");
    if (moved) throw redirect({ href: moved, statusCode: 301 });
  },
  head: ({ match, matches }) => ({
    // This route is both the /lab page and the layout wrapping /lab/$slug, so
    // an unconditional canonical here gives every lab page two of them — and
    // two canonicals is worse than none, the crawler just picks one.
    links:
      matches[matches.length - 1]?.id === match.id && absoluteUrl("/lab")
        ? [{ rel: "canonical", href: absoluteUrl("/lab")! }]
        : [],
    meta: [
      { title: `Lab — Interactive System Design Demos · ${SITE_NAME}` },
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

/** How many of your own labs the "what you have done" strip names before it
 *  stops. A cap, not a total — the rest are counted, never listed as missing. */
const RECENT_LIMIT = 8;

/**
 * What you have done — counting up only.
 *
 * Product Rule 1: no fraction, no bar, no "12 of 108", and nothing framed as
 * what is left. This renders names of things you finished and a count of them,
 * or nothing at all before you have finished any.
 *
 * localStorage-backed, so it renders as absent on the server and appears in the
 * effect. `hydrated` is what keeps the SSR HTML and the first client render in
 * agreement.
 */
function WhatYouHaveDone() {
  const { knowledge, hydrated, placedCount, reset } = useKnowledge();

  const placed = useMemo(() => {
    const slugs = new Set([...knowledge.solved, ...knowledge.known]);
    return labSummaries.filter((l) => slugs.has(l.slug)).reverse();
  }, [knowledge.solved, knowledge.known]);

  if (!hydrated || placed.length === 0) return null;

  const shown = placed.slice(0, RECENT_LIMIT);
  const rest = placed.length - shown.length;
  const proven = knowledge.solved.size;

  return (
    <section
      className="mt-8 rounded-lg border border-border bg-card/40 p-5"
      aria-labelledby="done-heading"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="done-heading" className="text-sm font-semibold tracking-tight">
          What you have done
        </h2>
        <button
          type="button"
          onClick={reset}
          className="rounded border border-border px-2 py-0.5 font-code text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          reset
        </button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{placedCount}</span>{" "}
        {placedCount === 1 ? "lab" : "labs"} under your belt
        {proven > 0 && (
          <>
            , <span className="font-semibold text-foreground">{proven}</span> of them proven against
            the tests
          </>
        )}
        .
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {shown.map((lab) => (
          <li key={lab.slug}>
            <Link
              to="/lab/$slug"
              params={{ slug: lab.slug }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground transition-colors hover:border-foreground/25"
            >
              <CheckCircle2 className="size-3.5 text-muted-foreground" aria-hidden />
              {lab.title}
            </Link>
          </li>
        ))}
        {rest > 0 && (
          <li className="self-center font-code text-xs text-muted-foreground">and {rest} more</li>
        )}
      </ul>
    </section>
  );
}

function LabIndex() {
  const { pathname } = useLocation();
  const { isPlaced, hydrated } = useKnowledge();
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

  // This route is also the layout for /lab/$slug, which is what gives the
  // platform its header on every lab page without touching the detail route.
  if (pathname !== "/lab") {
    return (
      <>
        {isPlatform && <PlatformHeader />}
        <Outlet />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isPlatform && <PlatformHeader />}

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Portfolio-only: on the platform this is the wrong product's name,
            and the header above already owns going home. */}
        {isPortfolio && (
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-code text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3" aria-hidden />
            Back to portfolio
          </Link>
        )}

        <div className={isPortfolio ? "mt-8" : ""}>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Lab</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Interactive demos of the system design, DSA, security, and AI-systems concepts worth
            knowing. Each one is a 2–6 minute play with a concept explainer, a reference
            implementation, the companies running it in production, and the pitfalls.
          </p>
        </div>

        {/*
         * Tracks and "what next", in that order on a wide screen: a track
         * answers the whole route, which is what turns a visit into a habit.
         *
         * On a phone the order flips. Five stacked track cards run about
         * 1400px, which pushed the answer to "what should I do right now" a
         * full screen and a half below the fold — so on small viewports the
         * three next steps come first and the routes sit under them. Wide
         * screens show tracks in one row, where no such burial happens.
         */}
        <div className="flex flex-col">
          <section className="order-2 mt-10 sm:order-1" aria-labelledby="tracks-heading">
            <h2
              id="tracks-heading"
              className="font-display text-xl font-semibold tracking-tight sm:text-2xl"
            >
              Guided tracks
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Ordered routes, each one built so no step is a cold start. Start anywhere.
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trackSummaries.map((track) => (
                <li key={track.slug}>
                  <Link
                    to="/path/$slug"
                    params={{ slug: track.slug }}
                    className="block h-full rounded-lg transition-colors hover:border-foreground/25"
                  >
                    <TrackCard track={track} className="h-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="order-1 sm:order-2">
            <NextThree />
          </div>
        </div>

        {/*
         * Then what you have already done, then — and only then — the
         * catalogue. The grid used to be the first thing on the page, which
         * made 108 cards of things you have not done the answer to "where do
         * I start".
         */}
        <WhatYouHaveDone />

        <section className="mt-16 border-t border-border pt-10" aria-labelledby="browse-heading">
          <h2
            id="browse-heading"
            className="font-display text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Browse everything
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            All {labSummaries.length} labs, by category. Nothing is locked.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 font-code text-xs">
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
                  type="button"
                  onClick={() => setFilter(cat)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1 transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                  }`}
                >
                  {cat} <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 space-y-10">
            {grouped.map((group) => (
              <section
                key={group.category}
                id={categoryAnchor(group.category)}
                className="scroll-mt-24"
              >
                {/* Always rendered, so the category anchors always have a
                    target and the cards never have to repeat their category. */}
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {group.category}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.labs.map((lab) => (
                    <LabCard key={lab.slug} lab={lab} done={hydrated && isPlaced(lab.slug)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * One catalogue card.
 *
 * `done` is passed in rather than read here: one `useKnowledge` for the page
 * instead of 108 localStorage reads on mount. It is false on the server and on
 * the first client render, which is what keeps the two in agreement — the grid
 * itself is plain anchors, so a crawler gets every link either way.
 */
function LabCard({ lab, done }: { lab: (typeof labSummaries)[number]; done: boolean }) {
  return (
    <Link
      to="/lab/$slug"
      params={{ slug: lab.slug }}
      className={`group relative flex flex-col rounded-lg border p-5 transition-colors ${
        done
          ? "border-foreground/40 bg-card"
          : "border-border bg-card/60 hover:border-foreground/25"
      }`}
    >
      {done && (
        <CheckCircle2
          className="absolute right-3 top-3 size-4 text-muted-foreground"
          aria-label="done"
        />
      )}
      <h4 className="pr-6 font-display text-lg font-semibold tracking-tight text-foreground">
        {lab.title}
      </h4>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{lab.blurb}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 font-code text-xs">
        <span className="rounded border border-border px-1.5 py-0.5 text-muted-foreground">
          <Gauge className="mr-1 inline size-3" aria-hidden />
          {lab.difficulty}
        </span>
        <span className="rounded border border-border px-1.5 py-0.5 text-muted-foreground">
          <Clock className="mr-1 inline size-3" aria-hidden />~{lab.readingTimeMin}min
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-foreground">
          {done ? "Replay" : "Try it"}
          <ArrowRight className="size-3" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
