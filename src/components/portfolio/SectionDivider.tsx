interface Props {
  label?: string;
}

/** Hairline rule between sections. */
export function SectionDivider({ label }: Props) {
  void label;
  return (
    <div aria-hidden className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="h-px w-full bg-border" />
    </div>
  );
}
