'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

const STORAGE_KEY = 'trial_banner_dismissed';
const TRIAL_DAYS = 14;
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface TrialBannerProps {
  plan: string;
  teamCreatedAt: string; // ISO date string
}

export function TrialBanner({ plan, teamCreatedAt }: TrialBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (plan !== 'free') return;

    const createdAt = new Date(teamCreatedAt).getTime();
    if (!Number.isFinite(createdAt)) return; // invalid date, don't show banner
    const trialExpiry = createdAt + TRIAL_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() <= trialExpiry) return; // still in trial, don't show

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { dismissed } = JSON.parse(raw) as { dismissed: number };
        if (Date.now() - dismissed < DISMISS_TTL_MS) return; // dismissed recently
      }
    } catch {
      // ignore parse errors
    }

    setVisible(true);
  }, [plan, teamCreatedAt]);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissed: Date.now() }));
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
      <span>
        Your 14-day trial has ended.{' '}
        <Link href="/settings/billing" className="font-medium underline hover:no-underline">
          Upgrade to Pro
        </Link>{' '}
        to keep all your monitors running.
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded p-0.5 hover:bg-amber-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
