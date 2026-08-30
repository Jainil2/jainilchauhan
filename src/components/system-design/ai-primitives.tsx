/**
 * Controls shared by the AI Systems labs. They live here rather than in one of
 * the lab files because each lab file is a lazily-loaded chunk — importing
 * AiInferenceLabs from AiRetrievalLabs to reuse a slider would pull all five
 * inference demos into the retrieval chunk.
 */

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between font-code text-xs uppercase tracking-wider text-muted-foreground">
        {label}
        <span className="tabular-nums text-foreground">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-foreground"
      />
    </label>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <p className="font-code text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-code text-xl tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Bar({ fraction, muted }: { fraction: number; muted?: boolean }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={`h-full rounded-full ${muted ? "bg-muted-foreground/50" : "bg-foreground"}`}
        style={{ width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }}
      />
    </div>
  );
}
