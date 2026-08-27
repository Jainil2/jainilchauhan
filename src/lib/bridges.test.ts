import { describe, expect, it } from "vitest";
import { bridgeEdges, labSummaries } from "@/content/labs.gen";
import { bridgesInto, bridgesOutOf, prerequisitesOf } from "./bridges";

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
