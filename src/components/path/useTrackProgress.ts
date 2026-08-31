import { useMemo } from "react";
import { labSummaries, type LabSummary, type TrackSummary } from "@/content/labs.gen";
import { bridgesInto } from "@/lib/bridges";
import { useKnowledge } from "@/lib/useKnowledge";

const summaryBySlug = new Map(labSummaries.map((l) => [l.slug, l]));

/** A track step, resolved against the catalogue. */
export interface TrackStep {
  slug: string;
  /** 0-based. The UI renders `index + 1`. */
  index: number;
  lab?: LabSummary;
  done: boolean;
  /**
   * Why this step follows the ones before it, taken from the bridge whose
   * source appears EARLIER in this same track. Empty when no such bridge
   * exists — a track never invents a reason it cannot back up.
   */
  reason: string;
  /** The earlier step the reason is borrowed from. */
  reasonFrom?: LabSummary;
}

export interface TrackProgress {
  steps: TrackStep[];
  total: number;
  /** How many steps are placed. Within one track only — never a catalogue tally. */
  doneCount: number;
  /** First step not yet placed, or -1 when the whole route is behind you. */
  currentIndex: number;
  /** False on the server and the first client render. Gate anything personal. */
  hydrated: boolean;
}

/**
 * Where the visitor is inside one track.
 *
 * Placement lives in localStorage, so this returns the zero-placement state on
 * the server and swaps in the personal one after `useKnowledge` hydrates. Both
 * renders agree because the empty state is deterministic; callers gate the
 * personal bits on `hydrated` rather than branching the markup.
 */
export function useTrackProgress(track: TrackSummary): TrackProgress {
  const { isPlaced, hydrated } = useKnowledge();

  return useMemo(() => {
    const position = new Map(track.steps.map((slug, i) => [slug, i]));

    const steps: TrackStep[] = track.steps.map((slug, index) => {
      // Prefer a bridge whose source the reader has already passed on this
      // route. Falling straight to the first bridge would tell someone a lab
      // "IS the thing you built" pointing at a step still ahead of them.
      const incoming = bridgesInto(slug);
      const earlier = incoming.find((b) => {
        const at = position.get(b.from);
        return at !== undefined && at < index;
      });

      return {
        slug,
        index,
        lab: summaryBySlug.get(slug),
        done: hydrated && isPlaced(slug),
        reason: earlier ? firstSentence(earlier.sameness) : "",
        reasonFrom: earlier?.source,
      };
    });

    const doneCount = steps.filter((s) => s.done).length;
    const currentIndex = steps.findIndex((s) => !s.done);

    return { steps, total: steps.length, doneCount, currentIndex, hydrated };
  }, [track, isPlaced, hydrated]);
}

/**
 * The opening sentence, capped.
 *
 * Bridge prose is written as a paragraph for the lab page. In a list it has one
 * line to earn its place, and the first sentence is always the claim — the rest
 * is the argument for it.
 */
export function firstSentence(text: string, max = 140): string {
  const trimmed = text.trim();
  const match = /[.!?](\s|$)/.exec(trimmed);
  const sentence = match ? trimmed.slice(0, match.index + 1) : trimmed;
  if (sentence.length <= max) return sentence;
  return sentence.slice(0, max - 1).trimEnd() + "…";
}
