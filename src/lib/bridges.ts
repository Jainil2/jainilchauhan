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
 * Phase 4's "next three" ranks on this; keeping it here means both surfaces
 * read the same graph.
 */
export function prerequisitesOf(slug: string): string[] {
  return bridgeEdges.filter((e) => e.to === slug).map((e) => e.from);
}
