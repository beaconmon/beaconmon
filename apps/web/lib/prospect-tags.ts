/**
 * Prospect tagging convention.
 *
 * Reuses Monitor.tags[] (existing column, no migration) to group competitor
 * monitors by the outreach target they're meant to inform. A monitor tagged
 * `prospect:lumi-skincare` belongs to the Lumi Skincare outreach thread; the
 * change digest groups all `prospect:lumi-skincare` monitors together so the
 * cold email writes itself.
 *
 * A monitor can carry at most one prospect tag in practice (the first one wins
 * in [[extractProspectSlug]]), but the array is not strictly enforced — manual
 * tag edits can produce zero or many, and the helpers handle both.
 */

export const PROSPECT_TAG_PREFIX = 'prospect:';

/** Lowercase, hyphenated brand slug. Matches what the user types into the tag input. */
export type ProspectSlug = string;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidProspectSlug(value: string): value is ProspectSlug {
  return SLUG_PATTERN.test(value) && value.length <= 60;
}

export function formatProspectTag(slug: ProspectSlug): string {
  return `${PROSPECT_TAG_PREFIX}${slug}`;
}

export function parseProspectTag(tag: string): ProspectSlug | null {
  if (!tag.startsWith(PROSPECT_TAG_PREFIX)) return null;
  const slug = tag.slice(PROSPECT_TAG_PREFIX.length);
  return isValidProspectSlug(slug) ? slug : null;
}

export function extractProspectSlug(tags: readonly string[]): ProspectSlug | null {
  for (const tag of tags) {
    const slug = parseProspectTag(tag);
    if (slug) return slug;
  }
  return null;
}

/** Turn a free-text brand name into a valid prospect slug ("Lumi Skincare" → "lumi-skincare"). */
export function slugifyProspect(name: string): ProspectSlug | null {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return isValidProspectSlug(slug) ? slug : null;
}

/** Group monitors by their prospect slug. Monitors with no prospect tag land under `null`. */
export function groupByProspect<T extends { tags: readonly string[] }>(
  monitors: readonly T[],
): Map<ProspectSlug | null, T[]> {
  const grouped = new Map<ProspectSlug | null, T[]>();
  for (const monitor of monitors) {
    const slug = extractProspectSlug(monitor.tags);
    const bucket = grouped.get(slug) ?? [];
    bucket.push(monitor);
    grouped.set(slug, bucket);
  }
  return grouped;
}
