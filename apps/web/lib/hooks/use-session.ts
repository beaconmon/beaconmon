'use client';

import { useQuery } from '@tanstack/react-query';
import type { PlanTier, TeamRole } from '@beaconmon/types';

interface SessionInfo {
  userId: string;
  teamId: string;
  plan: PlanTier;
  role: TeamRole;
  teamCreatedAt: string | null;
}

export function useSession() {
  return useQuery<SessionInfo>({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch('/api/me');
      if (!res.ok) throw new Error('Failed to fetch session');
      return res.json();
    },
    staleTime: 60_000,
  });
}
