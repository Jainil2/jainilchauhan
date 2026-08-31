import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { MAX_NEXT_STEPS, bridgesOutOf, nextSteps, startingPoints } from "@/lib/bridges";
import { useKnowledge } from "@/lib/useKnowledge";

/**
 * The bridge map: what to do next, three items, never more.
 *
 * Ranked by what is still in the way — fully unlocked first, then one step
 * away — so the list stays useful partway through rather than going empty.
 * A card names at most one thing to do first; it never renders a count of what
 * is missing, a fraction, or a bar against the catalogue. That wall is what
 * this product exists to invert (Product Rule 1).
 *
 * Placement lives in localStorage, so the server renders the zero-placement
 * state and the effect inside useKnowledge swaps in the personal one. Both
 * renders agree because the empty state is deterministic, and a crawler still
 * gets a real list of links.
 */
export function NextThree() {
  const { knowledge } = useKnowledge();

  const placed = useMemo(
    () => new Set([...knowledge.solved, ...knowledge.known]),
    [knowledge.solved, knowledge.known],
  );

  const steps = useMemo(() => nextSteps(placed), [placed]);
  const starts = useMemo(() => startingPoints(placed), [placed]);

  // Everything bridged is done. Say nothing rather than inventing filler.
  if (placed.size > 0 && steps.length === 0) return null;

  const personal = placed.size > 0;

  return (
    <section
      className="mt-8 rounded-lg border border-border bg-card/40 p-5"
      aria-labelledby="next-heading"
    >
      <h2
        id="next-heading"
        className="flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <Sparkles className="size-4 text-muted-foreground" />
        {personal ? "Your next three" : "Start here"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {personal
          ? "Built on what you have already done. Three, so it stays a decision rather than a backlog."
          : "Each of these is the thing an AI lab later turns out to already be. Do one and the map opens up."}
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {personal
          ? steps.slice(0, MAX_NEXT_STEPS).map((step) => {
              const blocker = step.unmet[0];
              return (
                <li
                  key={step.lab.slug}
                  className="flex flex-col rounded-md border border-border bg-card p-3.5"
                >
                  <Link
                    to="/lab/$slug"
                    params={{ slug: step.lab.slug }}
                    className="group text-sm font-semibold hover:text-muted-foreground"
                  >
                    {step.lab.title}
                    <ArrowRight className="ml-1 inline size-3.5 opacity-60" />
                  </Link>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {step.reason || step.lab.blurb}
                  </p>
                  {/* One name, never a list. This is the next action, not a
                      tally of what the visitor is missing. */}
                  {blocker && (
                    <p className="mt-2.5 border-t border-border pt-2.5 text-xs text-muted-foreground">
                      One step away — start with{" "}
                      <Link
                        to="/lab/$slug"
                        params={{ slug: blocker.slug }}
                        className="text-foreground underline underline-offset-2"
                      >
                        {blocker.title}
                      </Link>
                      .
                    </p>
                  )}
                </li>
              );
            })
          : starts.slice(0, MAX_NEXT_STEPS).map((lab) => {
              // Named, not counted: "unlocks KV Cache" is an invitation,
              // "3 of 15" is a scoreboard.
              const opens = bridgesOutOf(lab.slug)
                .map((u) => u.target?.title)
                .filter(Boolean)
                .slice(0, 2);
              return (
                <li
                  key={lab.slug}
                  className="flex flex-col rounded-md border border-border bg-card p-3.5"
                >
                  <Link
                    to="/lab/$slug"
                    params={{ slug: lab.slug }}
                    className="text-sm font-semibold hover:text-muted-foreground"
                  >
                    {lab.title}
                    <ArrowRight className="ml-1 inline size-3.5 opacity-60" />
                  </Link>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {lab.blurb}
                  </p>
                  {opens.length > 0 && (
                    <p className="mt-2.5 border-t border-border pt-2.5 text-xs text-muted-foreground">
                      Opens up {opens.join(" and ")}.
                    </p>
                  )}
                </li>
              );
            })}
      </ul>
    </section>
  );
}
