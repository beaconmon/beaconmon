'use client';

import { useState } from 'react';

interface Props {
  monitorName: string;
  cause: string;
  startedAt: string; // ISO string
  durationMs: number | null;
}

export function PastIncidentCard({ monitorName, cause, startedAt, durationMs }: Props) {
  const [open, setOpen] = useState(false);
  const start = new Date(startedAt);
  const timeLabel = start.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  }) + ' UTC';
  const durationLabel = durationMs != null ? formatDuration(durationMs) : 'Unknown';

  return (
    <div
      onClick={() => setOpen((o) => !o)}
      style={{
        background: 'white',
        border: '1px solid #F1F2F4',
        borderRadius: 8,
        padding: '12px 16px',
        marginTop: 8,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#94A3B8', flexShrink: 0,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: '#0F172A' }}>
            {monitorName}{' '}
            <span style={{ color: '#475569', fontWeight: 400 }}>· {cause}</span>
          </div>
          <div style={{
            fontSize: 12, color: '#64748B', marginTop: 2,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          }}>
            {timeLabel} · Resolved after {durationLabel}
          </div>
        </div>
        <span style={{
          display: 'inline-flex',
          transition: 'transform 180ms',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          color: '#94A3B8',
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {open && (
        <div style={{
          fontSize: 13, color: '#475569', marginTop: 10,
          lineHeight: 1.55, paddingLeft: 19,
          borderLeft: '2px solid #F1F2F4', marginLeft: 3,
        }}>
          Service was down for {durationLabel} starting at {timeLabel}.
        </div>
      )}
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
