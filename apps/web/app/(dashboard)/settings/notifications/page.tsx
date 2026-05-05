'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QueryState } from '@/components/dashboard/query-state';
import { useSession } from '@/lib/hooks/use-session';
import {
  useMyNotificationPreferences,
  useUpdateMyPrimaryChannel,
  useTeamNotificationSummary,
} from '@/lib/hooks/use-notification-preferences';

export default function NotificationsSettingsPage() {
  const { data: session } = useSession();
  const prefsQ = useMyNotificationPreferences();
  const updatePref = useUpdateMyPrimaryChannel();

  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    if (prefsQ.data?.primaryChannelId) {
      setSelected(prefsQ.data.primaryChannelId);
    }
  }, [prefsQ.data?.primaryChannelId]);

  async function handleSave() {
    if (!selected || selected === prefsQ.data?.primaryChannelId) return;
    try {
      await updatePref.mutateAsync({ primaryChannelId: selected });
    } catch {
      // surfaced via mutation state
    }
  }

  const isFree = session?.plan === 'free';
  const canManageTeam = session?.role === 'owner' || session?.role === 'admin';

  return (
    <div className="max-w-2xl space-y-6">
      {isFree && (
        <div className="flex items-start gap-2.5 rounded-md border border-brand-green/30 bg-brand-green/10 px-3.5 py-2.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
          <div className="flex-1 space-y-1 text-sm text-brand-text">
            <p className="font-medium">Routing alerts to specific teammates is a Pro feature.</p>
            <p className="text-xs text-brand-muted">
              On the Free plan you can still set your own primary channel — it's only used once
              you upgrade and a teammate adds you to an escalation step.
            </p>
            <Link
              href="/settings/billing"
              className="inline-block text-xs font-medium text-brand-green underline hover:text-brand-text"
            >
              Upgrade to Pro →
            </Link>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-brand-green" />
            Your primary channel
          </CardTitle>
          <CardDescription>
            When a teammate adds you to an escalation step, alerts route here. Defaults to your
            account email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QueryState
            isLoading={prefsQ.isLoading}
            isError={prefsQ.isError}
            error={prefsQ.error}
            onRetry={() => prefsQ.refetch()}
          >
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-text" htmlFor="primary-channel">
                  Primary channel
                </label>
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger id="primary-channel" className="w-full">
                    <SelectValue placeholder="Select a channel…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(prefsQ.data?.channels ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} <span className="text-brand-muted">({c.type})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {updatePref.isError && (
                <p className="text-sm text-red-400">{updatePref.error?.message}</p>
              )}
              {updatePref.isSuccess && (
                <p className="flex items-center gap-1.5 text-xs text-brand-green">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => void handleSave()}
                  disabled={
                    !selected ||
                    selected === prefsQ.data?.primaryChannelId ||
                    updatePref.isPending
                  }
                >
                  {updatePref.isPending ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </QueryState>
        </CardContent>
      </Card>

      {canManageTeam && <TeamRoutingSummary />}
    </div>
  );
}

function TeamRoutingSummary() {
  const summaryQ = useTeamNotificationSummary();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Team routing</CardTitle>
        <CardDescription>
          Read-only view of which channel each teammate routes to. Only the user themselves
          can change their primary channel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QueryState
          isLoading={summaryQ.isLoading}
          isError={summaryQ.isError}
          error={summaryQ.error}
          onRetry={() => summaryQ.refetch()}
        >
          {(summaryQ.data ?? []).length === 0 ? (
            <p className="text-sm text-brand-muted">No team members yet.</p>
          ) : (
            <div className="overflow-hidden rounded-md border border-brand-line">
              <div className="grid grid-cols-[1.4fr,80px,1fr] border-b border-brand-line bg-brand-bg2 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                <span>Member</span>
                <span>Role</span>
                <span>Primary</span>
              </div>
              {(summaryQ.data ?? []).map((row) => (
                <div
                  key={row.userId}
                  className="grid grid-cols-[1.4fr,80px,1fr] items-center border-b border-brand-line px-3 py-2.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-brand-text">{row.userName}</p>
                    <p className="truncate text-xs text-brand-muted">{row.userEmail}</p>
                  </div>
                  <span className="text-xs uppercase text-brand-muted">{row.role}</span>
                  <span className="truncate text-xs text-brand-text">
                    {row.primaryChannelName ?? (
                      <span className="text-brand-muted">— not configured</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </QueryState>
      </CardContent>
    </Card>
  );
}
