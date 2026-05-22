'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = ['Your store', 'Smart Setup', 'Competitors'] as const;

export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && (
              <div className={cn('h-px w-8 sm:w-16', done ? 'bg-brand-green' : 'bg-brand-line')} />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                  done
                    ? 'bg-brand-green text-brand-green-fg'
                    : active
                      ? 'border border-brand-green bg-brand-green/10 text-brand-green-ink'
                      : 'border border-brand-line bg-brand-bg3 text-brand-muted'
                )}
              >
                {done ? <Check className="h-3 w-3" /> : step}
              </div>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:block',
                  active
                    ? 'text-brand-text'
                    : done
                      ? 'text-brand-green-ink'
                      : 'text-brand-muted'
                )}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
