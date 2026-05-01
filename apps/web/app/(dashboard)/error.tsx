'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/10">
          <AlertTriangle className="h-6 w-6 text-brand-red" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-brand-text">Something went wrong</h2>
          <p className="mt-1 text-sm text-brand-muted">
            We hit an unexpected error and the team has been notified.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-[10px] text-brand-muted">
              ref: {error.digest}
            </p>
          )}
        </div>
        <Button onClick={reset} className="gap-2">
          <RefreshCcw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    </div>
  );
}
