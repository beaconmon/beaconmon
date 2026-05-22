'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { PLAN_LIMITS } from '@beaconmon/types';
import type { PlanTier } from '@beaconmon/types';
import { apiFetch } from '@/lib/api-fetch';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Step1Store } from '@/components/onboarding/Step1Store';
import { Step2Bundle, type BundleItem } from '@/components/onboarding/Step2Bundle';
import { Step3Competitors } from '@/components/onboarding/Step3Competitors';
import { ONBOARDING_TEMPLATES } from '@/lib/onboarding-templates';
import type { PlatformType } from '@/lib/onboarding-templates';
import Logo from '@/components/logo';

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

function obKey(teamId: string): string {
  return `bm_ob_${teamId}`;
}

function markComplete(teamId: string): void {
  try {
    localStorage.setItem(obKey(teamId), JSON.stringify({ completedAt: new Date().toISOString() }));
  } catch {
    // localStorage unavailable
  }
}

function buildBundle(storeUrl: string, platform: PlatformType, productSlugs: string[]): BundleItem[] {
  const base = storeUrl.replace(/\/$/, '');
  const items = ONBOARDING_TEMPLATES[platform].map((t, i): BundleItem => ({
    id: `${t.type}-${i}`,
    label: t.label,
    type: t.type,
    path: t.path,
    url: t.path === null ? storeUrl : `${base}${t.path}`,
    intervalSeconds: t.intervalSeconds,
    enabled: true,
    source: 'template',
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
    }));
    return [...items, ...products];
  }

  return items;
}

function mapDiscoverToBundle(
  suggestions: z.infer<typeof discoverResponseSchema>['suggestions'],
  _storeUrl: string
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
  }));
}

export function OnboardingWizard({ teamId, plan, email }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [storeUrl, setStoreUrl] = useState('');
  const [platform, setPlatform] = useState<PlatformType | null>(null);
  const [bundle, setBundle] = useState<BundleItem[]>([]);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverDegraded, setDiscoverDegraded] = useState(false);
  const [competitorSuggestions, setCompetitorSuggestions] = useState<string[]>([]);
  const [ready] = useState(() => {
    try {
      return localStorage.getItem(obKey(teamId)) === null;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!ready) {
      router.replace('/monitors');
    }
  }, [ready, router]);

  function skip(): void {
    markComplete(teamId);
    router.push('/monitors');
  }

  async function goToStep2(): Promise<void> {
    const isAiPlan = plan === 'growth' || plan === 'scale';

    if (isAiPlan) {
      setDiscoverDegraded(false);
      setDiscoverLoading(true);
      setStep(2);

      const hostname = (() => {
        try {
          return new URL(storeUrl).hostname;
        } catch {
          return storeUrl;
        }
      })();

      const [discoverResult, competitorResult] = await Promise.allSettled([
        apiFetch('/api/monitors/discover', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ domain: hostname }),
        }).then(async (res) => {
          const data = await res.json();
          return discoverResponseSchema.parse(data);
        }),
        apiFetch('/api/onboarding/suggest-competitors', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ domain: hostname }),
        }).then(async (res) => {
          const data = await res.json();
          return suggestCompetitorsResponseSchema.parse(data);
        }),
      ]);

      if (discoverResult.status === 'fulfilled') {
        setBundle(mapDiscoverToBundle(discoverResult.value.suggestions, storeUrl));
        setDiscoverDegraded(discoverResult.value.degraded === true);
      } else {
        setBundle(buildBundle(storeUrl, platform ?? 'other', []));
        setDiscoverDegraded(true);
      }

      if (competitorResult.status === 'fulfilled' && !competitorResult.value.degraded) {
        setCompetitorSuggestions(competitorResult.value.suggestions);
      }

      setDiscoverLoading(false);
      return;
    }

    // Free/Starter: template path
    let slugs: string[] = [];
    if (platform === 'shopify') {
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
    setBundle(buildBundle(storeUrl, platform ?? 'other', slugs));
    setStep(2);
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
        markComplete(teamId);
        router.push('/monitors');
        return;
      }

      // Client-side plan limit check
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

      markComplete(teamId);
      router.push('/monitors');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-brand-line px-6">
        <div className="flex items-center gap-2">
          <Logo size={22} />
          <span className="text-sm font-semibold text-brand-text">Beaconmon</span>
        </div>
        <StepIndicator current={step} />
      </header>

      {/* Content */}
      <main className="flex flex-1 items-start justify-center p-6 sm:items-center">
        <div className="w-full max-w-2xl">
          {step === 1 && (
            <Step1Store
              storeUrl={storeUrl}
              onStoreUrlChange={setStoreUrl}
              platform={platform}
              onPlatformChange={setPlatform}
              onContinue={goToStep2}
              onSkip={skip}
            />
          )}
          {step === 2 && (
            <Step2Bundle
              platform={platform ?? 'other'}
              bundle={bundle}
              onBundleChange={setBundle}
              plan={plan}
              loading={discoverLoading}
              degraded={discoverDegraded}
              onBack={() => setStep(1)}
              onSkip={skip}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3Competitors
              competitors={competitors}
              onCompetitorsChange={setCompetitors}
              plan={plan}
              email={email}
              aiSuggestions={competitorSuggestions}
              onBack={() => setStep(2)}
              onSkip={skip}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={error}
            />
          )}
        </div>
      </main>
    </div>
  );
}
