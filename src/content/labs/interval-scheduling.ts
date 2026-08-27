import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "interval-scheduling",
  title: "Interval Scheduling",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Select the maximum number of non-overlapping intervals.",
  caption:
    "Pick intervals by earliest finish time. The local greedy choice leaves maximum room for future compatible intervals.",
  skillTags: ["DSA", "Greedy"],
  concept:
    "Interval scheduling asks for the largest set of non-overlapping intervals. The optimal greedy rule is to sort by finish time and repeatedly choose the first interval that starts after the last selected interval ends.\n\nThis works because the earliest-finishing compatible interval never leaves less room for future intervals than a later-finishing choice.",
  complexity: [{ operation: "Sort + select", time: "O(n log n)", space: "O(1) to O(n)" }],
  realWorld: [
    "Calendar booking, meeting room allocation, CPU job windows, and media ad slot planning.",
  ],
  pitfalls: [
    "Sorting by start time or shortest duration is not generally optimal.",
    "Weighted intervals need DP, not this greedy rule.",
    "Boundary rules for touching intervals must be defined.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Maximum non-overlapping intervals: sort by END time, then take greedily.
type Interval = { start: number; end: number; id: string };

export function schedule(intervals: Interval[]): Interval[] {
  const byEnd = [...intervals].sort((a, b) => a.end - b.end);
  const picked: Interval[] = [];
  let freeAt = -Infinity;
  for (const iv of byEnd) {
    if (iv.start >= freeAt) { picked.push(iv); freeAt = iv.end; }
  }
  return picked; // sorting by start or by duration is provably worse
}`,
  },
  usedBy: [
    {
      company: "Google",
      product: "Calendar room booking",
      usage:
        "Fitting the most meetings into a room, and detecting conflicts, is interval scheduling over booking requests.",
      href: "https://developers.google.com/workspace/calendar/api/guides/free-busy",
    },
    {
      company: "AWS",
      product: "EC2 / spot capacity reservation windows",
      usage:
        "Non-overlapping reservation windows are packed to maximise utilised capacity per host.",
    },
    {
      company: "Netflix",
      product: "Encoding job slotting",
      usage:
        "Transcoding tasks with fixed durations are packed onto workers by earliest-finish-first ordering.",
    },
  ],
  references: [
    {
      label: "Google Calendar API — free/busy and conflict detection",
      href: "https://developers.google.com/workspace/calendar/api/guides/free-busy",
    },
    {
      label: "Kleinberg & Tardos — interval scheduling (greedy stays ahead)",
      href: "https://www.cs.princeton.edu/~wayne/kleinberg-tardos/pdf/04GreedyAlgorithmsI.pdf",
    },
  ],
};
