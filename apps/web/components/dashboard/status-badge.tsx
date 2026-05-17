import { cn } from '@/lib/utils';

type Status = 'up' | 'down' | 'paused' | 'warning' | 'ongoing' | 'resolved' | string;

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string; pulse?: boolean }> = {
  up:       { label: 'UP',       dot: 'bg-brand-green', text: 'text-brand-green-ink', pulse: true },
  down:     { label: 'DOWN',     dot: 'bg-brand-red',   text: 'text-brand-red' },
  paused:   { label: 'PAUSED',   dot: 'bg-blue-400',    text: 'text-blue-400' },
  warning:  { label: 'WARNING',  dot: 'bg-brand-amber', text: 'text-brand-amber' },
  ongoing:  { label: 'ONGOING',  dot: 'bg-brand-red',   text: 'text-brand-red', pulse: true },
  resolved: { label: 'RESOLVED', dot: 'bg-brand-muted', text: 'text-brand-muted' },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.toUpperCase(),
    dot: 'bg-brand-muted',
    text: 'text-brand-muted',
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full shrink-0',
          config.dot,
          config.pulse && 'animate-pulse'
        )}
      />
      <span className={cn('text-[10px] font-semibold tracking-widest uppercase', config.text)}>
        {config.label}
      </span>
    </span>
  );
}
