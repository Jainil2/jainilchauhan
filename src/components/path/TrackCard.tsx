import { ArrowRight, Check } from "lucide-react";
import type { TrackSummary } from "@/content/labs.gen";
import { cn } from "@/lib/utils";
import { useTrackProgress } from "./useTrackProgress";

/**
 * One track, compact, for a list of them.
 *
 * Deliberately renders no navigation of its own — the route that lists tracks
 * does not exist in this file's world, so the caller wraps it:
 *
 *   <Link to="/path/$slug" params={{ slug: track.slug }}><TrackCard track={track} /></Link>
 *
 * The count here is within one track and only ever forward-looking: "step 4 of
 * 13" is a position on a route, which is the opposite of "12 of 108 labs" —
 * a backlog rendered as a debt (Product Rule 1). Nothing on this card counts
 * the catalogue.
 *
 * Placement is localStorage, so the server renders the neutral state (no ticks,
 * "13 steps · start at X") and the effect in useKnowledge swaps in the personal
 * one. `hydrated` gates every part that would otherwise differ.
 */
export function TrackCard({ track, className }: { track: TrackSummary; className?: string }) {
  const { steps, total, doneCount, currentIndex, hydrated } = useTrackProgress(track);

  const started = hydrated && doneCount > 0;
  const finished = hydrated && currentIndex === -1;
  const next = currentIndex >= 0 ? steps[currentIndex] : undefined;

  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/25 sm:p-5",
        className,
      )}
    >
      <h3 className="font-display text-base leading-snug font-semibold tracking-tight">
        {track.title}
        <ArrowRight className="ml-1.5 inline size-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
      </h3>

      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{track.blurb}</p>

      {/* A rail of one tick per step. It is a map of the route, not a bar
          against a catalogue — it has a fixed, small, nameable length. */}
      <div className="mt-4 flex items-center gap-[3px]" aria-hidden="true">
        {steps.map((step) => (
          <span
            key={step.slug}
            className={cn(
              "h-1 flex-1 rounded-full",
              step.done
                ? "bg-foreground"
                : step.index === currentIndex && started
                  ? "bg-foreground/40"
                  : "bg-secondary",
            )}
          />
        ))}
      </div>

      <p className="mt-2.5 font-code text-xs tracking-wide text-muted-foreground">
        {finished ? (
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <Check className="size-3.5" />
            All {total} steps done
          </span>
        ) : started ? (
          <>
            <span className="text-foreground">
              Step {currentIndex + 1} of {total}
            </span>
            {next?.lab && <> · next: {next.lab.title}</>}
          </>
        ) : (
          <>
            <span className="text-foreground">{total} steps</span>
            {next?.lab && <> · starts at {next.lab.title}</>}
          </>
        )}
      </p>
    </article>
  );
}
