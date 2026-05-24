import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import { invitationRepository } from '@/lib/repositories/invitations';
import { auth } from '@/lib/auth';
import { AcceptButton } from './accept-button';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  const invitation = await invitationRepository.findByToken(token);

  // Invalid token
  if (!invitation) {
    return (
      <InviteShell>
        <h1 className="text-2xl font-semibold text-brand-text mb-2">Invalid invitation</h1>
        <p className="text-brand-dim mb-6">
          This invitation link is invalid or has already been used.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-brand-bg hover:bg-brand-green/90"
        >
          Sign in
        </Link>
      </InviteShell>
    );
  }

  // Expired token
  if (invitation.expiresAt < new Date()) {
    return (
      <InviteShell>
        <h1 className="text-2xl font-semibold text-brand-text mb-2">Invitation expired</h1>
        <p className="text-brand-dim mb-6">
          This invitation has expired. Ask a team owner or admin to send you a new one.
        </p>
      </InviteShell>
    );
  }

  // Already accepted
  if (invitation.acceptedAt) {
    return (
      <InviteShell>
        <h1 className="text-2xl font-semibold text-brand-text mb-2">Already accepted</h1>
        <p className="text-brand-dim mb-6">
          This invitation has already been used.
        </p>
        <Link
          href="/overview"
          className="inline-flex items-center rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-brand-bg hover:bg-brand-green/90"
        >
          Go to dashboard
        </Link>
      </InviteShell>
    );
  }

  // Check if the user is authenticated
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    // Redirect to sign-in with the invite path as redirect target
    redirect(`/sign-in?redirect=/invite/${token}`);
  }

  const userId = session.user.id;

  return (
    <InviteShell>
      <h1 className="text-2xl font-semibold text-brand-text mb-2">
        Join {invitation.team.name}
      </h1>
      <p className="text-brand-dim mb-6">
        You&apos;ve been invited to join <strong className="text-brand-text">{invitation.team.name}</strong>{' '}
        as a <strong className="text-brand-text">{invitation.role}</strong>.
      </p>
      <AcceptButton token={token} userId={userId} teamName={invitation.team.name} />
    </InviteShell>
  );
}

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-md rounded-lg border border-brand-line bg-brand-bg2 p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
            <span className="absolute h-6 w-6 rounded-full bg-brand-green opacity-20 animate-logo-pulse" />
            <span className="h-2.5 w-2.5 rounded-full bg-brand-green" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-brand-text">Beaconmon</span>
        </div>
        {children}
      </div>
    </div>
  );
}
