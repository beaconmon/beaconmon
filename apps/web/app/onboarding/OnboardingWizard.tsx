'use client';

import { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { PLAN_LIMITS } from '@beaconmon/types';
import type { PlanTier } from '@beaconmon/types';
import { apiFetch } from '@/lib/api-fetch';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Step1Store } from '@/components/onboarding/Step1Store';
import { CompetitorsStep } from '@/components/onboarding/CompetitorsStep';
import { BundleStep, type BundleItem } from '@/components/onboarding/BundleStep';
import { OnboardingSuccess, type CatalogPreviewResult } from '@/components/onboarding/OnboardingSuccess';
import { ONBOARDING_TEMPLATES } from '@/lib/onboarding-templates';
import type { PlatformType } from '@/lib/onboarding-templates';
import Logo from '@/components/logo';

const catalogPreviewResultSchema = z.object({
  domain: z.string(),
  productCount: z.number(),
  recentChanges30d: z.number(),
  error: z.string().optional(),
});

const catalogPreviewResponseSchema = z.object({
  results: z.array(catalogPreviewResultSchema),
});

const discoverResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      type: z.enum(['http', 'ssl', 'domain', 'content']),
      url: z.string(),
      name: z.string(),
      defaultIntervalSeconds: z.number(),
      checkedByDefault: z.boolean(),
      source: z.enum(['sitemap', 'ai', 'ai+sitemap', 'apex']).optional(),
      selectorChosen: z.string().nullable().optional(),
    })
  ),
  degraded: z.boolean().optional(),
});

const suggestCompetitorsResponseSchema = z.object({
  suggestions: z.array(z.string()),
  degraded: z.boolean().optional(),
});

interface OnboardingWizardProps {
  teamId: string;
  plan: PlanTier;
  email: string | null;
}

const shopifyProductsSchema = z.object({
  products: z.array(z.object({ handle: z.string() })),
});

// Persists onboarding-skipped server-side (teams.onboarding_completed_at) so
// /today and /onboarding read the same fact instead of racing a client flag.
async function markOnboardingSkipped(): Promise<void> {
  try {
    await apiFetch('/api/onboarding/skip', { method: 'POST' });
  } catch {
    // best-effort — worst case the user is bounced back to onboarding once
  }
}

// Reads the competitor stashed by the public snapshot tool, normalized to a bare
// domain. Returns [] when absent or malformed. Pure read so it is safe to call
// from a useState initializer (idempotent under StrictMode double-invoke).
function readCompetitorSeed(): string[] {
  try {
    const seed = localStorage.getItem('beaconmon:competitor');
    if (!seed) return [];
    const domain = seed.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain) ? [domain] : [];
  } catch {
    return [];
  }
}

export function buildBundle(storeUrl: string, platform: PlatformType, productSlugs: string[]): BundleItem[] {
  const base = storeUrl.replace(/\/$/, '');
  const items = ONBOARDING_TEMPLATES[platform]
    .filter((t) => platform !== 'shopify' || (t.type !== 'ssl' && t.type !== 'domain'))
    .map((t, i): BundleItem => ({
      id: `${t.type}-${i}`,
      label: t.label,
      type: t.type,
      path: t.path,
      url: t.path === null ? storeUrl : `${base}${t.path}`,
      intervalSeconds: t.intervalSeconds,
      enabled: true,
      source: 'template',
      description: t.description,
    }));

  if (platform === 'shopify' && productSlugs.length > 0) {
    const products = productSlugs.map((slug, i): BundleItem => ({
      id: `product-${i}`,
      label: `Product: ${slug}`,
      type: 'content',
      path: `/products/${slug}`,
      url: `${base}/products/${slug}`,
      intervalSeconds: 300,
      enabled: true,
      source: 'template',
      description: 'Price + stock status',
    }));
    return [...items, ...products];
  }

  return items;
}

function discoverDescription(type: string): string {
  if (type === 'ssl')    return 'Auto-renews 30 days before expiry';
  if (type === 'domain') return 'Reminds you before lapse';
  if (type === 'http')   return 'Uptime check';
  return 'Content change detection';
}

function mapDiscoverToBundle(
  suggestions: z.infer<typeof discoverResponseSchema>['suggestions']
): BundleItem[] {
  return suggestions.map((s, i): BundleItem => ({
    id: `discover-${i}`,
    label: s.name,
    type: s.type,
    path: (() => {
      try {
        return new URL(s.url).pathname || null;
      } catch {
        return null;
      }
    })(),
    url: s.url,
    intervalSeconds: s.defaultIntervalSeconds,
    enabled: s.checkedByDefault,
    source: s.source?.startsWith('ai') ? 'ai' : 'template',
    selectorChosen: s.selectorChosen,
    description: discoverDescription(s.type),
  }));
}

