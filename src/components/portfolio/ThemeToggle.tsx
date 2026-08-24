import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

const LABEL = {
  light: "Light theme",
  dark: "Dark theme",
  system: "System theme",
} as const;

interface Props {
  className?: string;
  withText?: boolean;
}

/** Cycles light → dark → system. Icon reflects the current preference. */
export function ThemeToggle({ className, withText = false }: Props) {
  const { choice, cycle, hydrated } = useTheme();
  const Icon = choice === "dark" ? Moon : choice === "light" ? Sun : Monitor;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${hydrated ? LABEL[choice] : "Theme"} — click to change`}
      title={hydrated ? LABEL[choice] : "Theme"}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ${className ?? ""}`}
    >
      <Icon className="size-4" />
      {withText && <span>{hydrated ? LABEL[choice] : "Theme"}</span>}
    </button>
  );
}
