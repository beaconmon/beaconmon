'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TeamMemberRow } from '@/lib/repositories/teams';
import type { InvitationRow } from '@/lib/repositories/invitations';

export function useTeamMembers() {
  return useQuery<TeamMemberRow[]>({
    queryKey: ['team-members'],
    queryFn: async () => {
      const res = await fetch('/api/team/members');
      if (!res.ok) throw new Error('Failed to fetch team members');
      return res.json();
    },
  });
}

export function usePendingInvitations() {
  return useQuery<InvitationRow[]>({
    queryKey: ['team-invitations'],
    queryFn: async () => {
      const res = await fetch('/api/team/invitations');
      if (!res.ok) throw new Error('Failed to fetch invitations');
      return res.json();
    },
  });
}

export function useSendInvitation() {
  const queryClient = useQueryClient();
  return useMutation<InvitationRow, { code?: string; error?: string }, { email: string; role: string }>({
    mutationFn: async (data) => {
      const res = await fetch('/api/team/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw json;
      return json as InvitationRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();
  return useMutation<InvitationRow, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/team/invitations/${id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to resend invitation');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/team/invitations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke invitation');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { userId: string; role: string }>({
    mutationFn: async ({ userId, role }) => {
      const res = await fetch(`/api/team/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('Failed to update member role');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/team/members/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove member');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
}
