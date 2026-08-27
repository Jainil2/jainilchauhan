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
  challenge: {
    prompt:
      "Find the fewest rooms needed to run every meeting. Unlike activity selection nothing is dropped here, so the answer is the largest number of meetings alive at any single moment — a sweep over start and end events.",
    entry: "minRooms",
    starter: `/**
 * @param {Array<[number, number]>} meetings - [start, end], end exclusive.
 * @returns {number} the fewest rooms that fit every meeting.
 */
function minRooms(meetings) {
  // The answer is the peak overlap. Sweep the timeline counting starts up and
  // ends down, and an end at time t must be processed before a start at t.
}
`,
    tests: [
      {
        name: "non-overlapping needs one room",
        body: `assertEquals(solution([[1, 2], [2, 3]]), 1);`,
      },
      {
        name: "two overlapping need two",
        body: `assertEquals(solution([[1, 5], [2, 3]]), 2);`,
      },
      {
        name: "three at once need three",
        body: `assertEquals(solution([[1, 9], [2, 8], [3, 7]]), 3);`,
      },
      {
        name: "peak matters, not the total",
        body: `assertEquals(solution([[1, 3], [2, 4], [5, 7], [6, 8]]), 2);`,
      },
      {
        name: "no meetings",
        body: `assertEquals(solution([]), 0);`,
      },
      {
        name: "one meeting",
        body: `assertEquals(solution([[0, 1]]), 1);`,
      },
      {
        name: "touching meetings share a room",
        body: `assertEquals(solution([[1, 2], [2, 3], [3, 4]]), 1);`,
      },
      {
        name: "handles many meetings",
        body: `var ms = [];
for (var i = 0; i < 40000; i++) ms.push([0, i + 1]);
assertEquals(solution(ms), 40000);`,
      },
    ],
    hints: [
      "Collect all start times and all end times into two sorted arrays.",
      "Walk them together: advance the start pointer and increase the count, or advance the end pointer and decrease it.",
      "Process an end before a start when they share a timestamp, or touching meetings will each demand a room.",
    ],
    reference: `function minRooms(meetings) {
  const starts = meetings.map((m) => m[0]).sort((a, b) => a - b);
  const ends = meetings.map((m) => m[1]).sort((a, b) => a - b);
  let rooms = 0;
  let peak = 0;
  let e = 0;
  for (let s = 0; s < starts.length; s++) {
    // <= so a meeting ending at t frees its room for one starting at t.
    while (e < ends.length && ends[e] <= starts[s]) {
      rooms--;
      e++;
    }
    rooms++;
    if (rooms > peak) peak = rooms;
  }
  return peak;
}
`,
  },
};
