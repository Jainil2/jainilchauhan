# Design Overhaul: Professional Light Portfolio

Full visual rewrite from the dark "hacker terminal" aesthetic to a clean, minimalist, light professional portfolio. All decisions below are frozen — one large PR, no partial rollout.

## Frozen decisions

- **Theme:** light only. No dark mode, no theme toggle. Dark tokens removed.
- **Color:** strictly black / white / greys for all UI. The only color on the page comes from brand logos (AWS, GCP, Kubernetes, PostgreSQL, Redis, GraphQL, Docker, Node, TypeScript, React, etc.).
- **Typography:** Sora for headings, Manrope for body (loaded via `<link>` in the root route head).
- **Monospace:** allowed only inside the terminal and code blocks. Everywhere else uses Manrope.
- **Terminal:** kept and fully functional, restyled light (white surface, black text, grey chrome) to match the site. Opened via ⌘K / ⌘J, nav button, mobile FAB.
- **HUD:** kept, restyled as a small neutral pill with the same tabs, light styling, reduced visual weight.
- **Labels:** plain professional wording everywhere — no `~/jainil $` prompts, no `// comment` captions, no `cd ~/`, no filename section dividers (`about.md`, `git log`).
- **Lab internals:** all 20+ lab/system-design components rethemed to the same light system.

## Brand icon source

`simple-icons` (via the `simple-icons` npm package, rendered through a small `<BrandIcon>` wrapper) for technology/service logos — 3000+ official marks with official brand colors, MIT-licensed, tree-shakeable, no network calls. AWS/GCP service-level icons that Simple Icons lacks are covered by the generic vendor mark plus a text label. Lucide stays for functional UI icons (menu, close, arrow, download) rendered in black/grey only.

## Where brand icons appear

- Skills section — every technology chip gets its brand mark
- Experience entries — employer/tech stack marks
- Projects cards — stack marks per project
- Infrastructure map nodes — AWS/K8s/Postgres/Redis marks
- Lab pages — relevant tech mark in the header
- Contact/footer — GitHub, LinkedIn, email marks

## Design system (src/styles.css)

Replace the entire token block:

```
--background: white
--foreground: near-black (oklch .18)
--muted-foreground: grey (oklch .52)
--border: light grey (oklch .90)
--card: white, --secondary: oklch .97
--primary: near-black, --primary-foreground: white
--radius: 0.5rem
```

- Remove `--terminal`, `--terminal-glow`, `--cyan-accent`, `.glow-terminal`, `.caret-blink`, the grid/glow body background, the `.dark` block, and the chaos jitter filter.
- Remove the `@import url(...)` Google Fonts line from `styles.css` (it breaks the build) — fonts move to `<link>` tags in `__root.tsx`.
- Keep `.env-chaos` behavior but make it a subtle opacity/border tint instead of a filter.
- Add utilities: `.surface` (white card + hairline border), `.hairline`, `.section` spacing.

## Component work

**Chrome:** `Nav` (white, hairline bottom border, plain labels, black CTA button), `Footer`, `SectionHeading` (plain eyebrow + heading, no shell prompt), `SectionDivider` (thin rule + plain label or removed), `CommandPalette`, `PortfolioHUD`, `MobileShellFab`, `TerminalShell`, `ChaosOverlay`, `Reveal` (keep, subtler motion).

**Content sections:** `Hero` (large Sora headline, plain sub-copy, no typing caret), `About`, `Skills` (brand-icon grid), `Experience`, `Projects`, `Education`, `Now`, `Writing`, `Contact`, `TokenBucketContact`, `InfrastructureMap`, `Counter`.

**Routes:** `__root.tsx` (font links, remove `dark` class, 404 page copy), `index.tsx`, `lab.tsx`, `lab.$slug.tsx`, `projects.$slug.tsx`, `writing.$slug.tsx`.

**Lab internals:** `GameCard`, `CodeBlock`, `LabContent`, and every `src/components/system-design/*` module — swap `text-terminal`/`cyan-accent`/`font-mono` for the neutral system, use black/grey/hairline visuals with a single accent state (solid black fill) for "active", and greyscale-plus-hairline for graphs, grids, and nodes. Code blocks keep mono and a light grey surface.

## Pre-work fixes bundled into the same PR

- Fix the build-breaking Google Fonts `@import` in `styles.css` (superseded by the font work above).
- `src/components/portfolio/Contact.tsx` imports `src/server/contact` directly, which is blocked in the client bundle — move the server function into a client-safe `*.functions.ts` module and import that.
- Fix TS errors in `CoreTreeLabs.tsx` (comma-operator misuse) and `QuadTreeLab.tsx` (implicit `any[]` on `newPoints`).

## Out of scope

No copy rewrite beyond label de-jargoning, no new sections, no new labs, no backend/logic changes.
