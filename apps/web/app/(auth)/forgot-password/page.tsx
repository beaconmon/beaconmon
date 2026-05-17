'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import {
  AuthShell,
  AuthPanel,
  AuthLogo,
  Label,
  Input,
  PrimaryBtn,
  ErrorBanner,
} from '@/components/auth';

function SentState({ email }: { email: string }) {
  return (
    <div className="space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-green/20 bg-brand-green/10">
        <span className="h-3 w-3 rounded-full bg-brand-green animate-blip" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-brand-text">Reset link sent</h2>
        <p className="mt-1.5 text-sm text-brand-dim">
          We emailed a password reset link to{' '}
          <span className="font-mono text-brand-text">{email}</span>. It expires in 1 hour.
        </p>
      </div>
      <p className="text-xs text-brand-muted">
        Didn&apos;t receive it? Check your spam folder or{' '}
        <button
          className="text-brand-green-ink hover:underline"
          onClick={() => window.location.reload()}
        >
          try again
        </button>
        .
      </p>
      <Link href="/sign-in" className="block text-sm text-brand-dim hover:text-brand-green-ink transition-colors">
        ← Back to sign in
      </Link>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    });
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? 'Could not send reset email. Try again.');
    } else {
      setSent(true);
    }
  }

  return (
    <AuthShell panel={<AuthPanel variant="reset" />}>
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="mb-2">
          <AuthLogo />
        </div>

        {sent ? (
          <SentState email={email} />
        ) : (
          <>
            <div>
              <h1 className="text-xl font-bold text-brand-text">Reset your password</h1>
              <p className="mt-1 text-sm text-brand-dim">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <ErrorBanner message={error} />}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <PrimaryBtn type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </PrimaryBtn>
            </form>

            {/* No-password tip */}
            <div className="rounded-lg border border-brand-line bg-brand-bg2 p-3.5 flex items-start gap-3">
              <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-brand-dim" />
              <div>
                <p className="text-xs font-medium text-brand-dim">Prefer no passwords?</p>
                <p className="mt-0.5 text-[11px] text-brand-muted">
                  Use a{' '}
                  <Link href="/sign-in" className="text-brand-green-ink hover:underline">
                    magic link
                  </Link>{' '}
                  to sign in without a password.
                </p>
              </div>
            </div>

            <Link href="/sign-in" className="block text-center text-xs text-brand-muted hover:text-brand-green-ink transition-colors">
              ← Back to sign in
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
