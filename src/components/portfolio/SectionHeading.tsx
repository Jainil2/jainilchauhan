interface Props {
  /** Small uppercase eyebrow above the heading. */
  prompt: string;
  title: string;
  id: string;
}

export function SectionHeading({ prompt, title, id }: Props) {
  return (
    <div id={id} className="mb-10 scroll-mt-24">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {prompt}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <div className="mt-4 h-px w-10 bg-foreground" />
    </div>
  );
}
