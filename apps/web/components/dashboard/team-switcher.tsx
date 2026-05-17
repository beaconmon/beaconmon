'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';
import { apiFetch } from '@/lib/api-fetch';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from '@/lib/hooks/use-session';

interface MembershipRow {
  teamId: string;
  teamName: string;
  plan: string;
  role: string;
}

function trialDaysLeft(trialEndsAt: string | null | undefined): number | null {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt).getTime();
  if (!Number.isFinite(end)) return null;
  const ms = end - Date.now();
  if (ms <= 0) return null;
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function TeamSwitcher() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const teamsQ = useQuery<MembershipRow[]>({
    queryKey: ['team-memberships'],
    queryFn: async () => {
      const res = await fetch('/api/team/list');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    },
    staleTime: 60_000,
  });

  const activeTeamId = session?.teamId;
  const activeTeamName = session?.teamName ?? 'Your Workspace';
  const activePlan = session?.plan ?? 'free';
  const initial = activeTeamName.trim().charAt(0).toUpperCase() || 'W';
  const daysLeft = activePlan !== 'free' ? trialDaysLeft(session?.trialEndsAt) : null;
  const teams = teamsQ.data ?? [];
  const hasMultiple = teams.length > 1;

  async function switchTo(teamId: string) {
    if (teamId === activeTeamId) return;
    const res = await apiFetch('/api/team/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    });
    if (!res.ok) {
      console.error('Failed to switch teams', { status: res.status, teamId });
      return;
    }
    // Drop all cached queries (team-scoped) and navigate to a safe root page.
    // router.refresh() would re-render the current page (e.g. /monitors/[id])
    // which belongs to the old team and would 403 under the new team context.
    await queryClient.invalidateQueries();
    router.push('/overview');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors hover:bg-brand-bg3/60"
          aria-label="Switch team"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-bg3 text-xs font-semibold text-brand-text">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-brand-text">{activeTeamName}</p>
            {daysLeft != null ? (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-amber">
                {daysLeft}d left in {activePlan} trial
              </p>
            ) : (
              <p
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-wider',
                  activePlan === 'free' ? 'text-brand-amber' : 'text-brand-green-ink'
                )}
              >
                {activePlan}
              </p>
            )}
          </div>
          {hasMultiple && (
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-brand-muted" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        className="w-56 border-brand-line bg-brand-bg3"
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-brand-muted">
          Teams
        </DropdownMenuLabel>
        {teams.map((t) => {
          const isActive = t.teamId === activeTeamId;
          return (
            <DropdownMenuItem
              key={t.teamId}
              onSelect={(e) => {
                e.preventDefault();
                void switchTo(t.teamId);
              }}
              className={cn(
                'cursor-pointer text-brand-dim hover:text-brand-text focus:text-brand-text',
                isActive && 'text-brand-text'
              )}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-brand-bg2 text-[10px] font-semibold text-brand-text">
                {t.teamName.trim().charAt(0).toUpperCase() || 'W'}
              </div>
              <span className="ml-2 flex-1 truncate text-xs">{t.teamName}</span>
              {isActive && <Check className="ml-2 h-3.5 w-3.5 text-brand-green-ink" />}
            </DropdownMenuItem>
          );
        })}
        {teams.length === 0 && !teamsQ.isLoading && (
          <DropdownMenuItem disabled className="text-xs text-brand-muted">
            No teams found
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-brand-line" />
        <DropdownMenuItem asChild className="cursor-pointer text-brand-dim hover:text-brand-text focus:text-brand-text">
          <Link href="/settings" className="text-xs">
            Team settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
