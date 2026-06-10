'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Globe, Mail, Slack, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { QueryState } from '@/components/dashboard/query-state';
import { useAlertChannels } from '@/lib/hooks/use-alert-channels';
import { useIntelligenceSettings, useUpdateIntelligenceSettings } from '@/lib/hooks/use-intelligence-settings';
import type { DigestPrefs } from '@beaconmon/types';

type Frequency = DigestPrefs['frequency'];

type Sections = DigestPrefs['sections'];

function FrequencySelect({
  value,
  plan,
  disabled,
  onChange,
}: {
  value: Frequency;
  plan: string;
  disabled: boolean;
  onChange: (v: Frequency) => void;
}) {
  const isGrowthPlus = plan === 'growth' || plan === 'scale';

  return (
    <Select
      value={value ?? 'disabled'}
      disabled={disabled}
      onValueChange={(v) => onChange(v === 'disabled' ? null : (v as Frequency))}
    >
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="disabled">Disabled</SelectItem>
        <SelectItem value="weekly">Weekly (Monday)</SelectItem>
        {isGrowthPlus ? (
          <>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="both">Daily and Weekly</SelectItem>
          </>
        ) : (
          <>
            <SelectItem value="daily" disabled>
              Daily (Growth+ only)
            </SelectItem>
            <SelectItem value="both" disabled>
              Daily and Weekly (Growth+ only)
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
}

function timezoneLabel(tz: string): string {
  return tz === 'Etc/UTC' ? 'UTC' : tz.replace(/_/g, ' ');
}

function TimezoneSelect({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  const supportedZones = useMemo(
    () => (typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []),
    []
  );
  const zones = supportedZones.includes(value) ? supportedZones : [value, ...supportedZones];

  const browserZone =
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : null;

  const [draft, setDraft] = useState(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setDraft(v);
    if (zones.includes(v)) onChange(v);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        list="tz-zones"
        value={draft}
        disabled={disabled}
        onChange={handleChange}
        className="w-64"
      />
      <datalist id="tz-zones">
        {zones.map((tz) => (
          <option key={tz} value={tz} />
        ))}
      </datalist>
      {browserZone && browserZone !== value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => {
            setDraft(browserZone);
            onChange(browserZone);
          }}
        >
          <Globe className="mr-1.5 h-3.5 w-3.5" />
          Use {timezoneLabel(browserZone)}
        </Button>
      )}
    </div>
  );
}

function ChannelIcon({ type }: { type: string }) {
  if (type === 'slack') return <Slack className="h-4 w-4 shrink-0 text-brand-muted" />;
  return <Mail className="h-4 w-4 shrink-0 text-brand-muted" />;
}

export default function IntelligenceSettingsPage() {
  const settingsQ = useIntelligenceSettings();
  const channelsQ = useAlertChannels();
  const update = useUpdateIntelligenceSettings();

  const plan = settingsQ.data?.plan ?? 'free';
  const isFreePlan = plan === 'free';

  const [localPrefs, setLocalPrefs] = useState<DigestPrefs | null>(null);
  const [localTimezone, setLocalTimezone] = useState<string | null>(null);
  const serverTimezone = settingsQ.data?.timezone ?? 'Etc/UTC';
  const timezone = localTimezone ?? serverTimezone;
  const prefs: DigestPrefs = localPrefs ?? settingsQ.data?.prefs ?? {
    frequency: null,
    channelIds: [],
    sections: {
      incidents: true,
      ownContent: true,
      competitors: true,
      smartAlerts: true,
      expiry: true,
    },
  };

  const isDirty =
    (localPrefs !== null && JSON.stringify(localPrefs) !== JSON.stringify(settingsQ.data?.prefs)) ||
    (localTimezone !== null && localTimezone !== serverTimezone);

  function setPrefs(p: DigestPrefs) {
    setLocalPrefs(p);
  }

  function setFrequency(v: Frequency) {
    setPrefs({ ...prefs, frequency: v });
  }

  function toggleChannel(id: string, checked: boolean) {
    const next = checked
      ? [...prefs.channelIds, id]
      : prefs.channelIds.filter((c) => c !== id);
    setPrefs({ ...prefs, channelIds: next });
  }

  function toggleSection(key: keyof Sections, checked: boolean) {
    setPrefs({ ...prefs, sections: { ...prefs.sections, [key]: checked } });
  }

  async function handleSave() {
    if (!isDirty) return;
    await update.mutateAsync({
      frequency: prefs.frequency,
      channelIds: prefs.channelIds,
      sections: prefs.sections,
      timezone,
    });
    setLocalPrefs(null);
    setLocalTimezone(null);
  }

  // Only show email and slack channels
  const eligibleChannels = (channelsQ.data ?? []).filter(
    (c) => (c.type === 'email' || c.type === 'slack') && c.isActive
  );

  const SECTION_ROWS: Array<{ key: keyof Sections; label: string; description: string }> = [
    { key: 'incidents', label: 'Incidents', description: 'Downtime events that started or resolved in the window' },
    { key: 'ownContent', label: 'Own Content Changes', description: 'Changes detected on your non-competitor content monitors' },
    { key: 'competitors', label: 'Competitor Changes', description: 'Changes detected on competitor monitors' },
    { key: 'smartAlerts', label: 'Smart Alerts', description: 'Anomalous response times flagged by anomaly detection' },
    { key: 'expiry', label: 'SSL and Domain Expiry', description: 'SSL and domain expiry warnings sent in the window' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {isFreePlan && (
        <div className="flex items-start gap-2.5 rounded-md border border-brand-green/30 bg-brand-green/10 px-3.5 py-2.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-ink" />
          <div className="flex-1 space-y-1 text-sm text-brand-text">
            <p className="font-medium">Intelligence Digest requires a paid plan.</p>
            <p className="text-xs text-brand-muted">
              Upgrade to Starter or higher to receive scheduled digests by email or Slack.
            </p>
            <Link
              href="/settings/billing"
              className="inline-block text-xs font-medium text-brand-green-ink underline hover:text-brand-text"
            >
              View plans
            </Link>
          </div>
        </div>
      )}

      <QueryState
        isLoading={settingsQ.isLoading}
        isError={settingsQ.isError}
        onRetry={() => settingsQ.refetch()}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Digest Schedule</CardTitle>
            <CardDescription>
              How often to receive a summary of activity across your monitors.
              Delivered at 7:00 AM in your team timezone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FrequencySelect
              value={prefs.frequency}
              plan={plan}
              disabled={isFreePlan}
              onChange={setFrequency}
            />
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-brand-text">Timezone</p>
              <TimezoneSelect
                key={timezone}
                value={timezone}
                disabled={isFreePlan}
                onChange={setLocalTimezone}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Delivery Channels</CardTitle>
            <CardDescription>
              Choose which alert channels receive the digest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eligibleChannels.length === 0 ? (
              <p className="text-sm text-brand-muted">
                No email or Slack channels configured.{' '}
                <Link href="/alert-channels" className="text-brand-green-ink underline">
                  Add a channel
                </Link>
                .
              </p>
            ) : (
              <div className="space-y-3">
                {eligibleChannels.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <ChannelIcon type={c.type} />
                      <span className="text-sm text-brand-text truncate">{c.name}</span>
                      <span className="text-xs text-brand-muted uppercase">{c.type}</span>
                    </div>
                    <Switch
                      checked={prefs.channelIds.includes(c.id)}
                      onCheckedChange={(checked) => toggleChannel(c.id, checked)}
                      disabled={isFreePlan}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Digest Sections</CardTitle>
            <CardDescription>
              Choose which sections to include in each digest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SECTION_ROWS.map(({ key, label, description }) => (
                <div key={key} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-text">{label}</p>
                    <p className="text-xs text-brand-muted">{description}</p>
                  </div>
                  <Switch
                    checked={prefs.sections[key]}
                    onCheckedChange={(checked) => toggleSection(key, checked)}
                    disabled={isFreePlan}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {update.isError && (
          <p className="text-sm text-red-400">{update.error?.message}</p>
        )}
        {update.isSuccess && !isDirty && (
          <p className="flex items-center gap-1.5 text-xs text-brand-green-ink">
            <CheckCircle2 className="h-3.5 w-3.5" /> Saved
          </p>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => void handleSave()}
            disabled={isFreePlan || !isDirty || update.isPending}
          >
            {update.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </QueryState>
    </div>
  );
}
