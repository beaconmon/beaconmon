'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

const EXPIRED_STORAGE_KEY = 'trial_banner_dismissed';
const COUNTDOWN_STORAGE_KEY = 'trial_countdown_dismissed';
const TRIAL_DAYS = 14;
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const COUNTDOWN_THRESHOLD_DAYS = 7;

interface TrialBannerProps {
  plan: string;
  teamCreatedAt: string; // ISO date string
}

export function TrialBanner({ plan, teamCreatedAt }: TrialBannerProps) {
  const [expiredVisible, setExpiredVisible] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (plan !== 'free') return;

    const createdAt = new Date(teamCreatedAt).getTime();
    if (!Number.isFinite(createdAt)) return;
    const trialExpiry = createdAt + TRIAL_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (now > trialExpiry) {
      // Trial expired
      try {
        const raw = localStorage.getItem(EXPIRED_STORAGE_KEY);
        if (raw) {
          const { dismissed } = JSON.parse(raw) as { dismissed: number };
          if (now - dismissed < DISMISS_TTL_MS) return;
        }
      } catch {
        // ignore parse errors
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpiredVisible(true);
      return;
    }

    // Trial still active — show countdown if within 7 days
    const remainingMs = trialExpiry - now;
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    if (remainingDays > COUNTDOWN_THRESHOLD_DAYS) return;

    try {
      const raw = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
      if (raw) {
        const { dismissed } = JSON.parse(raw) as { dismissed: number };
        if (now - dismissed < DISMISS_TTL_MS) return;
      }
    } catch {
      // ignore parse errors
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaysLeft(remainingDays);
  }, [plan, teamCreatedAt]);

  function dismissExpired() {
    try {
      localStorage.setItem(EXPIRED_STORAGE_KEY, JSON.stringify({ dismissed: Date.now() }));
    } catch {
      // ignore storage errors
    }
    setExpiredVisible(false);
  }

  function dismissCountdown() {
    try {
      localStorage.setItem(COUNTDOWN_STORAGE_KEY, JSON.stringify({ dismissed: Date.now() }));
    } catch {
      // ignore storage errors
    }
    setDaysLeft(null);
  }

  if (expiredVisible) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
        <span>
          Your 14-day trial has ended.{' '}
          <Link href="/settings/billing" className="font-medium underline hover:no-underline">
            Upgrade to Starter
          </Link>{' '}
          to keep all your monitors running.
        </span>
        <button
          onClick={dismissExpired}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 hover:bg-amber-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (daysLeft !== null) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
        <span>
          <span className="font-semibold">{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span> in your trial.{' '}
          <Link href="/settings/billing" className="font-medium underline hover:no-underline">
            Upgrade to Starter
          </Link>{' '}
          to keep your monitors running after it ends.
        </span>
        <button
          onClick={dismissCountdown}
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
