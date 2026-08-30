/**
 * Which product this build is.
 *
 * One codebase, two Cloudflare Workers. The portfolio and the learning
 * platform share the design system and the lab content but are different
 * products with different audiences, so the root route mounts different chrome
 * for each. Set at build time via `VITE_SITE`; see the `build:delta` script and
 * the `delta` environment in wrangler.jsonc.
 *
 * `delta` is a placeholder name — it gets replaced before launch, so keep this
 * constant the single place the choice is read from.
 */
export type Site = "portfolio" | "delta";

export const SITE: Site = import.meta.env.VITE_SITE === "delta" ? "delta" : "portfolio";

export const isPlatform = SITE === "delta";
export const isPortfolio = SITE === "portfolio";

/**
 * The platform's name, in one place.
 *
 * Still the placeholder. Renaming is this object plus the OG image and the
 * wrangler environment — everything user-facing reads from here rather than
 * spelling it out inline.
 */
export const BRAND = {
  name: "Delta",
  tagline: "You already know most of this",
} as const;

/**
 * What a page title is suffixed with on this build.
 *
 * The lab pages are shared by both products, and hardcoding the portfolio's
 * name meant the platform shipped 108 titles reading "· Jainil Chauhan" —
 * the wrong brand on the pages that are supposed to rank for the new one.
 */
export const SITE_NAME = isPortfolio ? "Jainil Chauhan" : BRAND.name;

/**
 * Absolute origin of *this* build, or "" before a domain exists.
 *
 * Empty on purpose rather than defaulted to something plausible: a canonical
 * URL or a JSON-LD `@id` pointing at a placeholder host is worse than none at
 * all, because a crawler believes it.
 */
export const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? "";

/**
 * Where `/lab/*` has moved to, once it has moved.
 *
 * Empty means the migration has not happened, so nothing redirects. Setting it
 * on the portfolio build is what flips the 301 on — an environment variable on
 * launch day rather than a code change under time pressure.
 */
export const PLATFORM_URL: string = import.meta.env.VITE_PLATFORM_URL ?? "";

/**
 * Join an origin and a path without producing a double slash.
 *
 * Exported because it is the only part of this file a test can reach directly:
 * everything else reads `import.meta.env` at module load, which is fixed by the
 * time a test runs.
 */
export function joinUrl(origin: string, path: string): string {
  const base = origin.replace(/\/+$/, "");
  const rest = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return rest ? `${base}/${rest}` : `${base}/`;
}

/**
 * Absolute URL for a path on this build, or undefined when no domain is
 * configured. Callers omit the tag entirely rather than emitting a guess.
 */
export function absoluteUrl(path: string): string | undefined {
  if (!SITE_URL) return undefined;
  return joinUrl(SITE_URL, path);
}

/**
 * Where a `/lab` path should 301 to, or undefined if it should not.
 *
 * Only ever set on the portfolio build: the platform redirecting its own labs
 * to itself would be a loop.
 */
export function migratedLabUrl(path: string): string | undefined {
  if (!isPortfolio || !PLATFORM_URL) return undefined;
  return joinUrl(PLATFORM_URL, path);
}
