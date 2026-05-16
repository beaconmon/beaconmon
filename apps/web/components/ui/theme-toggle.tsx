'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';

const THEMES = ['light', 'dark', 'system'] as const;
type Theme = typeof THEMES[number];

const ICONS: Record<Theme, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const subscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const cycle = () => {
    const current = (theme as Theme) ?? 'system';
    const idx = THEMES.indexOf(current);
    setTheme(THEMES[(idx + 1) % THEMES.length] as string);
  };

  const current = (mounted ? (theme as Theme) : 'system') ?? 'system';
  const Icon = ICONS[current] ?? Monitor;

  return (
    <button
      onClick={cycle}
      aria-label={`Theme: ${current}. Click to cycle.`}
      className="h-8 w-8 flex items-center justify-center rounded-md text-brand-muted hover:text-brand-text transition-colors duration-150"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
