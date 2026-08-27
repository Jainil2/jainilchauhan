import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { bridgesInto } from "@/lib/bridges";
import { useKnowledge } from "@/lib/useKnowledge";

/**
 * "You already know this" — the reframe, rendered above everything else on the
 * page.
 *
 * Placement is the point. Read after the demo and the challenge, this is a
 * footnote; read first, it changes what the rest of the page feels like. Product
 * Rule 2: sameness before delta, always, so the familiarity lands before the
 * novelty does.
 *
 * Renders nothing when a lab declares no bridges, so it can be mounted
 * unconditionally on every lab page.
 */
export function BridgeCard({ slug }: { slug: string }) {
  const bridges = bridgesInto(slug);
  const { knowledge, hydrated } = useKnowledge();

  if (bridges.length === 0) return null;

  return (
    <section
      className="mt-6 rounded-lg border border-border bg-secondary/40 p-5"
      aria-labelledby="bridge-heading"
    >
      <h2
        id="bridge-heading"
        className="flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <Sparkles className="size-4 text-muted-foreground" />
        You already know this
      </h2>

      <ul className="mt-4 space-y-4">
        {bridges.map((bridge) => {
          // Only claim "you solved this" once localStorage has actually been
          // read, or the server HTML and the first client render disagree.
          const solved = hydrated && knowledge.solved.has(bridge.from);
          const known = hydrated && knowledge.known.has(bridge.from);
          const title = bridge.source?.title ?? bridge.from;

          return (
            <li key={bridge.from} className="border-l-2 border-border pl-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/lab/$slug"
                  params={{ slug: bridge.from }}
                  className="text-sm font-semibold underline underline-offset-4 hover:opacity-80"
                >
                  {title}
                </Link>
                {solved && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-foreground/30 px-2 py-0.5 text-xs font-medium">
                    <Check className="size-3" /> you solved this
                  </span>
                )}
                {!solved && known && (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    you know this
                  </span>
                )}
              </div>

              {/* sameness first, always — that ordering is the product */}
              <p className="mt-1.5 text-sm leading-relaxed">{bridge.sameness}</p>
              <p className="mt-1.5 flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <ArrowRight className="mt-1 size-3.5 shrink-0" />
                <span>
                  <span className="font-semibold text-foreground">New: </span>
                  {bridge.delta}
                </span>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
