import { useEffect } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Gauge } from "lucide-react";
import { getLabBySlug, labRegistry } from "@/lib/labRegistry";
import { GameCard } from "@/components/system-design/GameCard";
import { LabContent } from "@/components/system-design/LabContent";
import { useLabProgress } from "@/lib/useLabProgress";

export const Route = createFileRoute("/lab/$slug")({
  loader: ({ params }) => {
    const lab = getLabBySlug(params.slug);
    if (!lab) throw notFound();
    return {
      slug: lab.slug,
      title: lab.title,
      blurb: lab.blurb,
      category: lab.category,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Lab — Not found · Jainil Chauhan" }] };
    }
    const t = `${loaderData.title} — Lab · Jainil Chauhan`;
    const d = `${loaderData.blurb} Interactive ${loaderData.category.toLowerCase()} demo with concept, reference implementation, production usage at named companies, and pitfalls.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  notFoundComponent: NotFound,
  component: LabDetail,
});

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-mono">
      <div className="text-center">
        <p className="text-terminal text-sm">~/jainil/lab $ cat ./unknown</p>
        <h1 className="mt-4 text-4xl font-bold text-foreground">demo not found</h1>
        <Link to="/lab" className="mt-6 inline-block text-terminal hover:underline">
          ← back to /lab
        </Link>
      </div>
    </div>
  );
}

const DIFF_COLOR: Record<string, string> = {
  Beginner: "border-terminal/40 text-terminal",
  Intermediate: "border-amber-500/40 text-amber-300",
  Advanced: "border-fuchsia-500/40 text-fuchsia-300",
};

function LabDetail() {
  const { slug } = Route.useParams();
  const lab = labRegistry.find((l) => l.slug === slug)!;
  const Game = lab.component;
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
          ~/jainil/lab $ ls
        </Link>

        <div className="mt-6 mb-8">
          <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-accent">
            {lab.category}
          </p>
          <h1 className="mt-1 font-mono text-3xl font-bold text-foreground">{lab.title}</h1>
          <p className="mt-2 text-muted-foreground">{lab.blurb}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px]">
            <span className={`rounded border px-1.5 py-0.5 uppercase tracking-wider ${DIFF_COLOR[lab.difficulty]}`}>
              <Gauge className="mr-1 inline size-3" /> {lab.difficulty}
            </span>
            <span className="rounded border border-border px-1.5 py-0.5 text-muted-foreground">
              <Clock className="mr-1 inline size-3" /> ~{lab.readingTimeMin} min read
            </span>
          </div>
        </div>

        <div id="lab-surface">
          <GameCard title={lab.title} caption={lab.caption} whereUsed={lab.whereUsed}>
            <Game />
          </GameCard>
        </div>

        <LabContent lab={lab} />
      </div>
    </div>
  );
}
