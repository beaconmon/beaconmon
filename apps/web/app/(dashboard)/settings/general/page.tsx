'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/lib/hooks/use-session';
import { useUpdateTeamSettings } from '@/lib/hooks/use-team';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export default function GeneralPage() {
  const { data: session } = useSession();
  const updateSettings = useUpdateTeamSettings();
  const updateTeamName = useUpdateTeamSettings();

  const sessionTeamName = session?.teamName ?? '';
  const [teamNameOverride, setTeamNameOverride] = useState<string | null>(null);
  const teamName = teamNameOverride ?? sessionTeamName;
  const [teamNameSaved, setTeamNameSaved] = useState(false);

  const [agencyName, setAgencyName] = useState('');
  const [brandColor, setBrandColor] = useState('#1e40af');
  const [logoUrl, setLogoUrl] = useState('');
  const [colorError, setColorError] = useState('');
  const [saved, setSaved] = useState(false);

  const isViewer = session?.role === 'viewer';

  async function handleTeamNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim()) return;
    setTeamNameSaved(false);
    try {
      await updateTeamName.mutateAsync({ name: teamName.trim() });
      setTeamNameSaved(true);
    } catch {
      // error shown via mutation state
    }
  }

  function handleColorBlur() {
    if (brandColor && !HEX_RE.test(brandColor)) {
      setColorError('Must be a 6-digit hex color, e.g. #1e40af');
    } else {
      setColorError('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (brandColor && !HEX_RE.test(brandColor)) return;

    setSaved(false);
    try {
      await updateSettings.mutateAsync({
        ...(agencyName && { reportAgencyName: agencyName }),
        ...(brandColor && { reportBrandColor: brandColor }),
        ...(logoUrl && { reportLogoUrl: logoUrl }),
      });
      setSaved(true);
    } catch {
      // error shown via mutation state
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Workspace</CardTitle>
          <CardDescription>The name that appears across your dashboard and team switcher.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleTeamNameSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-text" htmlFor="team-name">
                Workspace name
              </label>
              <Input
                id="team-name"
                type="text"
                placeholder={session?.teamName ?? 'My Workspace'}
                value={teamName}
                onChange={(e) => { setTeamNameOverride(e.target.value); setTeamNameSaved(false); }}
                disabled={isViewer}
                maxLength={100}
              />
            </div>
            {isViewer ? (
              <p className="text-xs text-brand-muted">Contact an admin to update workspace settings.</p>
            ) : (
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={updateTeamName.isPending || !teamName.trim()}>
                  {updateTeamName.isPending ? 'Saving…' : 'Save'}
                </Button>
                {teamNameSaved && <p className="text-sm text-brand-green">Saved.</p>}
                {updateTeamName.isError && (
                  <p className="text-sm text-red-400">{updateTeamName.error?.message}</p>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Report branding</CardTitle>
          <CardDescription>These settings appear on generated PDF reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-text" htmlFor="agency-name">
                Agency name
              </label>
              <Input
                id="agency-name"
                type="text"
                placeholder="Acme Agency"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                disabled={isViewer}
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-text" htmlFor="brand-color">
                Brand color
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 shrink-0 rounded border border-brand-line"
                  style={{ backgroundColor: HEX_RE.test(brandColor) ? brandColor : undefined }}
                />
                <Input
                  id="brand-color"
                  type="text"
                  placeholder="#1e40af"
                  value={brandColor}
                  onChange={(e) => { setBrandColor(e.target.value); setColorError(''); }}
                  onBlur={handleColorBlur}
                  disabled={isViewer}
                  className="font-mono"
                  maxLength={7}
                />
              </div>
              {colorError && (
                <p className="text-xs text-red-400">{colorError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-text" htmlFor="logo-url">
                Logo URL
                <span className="ml-1.5 text-brand-muted font-normal">(optional)</span>
              </label>
              <Input
                id="logo-url"
                type="url"
                placeholder="https://your-cdn.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                disabled={isViewer}
                maxLength={500}
              />
            </div>

            {isViewer ? (
              <p className="text-xs text-brand-muted">Contact an admin to update branding settings.</p>
            ) : (
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={updateSettings.isPending || Boolean(colorError)}>
                  {updateSettings.isPending ? 'Saving…' : 'Save branding'}
                </Button>
                {saved && <p className="text-sm text-brand-green">Saved.</p>}
                {updateSettings.isError && (
                  <p className="text-sm text-red-400">{updateSettings.error?.message}</p>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
