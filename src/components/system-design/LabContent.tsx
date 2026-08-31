import { useState } from "react";
import {
  ChevronDown,
  BookOpen,
  Zap,
  Code2,
  Globe,
  AlertTriangle,
  Link2,
  Building2,
  ExternalLink,
} from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import type { LabMeta } from "@/content/types";

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ icon, title, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-lg border border-border bg-card/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
          <span className="text-terminal">{icon}</span>
          {title}
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-border px-4 py-4 text-sm leading-relaxed text-foreground">
          {children}
        </div>
      )}
    </section>
  );
}

/**
 * Named systems that run on the concept — never behind a click.
 *
 * This is the page's trust signal: every lab ships real companies, real
 * products, and links to the engineering write-ups they came from. It spent its
 * life as the fifth collapsed accordion on the page, which is the same as not
 * having it. It sits outside `Section` on purpose — nothing here should be
 * collapsible.
 */
function UsedInProduction({ items }: { items: NonNullable<LabMeta["usedBy"]> }) {
  return (
    <section
      aria-labelledby="used-by-heading"
      className="rounded-lg border border-border bg-card p-5"
    >
      <h2
        id="used-by-heading"
        className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
      >
        <Building2 className="size-4 text-muted-foreground" aria-hidden />
        Used in production
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Systems that run on this, and where each one is written up.
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const body = (
            <>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-code text-xs">
                <span className="font-semibold text-foreground">{item.company}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{item.product}</span>
                {item.href ? (
                  <ExternalLink className="size-3 text-muted-foreground" aria-hidden />
                ) : (
                  <span className="uppercase tracking-wider text-muted-foreground">
                    commonly used in
                  </span>
                )}
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                {item.usage}
              </span>
            </>
          );
          const className =
            "block h-full rounded-md border border-border bg-background/40 px-3 py-3";
          return (
            <li key={`${item.company}-${item.product}`}>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`${className} transition-colors hover:border-foreground/30`}
                >
                  {body}
                </a>
              ) : (
                <div className={className}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function LabContent({ lab }: { lab: LabMeta }) {
  return (
    <div className="mt-6 space-y-3">
      {lab.usedBy && lab.usedBy.length > 0 && <UsedInProduction items={lab.usedBy} />}

      <Section icon={<BookOpen className="size-4" />} title="Concept" defaultOpen>
        <div className="space-y-3 whitespace-pre-line">{lab.concept}</div>
      </Section>

      {lab.complexity && lab.complexity.length > 0 && (
        <Section icon={<Zap className="size-4" />} title="Complexity">
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-normal">Operation</th>
                  <th className="py-2 pr-4 font-normal">Time</th>
                  <th className="py-2 font-normal">Space</th>
                </tr>
              </thead>
              <tbody>
                {lab.complexity.map((row) => (
                  <tr key={row.operation} className="border-b border-border/40">
                    <td className="py-2 pr-4 text-foreground">{row.operation}</td>
                    <td className="py-2 pr-4 text-terminal">{row.time}</td>
                    <td className="py-2 text-cyan-accent">{row.space ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {lab.codeSnippet && (
        <Section icon={<Code2 className="size-4" />} title="Reference implementation">
          <CodeBlock code={lab.codeSnippet.code} language={lab.codeSnippet.language} />
        </Section>
      )}

      {lab.realWorld && lab.realWorld.length > 0 && (
        <Section icon={<Globe className="size-4" />} title="In the wild">
          <ul className="ml-4 list-disc space-y-1.5 marker:text-terminal">
            {lab.realWorld.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {lab.pitfalls && lab.pitfalls.length > 0 && (
        <Section icon={<AlertTriangle className="size-4" />} title="Pitfalls & gotchas">
          {/* Monochrome: the amber marker that used to be here was the only
              colour on the page outside a brand logo. */}
          <ul className="ml-4 list-disc space-y-1.5 marker:text-muted-foreground">
            {lab.pitfalls.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {lab.references && lab.references.length > 0 && (
        <Section icon={<Link2 className="size-4" />} title="References">
          <ul className="space-y-1.5 font-mono text-xs">
            {lab.references.map((r) => (
              <li key={r.href}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-accent hover:text-terminal hover:underline"
                >
                  → {r.label}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
