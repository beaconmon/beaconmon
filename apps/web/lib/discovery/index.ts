import 'server-only';
import { fetchSitemapUrls } from './sitemap';
import { buildSuggestions, type Suggestion } from './build-suggestions';

export interface DiscoverContext {
  existingUrls: string[];
  planMonitorLimit: number;
  existingMonitorCount: number;
  planMinIntervalSeconds: number;
}

export interface DiscoverResult {
  domain: string;
  suggestions: Suggestion[];
  warnings: string[];
  cappedByPlan: boolean;
  sitemapUrls?: string[];
}

export async function discoverMonitors(
  domain: string,
  ctx: DiscoverContext,
  signal?: AbortSignal
): Promise<DiscoverResult> {
  const warnings: string[] = [];
  const sitemap = await fetchSitemapUrls(domain, signal);
  warnings.push(...sitemap.warnings);

  const { suggestions, cappedByPlan, apexAlreadyMonitored } = buildSuggestions({
    domain,
    sitemapUrls: sitemap.urls,
    existingUrls: ctx.existingUrls,
    planMonitorLimit: ctx.planMonitorLimit,
    existingMonitorCount: ctx.existingMonitorCount,
    planMinIntervalSeconds: ctx.planMinIntervalSeconds,
  });

  if (apexAlreadyMonitored) {
    warnings.push("You already monitor this domain — we skipped the homepage check.");
  }
  if (cappedByPlan) {
    warnings.push("Suggestions were capped to fit your plan's monitor limit.");
  }

  return { domain, suggestions, warnings, cappedByPlan, sitemapUrls: sitemap.urls };
}

export type { Suggestion } from './build-suggestions';
export { buildSuggestions, buildAiSuggestions } from './build-suggestions';
export type { AiIntent, BuildAiSuggestionsInput } from './build-suggestions';
export { prioritizeUrls } from './prioritize';
export { fetchSitemapUrls, parseSitemapDirectives, parseSitemapXml } from './sitemap';
export { fetchPageHtml } from './page-fetch';
export { pickBestSelector } from './selector-validate';
export type { SelectorValidation } from './selector-validate';
