import { useEffect, useState } from "react";

const VISIBLE_KEY = "portfolio-hud-visible";
const EXPANDED_KEY = "portfolio-hud-expanded";
const TAB_KEY = "portfolio-hud-tab";

export type HudTab = "stats" | "me" | "ops";

const VALID_TABS: readonly HudTab[] = ["stats", "me", "ops"] as const;

function readBool(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === "1";
  } catch {
    return fallback;
  }
}

function readTab(): HudTab {
  try {
    const raw = localStorage.getItem(TAB_KEY);
    if (raw && (VALID_TABS as readonly string[]).includes(raw)) {
      return raw as HudTab;
    }
  } catch {
    // ignore
  }
  return "stats";
}

/**
 * Persisted prefs for the floating HUD dock:
 *   - `visible`  — whether the dock is mounted at all (else a small "hud" pill).
 *   - `expanded` — whether the dock shows the full tabbed panel or just a pill.
 *   - `tab`      — active tab when expanded.
 *
 * `hydrated` flips true after the first effect so SSR HTML matches the client
 * render before we touch localStorage.
 */
export function useHudPrefs() {
  const [visible, setVisible] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [tab, setTab] = useState<HudTab>("stats");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setVisible(readBool(VISIBLE_KEY, true));
    setExpanded(readBool(EXPANDED_KEY, false));
    setTab(readTab());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(VISIBLE_KEY, visible ? "1" : "0");
    } catch {
      // ignore
    }
  }, [visible, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(EXPANDED_KEY, expanded ? "1" : "0");
    } catch {
      // ignore
    }
  }, [expanded, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(TAB_KEY, tab);
    } catch {
      // ignore
    }
  }, [tab, hydrated]);

  return { visible, setVisible, expanded, setExpanded, tab, setTab, hydrated };
}
