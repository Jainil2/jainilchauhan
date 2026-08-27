import { TerminalSquare } from "lucide-react";

/**
 * Mobile-only FAB that opens the TerminalShell. Desktop visitors have ⌘J,
 * the nav `shell` button, and the HUD dock — phones need a tap target.
 *
 * Dispatches the same global ⌘J keydown event TerminalShell already listens
 * for, so we don't introduce a parallel state channel.
 */
export function MobileShellFab() {
  function open() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "j", metaKey: true }));
  }
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open terminal"
      className="fixed bottom-5 right-5 z-40 inline-flex size-12 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-secondary md:hidden"
    >
      <TerminalSquare className="size-5" />
    </button>
  );
}
