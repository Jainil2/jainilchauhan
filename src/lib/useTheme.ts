import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";

const KEY = "portfolio-theme";

export function resolveTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(choice: ThemeChoice) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(choice);
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

function readChoice(): ThemeChoice {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    // ignore
  }
  return "system";
}

/** Inline script string that applies the stored theme before first paint. */
export const themeBootScript = `(function(){try{var c=localStorage.getItem('${KEY}')||'system';var d=c==='dark'||(c==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

/**
 * Theme preference (light / dark / system) persisted in localStorage and
 * applied as a `dark` class on <html>. `hydrated` guards SSR mismatches.
 */
export function useTheme() {
  const [choice, setChoiceState] = useState<ThemeChoice>("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readChoice();
    setChoiceState(stored);
    applyTheme(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice, hydrated]);

  const setChoice = useCallback((next: ThemeChoice) => {
    setChoiceState(next);
    applyTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent("theme-change", { detail: next }));
  }, []);

  // Keep multiple mounted consumers (nav, palette, terminal) in sync.
  useEffect(() => {
    const onExternal = (e: Event) => {
      const next = (e as CustomEvent).detail as ThemeChoice;
      setChoiceState(next);
    };
    window.addEventListener("theme-change", onExternal);
    return () => window.removeEventListener("theme-change", onExternal);
  }, []);

  const resolved = hydrated ? resolveTheme(choice) : "light";

  const cycle = useCallback(() => {
    const order: ThemeChoice[] = ["light", "dark", "system"];
    setChoice(order[(order.indexOf(choice) + 1) % order.length]!);
  }, [choice, setChoice]);

  return { choice, setChoice, resolved, hydrated, cycle };
}
