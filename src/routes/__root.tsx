import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PortfolioHUD } from "@/components/portfolio/PortfolioHUD";
import { TerminalShell } from "@/components/portfolio/TerminalShell";
import { ChaosOverlay } from "@/components/portfolio/ChaosOverlay";
import { MobileShellFab } from "@/components/portfolio/MobileShellFab";
import { useWebVitals } from "@/lib/useWebVitals";
import { useBuildStatus } from "@/lib/useBuildStatus";
import { useHydrateControlPlane } from "@/lib/useControlPlane";
import { themeBootScript } from "@/lib/useTheme";
import { BRAND, absoluteUrl, isPortfolio } from "@/lib/site";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Error 404</p>
        <h1 className="mt-4 text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

/*
 * Root defaults only. Individual routes override title and description; these
 * are what a page inherits when it sets none.
 *
 * Previously this list repeated `description`, `og:description`, and
 * `twitter:description` with leftover scaffolding copy ("Portfolio Powerhouse
 * transforms your resume..."). Later entries win, so that generic text was the
 * live meta description for the whole site.
 */
const DEFAULT_META = isPortfolio
  ? {
      title: "Jainil Chauhan",
      description:
        "Jainil Chauhan — Software Engineer building low-latency, high-trust distributed systems. Backend, OAuth/OIDC, AWS, and cloud cost optimization.",
      social:
        "Backend & distributed systems engineer. Building low-latency, high-trust systems that scale quietly.",
      image: "/og-image.png",
    }
  : {
      title: `${BRAND.name} — ${BRAND.tagline.toLowerCase()}`,
      description:
        "Learn AI systems from what you already understand. An LLM KV-cache is an LRU cache; continuous batching is a queue and a scheduler. Interactive labs with challenges you actually run.",
      social:
        "Learn AI systems from the CS you already know. Interactive labs, real challenges, and only ever three next steps.",
      // Its own card, not the portfolio's. Rebuild it by screenshotting
      // scripts/og-delta-card.html at 1200x630 if the brand changes.
      image: "/og-delta.png",
    };

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: DEFAULT_META.title },
      { name: "description", content: DEFAULT_META.description },
      ...(isPortfolio ? [{ name: "author", content: "Jainil Chauhan" }] : []),
      { property: "og:title", content: DEFAULT_META.title },
      { property: "og:description", content: DEFAULT_META.social },
      { property: "og:type", content: "website" },
      // Absolute once a domain exists: several social crawlers refuse to
      // resolve a relative og:image and just show no card.
      { property: "og:image", content: absoluteUrl(DEFAULT_META.image) ?? DEFAULT_META.image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: DEFAULT_META.title },
      { name: "twitter:description", content: DEFAULT_META.social },
      { name: "twitter:image", content: absoluteUrl(DEFAULT_META.image) ?? DEFAULT_META.image },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useHydrateControlPlane();
  useWebVitals();
  useBuildStatus();
  return (
    <>
      <Outlet />
      {/*
       * All portfolio chrome. The HUD, chaos overlay, and FAB are personality
       * that competes with the material on a learning site. The terminal goes
       * too: its command set is a bio shell (whoami, cat about.md, resume, cd
       * between portfolio sections) with lab listing as one `ls` command, so it
       * is not the lab navigation the platform needs. Platform navigation is
       * the bridge map in Phase 4; until then /lab's category filters carry it.
       */}
      {isPortfolio && (
        <>
          <PortfolioHUD />
          <MobileShellFab />
          <ChaosOverlay />
          <TerminalShell />
        </>
      )}
    </>
  );
}
