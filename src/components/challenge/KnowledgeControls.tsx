import { Check, Circle } from "lucide-react";
import { useKnowledge } from "@/lib/useKnowledge";

/**
 * "I already know this" — one click, on every lab page.
 *
 * Lives here rather than inside ChallengePanel because most labs will never
 * have a challenge, and those still have to feed placement. If declaring
 * knowledge were harder than proving it, nobody would place themselves and the
 * bridge map would have nothing to read.
 */
export function KnowledgeControls({ slug }: { slug: string }) {
  const { knowledge, hydrated, toggleKnown } = useKnowledge();

  const solved = knowledge.solved.has(slug);
  const known = knowledge.known.has(slug);

  // Rendered only after hydration: its state comes from localStorage, so
  // drawing it during SSR would guarantee a mismatch.
  if (!hydrated) return <div className="h-8" aria-hidden />;

  if (solved) {
    return (
      <p className="inline-flex h-8 items-center gap-1.5 text-sm text-muted-foreground">
        <Check className="size-4" />
        You solved this one.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleKnown(slug)}
      aria-pressed={known}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors ${
        known
          ? "border-foreground/30 bg-secondary text-foreground"
          : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
      }`}
    >
      {known ? <Check className="size-3.5" /> : <Circle className="size-3.5" />}
      {known ? "You know this" : "I already know this"}
    </button>
  );
}
