import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Flag } from "lucide-react";
import type { TrackSummary } from "@/content/labs.gen";
import { cn } from "@/lib/utils";
import { useTrackProgress } from "./useTrackProgress";

/**
 * One track, in full: the ordered route, with the reader's position in it.
 *
 * The whole point of the ordering is that no step is a cold start — where a
 * bridge exists from an EARLIER step on this same route, the step carries the
 * one line explaining why it is a small move rather than a new topic. That line
 * is the product, so it renders above the fold of each step rather than being
 * something you unfold.
 *
 * Counting rules: "step 4 of 13" is a position on a route the reader chose, and
 * that is allowed and useful. What is never rendered is progress against the
 * catalogue — no "12 of 108", no bar over everything undone (Product Rule 1).
 *
 * Hydration: placement is localStorage. The server renders the route with no
 * step marked done and the first step framed as "start here"; the effect inside
 * useKnowledge then swaps in the personal state. Everything that would differ
 * is gated on `hydrated`, so the first client render matches the server HTML
 * and a crawler still gets the full ordered list of links.
 */
export function TrackDetail({ track }: { track: TrackSummary }) {
  const { steps, total, doneCount, currentIndex, hydrated } = useTrackProgress(track);

  const started = hydrated && doneCount > 0;
  const finished = hydrated && currentIndex === -1;
  const current = currentIndex >= 0 ? steps[currentIndex] : undefined;

  return (
    <div>
      <header>
        <p className="font-code text-xs tracking-widest text-muted-foreground uppercase">Track</p>
        <h1 className="mt-2 font-display text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
          {track.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {track.blurb}
        </p>
      </header>

      {/* Where am I / what is next — one box, one action, at the top. */}
      <section
        className="mt-6 rounded-lg border border-border bg-card p-4 sm:p-5"
        aria-labelledby="track-position"
      >
        <h2 id="track-position" className="font-code text-xs tracking-wide text-muted-foreground">
          {finished ? (
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <Check className="size-3.5" /> All {total} steps done
            </span>
          ) : started ? (
            <>
              You are on{" "}
              <span className="text-foreground">
                step {currentIndex + 1} of {total}
              </span>
            </>
          ) : (
            <>
              <span className="text-foreground">{total} steps</span> · start at the top
            </>
          )}
        </h2>

        {current?.lab ? (
          <Link
            to="/lab/$slug"
            params={{ slug: current.slug }}
            className="group mt-2 inline-flex items-start gap-2 text-base font-semibold tracking-tight hover:text-muted-foreground"
          >
            {current.lab.title}
            <ArrowRight className="mt-1 size-4 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <p className="mt-2 text-base font-semibold tracking-tight">Nothing left on this route.</p>
        )}

        <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <Flag className="mt-0.5 size-3.5 shrink-0" />
          <span>{track.outcome}</span>
        </p>
      </section>

      <ol className="mt-8">
        {steps.map((step) => {
          const isCurrent = hydrated && step.index === currentIndex;
          const last = step.index === total - 1;

          return (
            <li key={step.slug} className="relative flex gap-3 sm:gap-4">
              {/* Rail: position marker plus the line joining it to the next
                  step. The route is the visual, so it stays visible on 390px. */}
              <div className="flex shrink-0 flex-col items-center">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border font-code text-xs tabular-nums",
                    step.done
                      ? "border-foreground bg-foreground text-background"
                      : isCurrent
                        ? "border-foreground text-foreground"
                        : "border-border bg-secondary text-muted-foreground",
                  )}
                >
                  {step.done ? <Check className="size-3.5" /> : step.index + 1}
                </span>
                {!last && <span className="w-px flex-1 bg-border" />}
              </div>

              <div className={cn("min-w-0 flex-1", last ? "pb-0" : "pb-6")}>
                <Link
                  to="/lab/$slug"
                  params={{ slug: step.slug }}
                  className="group inline-flex items-start gap-1.5 text-sm font-semibold tracking-tight hover:text-muted-foreground"
                >
                  <span className={cn(step.done && "text-muted-foreground")}>
                    {step.lab?.title ?? step.slug}
                  </span>
                  <ArrowRight className="mt-0.5 size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                </Link>

                {isCurrent && (
                  <span className="ml-2 align-middle font-code text-xs text-muted-foreground">
                    you are here
                  </span>
                )}

                {step.lab && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.lab.blurb}
                  </p>
                )}

                {/* The join. Only rendered when the bridge comes from a step
                    already behind the reader on this route, so it can never
                    claim they built something still ahead of them. */}
                {step.reason && (
                  <p className="mt-2 border-l border-border pl-3 text-xs leading-relaxed text-muted-foreground">
                    {step.reasonFrom && (
                      <span className="font-code text-foreground">{step.reasonFrom.title} → </span>
                    )}
                    {step.reason}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
