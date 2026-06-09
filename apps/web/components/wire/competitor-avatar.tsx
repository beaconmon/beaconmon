'use client';

interface CompetitorAvatarProps {
  name: string;
  size?: number;
  tone?: 'amber' | 'muted';
}

export function CompetitorAvatar({ name, size = 32, tone = 'muted' }: CompetitorAvatarProps) {
  const letter = (name.trim()[0] ?? '?').toUpperCase();
  const bg = tone === 'amber' ? 'rgba(180,83,9,0.12)' : 'var(--brand-bg3)';
  const color = tone === 'amber' ? 'var(--brand-amber)' : 'var(--brand-dim)';
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-lg font-bold"
      style={{
        width: size,
        height: size,
        background: bg,
        color,
        fontSize: Math.round(size * 0.42),
        boxShadow: tone === 'amber' ? 'inset 0 0 0 1px rgba(180,83,9,0.25)' : undefined,
      }}
    >
      {letter}
    </div>
  );
}
