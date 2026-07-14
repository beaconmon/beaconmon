import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { PlanTier } from '@beaconmon/types';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import { auth } from '@/lib/auth';
import { isTeamOnboarded } from '@/lib/onboarding';
import { OnboardingWizard } from './OnboardingWizard';

function isPlanTier(value: unknown): value is PlanTier {
  return value === 'free' || value === 'starter' || value === 'growth' || value === 'scale';
}

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect('/sign-in?redirect=/onboarding');
  }

  const teamId = session.user.teamId;
  if (!teamId) {
    redirect('/sign-in');
  }

  if (await isTeamOnboarded(teamId)) {
    redirect('/today');
  }

  return (
    <OnboardingWizard
      teamId={teamId}
      plan={isPlanTier(session.user.plan) ? session.user.plan : 'free'}
      email={session.user.email ?? null}
    />
  );
}
