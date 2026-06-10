// Pure helpers for per-team digest scheduling. The daily digest sends once the
// team's local clock passes DAILY_DIGEST_LOCAL_HOUR; the weekly digest additionally
// requires the local day to be Monday. All date keys are computed in the team's
// timezone so the "once per day" guarantee holds across DST transitions.

export const DAILY_DIGEST_LOCAL_HOUR = 7;

export const FALLBACK_TIMEZONE = 'Etc/UTC';

export interface LocalSendState {
  /** YYYY-MM-DD in the team's timezone */
  dateKey: string;
  /** ISO week (YYYY-Www) of the team-local date */
  weekKey: string;
  /** 0-23 hour in the team's timezone */
  hour: number;
  isMonday: boolean;
}

function getIsoWeekKey(year: number, month: number, day: number): string {
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function formatParts(now: Date, timeZone: string): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    weekday: 'short',
  }).formatToParts(now);
}

export function getLocalSendState(now: Date, timeZone: string): LocalSendState {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = formatParts(now, timeZone);
  } catch {
    parts = formatParts(now, FALLBACK_TIMEZONE);
  }

  const lookup = new Map(parts.map((p) => [p.type, p.value]));
  const year = Number(lookup.get('year'));
  const month = Number(lookup.get('month'));
  const day = Number(lookup.get('day'));
  const hour = Number(lookup.get('hour'));

  return {
    dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    weekKey: getIsoWeekKey(year, month, day),
    hour,
    isMonday: lookup.get('weekday') === 'Mon',
  };
}
