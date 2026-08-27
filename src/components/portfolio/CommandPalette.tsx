import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Download,
  Github,
  Linkedin,
  Mail,
  User,
  Sparkles,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Pencil,
  MessageSquare,
  Clock,
  Cpu,
  EyeOff,
  Beaker,
  TerminalSquare,
  Activity,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";
import { labRegistry } from "@/lib/labRegistry";
import { useControlPlane, type EnvMode } from "@/lib/useControlPlane";
import { useTheme, type ThemeChoice } from "@/lib/useTheme";

type Action = () => void;

function scrollTo(id: string): Action {
  return () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

function openLink(url: string, target: "_self" | "_blank" = "_blank"): Action {
  return () => {
    window.open(url, target, target === "_blank" ? "noopener,noreferrer" : undefined);
  };
}

/**
 * ⌘K command palette — jump between sections, copy email, open socials.
 * Also includes a "Disable Simulations" toggle for low-end devices.
 * Always mounted; toggled with ⌘K / Ctrl+K or Esc.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { simulationsEnabled, setSimulationsEnabled } = useSimulationStore();
  const env = useControlPlane((s) => s.env);
  const setEnv = useControlPlane((s) => s.setEnv);
  const navigate = useNavigate();
  const { choice: themeChoice, setChoice: setThemeChoice } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function run(action: Action) {
    setOpen(false);
    // Defer to allow the dialog to close before scrolling.
    requestAnimationFrame(action);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 font-mono text-xs text-muted-foreground shadow-lg backdrop-blur-md transition-colors hover:border-terminal/50 hover:text-foreground md:inline-flex"
      >
        <span className="rounded border border-border bg-background/60 px-1.5 py-0.5 text-xs">
          ⌘K
        </span>
        <span>jump anywhere</span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="type a command or section..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Sections">
            <CommandItem onSelect={() => run(scrollTo("top"))}>
              <Sparkles className="size-4" /> Hero
            </CommandItem>
            <CommandItem onSelect={() => run(scrollTo("about"))}>
              <User className="size-4" /> About
            </CommandItem>
            <CommandItem onSelect={() => run(scrollTo("skills"))}>
              <Sparkles className="size-4" /> Skills
            </CommandItem>
            <CommandItem onSelect={() => run(scrollTo("experience"))}>
              <Briefcase className="size-4" /> Experience
            </CommandItem>
            <CommandItem onSelect={() => run(scrollTo("projects"))}>
              <FolderGit2 className="size-4" /> Projects
            </CommandItem>
            <CommandItem onSelect={() => run(scrollTo("now"))}>
              <Clock className="size-4" /> Now
            </CommandItem>
            <CommandItem onSelect={() => run(scrollTo("education"))}>
              <GraduationCap className="size-4" /> Education
            </CommandItem>
            <CommandItem onSelect={() => run(scrollTo("writing"))}>
              <Pencil className="size-4" /> Writing
            </CommandItem>
            <CommandItem onSelect={() => run(scrollTo("contact"))}>
              <MessageSquare className="size-4" /> Contact
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Labs">
            <CommandItem onSelect={() => run(() => navigate({ to: "/lab" }))}>
              <Beaker className="size-4" /> Open Lab index
            </CommandItem>
            {labRegistry.map((lab) => (
              <CommandItem
                key={lab.slug}
                onSelect={() =>
                  run(() => navigate({ to: "/lab/$slug", params: { slug: lab.slug } }))
                }
              >
                <Beaker className="size-4" /> {lab.title}
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {lab.category}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Shell & environment">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                // TerminalShell listens for this global event.
                requestAnimationFrame(() =>
                  window.dispatchEvent(new KeyboardEvent("keydown", { key: "j", metaKey: true })),
                );
              }}
            >
              <TerminalSquare className="size-4" /> Open shell (⌘J)
            </CommandItem>
            {(["prod", "staging", "chaos"] as EnvMode[]).map((mode) => (
              <CommandItem
                key={mode}
                onSelect={() => {
                  setEnv(mode);
                  setOpen(false);
                }}
              >
                <Activity className="size-4" /> env: {mode}
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {env === mode ? "ACTIVE" : "switch"}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick actions">
            <CommandItem onSelect={() => run(openLink("/jainil-chauhan-resume.pdf", "_self"))}>
              <Download className="size-4" /> Download resume.pdf
            </CommandItem>
            <CommandItem
              onSelect={() => run(openLink("mailto:jainil.chauhan@example.com", "_self"))}
            >
              <Mail className="size-4" /> Email me
            </CommandItem>
            <CommandItem onSelect={() => run(openLink("https://github.com/jainil-chauhan"))}>
              <Github className="size-4" /> GitHub
            </CommandItem>
            <CommandItem
              onSelect={() => run(openLink("https://www.linkedin.com/in/jainil-chauhan"))}
            >
              <Linkedin className="size-4" /> LinkedIn
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            {(["light", "dark", "system"] as ThemeChoice[]).map((mode) => {
              const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : Monitor;
              return (
                <CommandItem
                  key={mode}
                  onSelect={() => {
                    setThemeChoice(mode);
                    setOpen(false);
                  }}
                >
                  <Icon className="size-4" /> Theme: {mode}
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {themeChoice === mode ? "ACTIVE" : "switch"}
                  </span>
                </CommandItem>
              );
            })}
            <CommandItem
              onSelect={() => {
                setSimulationsEnabled(!simulationsEnabled);
                setOpen(false);
              }}
            >
              {simulationsEnabled ? (
                <>
                  <EyeOff className="size-4" />
                  Disable Simulations
                  <span className="ml-auto font-mono text-xs text-terminal">ON</span>
                </>
              ) : (
                <>
                  <Cpu className="size-4" />
                  Enable Simulations
                  <span className="ml-auto font-mono text-xs text-muted-foreground">OFF</span>
                </>
              )}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
