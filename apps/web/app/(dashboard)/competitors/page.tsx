'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QueryState } from '@/components/dashboard/query-state';
import { CompetitorTimeline } from '@/components/competitors/competitor-timeline';
import { CompetitorEmptyState } from '@/components/competitors/competitor-empty-state';
import { AddCompetitorWizard } from '@/components/competitors/add-competitor-wizard';
import { useCompetitorFeed, useInvalidateCompetitorFeed } from '@/lib/hooks/use-competitors';
import { useSession } from '@/lib/hooks/use-session';

export default function CompetitorsPage() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { data: feed, isLoading, isError, error, refetch } = useCompetitorFeed();
  const { data: session } = useSession();
  const invalidateFeed = useInvalidateCompetitorFeed();

  const plan = session?.plan ?? 'free';
  const items = feed?.items ?? [];
  const competitorCount = feed?.activeCount ?? 0;

  function handleCreated() {
    void invalidateFeed();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">Competitors</h1>
          <p className="mt-0.5 text-sm text-brand-muted">
            Track changes on competitor pricing, features, changelog, and legal pages.
          </p>
        </div>
        <Button
          onClick={() => setWizardOpen(true)}
          className="gap-1.5"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add competitor
        </Button>
      </div>

      {/* Feed */}
      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        skeletonRows={5}
      >
        {items.length === 0 ? (
          <CompetitorEmptyState
            plan={plan}
            competitorCount={competitorCount}
            onAddClick={() => setWizardOpen(true)}
          />
        ) : (
          <CompetitorTimeline items={items} />
        )}
      </QueryState>

      <AddCompetitorWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        plan={plan}
        onCreated={handleCreated}
      />
    </div>
  );
}
