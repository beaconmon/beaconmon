'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { analytics } from '@/lib/analytics';
import {
  AuthShell,
  AuthPanel,
  AuthLogo,
  Label,
  Input,
  PasswordInput,
  PasswordStrength,
  PrimaryBtn,
  Divider,
  Checkbox,
  ErrorBanner,
  SocialButtons,
  getPasswordStrength,
  MIN_PASSWORD_STRENGTH,
} from '@/components/auth';

function SignUpForm() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';
  const planParam = searchParams.get('plan');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const passwordTooWeak = passwordStrength < MIN_PASSWORD_STRENGTH;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!agreed) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }
    if (passwordTooWeak) {
      setError('Please choose a stronger password (8+ characters with a mix of upper/lowercase, numbers, or symbols).');
      return;
    }
    setLoading(true);
    const res = await authClient.signUp.email({ name, email, password });
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? 'Sign up failed. Please try again.');
      analytics.signUpFailed({ method: 'email', error: res.error.code ?? 'signup_error' });
    } else {
      const allowedPlans = ['starter', 'growth', 'scale', 'business'] as const;
      if (allowedPlans.includes(planParam as (typeof allowedPlans)[number])) {
        const planRes = await fetch('/api/billing/set-trial-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planParam }),
        });
        if (!planRes.ok) {
          setError('Account created but failed to activate your trial plan. Please contact support.');
          setLoading(false);
          return;
        }
      }
      analytics.userSignedUp({ plan: planParam, method: 'email' });
      router.push('/overview');
    }
  }

  async function handleSocial(provider: 'google' | 'github') {
    analytics.signUpSocialAttempted({ provider });
    setLoading(true);
    try {
      await authClient.signIn.social({ provider, callbackURL: '/overview' });
    } catch {
      setLoading(false);
      analytics.signUpSocialFailed({ provider });
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setLoading(true);
    const res = await authClient.signIn.magicLink({ email, callbackURL: '/overview' });
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? 'Could not send magic link.');
      analytics.signUpFailed({ method: 'magic_link', error: res.error.code ?? 'magic_link_error' });
    } else {
      analytics.magicLinkSent({ context: 'sign_up' });
      setMagicSent(true);
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    }
  }

  return (
    <AuthShell panel={<AuthPanel variant="default" />}>
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="mb-2">
          <AuthLogo />
        </div>

        <div>
          <h1 className="text-xl font-bold text-brand-text">Create your account</h1>
          <p className="mt-1 text-sm text-brand-dim">
            {planParam === 'scale' || planParam === 'business' ? '14-day Scale trial · no card required' : planParam === 'growth' ? '14-day Growth trial · no card required' : planParam === 'starter' ? '14-day Starter trial · no card required' : '14-day Growth trial · no card required'}
          </p>
        </div>

        <SocialButtons onGoogle={() => handleSocial('google')} onGitHub={() => handleSocial('github')} loading={loading} />

        <Divider />

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorBanner message={error} />}

          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Work email</Label>
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

          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <PasswordStrength password={password} />
          </div>

          <Checkbox
            id="terms"
            checked={agreed}
            onChange={setAgreed}
            label={
              <>
                I agree to the{' '}
                <Link href="/terms" className="text-brand-green-ink hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-brand-green-ink hover:underline">
                  Privacy Policy
                </Link>
              </>
            }
          />

          <PrimaryBtn type="submit" disabled={loading || passwordTooWeak || !agreed}>
            {loading ? 'Creating account…' : 'Create account'}
          </PrimaryBtn>
        </form>

        <Divider label="or sign in without a password" />

        <button
          type="button"
          onClick={handleMagicLink}
          disabled={loading || magicSent}
          className="w-full text-center text-sm text-brand-dim hover:text-brand-green-ink transition-colors disabled:opacity-50"
        >
          {magicSent ? 'Magic link sent — check your inbox' : 'Send me a magic link →'}
        </button>

        <p className="text-center text-xs text-brand-muted">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-brand-green-ink hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
