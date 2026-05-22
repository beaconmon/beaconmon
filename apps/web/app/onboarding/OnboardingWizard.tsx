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
    }));
    return [...items, ...products];
  }

  return items;
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
      const res = await apiFetch('/api/monitors/bulk-create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ monitors, source: 'template' }),
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
