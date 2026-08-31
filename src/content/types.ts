export type LabCategory =
  | "Distributed Systems"
  | "System Design"
  | "Data Structures"
  | "Algorithms"
  | "Security"
  | "AI Systems";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export const LAB_CATEGORIES: LabCategory[] = [
  "Distributed Systems",
  "System Design",
  "Data Structures",
  "Algorithms",
  "Security",
  "AI Systems",
];

/**
 * An ordered route through the labs.
 *
 * Bridges answer "what is this a small change from"; a track answers "what do I
 * do first, and then what". Both read the same catalogue — a track is only an
 * ordering of slugs, so it can never disagree with the labs it points at.
 *
 * Product Rule 1 still binds: a track may be long, but nothing renders it as a
 * count of what the visitor has not done.
 */
export interface Track {
  slug: string;
  title: string;
  /** One line: who this is for and where it ends. */
  blurb: string;
  /** What you can do at the end, stated concretely. */
  outcome: string;
  /** Lab slugs, in the order they should be taken. Every one must resolve. */
  steps: string[];
}

/**
 * One test case. `body` runs inside the challenge worker with `solution` bound
 * to the visitor's exported function and `assert`/`assertEquals` in scope.
 */
export interface ChallengeTest {
  name: string;
  body: string;
}

export interface Challenge {
  /** What to build, one or two sentences. */
  prompt: string;
  /**
   * Name of the function in `starter` that the tests exercise. The harness
   * binds it to `solution`, so every test body can call `solution(...)` without
   * caring what the author named it. Required — `prebuild` fails without it.
   */
  entry: string;
  /** JSDoc + stub seeded into the editor. JavaScript — there is no transpile step. */
  starter: string;
  tests: ChallengeTest[];
  /** Revealed after a pass, or on explicit give-up. */
  reference: string;
  /** Shown one at a time, in order. */
  hints: string[];
}

/**
 * A link from something the visitor already knows to something new.
 *
 * This is the product: `sameness` always renders before any new material, so a
 * lab opens with "you already know 70% of this" rather than a wall of novelty.
 */
export interface Bridge {
  /** Slug of the prerequisite lab. Must resolve — `prebuild` fails otherwise. */
  slug: string;
  /** "It IS an LRU cache, keyed by token position, evicted under memory pressure." */
  sameness: string;
  /** "New: attention K/V tensors, and GPU memory as the eviction budget." */
  delta: string;
}

/**
 * Lab metadata. Deliberately free of React imports so Node build scripts
 * (sitemap, bridge-graph validation) and list-only pages can read it without
 * pulling every lab component into the bundle. The component lives in
 * `src/components/system-design/registry.ts`, keyed by the same slug.
 */
export interface LabMeta {
  slug: string;
  title: string;
  category: LabCategory;
  difficulty: Difficulty;
  readingTimeMin: number;
  blurb: string;
  caption: string;
  whereUsed?: { label: string; href: string };
  /** Skill names this lab demonstrates. */
  skillTags: string[];
  /** Long-form explanation, shown in the "Concept" section. */
  concept: string;
  complexity?: { operation: string; time: string; space?: string }[];
  codeSnippet?: { language: "ts" | "py" | "go" | "sql"; code: string };
  realWorld?: string[];
  pitfalls?: string[];
  references?: { label: string; href: string }[];
  /**
   * Named companies/products that run on this concept, shown as chips in the
   * "Used in production" section. `href` points at a public source (engineering
   * blog, paper, docs); entries without one render as "commonly used in".
   */
  usedBy?: { company: string; product: string; usage: string; href?: string }[];
  /** Opt-in validation. Absent means the lab is read-and-play only. */
  challenge?: Challenge;
  /** What this lab is a small delta from. Drives the bridge map. */
  bridgesFrom?: Bridge[];
}
