export function formatBriefDate(d: Date, tz = 'UTC'): string {
  // "Sun, Jun 7"
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: tz,
  });
}

export function formatTime(d: Date, tz = 'UTC'): string {
  // "08:00 EDT" (or "08:00 UTC" when no timezone supplied)
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
    timeZoneName: 'short',
  }).formatToParts(d);
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const tzLabel = parts.find((p) => p.type === 'timeZoneName')?.value ?? tz;
  const hh = hour === '24' ? '00' : hour;
  return `${hh}:${minute} ${tzLabel}`;
}

export function formatBriefDateTimeUTC(d: Date, tz = 'UTC'): string {
  // "Jun 7, 09:14 EDT"
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: tz });
  return `${date}, ${formatTime(d, tz)}`;
}

export function hostnameFrom(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function formatRelativeAgo(d: Date, now: Date = new Date()): string {
  const ms = Math.max(0, now.getTime() - d.getTime());
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export function formatDurationMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  return `${seconds}s`;
}
