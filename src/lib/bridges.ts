import { bridgeEdges, labSummaries, type BridgeEdge, type LabSummary } from "@/content/labs.gen";

export type { BridgeEdge };

/** A bridge as read from the newer lab: "you already know <from>". */
export interface IncomingBridge {
  from: string;
  sameness: string;
  delta: string;
  source?: LabSummary;
}

/** A bridge as read from the prerequisite: "this unlocks <to>". */
export interface OutgoingBridge {
  to: string;
  sameness: string;
  target?: LabSummary;
}

const summaryBySlug = new Map(labSummaries.map((l) => [l.slug, l]));

/**
 * Bridges into a lab — what it is a small delta from.
 *
 * Order is preserved from the lab file, because the author chose it: the first
 * source is the one the reframe leans hardest on.
 */
export function bridgesInto(slug: string): IncomingBridge[] {
  return bridgeEdges
    .filter((e) => e.to === slug)
    .map((e) => ({
      from: e.from,
      sameness: e.sameness,
      delta: e.delta,
      source: summaryBySlug.get(e.from),
    }));
}

/**
 * Bridges out of a lab — what knowing it unlocks.
 *
 * Derived by inverting the same edges rather than authored per lab. Hand-written
 * reverse lists across 93 labs would desync the first time a bridge changed.
 */
export function bridgesOutOf(slug: string): OutgoingBridge[] {
  return bridgeEdges
    .filter((e) => e.from === slug)
    .map((e) => ({
      to: e.to,
      sameness: e.sameness,
      target: summaryBySlug.get(e.to),
    }));
}

/**
 * Every prerequisite slug a lab depends on, directly.
 *
 * The "next three" ranks on this; keeping it here means both surfaces read the
 * same graph.
 */
export function prerequisitesOf(slug: string): string[] {
  return bridgeEdges.filter((e) => e.to === slug).map((e) => e.from);
}

/** One candidate for "what should I do next". */
export interface NextStep {
  lab: LabSummary;
  /** Prerequisites not yet placed, in the order the author wrote them. */
  unmet: LabSummary[];
  /**
   * Why this is a short step: the sameness line of a bridge whose source the
   * visitor has actually placed. Empty when none is — the card then falls back
   * to the blurb rather than telling someone they already built something they
   * have not.
   */
  reason: string;
}

/** Never more than this, anywhere. Product Rule 1. */
export const MAX_NEXT_STEPS = 3;

/** Distinct targets in the order they first appear in the edge list. */
function bridgeTargets(): string[] {
  const seen = new Set<string>();
  for (const e of bridgeEdges) seen.add(e.to);
  return [...seen];
}

/**
 * The next things worth doing, given what the visitor has proven or declared.
 *
 * Ranked by how much is still in the way — nothing first, then one thing —
 * so a fully unlocked lab always outranks a nearly unlocked one. Ties break on
 * reading time and then slug, which keeps the result identical between the
 * server render and the client's, and lets a test assert an exact order.
 *
 * Capped here as well as in the component. A cap that lives in one place is a
 * convention; in two it survives the next caller.
 */
export function nextSteps(placed: Set<string>, limit: number = MAX_NEXT_STEPS): NextStep[] {
  const candidates: NextStep[] = [];

  for (const slug of bridgeTargets()) {
    // Already placed: it is not a next step, it is a done one.
    if (placed.has(slug)) continue;
    const lab = summaryBySlug.get(slug);
    if (!lab) continue;

    const incoming = bridgesInto(slug);
    const unmet = incoming
      .filter((b) => !placed.has(b.from))
      .map((b) => summaryBySlug.get(b.from))
      .filter((l): l is LabSummary => Boolean(l));

    // The reframe has to come from a lab they have actually done. Taking the
    // first bridge regardless would tell someone a lab "IS the thing you
    // implemented" while the card below it says that thing is still to do.
    const met = incoming.find((b) => placed.has(b.from));
    candidates.push({ lab, unmet, reason: met?.sameness ?? "" });
  }

  return candidates
    .sort(
      (a, b) =>
        a.unmet.length - b.unmet.length ||
        a.lab.readingTimeMin - b.lab.readingTimeMin ||
        a.lab.slug.localeCompare(b.lab.slug),
    )
    .slice(0, Math.max(0, limit));
}

/**
 * Where to start when nothing has been placed yet.
 *
 * Prerequisites the visitor has not done, ranked by how much each one opens up.
 * Framed as an opening rather than a gap: with an empty placement there is
 * nothing to be "next" from, and listing what is missing is the wall this
 * product exists to remove.
 */
export function startingPoints(placed: Set<string>, limit: number = MAX_NEXT_STEPS): LabSummary[] {
  const unlockCount = new Map<string, number>();
  for (const edge of bridgeEdges) {
    if (placed.has(edge.from)) continue;
    unlockCount.set(edge.from, (unlockCount.get(edge.from) ?? 0) + 1);
  }

  return [...unlockCount.entries()]
    .map(([slug, unlocks]) => ({ lab: summaryBySlug.get(slug), unlocks }))
    .filter((x): x is { lab: LabSummary; unlocks: number } => Boolean(x.lab))
    .sort(
      (a, b) =>
        b.unlocks - a.unlocks ||
        a.lab.readingTimeMin - b.lab.readingTimeMin ||
        a.lab.slug.localeCompare(b.lab.slug),
    )
    .slice(0, Math.max(0, limit))
    .map((x) => x.lab);
}
