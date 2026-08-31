# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` holds the repo conventions (style, commits, PRs). This file covers architecture and the non-obvious wiring.

## Commands

```bash
npm run dev        # vite dev server
npm run build      # vite build + regenerates public/status.json (scripts/generate-status.mjs)
npm run build:dev  # build in development mode
npm run preview    # serve the build
npm run lint       # eslint (prettier runs as an eslint rule, so lint fails on format drift)
npm run format     # prettier --write .
```

No test runner is configured. Verification = `npm run lint` + `npm run build`.

Bun lockfiles exist alongside `package-lock.json`; pick one package manager and stay on it.

## Stack

TanStack Start (SSR) + TanStack Router file routes, React 19, Vite 7, Tailwind v4 (CSS-first, no tailwind.config), shadcn/ui (new-york) in `src/components/ui/`, Zustand for state, Supabase client (currently unused by any feature), deployed to Cloudflare Workers (`wrangler.jsonc`, `nitro`).

`vite.config.ts` is a one-liner over `@lovable.dev/vite-tanstack-config`. That preset already supplies tanstackStart, viteReact, tailwindcss, tsConfigPaths, the cloudflare plugin, the `@` alias and React/TanStack dedupe. **Adding any of those manually breaks the app with duplicate plugins.** Extra config goes through `defineConfig({ vite: { ... } })`.

## Architecture

### Routes

`src/routes/` — `__root.tsx`, `index.tsx` (whole portfolio page, section components composed in order), `lab.tsx` (index + `<Outlet/>`), `lab.$slug.tsx`, `projects.$slug.tsx`, `writing.$slug.tsx`. `src/routeTree.gen.ts` is generated — never hand-edit. Router factory is `getRouter()` in `src/router.tsx`.

Project and writing detail pages read from hardcoded `Record<string, …>` objects inside their own route files — no loader, no CMS.

### The lab system (the bulk of the codebase)

`src/lib/labRegistry.ts` (~7.6k lines) is the single source of truth: ~96 `LabEntry` objects, each pairing a slug with a React component from `src/components/system-design/` plus the prose shown on the page (`concept`, `complexity`, `codeSnippet`, `realWorld`, `pitfalls`, `usedBy`, `references`, `skillTags`).

Rendering split:

- `GameCard` — shell around the interactive component (title, caption, "Where I used this").
- `LabContent` — collapsible sections rendered generically from the `LabEntry` fields.
- `lab.$slug.tsx` — loader validates the slug via `getLabBySlug` and 404s otherwise; the first pointerdown/keydown inside `#lab-surface` marks the lab complete.

**Adding a lab:** write the component in `src/components/system-design/`, export it, add one import + one entry to `labRegistry`. Nothing else registers it. Related labs are grouped into shared files (`CoreTreeLabs.tsx`, `SearchSortLabs.tsx`, `AdvancedSystemLabs.tsx`, …) that export several components each. Categories are the four in `LAB_CATEGORIES`.

Lab components take no props; they read simulation toggles from `useSimulationStore` and respect `useReducedMotion()`.

### Root-level overlays

`__root.tsx` mounts four always-on overlays outside the `<Outlet/>`: `PortfolioHUD` (floating dock, tabs stats/me/ops), `TerminalShell` (⌘J/Ctrl-J), `MobileShellFab`, `ChaosOverlay`. `CommandPalette` (⌘K) is mounted by the index route. Components trigger the terminal by dispatching a synthetic `KeyboardEvent("keydown", { key: "j", metaKey: true })` on `window` rather than calling into it.

### State

Zustand stores, all in `src/lib/`:

- `useControlPlane.ts` — the env mode (`prod` / `staging` / `chaos`), web vitals, build status, TPS sparkline history, fake incidents. `chaos` makes `ChaosOverlay` inject incidents and tint the page.
- `useSimulationStore.ts` — node/token state the lab components read.
- `store.ts` — an older global store with an overlapping token-bucket slice and a module-level `setInterval`. Prefer `useSimulationStore` for new work.

Everything user-facing persists to `localStorage` only: theme (`portfolio-theme`), lab progress (`lab-progress-v1`), HUD prefs, control-plane env. Each reader follows the same pattern — default state on the server, load in an effect, expose a `hydrated` flag so SSR HTML matches the first client render. Keep that pattern; skipping it causes hydration mismatches.

`public/status.json` is written by `scripts/generate-status.mjs` at build time (git sha, timestamp, bundle KB) and fetched at runtime by `useBuildStatus` to feed the HUD.

### Supabase

`src/integrations/supabase/` is scaffolding: browser client, service-role server client, `requireSupabaseAuth` middleware, `attachSupabaseAuth` client middleware, generated `types.ts`. Files are marked "automatically generated — do not edit". Nothing in the app calls them yet, and `attachSupabaseAuth` expects to be registered in `src/start.ts`, which does not exist — create it if you actually wire up auth. The only server function today is `sendContactMessage` in `src/lib/contact.functions.ts` (zod validation + honeypot + time-trap; it just logs).

## Design system

`src/styles.css` is the whole theme: Tailwind v4 `@theme inline` tokens + `:root` / `.dark` oklch values, `@custom-variant dark (&:where(.dark, .dark *))`.

Rules the design has been deliberately built around (see `.lovable/plan/`):

- Strictly black/white/grey UI. Color enters the page **only** through brand logos, rendered via `<BrandIcon>` over `simple-icons`. Lucide icons stay monochrome.
- Sora for headings (`font-display`), Manrope for body. `font-mono` is aliased to Manrope on purpose — real monospace is opt-in via `font-code`, only in the terminal and code blocks.
- 12px is the smallest allowed text size, and only for badges/chrome.
- Use the semantic tokens (`text-muted-foreground`, `border-border`, `bg-card`) rather than opacity variants or raw colors. `--terminal` / `--cyan-accent` are legacy names remapped to neutrals — they are not green/cyan.

Theme is applied as a `dark` class on `<html>` by `themeBootScript`, an inline script in the root shell that runs before first paint. `useTheme` broadcasts changes via a `theme-change` window event so nav, palette and terminal stay in sync.

## Repo notes

- `project-memory/` and `agents/` are stale artifacts of an earlier multi-agent workflow (last touched at ~35% progress, before the lab registry existed). Do not treat them as current state and do not update them unless asked.
- `.gemini/scratch/` holds one-off scaffolding scripts that generated placeholder labs. Historical.
- `.lovable/plan/` holds the two design decision docs — those are current and worth reading before visual changes.
