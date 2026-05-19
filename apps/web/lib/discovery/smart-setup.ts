import 'server-only';
import * as cheerio from 'cheerio';
import { createAiProvider, classifySite, proposeSelectors } from '@beaconmon/ai';
import type { ClassifyOutput } from '@beaconmon/ai';
import { fetchPageHtml } from './page-fetch';
import { pickBestSelector } from './selector-validate';
import { buildAiSuggestions } from './build-suggestions';
import type { DiscoverResult, Suggestion } from './index';
import { logger } from '@/lib/logger';
import { getPostHogClient } from '@/lib/posthog-server';

export interface SmartSetupBudgets {
  classifyMs: number;
  perFetchMs: number;
  totalEnrichMs: number;
}

export interface SmartSetupContext {
  teamId: string;
  existingUrls: string[];
  planMonitorLimit: number;
  existingMonitorCount: number;
  planMinIntervalSeconds: number;
}

export interface SmartSetupInput {
  domain: string;
  baseline: DiscoverResult;
  ctx: SmartSetupContext;
  signal?: AbortSignal;
  budgets: SmartSetupBudgets;
}

export interface AiClassification {
  category: ClassifyOutput['category'];
  confidence: number;
}

export interface SmartSetupSuccess {
  suggestions: Suggestion[];
  aiClassification: AiClassification;
  aiModel: string;
  aiDurationMs: number;
  degraded: false;
}

export interface SmartSetupDegraded {
  degraded: true;
}

export type SmartSetupResult = SmartSetupSuccess | SmartSetupDegraded;

