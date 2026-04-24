'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import {
  AuthShell,
  AuthPanel,
  AuthLogo,
  Label,
  PasswordInput,
  PasswordStrength,
  PrimaryBtn,
  ErrorBanner,
  FieldNote,
} from '@/components/auth';
import { cn } from '@/lib/utils';

const REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number or symbol', test: (p: string) => /[0-9!@#$%^&*]/.test(p) },
];

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!token) {
      setError('Invalid or expired reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    const res = await authClient.resetPassword({ newPassword: password, token });
    setLoading(false);

    if (res.error) {
      setError(res.error.message ?? 'Could not reset password. The link may have expired.');
    } else {
      router.push('/sign-in?reset=1');
    }
  }

  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <AuthShell panel={<AuthPanel variant="reset" />}>
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="mb-2">
          <AuthLogo />
        </div>

        <div>
          <h1 className="text-xl font-bold text-brand-text">Set new password</h1>
          <p className="mt-1 text-sm text-brand-dim">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorBanner message={error} />}

          <div>
            <Label htmlFor="password">New password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordStrength password={password} />
          </div>

          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={mismatch}
              required
            />
            {mismatch && <FieldNote error>Passwords do not match</FieldNote>}
          </div>

          {/* Requirements checklist */}
          <ul className="space-y-1.5">
            {REQUIREMENTS.map((req) => {
              const met = req.test(password);
              return (
                <li key={req.label} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                      met
                        ? 'border-brand-green bg-brand-green'
                        : 'border-brand-line bg-brand-bg2'
                    )}
                  >
                    {met && <Check className="h-2.5 w-2.5 text-brand-bg" strokeWidth={3} />}
                  </span>
                  <span className={cn('text-xs transition-colors', met ? 'text-brand-green' : 'text-brand-muted')}>
                    {req.label}
                  </span>
                </li>
              );
            })}
          </ul>

          <PrimaryBtn type="submit" disabled={loading || !token}>
            {loading ? 'Saving…' : 'Set new password'}
          </PrimaryBtn>
        </form>

        <Link href="/sign-in" className="block text-center text-xs text-brand-muted hover:text-brand-green transition-colors">
          ← Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
