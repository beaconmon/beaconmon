'use client';

import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const STEPS = ['Your store', 'Competitors', 'Smart Setup'] as const;

export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex w-full items-center">
      {STEPS.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3;
        const done = step < current;
        const active = step === current;
        const inactive = !done && !active;
        return (
          <Fragment key={label}>
            {i > 0 && (
              <div className="relative mx-3 h-px flex-1">
                <div className="absolute inset-0 bg-brand-line" />
                {done && (
                  <div
                    className="absolute inset-0 bg-brand-green"
                    style={{ boxShadow: '0 0 4px rgba(0,229,122,0.7)' }}
                  />
                )}
              </div>
            )}
            <div
              className={cn(
                'flex flex-col items-center gap-1.5',
                inactive && 'px-4 py-2'
              )}
            >
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                  done || active
                    ? 'bg-brand-green text-brand-green-fg'
                    : 'border border-brand-line bg-brand-bg3 text-brand-muted'
                )}
                style={active ? { boxShadow: '0 0 0 4px rgba(0,229,122,0.12)' } : undefined}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step}
              </div>
              <span
                className={cn(
                  'hidden text-[10px] font-medium tracking-wide sm:block',
                  active ? 'text-brand-text' : done ? 'text-brand-green-ink' : 'text-brand-muted'
                )}
              >
                {label}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
