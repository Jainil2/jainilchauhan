import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { bridgesOutOf } from "@/lib/bridges";
import { useKnowledge } from "@/lib/useKnowledge";

/**
 * "What this unlocks" — the reverse view, shown on a prerequisite lab.
 *
 * Entirely derived by inverting the same edges the BridgeCard reads, so nothing
 * is authored twice and the two directions cannot disagree.
 *
 * Deliberately does not show a count or a progress bar. This is a pull forward,
 * not a tally of what is left (Product Rule 1).
 */
export function UnlocksCard({ slug }: { slug: string }) {
  const unlocks = bridgesOutOf(slug);
  const { knowledge, hydrated } = useKnowledge();

  if (unlocks.length === 0) return null;

  return (
    <section className="mt-8 rounded-lg border border-border p-5" aria-labelledby="unlocks-heading">
      <h2 id="unlocks-heading" className="text-sm font-semibold tracking-tight">
        What this unlocks
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Once this makes sense, these are a short step away.
      </p>

      <ul className="mt-4 space-y-3">
        {unlocks.map((unlock) => {
          const done =
            hydrated && (knowledge.solved.has(unlock.to) || knowledge.known.has(unlock.to));
          return (
            <li key={unlock.to}>
              <Link
                to="/lab/$slug"
                params={{ slug: unlock.to }}
                className="group flex items-start gap-2.5 rounded-md border border-border bg-card p-3.5 transition-colors hover:border-foreground/25"
              >
                <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="text-sm font-semibold">{unlock.target?.title ?? unlock.to}</span>
                  {done && <span className="ml-2 text-xs text-muted-foreground">already done</span>}
                  {/* The same sameness line, read from the other end: this is
                      why the next lab is a short step rather than a new topic. */}
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {unlock.sameness}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
