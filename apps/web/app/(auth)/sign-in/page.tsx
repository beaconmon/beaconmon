'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { authClient } from '@/lib/auth-client';
import {
  AuthShell,
  AuthPanel,
  AuthLogo,
  Label,
  Input,
  PasswordInput,
  PrimaryBtn,
  Divider,
  ErrorBanner,
  SocialButtons,
} from '@/components/auth';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/monitors';
  const resetSuccess = searchParams.get('reset') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? 'Invalid email or password.');
    } else {
      router.push(redirect);
    }
  }

  async function handleSocial(provider: 'google' | 'github') {
    setLoading(true);
    await authClient.signIn.social({ provider, callbackURL: redirect });
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setLoading(true);
    const res = await authClient.signIn.magicLink({ email, callbackURL: redirect });
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? 'Could not send magic link.');
    } else {
      setMagicSent(true);
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    }
  }

  const hasError = Boolean(error);

  return (
    <AuthShell panel={<AuthPanel variant="welcome" />}>
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="mb-2">
          <AuthLogo />
        </div>

        <div>
          <h1 className="text-xl font-bold text-brand-text">Sign in to Beaconmon</h1>
          <p className="mt-1 text-sm text-brand-dim">
            {resetSuccess ? 'Password updated. Sign in below.' : 'Monitor smarter, respond faster.'}
          </p>
        </div>

        <SocialButtons onGoogle={() => handleSocial('google')} onGitHub={() => handleSocial('github')} loading={loading} />

        <Divider />

        <form onSubmit={handleSubmit} className="space-y-4">
          {hasError && <ErrorBanner message={error} />}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              error={hasError}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-brand-muted hover:text-brand-green transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              error={hasError}
              required
            />
          </div>

          <PrimaryBtn type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </PrimaryBtn>
        </form>

        <Divider label="or sign in without a password" />

        <button
          type="button"
          onClick={handleMagicLink}
          disabled={loading || magicSent}
          className="w-full text-center text-sm text-brand-dim hover:text-brand-green transition-colors disabled:opacity-50"
        >
          {magicSent ? 'Magic link sent — check your inbox' : 'Send me a magic link →'}
        </button>

        <p className="text-center text-xs text-brand-muted">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-brand-green hover:underline">
            Start free →
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
