import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { isTeamOnboarded } from '@/lib/onboarding';
import { TodayPageClient } from './TodayPageClient';

export default async function TodayPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const teamId = session?.user?.teamId;
  if (!teamId) {
    redirect('/sign-in');
  }

  if (!(await isTeamOnboarded(teamId))) {
    redirect('/onboarding');
  }

  return <TodayPageClient />;
}
