import { useMemo, useState } from "react";
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
 * Where a hit landed, best first. The tiers are the ranking.
 *
 * cmdk's default scorer is a fuzzy *subsequence* match over the value and the
 * keywords glued together. With 127 labs that matches nearly everything: for
 * the query "cach" it ranked "Consistent Hashing" and "CAP Theorem" above
 * "KV Cache", because c-a-c-h turns up scattered across some blurb. Ordering
 * was noise, which on a list this long is the same as having no search.
 */
const TIER = {
  exactTitle: 1,
  titlePrefix: 0.95,
  titleWord: 0.85,
  titleSubstring: 0.6,
  category: 0.4,
  blurb: 0.25,
  /** Multiplier for a hit that only matched after stemming. See `scoreLab`. */
  stemmed: 0.5,
} as const;

/** Best tier one token reaches, or 0 if it is nowhere. */
function tokenScore(token: string, title: string, category: string, body: string): number {
  const at = title.indexOf(token);
  if (at === 0) return TIER.titlePrefix;
  if (at > 0 && !/[a-z0-9]/.test(title[at - 1])) return TIER.titleWord;
  if (at > 0) return TIER.titleSubstring;
  if (category.includes(token)) return TIER.category;
  if (body.includes(token)) return TIER.blurb;
  return 0;
}

/**
 * How well one lab answers the query. 0 means "do not show".
 *
 * Substring matching, scored by tier. `keywords` is `[category, blurb, slug]`
 * from the call site below — the order matters, because a hit in the category
 * has to outrank a hit in the blurb.
 *
 * Whitespace splits the query into tokens and every token has to land
 * somewhere, so "kv cache" narrows the list rather than widening it; the score
 * is the mean, so a query that matches a title twice beats one that limps in
 * through a blurb.
 */
function scoreLab(value: string, search: string, keywords?: string[]): number {
  const query = search.trim().toLowerCase().replace(/\s+/g, " ");
  if (!query) return 1;

  const title = value.toLowerCase();
  if (title === query) return TIER.exactTitle;
  if (title.startsWith(query)) return TIER.titlePrefix;

  const [category = "", blurb = "", slug = ""] = keywords ?? [];
  const cat = category.toLowerCase();
  const body = `${blurb} ${slug}`.toLowerCase();

  const tokens = query.split(" ");
  let total = 0;
  for (const token of tokens) {
    let score = tokenScore(token, title, cat, body);
    if (score === 0 && token.length > 3) {
      // Substrings alone would drop "Caching Layers" for the query "cache",
      // which a reader notices. One crude stem, scored at half, so the labs
      // that matched the word actually typed still rank above it.
      const stem = token.replace(/(ing|ed|es|s|e)$/, "");
      if (stem.length > 2 && stem !== token) {
        score = tokenScore(stem, title, cat, body) * TIER.stemmed;
      }
    }
    if (score === 0) return 0;
    total += score;
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
  // Controlled so the list can switch between grouped and flat. See below.
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;

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

  function renderLab(lab: (typeof labSummaries)[number]) {
    return (
      <CommandItem
        key={lab.slug}
        value={lab.title}
        keywords={[lab.category, lab.blurb, lab.slug]}
        onSelect={() => go(() => navigate({ to: "/lab/$slug", params: { slug: lab.slug } }))}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-foreground">{lab.title}</span>
          <span className="block truncate text-xs text-muted-foreground">{lab.blurb}</span>
        </span>
        <span className="ml-2 hidden shrink-0 font-code text-xs text-muted-foreground sm:inline">
          {lab.category}
        </span>
      </CommandItem>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Fresh box every time it opens, rather than yesterday's query.
        if (!next) setQuery("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="overflow-hidden p-0">
        <DialogTitle className="sr-only">Search labs</DialogTitle>
        <Command filter={scoreLab} className="[&_[cmdk-group-heading]]:px-2">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={`Search ${labSummaries.length} labs…`}
          />
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

            {/*
             * Flat while searching, grouped while browsing.
             *
             * cmdk sorts items within a group by score but its group reordering
             * silently no-ops in this setup, so with one group per category the
             * best match for "cache" sat under two System Design labs purely
             * because System Design is declared earlier. One group means the
             * score is the order. Each row still names its category, so nothing
             * is lost — and with an empty query the category headings come back,
             * because 127 labs in one alphabetical list is not browsable.
             */}
            {searching ? (
              <CommandGroup heading="Labs">{labSummaries.map(renderLab)}</CommandGroup>
            ) : (
              groups.map((group) => (
                <CommandGroup key={group.category} heading={group.category}>
                  {group.labs.map(renderLab)}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
