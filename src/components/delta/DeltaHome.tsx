import { Link } from "@tanstack/react-router";
import { ArrowRight, Beaker } from "lucide-react";
import { labSummaries, LAB_CATEGORIES } from "@/content/labs";
import { useLabProgress } from "@/lib/useLabProgress";

/**
 * Platform landing page.
 *
 * Product rule: this page never shows a catalogue-wide progress bar or a count
 * of everything you have not done. The bridge map ("here are your next three")
 * lands in Phase 4 and takes the slot below the fold; until then this page
 * states the promise and routes into the labs, and claims nothing that does not
 * exist yet.
 */
export function DeltaHome() {
  const { completed, hydrated } = useLabProgress();
  const started = hydrated && completed.size > 0;

  const counts = LAB_CATEGORIES.map((category) => ({
    category,
    count: labSummaries.filter((l) => l.category === category).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="font-display text-lg font-semibold tracking-tight">Delta</span>
          <Link to="/lab" className="text-sm text-muted-foreground hover:text-foreground">
            Labs
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <section className="py-20 sm:py-28">
          <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            You already know most of this.
          </h1>
          <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>
              An LLM&rsquo;s KV-cache is an LRU cache. Continuous batching is a queue and a
              scheduler. Retrieval is an index and a nearest-neighbour search.
            </p>
            <p>
              The gap between the systems you build and the AI systems everyone is talking about is
              smaller than it looks. Delta shows you each new idea as a small change to one you
              already understand &mdash; then hands you a failing test so you can prove you have it.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/lab"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {started ? "Keep going" : "Start with what you know"}
              <ArrowRight className="size-4" />
            </Link>
            <span className="text-sm text-muted-foreground">
              {labSummaries.length} interactive labs. No sign-up, nothing locked.
            </span>
          </div>
        </section>

        <section className="border-t border-border py-16">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            What&rsquo;s here
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {counts.map(({ category, count }) => (
              <Link
                key={category}
                to="/lab"
                className="group flex items-center justify-between rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/25"
              >
                <span className="flex items-center gap-2.5 font-medium">
                  <Beaker className="size-4 text-muted-foreground" />
                  {category}
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-5xl px-4 text-sm text-muted-foreground sm:px-6">
          Built by{" "}
          <a
            href="https://jainilchauhan.com"
            className="text-foreground underline underline-offset-4 hover:opacity-80"
          >
            Jainil Chauhan
          </a>
          .
        </div>
      </footer>
    </div>
  );
}
