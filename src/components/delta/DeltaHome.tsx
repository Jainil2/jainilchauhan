import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Play } from "lucide-react";
import { labSummaries, LAB_CATEGORIES } from "@/content/labs";
import { NextThree } from "@/components/bridge/NextThree";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { categoryAnchor } from "@/components/platform/categories";
import { bridgesInto } from "@/lib/bridges";
import { BRAND } from "@/lib/site";
import { useKnowledge } from "@/lib/useKnowledge";

/**
 * The specimens the hero cycles through.
 *
 * Only the two slugs are written here — the sentence comes from the bridge
 * graph. The landing page therefore cannot claim a reframe the lab does not
 * actually make, and editing a lab's bridge updates the pitch.
 */
const SPECIMENS = [
  { to: "kv-cache", from: "lru-cache" },
  { to: "semantic-cache", from: "consistent-hashing" },
  { to: "agent-loop", from: "topological-sort" },
] as const;

function specimenAt(index: number) {
  const { to, from } = SPECIMENS[index];
  const bridge = bridgesInto(to).find((b) => b.from === from);
  const target = labSummaries.find((l) => l.slug === to);
  return bridge && target ? { bridge, target } : null;
}

/**
 * The hero's proof: one real bridge, cycled.
 *
 * This is the whole product in one card, so it is the page's signature rather
 * than an illustration of it. The first specimen renders without interaction,
 * which is what a crawler and a reader who never clicks both get.
 */
function BridgeSpecimen() {
  const [index, setIndex] = useState(0);
  const current = specimenAt(index);
  if (!current) return null;

  const { bridge, target } = current;
  const source = bridge.source;

  return (
    <figure className="mt-10 rounded-lg border border-border bg-card p-6 sm:p-8">
      {/* The product's grammar: two identifiers and an arrow. Set in the code
          face because these are things you have built, not topics you read. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-code text-sm">
        <span className="rounded-md border border-border px-2.5 py-1">
          {source?.title ?? bridge.from}
        </span>
        <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
        <span className="rounded-md border border-foreground bg-foreground px-2.5 py-1 text-background">
          {target.title}
        </span>
      </div>

      <blockquote className="mt-5 font-display text-xl leading-snug tracking-tight sm:text-2xl">
        {bridge.sameness}
      </blockquote>

      <figcaption className="mt-4 flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
        <ArrowRight className="mt-1 size-3.5 shrink-0" aria-hidden />
        <span>
          <span className="font-semibold text-foreground">What is new: </span>
          {bridge.delta}
        </span>
      </figcaption>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
        <div className="flex items-center gap-2">
          {SPECIMENS.map((specimen, i) => (
            <button
              key={specimen.to}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show the ${specimen.to.replace(/-/g, " ")} bridge`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all motion-reduce:transition-none ${
                i === index ? "w-8 bg-foreground" : "w-3 bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>
        <Link
          to="/lab/$slug"
          params={{ slug: target.slug }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4 hover:opacity-80"
        >
          Open {target.title}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </figure>
  );
}

/** The three steps, in the order they happen. The order is the argument. */
const STEPS = [
  {
    title: "Say what you already know",
    body: "One click on any lab, or solve its challenge. No quiz, no onboarding survey — the set of things you have proven is the whole profile.",
  },
  {
    title: "Meet the new thing as a delta",
    body: "Every AI lab opens with the lab it is a small change from, and why. The familiar half comes first, always, so the unfamiliar half has somewhere to land.",
  },
  {
    title: "Prove it against a failing test",
    body: "Write the implementation in the browser and run the real tests. Passing them is what marks it known — there is nothing else to mark it with.",
  },
] as const;

/**
 * Platform landing page.
 *
 * Two product rules bind here. Nothing shows a catalogue-wide progress bar or a
 * count of what is undone (Rule 1), and the bridge is demonstrated rather than
 * described (Rule 2) — an earlier version of this page asserted the promise in
 * prose and then showed category counts, which asked the reader to take the one
 * differentiating idea on faith.
 */
export function DeltaHome() {
  const { placedCount } = useKnowledge();
  const started = placedCount > 0;

  const aiCount = labSummaries.filter((l) => l.category === "AI Systems").length;
  const counts = LAB_CATEGORIES.map((category) => ({
    category,
    count: labSummaries.filter((l) => l.category === category).length,
  }))
    .filter((c) => c.count > 0)
    // AI Systems leads: it is what someone arrives for, even though it is the
    // smallest group.
    .sort((a, b) => (a.category === "AI Systems" ? -1 : b.category === "AI Systems" ? 1 : 0));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* The real shell: brand, nav, ⌘K search, mobile menu. This file only
          ever renders on the platform build, so no gate is needed here. */}
      <PlatformHeader />

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <section className="pt-16 sm:pt-24">
          {/* text-balance: without it "this." orphans onto its own line at
              desktop widths, which reads as a mistake at 60px. */}
          <h1 className="max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            You already know most of this.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            The distance between the systems you build and the AI systems everyone is talking about
            is shorter than it looks. {BRAND.name} shows each new idea as a small change to one you
            have already built, then hands you a failing test so you can prove it.
          </p>

          <BridgeSpecimen />

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/lab"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {started ? "Keep going" : "Start with what you know"}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <span className="text-sm text-muted-foreground">
              {labSummaries.length} interactive labs, {aiCount} of them on AI systems. No sign-up,
              nothing locked.
            </span>
          </div>
        </section>

        <section className="mt-20 border-t border-border pt-12" aria-labelledby="how-heading">
          <h2
            id="how-heading"
            className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground"
          >
            How it works
          </h2>
          {/* Ordered because the order is real: you cannot see a delta from
              something you have not placed, and you cannot claim it without
              passing the tests. */}
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t-2 border-foreground pt-4">
                <span className="font-code text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1.5 font-display text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16" aria-label="Where to start">
          <NextThree />
        </section>

        <section className="mt-16 border-t border-border pt-12" aria-labelledby="inside-heading">
          <h2
            id="inside-heading"
            className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground"
          >
            What is inside
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {counts.map(({ category, count }) => (
              <li key={category}>
                <Link
                  to="/lab"
                  hash={categoryAnchor(category)}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4 transition-colors hover:border-foreground/25"
                >
                  <span className="font-medium">{category}</span>
                  <span className="font-code text-sm tabular-nums text-muted-foreground">
                    {count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="size-4 shrink-0" aria-hidden />
            Every lab has a challenge you run in the browser.
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Play className="size-4 shrink-0" aria-hidden />
            Every AI lab opens with a lab you have already done.
          </p>
        </section>
      </main>

      <footer className="mt-20 border-t border-border py-10">
        <div className="mx-auto max-w-5xl px-4 text-sm text-muted-foreground sm:px-6">
          {/*
           * Credit with no outbound link. This used to point at
           * jainilchauhan.com, which is owned by a different person of the same
           * name — so the platform's footer was sending its visitors to a
           * stranger's site. Restore a link only when there is a domain this
           * project actually controls.
           */}
          Built by <span className="text-foreground">Jainil Chauhan</span>.
        </div>
      </footer>
    </div>
  );
}
