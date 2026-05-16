'use client';

import { Telescope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradePrompt } from '@/components/ui/upgrade-prompt';
import type { PlanTier } from '@beaconmon/types';
import { PLAN_LIMITS } from '@beaconmon/types';

interface CompetitorEmptyStateProps {
  plan: PlanTier;
  competitorCount: number;
  onAddClick: () => void;
}

export function CompetitorEmptyState({ plan, competitorCount, onAddClick }: CompetitorEmptyStateProps) {
  const limit = PLAN_LIMITS[plan].competitorMonitors;
  const atLimit = limit !== -1 && competitorCount >= limit;

  if (atLimit) {
    return (
      <div className="p-4">
        <UpgradePrompt currentPlan={plan} limitReached="competitor monitors" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-brand-bg3 p-4 mb-4">
        <Telescope className="h-8 w-8 text-brand-muted" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Track competitor changes</h3>
      <p className="text-sm text-brand-muted mb-6 max-w-sm">
        Add a competitor URL and choose what to watch — pricing, features, changelog, or legal pages.
        You&apos;ll get a daily digest whenever something changes.
      </p>
      <Button onClick={onAddClick}>Add competitor</Button>
    </div>
  );
}
