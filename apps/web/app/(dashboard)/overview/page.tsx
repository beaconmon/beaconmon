import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { monitorRepository } from '@/lib/repositories/monitors';

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const teamId = session?.user?.teamId;
  if (!teamId) {
    redirect('/sign-in');
  }

  const count = await monitorRepository.countByTeam(teamId);
  if (count === 0) {
    redirect('/onboarding');
  }

  redirect('/monitors');
}
