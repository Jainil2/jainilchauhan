import { describe, expect, it } from "vitest";
import { bridgeEdges, labSummaries } from "@/content/labs.gen";
import {
  MAX_NEXT_STEPS,
  bridgesInto,
  bridgesOutOf,
  nextSteps,
  prerequisitesOf,
  startingPoints,
} from "./bridges";

const slugs = new Set(labSummaries.map((l) => l.slug));

/**
 * The bridge graph is generated, so these guard the shape the UI relies on
 * rather than any hand-written data. A dangling edge would render a card
 * claiming "you already know" something that does not exist.
 */
describe("bridge graph integrity", () => {
  it("points every edge at labs that exist", () => {
    for (const edge of bridgeEdges) {
      expect(slugs.has(edge.from), `unknown source: ${edge.from}`).toBe(true);
      expect(slugs.has(edge.to), `unknown target: ${edge.to}`).toBe(true);
    }
  });

  it("has no self-bridges", () => {
    for (const edge of bridgeEdges) expect(edge.from).not.toBe(edge.to);
  });

  it("gives every edge both halves of the reframe", () => {
    // sameness without delta is a claim with no payoff; delta without sameness
    // is just novelty, which is what the product exists to avoid.
    for (const edge of bridgeEdges) {
      expect(edge.sameness.length, `${edge.to} <- ${edge.from}`).toBeGreaterThan(0);
      expect(edge.delta.length, `${edge.to} <- ${edge.from}`).toBeGreaterThan(0);
    }
  });

  it("contains no duplicate source for the same target", () => {
    const seen = new Set<string>();
    for (const edge of bridgeEdges) {
      const key = `${edge.to}<-${edge.from}`;
      expect(seen.has(key), `duplicate bridge ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it("has no cycles", () => {
    // AI labs may bridge from other AI labs, so a cycle is possible to author
    // and would make "what should I do next" unanswerable.
    const outgoing = new Map<string, string[]>();
    for (const e of bridgeEdges) {
      if (!outgoing.has(e.from)) outgoing.set(e.from, []);
      outgoing.get(e.from)!.push(e.to);
    }
    const state = new Map<string, number>(); // 1 = on path, 2 = done
    const walk = (node: string): boolean => {
      if (state.get(node) === 1) return true;
      if (state.get(node) === 2) return false;
      state.set(node, 1);
      for (const next of outgoing.get(node) ?? []) {
        if (walk(next)) return true;
      }
      state.set(node, 2);
      return false;
    };
    for (const node of outgoing.keys()) {
      expect(walk(node), `cycle through ${node}`).toBe(false);
    }
  });
});

describe("bridgesInto / bridgesOutOf", () => {
  it("returns nothing for a lab with no bridges", () => {
    expect(bridgesInto("definitely-not-a-lab")).toEqual([]);
    expect(bridgesOutOf("definitely-not-a-lab")).toEqual([]);
  });

  it("inverts exactly — every incoming edge appears as an outgoing one", () => {
    for (const edge of bridgeEdges) {
      const outgoing = bridgesOutOf(edge.from);
      expect(outgoing.some((o) => o.to === edge.to)).toBe(true);
      const incoming = bridgesInto(edge.to);
      expect(incoming.some((i) => i.from === edge.from)).toBe(true);
    }
  });

  it("resolves the summary of every endpoint it can", () => {
    for (const edge of bridgeEdges) {
      const incoming = bridgesInto(edge.to).find((i) => i.from === edge.from);
      expect(incoming?.source?.slug).toBe(edge.from);
    }
  });

  it("agrees with prerequisitesOf", () => {
    for (const edge of bridgeEdges) {
      expect(prerequisitesOf(edge.to)).toContain(edge.from);
    }
  });

  it("preserves the order the lab author chose", () => {
    // The first source is the one the reframe leans hardest on, so it must
    // render first.
    const byTarget = new Map<string, string[]>();
    for (const e of bridgeEdges) {
      if (!byTarget.has(e.to)) byTarget.set(e.to, []);
      byTarget.get(e.to)!.push(e.from);
    }
    for (const [target, expected] of byTarget) {
      expect(bridgesInto(target).map((b) => b.from)).toEqual(expected);
    }
  });
});

/**
 * The "next three" is the product, so these guard the two rules that make it
 * one: never more than three, and never a step the visitor has already taken.
 */
describe("nextSteps", () => {
  const anyTarget = bridgeEdges[0].to;
  const itsSources = prerequisitesOf(anyTarget);

  it("never returns more than three, whatever it is asked for", () => {
    expect(nextSteps(new Set()).length).toBeLessThanOrEqual(MAX_NEXT_STEPS);
    expect(nextSteps(new Set(), 99).length).toBeLessThanOrEqual(99);
    // The component caps too, but the default is the one the UI relies on.
    expect(MAX_NEXT_STEPS).toBe(3);
  });

  it("never suggests a lab that is already placed", () => {
    const placed = new Set(bridgeEdges.map((e) => e.to));
    expect(nextSteps(placed)).toEqual([]);
  });

  it("ranks a fully unlocked lab above a partly unlocked one", () => {
    const placed = new Set(itsSources);
    const [first] = nextSteps(placed);
    // Those same sources can fully unlock several labs at once, and the shorter
    // read wins the tie — so assert the rule (nothing in the way ranks first)
    // and that the target is somewhere in the ranking, not that it is first.
    expect(first.unmet).toEqual([]);
    expect(nextSteps(placed, 99).some((s) => s.lab.slug === anyTarget)).toBe(true);
  });

  it("reports exactly the prerequisites that are still missing", () => {
    const [firstSource, ...rest] = itsSources;
    const step = nextSteps(new Set([firstSource]), 99).find((s) => s.lab.slug === anyTarget);
    expect(step?.unmet.map((l) => l.slug)).toEqual(rest);
  });

  it("moves a lab from near-ready to ready when its last prerequisite is placed", () => {
    const before = nextSteps(new Set(itsSources.slice(1)), 99).find(
      (s) => s.lab.slug === anyTarget,
    );
    const after = nextSteps(new Set(itsSources), 99).find((s) => s.lab.slug === anyTarget);
    expect(before?.unmet.length).toBe(1);
    expect(after?.unmet.length).toBe(0);
  });

  it("takes its reframe from a lab the visitor has actually placed", () => {
    const placed = new Set(itsSources);
    const step = nextSteps(placed, 99).find((s) => s.lab.slug === anyTarget);
    expect(step?.reason).toBe(bridgesInto(anyTarget)[0].sameness);
  });

  it("gives no reframe when nothing it bridges from has been placed", () => {
    // Claiming "this IS the thing you already built" about a lab they have
    // not done is the one sentence this surface must never print.
    for (const step of nextSteps(new Set(), 99)) {
      expect(step.reason).toBe("");
    }
  });

  it("is deterministic, so the server and client renders agree", () => {
    const placed = new Set(itsSources);
    expect(nextSteps(placed).map((s) => s.lab.slug)).toEqual(
      nextSteps(placed).map((s) => s.lab.slug),
    );
  });

  it("returns nothing for a limit of zero", () => {
    expect(nextSteps(new Set(), 0)).toEqual([]);
  });
});

describe("startingPoints", () => {
  it("offers only prerequisites, never the AI labs they unlock", () => {
    const sources = new Set(bridgeEdges.map((e) => e.from));
    for (const lab of startingPoints(new Set(), 99)) {
      expect(sources.has(lab.slug), `${lab.slug} is not a bridge source`).toBe(true);
    }
  });

  it("never offers something already placed", () => {
    const placed = new Set(bridgeEdges.map((e) => e.from));
    expect(startingPoints(placed, 99)).toEqual([]);
  });

  it("puts the prerequisite that unlocks the most first", () => {
    const unlocks = new Map<string, number>();
    for (const e of bridgeEdges) unlocks.set(e.from, (unlocks.get(e.from) ?? 0) + 1);
    const [first] = startingPoints(new Set(), 99);
    const best = Math.max(...unlocks.values());
    expect(unlocks.get(first.slug)).toBe(best);
  });

  it("caps at three by default", () => {
    expect(startingPoints(new Set()).length).toBeLessThanOrEqual(MAX_NEXT_STEPS);
  });
});
