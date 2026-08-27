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
