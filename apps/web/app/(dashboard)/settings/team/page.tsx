'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/lib/hooks/use-session';
import {
  useTeamMembers,
  usePendingInvitations,
  useSendInvitation,
  useResendInvitation,
  useRevokeInvitation,
  useUpdateMemberRole,
  useRemoveMember,
} from '@/lib/hooks/use-team';
import { ErrorCode } from '@beaconmon/types';

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/50',
  admin: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/50',
  viewer: 'bg-brand-bg3 text-brand-dim border-brand-line',
};

function RoleBadge({ role }: { role: string }) {
  return (
    <Badge variant="outline" className={ROLE_COLORS[role] ?? ROLE_COLORS['viewer']!}>
      {role}
    </Badge>
  );
}

function InviteForm({ currentRole }: { currentRole: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'viewer'>('viewer');
  const [pendingResendId, setPendingResendId] = useState<string | null>(null);
  const sendMutation = useSendInvitation();
  const resendMutation = useResendInvitation();

  const roleOptions = currentRole === 'owner'
    ? [{ value: 'admin', label: 'Admin' }, { value: 'viewer', label: 'Viewer' }]
    : [{ value: 'viewer', label: 'Viewer' }];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPendingResendId(null);
    sendMutation.reset();
    try {
      await sendMutation.mutateAsync({ email, role });
      setEmail('');
    } catch (err) {
      const e = err as { code?: string; invitationId?: string };
      if (e.code === ErrorCode.INVITATION_ALREADY_PENDING && e.invitationId) {
        setPendingResendId(e.invitationId);
      }
    }
  }

  async function handleResend() {
    if (!pendingResendId) return;
    await resendMutation.mutateAsync(pendingResendId);
    setPendingResendId(null);
    setEmail('');
    sendMutation.reset();
  }

  const errorMsg = (() => {
    if (!sendMutation.error) return null;
    const e = sendMutation.error as { error?: string; code?: string };
    return e.error ?? 'Failed to send invitation';
  })();

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1">
        <label className="text-sm font-medium text-brand-text" htmlFor="invite-email">
          Email address
        </label>
        <Input
          id="invite-email"
          type="email"
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setPendingResendId(null); sendMutation.reset(); }}
          required
        />
      </div>
      <div className="w-36 space-y-1">
        <label className="text-sm font-medium text-brand-text">Role</label>
        <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'viewer')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={sendMutation.isPending}>
        {sendMutation.isPending ? 'Sending…' : 'Send invite'}
      </Button>

      {errorMsg && (
        <div className="w-full mt-1 text-sm text-red-400">
          {errorMsg}
          {pendingResendId && (
            <button
              type="button"
              onClick={() => void handleResend()}
              className="ml-2 underline text-brand-green"
              disabled={resendMutation.isPending}
            >
              {resendMutation.isPending ? 'Resending…' : 'Resend?'}
            </button>
          )}
        </div>
      )}
      {sendMutation.isSuccess && (
        <p className="w-full mt-1 text-sm text-brand-green">Invitation sent.</p>
      )}
      {resendMutation.isSuccess && (
        <p className="w-full mt-1 text-sm text-brand-green">Invitation resent.</p>
      )}
    </form>
  );
}

export default function TeamPage() {
  const sessionQ = useSession();
  const membersQ = useTeamMembers();
  const invitationsQ = usePendingInvitations();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMutation = useRemoveMember();
  const revokeMutation = useRevokeInvitation();
  const resendMutation = useResendInvitation();

  const currentUserId = sessionQ.data?.userId;
  const currentRole = sessionQ.data?.role ?? 'viewer';
  const canManage = currentRole === 'owner' || currentRole === 'admin';

  if (sessionQ.isLoading || membersQ.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  const members = membersQ.data ?? [];
  const invitations = invitationsQ.data ?? [];

  return (
    <div className="space-y-6">
      {canManage && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Invite a teammate</CardTitle>
          </CardHeader>
          <CardContent>
            <InviteForm currentRole={currentRole} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-line">
                <th className="px-6 py-3 text-left font-medium text-brand-dim">Name</th>
                <th className="px-6 py-3 text-left font-medium text-brand-dim">Email</th>
                <th className="px-6 py-3 text-left font-medium text-brand-dim">Role</th>
                <th className="px-6 py-3 text-left font-medium text-brand-dim">Joined</th>
                {canManage && (
                  <th className="px-6 py-3 text-right font-medium text-brand-dim">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isSelf = member.userId === currentUserId;
                const isOwner = member.role === 'owner';
                const showActions = canManage && !isSelf && !(isOwner && currentRole !== 'owner');

                return (
                  <tr key={member.id} className="border-b border-brand-line last:border-0">
                    <td className="px-6 py-3 text-brand-text">
                      {member.user.name}
                      {isSelf && <span className="ml-1.5 text-xs text-brand-muted">(you)</span>}
                    </td>
                    <td className="px-6 py-3 text-brand-dim">{member.user.email}</td>
                    <td className="px-6 py-3">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-6 py-3 text-brand-dim">
                      {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                    </td>
                    {canManage && (
                      <td className="px-6 py-3">
                        {showActions && (
                          <div className="flex items-center justify-end gap-2">
                            {!isOwner && (
                              <Select
                                value={member.role}
                                onValueChange={(v) =>
                                  void updateRoleMutation.mutate({ userId: member.userId, role: v })
                                }
                              >
                                <SelectTrigger className="h-7 w-24 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {currentRole === 'owner' && (
                                    <SelectItem value="admin">Admin</SelectItem>
                                  )}
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-red-400 hover:text-red-300"
                              onClick={() => void removeMutation.mutate(member.userId)}
                              disabled={removeMutation.isPending}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {canManage && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pending invitations</CardTitle>
          </CardHeader>
          <CardContent className={invitations.length === 0 ? undefined : 'p-0'}>
            {invitations.length === 0 ? (
              <p className="text-sm text-brand-dim">No pending invitations.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-line">
                    <th className="px-6 py-3 text-left font-medium text-brand-dim">Email</th>
                    <th className="px-6 py-3 text-left font-medium text-brand-dim">Role</th>
                    <th className="px-6 py-3 text-left font-medium text-brand-dim">Expires</th>
                    <th className="px-6 py-3 text-right font-medium text-brand-dim">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="border-b border-brand-line last:border-0">
                      <td className="px-6 py-3 text-brand-text">{inv.email}</td>
                      <td className="px-6 py-3">
                        <RoleBadge role={inv.role} />
                      </td>
                      <td className="px-6 py-3 text-brand-dim">
                        {format(new Date(inv.expiresAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => void resendMutation.mutate(inv.id)}
                          disabled={resendMutation.isPending}
                        >
                          Resend
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-red-400 hover:text-red-300"
                          onClick={() => void revokeMutation.mutate(inv.id)}
                          disabled={revokeMutation.isPending}
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
