import { useEffect, type Dispatch, type SetStateAction } from "react";

/**
 * ⌘K / Ctrl-K, the same binding the portfolio's CommandPalette uses.
 *
 * Its own module so `LabSearch` stays a component-only file (react-refresh
 * warns otherwise). The portfolio's palette keeps its own copy of the listener
 * because it is a different surface — sections, env switches, resume — that
 * happens to share the shortcut.
 *
 * Takes the setter itself, which React guarantees is stable, so the listener is
 * attached once rather than on every render.
 */
export function useSearchHotkey(setOpen: Dispatch<SetStateAction<boolean>>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}
