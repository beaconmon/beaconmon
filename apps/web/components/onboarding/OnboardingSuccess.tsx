'use client';

import { Loader2, CheckCircle2 } from 'lucide-react';

export interface CatalogPreviewResult {
  domain: string;
  productCount: number;
  recentChanges30d: number;
  error?: string;
}

function computeHoursPerWeek(totalRecentChanges30d: number): number {
  return Math.max(0.5, Math.round((totalRecentChanges30d / 30) * 7 * 0.05 * 2) / 2);
}

function formatHours(h: number): string {
  if (h < 1) return '30 minutes';
  if (h === 1) return '1 hour';
  return `${h} hours`;
}

interface OnboardingSuccessProps {
  catalogPreviewLoading: boolean;
  catalogPreview: CatalogPreviewResult[] | null;
  onDone: () => void;
}

export function OnboardingSuccess({ catalogPreviewLoading, catalogPreview, onDone }: OnboardingSuccessProps) {
  const validResults = (catalogPreview ?? []).filter((r) => !r.error);
  const totalProducts = validResults.reduce((sum, r) => sum + r.productCount, 0);
  const totalChanges = validResults.reduce((sum, r) => sum + r.recentChanges30d, 0);
  const hoursPerWeek = computeHoursPerWeek(totalChanges);
  const showRoi = validResults.length > 0 && totalProducts > 0;

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/15">
          <CheckCircle2 className="h-8 w-8 text-brand-green-ink" />
        </div>
        <h1 className="text-3xl font-semibold italic leading-tight text-brand-text">
          All set. Monitoring starts now.
        </h1>
        <p className="text-sm text-brand-dim">
          Your first checks run within the next 5 minutes.
        </p>
      </div>

      {catalogPreviewLoading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-brand-line bg-brand-bg2 p-5">
          <Loader2 className="h-4 w-4 animate-spin text-brand-muted" />
          <span className="text-sm text-brand-muted">Counting competitor products...</span>
        </div>
      )}

      {!catalogPreviewLoading && showRoi && (
        <div className="rounded-lg border border-brand-green/30 bg-brand-green/5 p-5">
          <p className="text-sm font-medium text-brand-text">
            Tracking {validResults.length} competitor{validResults.length !== 1 ? 's' : ''} with{' '}
            {totalProducts.toLocaleString()} products. About {formatHours(hoursPerWeek)} of manual
            checking saved per week.
          </p>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button
          onClick={onDone}
          className="flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90"
          style={{
            background: 'var(--brand-green, #00e57a)',
            boxShadow: '0 0 24px rgba(0,229,122,0.35)',
          }}
        >
          Go to dashboard
          <span className="ml-0.5">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
