import { useEffect, useState } from "react";
import { Menu, X, Download, TerminalSquare } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useScrollSpy } from "@/hooks/use-scroll-spy";

function openShell() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key: "j", metaKey: true }),
  );
}

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#now", label: "Now" },
  { href: "#writing", label: "Writing" },
  { href: "#contact", label: "Contact" },
];

const sectionIds = links.map((l) => l.href.slice(1));

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useScrollSpy(sectionIds);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#top"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Jainil Chauhan
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={active === l.href.slice(1) ? "true" : undefined}
                className={`relative rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary hover:text-foreground ${
                  active === l.href.slice(1)
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {l.label}
                {active === l.href.slice(1) && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-px h-px bg-foreground"
                  />
                )}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/lab"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Lab
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={openShell}
              title="Open terminal (⌘J)"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <TerminalSquare className="size-3.5" />
              Terminal
            </button>
          </li>
          <li>
            <a
              href="/jainil-chauhan-resume.pdf"
              download
              className="ml-2 inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Download className="size-3.5" />
              Resume
            </a>
          </li>
        </ul>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-foreground hover:bg-secondary md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-md md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/lab"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Lab
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openShell();
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <TerminalSquare className="size-3.5" />
                Terminal
              </button>
            </li>
            <li>
              <a
                href="/jainil-chauhan-resume.pdf"
                download
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Download className="size-3.5" />
                Download resume
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
