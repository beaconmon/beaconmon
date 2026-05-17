'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { AuthLogo, PrimaryBtn } from '@/components/auth';

const RESEND_COOLDOWN = 45;

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  async function handleResend() {
    if (!email || countdown > 0) return;
    setError('');
    setResending(true);
    const res = await authClient.signIn.magicLink({ email });
    setResending(false);
    if (res.error) {
      setError(res.error.message ?? 'Could not resend. Try again.');
    } else {
      setResent(true);
      setCountdown(RESEND_COOLDOWN);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-6 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <AuthLogo />

        {/* Pulsing mail icon */}
        <div className="flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-brand-green/20 bg-brand-green/10">
            <span className="absolute h-20 w-20 rounded-full border border-brand-green/20 animate-logo-pulse" />
            <Mail className="h-8 w-8 text-brand-green-ink" />
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-brand-text">Check your inbox</h1>
          <p className="mt-2 text-sm text-brand-dim">
            We sent a magic link to{' '}
            <span className="font-mono text-brand-text">{email || 'your email'}</span>
          </p>
        </div>

        {/* Mock inbox preview */}
        <div className="rounded-xl border border-brand-line bg-brand-bg2 p-4 text-left space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green/20">
              <span className="h-2 w-2 rounded-full bg-brand-green" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-brand-text truncate">Beaconmon</p>
                <p className="shrink-0 text-[10px] text-brand-muted">just now</p>
              </div>
              <p className="mt-0.5 text-xs text-brand-dim truncate">Sign in to Beaconmon →</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-brand-muted">
          The link expires in 10 minutes. Check your spam folder if you don&apos;t see it.
        </p>

        {/* Resend */}
        <div className="space-y-3">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}
          <PrimaryBtn onClick={handleResend} disabled={resending || countdown > 0}>
            {resending
              ? 'Sending…'
              : resent && countdown > 0
              ? `Resend link (${countdown}s)`
              : countdown > 0
              ? `Resend in ${countdown}s`
              : 'Resend magic link'}
          </PrimaryBtn>

          <Link
            href="/sign-in"
            className="block text-sm text-brand-muted hover:text-brand-green-ink transition-colors"
          >
            ← Wrong email? Go back
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
