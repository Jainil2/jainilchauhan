import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PortfolioHUD } from "@/components/portfolio/PortfolioHUD";
import { TerminalShell } from "@/components/portfolio/TerminalShell";
import { ChaosOverlay } from "@/components/portfolio/ChaosOverlay";
import { MobileShellFab } from "@/components/portfolio/MobileShellFab";
import { useWebVitals } from "@/lib/useWebVitals";
import { useBuildStatus } from "@/lib/useBuildStatus";
import { useHydrateControlPlane } from "@/lib/useControlPlane";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-mono">
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

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Jainil Chauhan" },
      {
        name: "description",
        content:
          "Jainil Chauhan — Software Engineer building low-latency, high-trust distributed systems. Backend, OAuth/OIDC, AWS, and cloud cost optimization.",
      },
      { name: "author", content: "Jainil Chauhan" },
      { property: "og:title", content: "Jainil Chauhan" },
      {
        property: "og:description",
        content:
          "Backend & distributed systems engineer. Building low-latency, high-trust systems that scale quietly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Jainil Chauhan" },
      {
        name: "twitter:description",
        content:
          "Backend & distributed systems engineer. Building low-latency, high-trust systems that scale quietly.",
      },
      { name: "description", content: "Portfolio Powerhouse transforms your resume into a professional, high-quality personal portfolio website." },
      { property: "og:description", content: "Portfolio Powerhouse transforms your resume into a professional, high-quality personal portfolio website." },
      { name: "twitter:description", content: "Portfolio Powerhouse transforms your resume into a professional, high-quality personal portfolio website." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e2b91672-f1c0-4144-8aae-0ab0de3cbbe9/id-preview-fd5ced91--8b5c5000-fb28-41ed-ab20-99a167c4a45e.lovable.app-1777095623015.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e2b91672-f1c0-4144-8aae-0ab0de3cbbe9/id-preview-fd5ced91--8b5c5000-fb28-41ed-ab20-99a167c4a45e.lovable.app-1777095623015.png" },
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
      <PortfolioHUD />
      <TerminalShell />
      <MobileShellFab />
      <ChaosOverlay />
    </>
  );
}
