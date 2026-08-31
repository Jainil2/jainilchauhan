import { Suspense, useEffect } from "react";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowLeft, Clock, Gauge } from "lucide-react";
import { loadLab } from "@/content/labs";
import { GameCard } from "@/components/system-design/GameCard";
import { LabContent } from "@/components/system-design/LabContent";
import { labComponents } from "@/components/system-design/registry";
import { BridgeCard } from "@/components/bridge/BridgeCard";
import { UnlocksCard } from "@/components/bridge/UnlocksCard";
import { ChallengePanel } from "@/components/challenge/ChallengePanel";
import { KnowledgeControls } from "@/components/challenge/KnowledgeControls";
import { useLabProgress } from "@/lib/useLabProgress";
import { SITE_NAME, absoluteUrl, migratedLabUrl } from "@/lib/site";

export const Route = createFileRoute("/lab/$slug")({
  // Inert until VITE_PLATFORM_URL is set on the portfolio build. The spec moves
  // /lab/* to the platform domain with a 301 from here; wiring it now means
  // launch day is an environment variable, not a code change.
  beforeLoad: ({ params }) => {
    const moved = migratedLabUrl(`/lab/${params.slug}`);
    if (moved) throw redirect({ href: moved, statusCode: 301 });
  },
  loader: async ({ params }) => {
    const lab = await loadLab(params.slug);
    if (!lab) throw notFound();
    return { lab };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: `Lab — Not found · ${SITE_NAME}` }] };
    }
    const { lab } = loaderData;
    const t = `${lab.title} — Lab · ${SITE_NAME}`;
    const d = `${lab.blurb} Interactive ${lab.category.toLowerCase()} demo with concept, reference implementation, production usage at named companies, and pitfalls.`;
    const url = absoluteUrl(`/lab/${params.slug}`);

    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        ...(url ? [{ property: "og:url", content: url }] : []),
      ],
      // Omitted entirely before a domain exists — a canonical pointing at a
      // placeholder host is worse than none, because a crawler believes it.
      links: url ? [{ rel: "canonical", href: url }] : [],
      // These are the pages meant to rank, and until now they carried no
      // structured data at all.
      scripts: url
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LearningResource",
                "@id": url,
                url,
                name: lab.title,
                description: lab.blurb,
                learningResourceType: "Interactive lab",
                educationalLevel: lab.difficulty,
                teaches: lab.skillTags,
                timeRequired: `PT${lab.readingTimeMin}M`,
                isAccessibleForFree: true,
                inLanguage: "en",
              }),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Lab", item: absoluteUrl("/lab") },
                  { "@type": "ListItem", position: 2, name: lab.title, item: url },
                ],
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: NotFound,
  component: LabDetail,
});

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-mono">
      <div className="text-center">
        <p className="text-terminal text-sm">Lab</p>
        <h1 className="mt-4 text-4xl font-bold text-foreground">Demo not found</h1>
        <Link to="/lab" className="mt-6 inline-block text-terminal hover:underline">
          ← Back to the lab
        </Link>
      </div>
    </div>
  );
}

const DIFF_COLOR: Record<string, string> = {
  Beginner: "border-foreground/40 text-foreground",
  Intermediate: "border-border text-muted-foreground",
  Advanced: "border-border text-muted-foreground",
};

function LabDetail() {
  const { slug } = Route.useParams();
  const { lab } = Route.useLoaderData();
  const Game = labComponents[slug];
  const { markCompleted } = useLabProgress();

  useEffect(() => {
    let done = false;
    const hit = () => {
      if (done) return;
      done = true;
      markCompleted(slug);
    };
    const el = document.getElementById("lab-surface");
    el?.addEventListener("pointerdown", hit);
    el?.addEventListener("keydown", hit);
    return () => {
      el?.removeEventListener("pointerdown", hit);
      el?.removeEventListener("keydown", hit);
    };
  }, [slug, markCompleted]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link
          to="/lab"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-terminal"
        >
          <ArrowLeft className="size-3" />
          All labs
        </Link>

        <div className="mt-6 mb-8">
          <p className="font-mono text-xs uppercase tracking-wider text-cyan-accent">
            {lab.category}
          </p>
          <h1 className="mt-1 font-mono text-3xl font-bold text-foreground">{lab.title}</h1>
          <p className="mt-2 text-muted-foreground">{lab.blurb}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs">
            <span
              className={`rounded border px-1.5 py-0.5 uppercase tracking-wider ${DIFF_COLOR[lab.difficulty]}`}
            >
              <Gauge className="mr-1 inline size-3" /> {lab.difficulty}
            </span>
            <span className="rounded border border-border px-1.5 py-0.5 text-muted-foreground">
              <Clock className="mr-1 inline size-3" /> ~{lab.readingTimeMin} min read
            </span>
          </div>
          <div className="mt-4">
            <KnowledgeControls slug={slug} />
          </div>
        </div>

        <BridgeCard slug={slug} />

        {/*
         * A lab may ship without a bespoke visualisation. The registry is keyed
         * by slug and a missing entry used to render `undefined` as a component,
         * which throws — so a lab whose demo has not been built yet took the
         * whole page down. It now simply has no demo surface, and the concept,
         * production usage and challenge below carry the page.
         */}
        {Game && (
          <div id="lab-surface">
            <GameCard title={lab.title} caption={lab.caption} whereUsed={lab.whereUsed}>
              <Suspense
                fallback={
                  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    Loading demo…
                  </div>
                }
              >
                <Game />
              </Suspense>
            </GameCard>
          </div>
        )}

        {/*
         * Between the demo and the prose on purpose. Buried under six collapsed
         * sections, the one mechanic the product is built on is the thing
         * nobody scrolls to. The prose stays below and fully crawlable.
         */}
        {lab.challenge && <ChallengePanel slug={slug} challenge={lab.challenge} />}

        <LabContent lab={lab} />

        <UnlocksCard slug={slug} />
      </div>
    </div>
  );
}
