import type { LabCategory } from "@/content/types";

/**
 * Anchor id for a category section on `/lab`.
 *
 * The header and the mobile menu link straight into the browse grid, so the id
 * has to be derived the same way in both places. One function, imported by the
 * nav and by the page that renders the sections — a hand-written string in
 * either would rot the moment a category is renamed.
 */
export function categoryAnchor(category: LabCategory): string {
  return `cat-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}