export async function runSmartSetupOrDegrade(input: SmartSetupInput): Promise<SmartSetupResult> {
  const { domain, baseline, ctx, signal, budgets } = input;
  const startMs = Date.now();

  try {
    logger.info({ service: 'web', teamId: ctx.teamId, domain }, 'smart_setup: invoked');
    _capturePosthog(ctx.teamId, 'smart_setup.invoked', { domain });

    // Phase 1: fetch homepage HTML (race against 5s)
    const html = await raceTimeout(
      fetchPageHtml(`https://${domain}`, domain, signal),
      5_000
    );
    if (!html) {
      logger.warn({ service: 'web', teamId: ctx.teamId, domain }, 'smart_setup: homepage fetch failed');
      _capturePosthog(ctx.teamId, 'smart_setup.degraded', { domain, reason: 'homepage_fetch' });
      return { degraded: true };
    }

    const homepageText = extractText(html);
    const urlsForClassify = [
      `https://${domain}`,
      ...(baseline.sitemapUrls ?? baseline.suggestions.map((s) => s.url)),
    ].slice(0, 200);

    // Phase 2: classify site (race against classifyMs)
    const provider = createAiProvider({
      provider: (process.env.AI_PROVIDER ?? 'noop') as 'anthropic' | 'openai' | 'deepseek' | 'noop',
      apiKey: process.env.AI_API_KEY,
      model: process.env.AI_MODEL,
    });

    const classifyResult = await raceTimeout(
      classifySite(provider, { homepageText, urls: urlsForClassify }),
      budgets.classifyMs
    );
    if (!classifyResult) {
      logger.warn({ service: 'web', teamId: ctx.teamId, domain }, 'smart_setup: classify timed out');
      _capturePosthog(ctx.teamId, 'smart_setup.degraded', { domain, reason: 'classify_timeout' });
      return { degraded: true };
    }

    logger.info(
      {
        service: 'web',
        teamId: ctx.teamId,
        domain,
        category: classifyResult.data.category,
        intents: classifyResult.data.intents.length,
      },
      'smart_setup: classified'
    );
    _capturePosthog(ctx.teamId, 'smart_setup.classified', {
      domain,
      category: classifyResult.data.category,
      confidence: classifyResult.data.confidence,
      intent_count: classifyResult.data.intents.length,
    });

    // Phase 3: merge AI intents with baseline
    const merged = buildAiSuggestions({
      baselineSuggestions: baseline.suggestions,
      domain,
      aiIntents: classifyResult.data.intents,
      existingUrls: ctx.existingUrls,
      planMonitorLimit: ctx.planMonitorLimit,
      existingMonitorCount: ctx.existingMonitorCount,
      planMinIntervalSeconds: ctx.planMinIntervalSeconds,
    });

    // Phase 4: enrich content intents with CSS selectors
    const enrichDeadline = Date.now() + budgets.totalEnrichMs;
    const contentIntents = merged.filter(
      (s) => s.type === 'content' && (s.source === 'ai' || s.source === 'ai+sitemap')
    );

    const enriched = await Promise.allSettled(
      contentIntents.map(async (intent) => {
        const remaining = enrichDeadline - Date.now();
        if (remaining <= 0) return intent;

        const pageHtml = await raceTimeout(
          fetchPageHtml(intent.url, domain, signal),
          Math.min(budgets.perFetchMs, remaining)
        );
        if (!pageHtml) return intent;

        const afterFetchRemaining = enrichDeadline - Date.now();
        if (afterFetchRemaining <= 0) return intent;

        const selectorResult = await raceTimeout(
          proposeSelectors(provider, { pageHtml, intentName: intent.name }),
          afterFetchRemaining
        );
        if (!selectorResult) return intent;

        const validation = pickBestSelector(pageHtml, selectorResult.data.candidates);
        return {
          ...intent,
          selectorCandidates: selectorResult.data.candidates,
          selectorChosen: validation.chosen,
          generatedAt: new Date().toISOString(),
        };
      })
    );

    // Merge enriched results back into the suggestions list
    const enrichedMap = new Map<string, Suggestion>();
    let enrichedCount = 0;
    for (const result of enriched) {
      if (result.status === 'fulfilled') {
        const s = result.value;
        enrichedMap.set(`${s.type}:${s.url}`, s);
        if (s.selectorCandidates) enrichedCount += 1;
      }
    }

    const finalSuggestions = merged.map((s) => enrichedMap.get(`${s.type}:${s.url}`) ?? s);

    const aiDurationMs = Date.now() - startMs;
    logger.info(
      { service: 'web', teamId: ctx.teamId, domain, contentIntents: contentIntents.length, enrichedCount, aiDurationMs },
      'smart_setup: enriched'
    );
    _capturePosthog(ctx.teamId, 'smart_setup.enriched', {
      domain,
      content_intents: contentIntents.length,
      enriched_count: enrichedCount,
      duration_ms: aiDurationMs,
    });

    return {
      suggestions: finalSuggestions,
      aiClassification: {
        category: classifyResult.data.category,
        confidence: classifyResult.data.confidence,
      },
      aiModel: classifyResult.model,
      aiDurationMs,
      degraded: false,
    };
  } catch (err) {
    logger.error({ service: 'web', teamId: ctx.teamId, domain, err }, 'smart_setup: unexpected error');
    _capturePosthog(ctx.teamId, 'smart_setup.failed', { domain, error: String(err) });
    return { degraded: true };
  }
}

async function raceTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout>;
  const sentinel = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });
  try {
    return await Promise.race([promise, sentinel]);
  } finally {
    clearTimeout(timer!);
  }
}

function extractText(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, noscript, link, meta').remove();

  const title = $('title').text().trim();
  const navLinks = $('nav a, header a')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 20);
  const bodyText = $('main, [role="main"], article, .main, #main, body')
    .first()
    .text()
    .replace(/\s+/g, ' ')
    .trim();

  return [
    title ? `Title: ${title}` : '',
    navLinks.length > 0 ? `Navigation: ${navLinks.join(', ')}` : '',
    bodyText,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function _capturePosthog(teamId: string, event: string, properties: Record<string, unknown>): void {
  try {
    getPostHogClient().capture({ distinctId: teamId, event, properties });
  } catch {
    // PostHog not configured locally — non-fatal
  }
}
