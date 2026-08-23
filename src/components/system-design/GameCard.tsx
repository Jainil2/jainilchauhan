import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

interface GameCardProps {
  title: string;
  caption: string;
  whereUsed?: { label: string; href: string };
  children: ReactNode;
  toolbar?: ReactNode;
}

/** Shared shell for every lab demo: header, body, caption + "Where I used this". */
export function GameCard({ title, caption, whereUsed, children, toolbar }: GameCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {toolbar}
      </div>
      <div className="min-h-[260px]">{children}</div>
      <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        {caption}
      </p>
      {whereUsed && (
        <div className="mt-2 text-xs">
          {whereUsed.href.startsWith("/") ? (
            <Link
              to={whereUsed.href}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-terminal"
            >
              <ExternalLink className="size-3" />
              Where I used this: {whereUsed.label}
            </Link>
          ) : (
            <a
              href={whereUsed.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-terminal"
            >
              <ExternalLink className="size-3" />
              Where I used this: {whereUsed.label}
            </a>
          )}
        </div>
      )}
    </div>
  );
}