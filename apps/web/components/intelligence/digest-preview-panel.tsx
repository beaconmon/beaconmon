'use client';

import Link from 'next/link';
import { useIntelligenceSettings } from '@/lib/hooks/use-intelligence-settings';

const SECTION_LABELS: Record<string, { label: string; color: string }> = {
  incidents:    { label: 'Incidents',      color: 'bg-brand-red' },
  ownContent:   { label: 'Your content',   color: 'bg-brand-green' },
  competitors:  { label: 'Competitors',    color: 'bg-amber-500' },
  smartAlerts:  { label: 'Smart alerts',   color: 'bg-blue-500' },
  expiry:       { label: 'Expiry alerts',  color: 'bg-brand-muted' },
};

export function DigestPreviewPanel() {
  const { data } = useIntelligenceSettings();
  const prefs = data?.prefs;

  const enabledSections = prefs
    ? (Object.entries(prefs.sections) as [string, boolean][]).filter(([, on]) => on)
    : [];

  const frequencyLabel =
    prefs?.frequency === 'daily'
      ? 'Daily at 7:00 UTC'
      : prefs?.frequency === 'weekly'
        ? 'Weekly, Monday 7:00 UTC'
        : prefs?.frequency === 'both'
          ? 'Daily + weekly'
          : 'Not configured';

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{
        background: 'linear-gradient(180deg, rgba(0,229,122,0.06) 0%, var(--brand-bg2) 60%)',
        boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
      }}
    >
      <div className="border-b border-brand-line px-4 py-2.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
          Daily digest
        </p>
      </div>

      <div className="px-4 py-4 space-y-3">
        <p className="font-mono text-[11px] text-brand-muted">{frequencyLabel}</p>

        {enabledSections.length > 0 ? (
          <ul className="space-y-1.5">
            {enabledSections.map(([key]) => {
              const def = SECTION_LABELS[key];
              if (!def) return null;
              return (
                <li key={key} className="flex items-center gap-2 text-xs text-brand-dim">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${def.color}`} />
                  {def.label}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-brand-muted">No sections enabled.</p>
        )}

        <Link
          href="/intelligence/settings"
          className="block pt-1 text-xs text-brand-green-ink hover:underline"
        >
          Manage digest settings →
        </Link>
      </div>
    </div>
  );
}
