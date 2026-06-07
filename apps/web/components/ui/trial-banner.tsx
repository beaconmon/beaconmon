'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { PlanTier } from '@beaconmon/types';

const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const STORAGE_KEYS = {
  inTrialPositive: 'trial_banner_positive_dismissed',
  inTrialCountdown: 'trial_banner_countdown_dismissed',
  expired: 'trial_banner_expired_dismissed',
} as const;

export type BannerState = 'inTrialPositive' | 'inTrialCountdown' | 'expired' | 'none';

export function computeBannerState(
  effectivePlan: PlanTier,
  trialEndsAt: string | null,
  now = Date.now(),
): BannerState {
  if (!trialEndsAt) return 'none';
  const expiryMs = new Date(trialEndsAt).getTime();
  if (!Number.isFinite(expiryMs)) return 'none';

  if (effectivePlan !== 'free') {
    if (expiryMs < now) return 'none';
    const daysLeft = Math.ceil((expiryMs - now) / (24 * 60 * 60 * 1000));
    return daysLeft > 7 ? 'inTrialPositive' : 'inTrialCountdown';
  }

  if (expiryMs < now) return 'expired';
  return 'none';
}

function isDismissed(key: string, now: number): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const { dismissed } = JSON.parse(raw) as { dismissed: number };
    return now - dismissed < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

function persistDismiss(key: string) {
  try {
    localStorage.setItem(key, JSON.stringify({ dismissed: Date.now() }));
  } catch {
    // ignore storage errors
  }
}

interface TrialBannerProps {
  plan: PlanTier;
  trialEndsAt: string | null;
}

export function TrialBanner({ plan, trialEndsAt }: TrialBannerProps) {
  type DismissMap = Partial<Record<Exclude<BannerState, 'none'>, boolean>>;
  const [{ now, dismissed }, setDismissedState] = useState<{ now: number; dismissed: DismissMap }>(() => {
    const ts = Date.now();
    return {
      now: ts,
      dismissed: typeof window !== 'undefined'
        ? {
            inTrialPositive: isDismissed(STORAGE_KEYS.inTrialPositive, ts),
            inTrialCountdown: isDismissed(STORAGE_KEYS.inTrialCountdown, ts),
            expired: isDismissed(STORAGE_KEYS.expired, ts),
          }
        : {},
    };
  });
  const computed = computeBannerState(plan, trialEndsAt, now);
  const bannerState: BannerState =
    computed === 'none' || dismissed[computed as Exclude<BannerState, 'none'>] ? 'none' : computed;
  const daysLeft =
    bannerState === 'inTrialCountdown' && trialEndsAt
      ? Math.ceil((new Date(trialEndsAt).getTime() - now) / (24 * 60 * 60 * 1000))
      : 0;

  function dismissBanner(state: Exclude<BannerState, 'none'>) {
    persistDismiss(STORAGE_KEYS[state]);
    setDismissedState((prev) => ({ ...prev, dismissed: { ...prev.dismissed, [state]: true } }));
  }

  if (bannerState === 'inTrialPositive') {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800">
        <span>
          You&apos;re on a Growth trial. Explore{' '}
          <Link href="/wire" className="font-medium underline hover:no-underline">
            competitor intelligence
          </Link>{' '}
          and AI-powered insights while your trial is active.
        </span>
        <button
          onClick={() => dismissBanner('inTrialPositive')}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 hover:bg-blue-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (bannerState === 'inTrialCountdown') {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
        <span>
          <span className="font-semibold">{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span> in your Growth trial.{' '}
          <Link href="/pricing?plan=growth" className="font-medium underline hover:no-underline">
            Convert to Growth
          </Link>{' '}
          to keep your monitors and intelligence running.
        </span>
        <button
          onClick={() => dismissBanner('inTrialCountdown')}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 hover:bg-amber-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (bannerState === 'expired') {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
        <span>
          Your Growth trial has ended.{' '}
          <Link href="/pricing?plan=growth" className="font-medium underline hover:no-underline">
            Resume Growth
          </Link>{' '}
          to keep all your monitors running.
        </span>
        <button
          onClick={() => dismissBanner('expired')}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 hover:bg-amber-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return null;
}
