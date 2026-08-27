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

export function LabContent({ lab }: { lab: LabMeta }) {
  return (
    <div className="mt-6 space-y-3">
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

      {lab.usedBy && lab.usedBy.length > 0 && (
        <Section icon={<Building2 className="size-4" />} title="Used in production" defaultOpen>
          <ul className="grid gap-2 sm:grid-cols-2">
            {lab.usedBy.map((item) => {
              const body = (
                <>
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-semibold text-terminal">{item.company}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-cyan-accent">{item.product}</span>
                    {item.href ? (
                      <ExternalLink className="size-3 text-muted-foreground" />
                    ) : (
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        commonly used in
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs text-foreground">{item.usage}</span>
                </>
              );
              const className =
                "block h-full rounded-md border border-border bg-background/40 px-3 py-2";
              return (
                <li key={`${item.company}-${item.product}`}>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`${className} transition-colors hover:border-terminal/50`}
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
          <ul className="ml-4 list-disc space-y-1.5 marker:text-amber-400">
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
