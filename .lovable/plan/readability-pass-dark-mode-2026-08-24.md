# Readability Pass + Dark Mode

Two changes: fix the typography/contrast issues causing eye strain, and add a proper dark mode with a toggle.

## 1. Readability fixes

Current problems found in the code: heavy use of `text-xs`, `text-[10px]` and `text-[11px]` (469 small-text matches across 74 files), wide letter-spacing on eyebrows (`tracking-[0.18em]`), tight line-heights on body copy, and grey-on-white text at `oklch(0.52)` which is borderline for contrast.

Fixes:

- **Type scale.** Establish one scale and apply it: body 16px (17px for long paragraphs), secondary text 14px, smallest allowed label 12px. Remove every `text-[10px]` / `text-[11px]`; the floor becomes 12px, and 12px is used only for badges and chrome, never for readable content.
- **Line height and measure.** Body copy gets `leading-relaxed` (1.65) and a max width of ~68 characters. Headings get `leading-tight`, not `leading-[1.05]`.
- **Letter spacing.** Eyebrow tracking drops from `0.18em` to `0.08em`. Headings keep a slight negative tracking; body text gets none.
- **Contrast.** `--muted-foreground` darkens from `oklch(0.52)` to `oklch(0.42)` (about 7:1 on white). Borders darken slightly from `oklch(0.90)` to `oklch(0.88)` so cards and dividers read clearly. All `/40`, `/60`, `/70` opacity text variants get replaced by solid tokens.
- **Spacing rhythm.** Consistent section padding, consistent 8px-based gaps inside cards, more breathing room between label and value pairs in lab modules.
- **Focus and hit targets.** Visible focus ring on every interactive element; icon buttons get a minimum 44x44 tap area.

Scope covers the portfolio sections, nav, footer, terminal, HUD, lab index, lab pages, and the system-design modules (where the tiny mono labels are most concentrated).

## 2. Dark mode

- Class-based dark theme (`.dark` on `<html>`), with a full dark token set that mirrors the light one: near-black background, off-white foreground, mid-grey muted text tuned for AA contrast on dark, and slightly lighter borders. Still strictly black/white/grey; color continues to come only from brand logos.
- Toggle button in the nav (sun/moon icon, labelled), plus a `theme` command in the terminal and command palette.
- Three states: light, dark, system. Default is system preference.
- Choice persisted in `localStorage`, applied by a small inline script in the root document so there is no white flash before hydration.
- Brand logos get a small brightness lift in dark mode so dark marks (GitHub, Vercel-style) stay visible.

## Technical notes

- Token work lives in `src/styles.css`: retune `:root`, add a `.dark` block, and register `@custom-variant dark`.
- Theme state in a small `useTheme` hook plus the no-flash script in `src/routes/__root.tsx`.
- Component edits are className-only; no logic or data changes.
- Verify with a build plus a light/dark screenshot pass over the home page and one lab page.
