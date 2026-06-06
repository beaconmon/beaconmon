'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Mail } from 'lucide-react';

function UnsubscribedContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const category = searchParams.get('category') ?? 'lifecycle';
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? 'Something went wrong. Try again.');
        return;
      }
      setDone(true);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setConfirming(false);
    }
  }

  const categoryLabel = category === 'lifecycle' ? 'product and trial' : category;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        {done || !token ? (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-brand-green-ink" />
            <h1 className="text-2xl font-semibold text-brand-text">
              {done ? 'Unsubscribed' : 'Already unsubscribed'}
            </h1>
            <p className="text-sm text-brand-dim">
              You will no longer receive {categoryLabel} emails from Beaconmon.
            </p>
            <Link
              href="/monitors"
              className="inline-block rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-brand-green-fg hover:bg-brand-green/90"
            >
              Go to dashboard
            </Link>
          </>
        ) : (
          <>
            <Mail className="mx-auto h-12 w-12 text-brand-muted" />
            <h1 className="text-2xl font-semibold text-brand-text">Unsubscribe from emails?</h1>
            <p className="text-sm text-brand-dim">
              You are about to unsubscribe from {categoryLabel} emails. This will stop all emails
              in this category.
            </p>
            {error && (
              <p className="rounded-lg border border-red-400/30 bg-red-50/10 px-4 py-2 text-sm text-red-500">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => void handleConfirm()}
                disabled={confirming}
                className="rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-brand-green-fg transition-opacity hover:bg-brand-green/90 disabled:opacity-50"
              >
                {confirming ? 'Unsubscribing...' : 'Confirm unsubscribe'}
              </button>
              <Link
                href="/monitors"
                className="text-sm text-brand-muted transition-colors hover:text-brand-dim"
              >
                Cancel, take me back
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribedPage() {
  return (
    <Suspense>
      <UnsubscribedContent />
    </Suspense>
  );
}
