import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { trackSummaries } from "@/content/labs.gen";
import { TrackDetail } from "@/components/path/TrackDetail";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

/**
 * One guided track.
 *
 * Tracks are tiny — a title and a list of slugs — so they ship in the generated
 * summary index rather than being lazily loaded like lab prose. That means no
 * loader: the route resolves the track synchronously and 404s on an unknown
 * slug, the same contract `/lab/$slug` has.
 */
export const Route = createFileRoute("/path/$slug")({
  beforeLoad: ({ params }) => {
    if (!trackSummaries.some((t) => t.slug === params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const track = trackSummaries.find((t) => t.slug === params.slug);
    if (!track) return { meta: [{ title: `Track — Not found · ${SITE_NAME}` }] };

    const title = `${track.title} — a guided track · ${SITE_NAME}`;
    const url = absoluteUrl(`/path/${params.slug}`);

    return {
      meta: [
        { title },
        { name: "description", content: `${track.blurb} ${track.outcome}` },
        { property: "og:title", content: title },
        { property: "og:description", content: track.blurb },
        ...(url ? [{ property: "og:url", content: url }] : []),
      ],
      links: url ? [{ rel: "canonical", href: url }] : [],
      // A track is a course in schema.org's vocabulary: an ordered sequence of
      // free, self-paced work with a stated outcome.
      scripts: url
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Course",
                "@id": url,
                url,
                name: track.title,
                description: `${track.blurb} ${track.outcome}`,
                isAccessibleForFree: true,
                inLanguage: "en",
                numberOfCredits: track.steps.length,
                hasCourseInstance: {
                  "@type": "CourseInstance",
                  courseMode: "online",
                  courseWorkload: `PT${track.steps.length * 5}M`,
                },
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: TrackNotFound,
  component: TrackPage,
});

function TrackNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <p className="font-code text-sm text-muted-foreground">Track</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">No such track</h1>
        <Link to="/lab" className="mt-6 inline-block text-sm underline underline-offset-4">
          ← All labs
        </Link>
      </div>
    </div>
  );
}

function TrackPage() {
  const { slug } = Route.useParams();
  const track = trackSummaries.find((t) => t.slug === slug)!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Same shell as every other platform page — a track is a place you
          navigate from, not a dead end. */}
      <PlatformHeader />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link
          to="/lab"
          className="inline-flex items-center gap-2 font-code text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          All labs
        </Link>

        <div className="mt-8">
          <TrackDetail track={track} />
        </div>
      </div>
    </div>
  );
}
