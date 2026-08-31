import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Beaker, Home } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LAB_CATEGORIES, labSummaries } from "@/content/labs";
import { BRAND } from "@/lib/site";

/**
 * How well an item answers the query. 0 means "do not show".
 *
 * cmdk's default scorer is a fuzzy subsequence match over the value *and* the
 * keywords glued together, which ranked "Consistent Hashing" above "KV Cache"
 * for the query "cach" — the letters turn up scattered across some blurb, so
 * nearly everything matches and the ordering is noise.
 *
 * Substrings instead, weighted by where they land: a word-start hit in the
 * title beats a mid-word hit, which beats anything found only in the blurb or
 * the category. Every whitespace-separated token has to match somewhere, so
 * "kv cache" narrows the list rather than widening it.
 */
function scoreLab(value: string, search: string, keywords?: string[]): number {
  const query = search.trim().toLowerCase();
  if (!query) return 1;

  const title = value.toLowerCase();
  const rest = (keywords ?? []).join(" ").toLowerCase();

  const tokens = query.split(/\s+/);
  let total = 0;
  for (const token of tokens) {
    const inTitle = title.indexOf(token);
    if (inTitle === 0 || (inTitle > 0 && !/[a-z0-9]/.test(title[inTitle - 1]))) total += 1;
    else if (inTitle > 0) total += 0.6;
    else if (rest.includes(token)) total += 0.3;
    else return 0;
  }
  return total / tokens.length;
}

/**
 * Search over the whole catalogue.
 *
 * cmdk still owns the keyboard model — arrows move, enter selects, escape
 * closes, the active item scrolls into view — which is why this reuses the
 * portfolio's `Command*` primitives rather than hand-rolling a listbox. It
 * mounts them inside a `Dialog` directly instead of using `CommandDialog`,
 * because that wrapper forwards its props to the dialog and so leaves no way to
 * pass `filter` through.
 *
 * Matching spans title, blurb and category: the title is the `value`, the rest
 * are `keywords`, and `scoreLab` decides which of those a hit landed in.
 */
export function LabSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  const groups = useMemo(
    () =>
      LAB_CATEGORIES.map((category) => ({
        category,
        labs: labSummaries.filter((l) => l.category === category),
      })).filter((g) => g.labs.length > 0),
    [],
  );

  // Close first, navigate on the next frame — otherwise the dialog's exit
  // animation runs against a page that has already swapped underneath it.
  function go(action: () => void) {
    onOpenChange(false);
    requestAnimationFrame(action);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0">
        <DialogTitle className="sr-only">Search labs</DialogTitle>
        <Command filter={scoreLab} className="[&_[cmdk-group-heading]]:px-2">
          <CommandInput placeholder={`Search ${labSummaries.length} labs…`} />
          <CommandList className="max-h-[min(60vh,26rem)]">
            <CommandEmpty>Nothing matches that.</CommandEmpty>

            <CommandGroup heading="Go to">
              <CommandItem
                value="Home"
                keywords={[BRAND.name, "start", "landing"]}
                onSelect={() => go(() => navigate({ to: "/" }))}
              >
                <Home className="size-4" aria-hidden />
                Home
              </CommandItem>
              <CommandItem
                value="All labs"
                keywords={["index", "browse", "catalogue", "everything"]}
                onSelect={() => go(() => navigate({ to: "/lab" }))}
              >
                <Beaker className="size-4" aria-hidden />
                All labs
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {groups.map((group) => (
              <CommandGroup key={group.category} heading={group.category}>
                {group.labs.map((lab) => (
                  <CommandItem
                    key={lab.slug}
                    value={lab.title}
                    keywords={[lab.category, lab.blurb, lab.slug]}
                    onSelect={() =>
                      go(() => navigate({ to: "/lab/$slug", params: { slug: lab.slug } }))
                    }
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">{lab.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {lab.blurb}
                      </span>
                    </span>
                    <span className="ml-2 hidden shrink-0 font-code text-xs text-muted-foreground sm:inline">
                      {lab.category}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