export function OnboardingWizard({ teamId, plan, email }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [storeUrl, setStoreUrl] = useState('');
  const [platform, setPlatform] = useState<PlatformType | null>(null);
  const [bundle, setBundle] = useState<BundleItem[]>([]);
  // Seed a competitor stashed by the public snapshot tool ("Watch this store").
  // Read in the initializer (idempotent) so it survives StrictMode; the key is
  // cleared in an effect below. localStorage is used rather than a query param
  // so the value survives the signup, social-auth, and /today hops.
  const [competitors, setCompetitors] = useState<string[]>(() => readCompetitorSeed());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [catalogPreviewLoading, setCatalogPreviewLoading] = useState(false);
  const [catalogPreview, setCatalogPreview] = useState<CatalogPreviewResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverDegraded, setDiscoverDegraded] = useState(false);
  const [competitorSuggestions, setCompetitorSuggestions] = useState<string[]>([]);
  const prefetchRef = useRef<{
    hostname: string;
    discover: Promise<z.infer<typeof discoverResponseSchema>>;
    competitors: Promise<z.infer<typeof suggestCompetitorsResponseSchema>>;
  } | null>(null);
  const bundleSourceRef = useRef<{ storeUrl: string; platform: string } | null>(null);

  // Clear the stashed competitor once seeded so a later onboarding does not reuse it.
  useEffect(() => {
    try {
      localStorage.removeItem('beaconmon:competitor');
    } catch {
      // localStorage unavailable — nothing to clear.
    }
  }, []);

  async function skip(): Promise<void> {
    await markOnboardingSkipped();
    router.push('/today');
  }

  function prefetchDiscover(hostname: string): void {
    const isAiPlan = plan === 'growth' || plan === 'scale';
    if (!isAiPlan) return;
    if (prefetchRef.current?.hostname === hostname) return;

    prefetchRef.current = {
      hostname,
      discover: apiFetch('/api/monitors/discover', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ domain: hostname }),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Discover API failed with status ${res.status}`);
        const data = await res.json();
        return discoverResponseSchema.parse(data);
      }),
      competitors: apiFetch('/api/onboarding/suggest-competitors', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ domain: hostname }),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Suggest competitors API failed with status ${res.status}`);
        const data = await res.json();
        return suggestCompetitorsResponseSchema.parse(data);
      }),
    };
  }

  // Step 1 → Step 2 (competitors). Kicks off both prefetches; competitor
  // suggestions fill in asynchronously so the transition is instant.
  async function goToStep2(): Promise<void> {
    const hostname = (() => {
      try { return new URL(storeUrl).hostname; }
      catch { return storeUrl; }
    })();

    prefetchDiscover(hostname);

    if (prefetchRef.current) {
      void prefetchRef.current.competitors
        .then((result) => {
          if (!result.degraded) setCompetitorSuggestions(result.suggestions);
        })
        .catch(() => {});
    }

    setStep(2);
  }

  // Step 2 → Step 3 (bundle). For AI plans, awaits the already-in-flight
  // discover promise and renders a loading skeleton while it resolves.
  // For free/starter, fetches products.json for Shopify slugs.
  // Skips recomputation only when the bundle is already built for the same store and platform.
  async function goToStep3(): Promise<void> {
    const currentPlatform = platform ?? 'other';
    const bundleCurrent =
      bundle.length > 0 &&
      bundleSourceRef.current?.storeUrl === storeUrl &&
      bundleSourceRef.current?.platform === currentPlatform;

    if (bundleCurrent) {
      setStep(3);
      setDiscoverLoading(false);
      return;
    }

    const isAiPlan = plan === 'growth' || plan === 'scale';
    setDiscoverDegraded(false);
    setDiscoverLoading(true);
    setStep(3);

    if (isAiPlan && prefetchRef.current) {
      try {
        const discoverResult = await prefetchRef.current.discover;
        const discovered = mapDiscoverToBundle(discoverResult.suggestions);
        const filtered = currentPlatform === 'shopify'
          ? discovered.filter((b) => b.type !== 'ssl' && b.type !== 'domain')
          : discovered;
        bundleSourceRef.current = { storeUrl, platform: currentPlatform };
        setBundle(filtered);
        setDiscoverDegraded(discoverResult.degraded === true);
      } catch {
        bundleSourceRef.current = { storeUrl, platform: currentPlatform };
        setBundle(buildBundle(storeUrl, currentPlatform, []));
        setDiscoverDegraded(true);
      }
    } else {
      let slugs: string[] = [];
      if (currentPlatform === 'shopify') {
        try {
          const hostname = new URL(storeUrl).hostname;
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), 3000);
          const res = await fetch(`https://${hostname}/products.json?limit=3`, {
            signal: controller.signal,
          });
          clearTimeout(t);
          if (res.ok) {
            const parsed = shopifyProductsSchema.safeParse(await res.json());
            if (parsed.success) {
              slugs = parsed.data.products.slice(0, 3).map((p) => p.handle);
            }
          }
        } catch {
          slugs = ['your-product-1', 'your-product-2', 'your-product-3'];
        }
      }
      bundleSourceRef.current = { storeUrl, platform: currentPlatform };
      setBundle(buildBundle(storeUrl, currentPlatform, slugs));
    }

    setDiscoverLoading(false);
  }

  async function handleSubmit(): Promise<void> {
    setError(null);
    setSubmitting(true);
    try {
      const limits = PLAN_LIMITS[plan];
      const minInterval = limits.checkIntervalSeconds;
      const clamp = (s: number) => Math.max(s, minInterval);

      const enabledBundle = bundle
        .filter((b) => b.enabled)
        .map((b) => ({
          name: b.label,
          url: b.url,
          type: b.type,
          intervalSeconds: clamp(b.intervalSeconds),
          ...(b.selectorChosen ? { config: { selectorChosen: b.selectorChosen } } : {}),
        }));

      const competitorInputs = competitors.map((domain) => ({
        name: domain,
        url: `https://${domain}`,
        type: 'content' as const,
        intervalSeconds: clamp(300),
        isCompetitor: true,
      }));

      const total = enabledBundle.length + competitorInputs.length;

      if (total === 0) {
        await markOnboardingSkipped();
        router.push('/today');
        return;
      }

      if (limits.monitors !== -1 && total > limits.monitors) {
        setError(
          `This bundle would create ${total} monitors, exceeding your plan limit of ${limits.monitors}. Disable some monitors or upgrade.`
        );
        return;
      }

      const monitors = [...enabledBundle, ...competitorInputs];
      const bulkSource = bundle.some((b) => b.source === 'ai') ? 'smart-setup' : 'template';
      const res = await apiFetch('/api/monitors/bulk-create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ monitors, source: bulkSource }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? 'Something went wrong. Try again.');
        return;
      }

      // bulk-create already marks onboardingCompletedAt server-side.
      const shopifyCompetitors =
        platform === 'shopify' ? competitors.slice(0, 5) : [];

      if (shopifyCompetitors.length > 0) {
        setSubmitted(true);
        setCatalogPreviewLoading(true);
        try {
          const previewRes = await apiFetch('/api/onboarding/catalog-preview', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ domains: shopifyCompetitors }),
          });
          if (previewRes.ok) {
            const raw = await previewRes.json();
            const parsed2 = catalogPreviewResponseSchema.safeParse(raw);
            if (parsed2.success) setCatalogPreview(parsed2.data.results);
          }
        } catch {
          // fail silently, success screen still renders without ROI numbers
        }
        setCatalogPreviewLoading(false);
      } else {
        router.push('/today');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        background:
          'radial-gradient(ellipse at 50% -10%, rgba(0,229,122,0.07) 0%, transparent 60%), var(--brand-bg)',
      }}
    >
      {/* Topbar */}
      <header className="flex h-14 items-center justify-between border-b border-brand-line px-6">
        <div className="flex items-center gap-2">
          <Logo size={22} />
          <span className="text-sm font-semibold text-brand-text">Beaconmon</span>
        </div>
        <button
          onClick={skip}
          className="font-mono text-xs text-brand-muted transition-colors hover:text-brand-dim"
        >
          Save &amp; continue later
        </button>
      </header>

      {/* Progress bar */}
      {!submitted && (
        <div className="flex justify-center border-b border-brand-line/50 px-6 py-4">
          <div className="w-full max-w-[720px]">
            <StepIndicator current={step} />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex flex-1 items-start justify-center px-6 py-10 sm:items-center">
        <div className="w-full max-w-[760px]">
          {submitted ? (
            <OnboardingSuccess
              catalogPreviewLoading={catalogPreviewLoading}
              catalogPreview={catalogPreview}
              onDone={() => router.push('/today')}
            />
          ) : (
            <>
              {step === 1 && (
                <Step1Store
                  storeUrl={storeUrl}
                  onStoreUrlChange={setStoreUrl}
                  platform={platform}
                  onPlatformChange={setPlatform}
                  onContinue={goToStep2}
                  onSkip={skip}
                  onCheckSuccess={prefetchDiscover}
                />
              )}
              {step === 2 && (
                <CompetitorsStep
                  competitors={competitors}
                  onCompetitorsChange={setCompetitors}
                  plan={plan}
                  teamId={teamId}
                  email={email}
                  aiSuggestions={competitorSuggestions}
                  onBack={() => setStep(1)}
                  onContinue={goToStep3}
                  continuing={discoverLoading}
                />
              )}
              {step === 3 && (
                <BundleStep
                  storeUrl={storeUrl}
                  platform={platform ?? 'other'}
                  bundle={bundle}
                  onBundleChange={setBundle}
                  plan={plan}
                  loading={discoverLoading}
                  degraded={discoverDegraded}
                  onBack={() => setStep(2)}
                  onSkip={skip}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                  error={error}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Mono hint footer */}
      {!submitted && (
        <footer className="flex justify-center pb-8">
          <p className="font-mono text-[11px] text-brand-muted">
            Step {step} of 3 · No credit card, ever, even for the trial.
          </p>
        </footer>
      )}
    </div>
  );
}
