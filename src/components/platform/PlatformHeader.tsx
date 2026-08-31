import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { LAB_CATEGORIES } from "@/content/labs";
import { BRAND } from "@/lib/site";
import { LabSearch } from "./LabSearch";
import { useSearchHotkey } from "./useSearchHotkey";
import { categoryAnchor } from "./categories";

const linkClass =
  "rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * The platform's only chrome.
 *
 * Mount it behind `isPlatform` at the call site: the flag folds to a literal at
 * build time, so the portfolio build drops this and everything it imports
 * rather than shipping a header it never renders.
 *
 * Deliberately thin — brand, two links, search, a menu on small screens. The
 * navigation this product actually needs is the bridge map, and a fat nav bar
 * would compete with it.
 */
export function PlatformHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // "⌘" on the server for everyone, corrected in the effect. Reading
  // navigator during render would disagree with the SSR HTML.
  const [metaKey, setMetaKey] = useState("⌘");
  const { pathname, hash } = useLocation();

  useSearchHotkey(setSearchOpen);

  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setMetaKey("Ctrl ");
  }, []);

  // Any navigation closes the menu, including a same-page jump to a category
  // anchor — which changes the hash and nothing else.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="rounded-sm font-display text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {BRAND.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-5 sm:flex">
          <Link to="/lab" className={linkClass}>
            All labs
          </Link>
          <Link to="/path/$slug" params={{ slug: "the-spine" }} className={linkClass}>
            Tracks
          </Link>
          <Link to="/lab" hash={categoryAnchor("AI Systems")} className={linkClass}>
            AI Systems
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search labs"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Search className="size-4" aria-hidden />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-border px-1 py-0.5 font-code text-xs text-muted-foreground md:inline">
              {metaKey}K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="platform-menu"
            className="inline-flex items-center rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:hidden"
          >
            {menuOpen ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="platform-menu"
          aria-label="Menu"
          className="border-t border-border bg-background px-4 pb-5 pt-3 sm:hidden"
        >
          <Link to="/lab" className="block py-2 text-base font-medium text-foreground">
            All labs
          </Link>
          <Link
            to="/path/$slug"
            params={{ slug: "the-spine" }}
            className="block py-2 text-base font-medium text-foreground"
          >
            Tracks
          </Link>
          <p className="mt-3 font-code text-xs uppercase tracking-[0.08em] text-muted-foreground">
            Categories
          </p>
          <ul className="mt-1">
            {LAB_CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  to="/lab"
                  hash={categoryAnchor(category)}
                  className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <LabSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
