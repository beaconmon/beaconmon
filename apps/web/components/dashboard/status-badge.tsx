import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Status = 'up' | 'down' | 'paused' | string;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  up:     { label: 'Up',     className: 'bg-green-100 text-green-800 border-green-200' },
  down:   { label: 'Down',   className: 'bg-red-100 text-red-800 border-red-200' },
  paused: { label: 'Paused', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <Badge variant="outline" className={cn('font-medium text-xs', config.className)}>
      {config.label}
    </Badge>
  );
}
