'use client';

import { useState, useRef } from 'react';
import { Eye, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlanTier } from '@beaconmon/types';
import { PLAN_LIMITS } from '@beaconmon/types';

export function normalizeDomain(input: string): string {
  let s = input.trim();
  s = s.replace(/^https?:\/\//, '');
  s = (s.split('/')[0] ?? s).toLowerCase();
  return s;
}

export function domainToName(domain: string): string {
  const withoutTld = domain.replace(/\.[a-z]{2,}(\.[a-z]{2})?$/, '').replace(/^www\./, '');
  return withoutTld
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface CompetitorDomainInputProps {
  value: string[];
  onChange: (v: string[]) => void;
  plan: PlanTier;
  aiSuggestions?: string[];
  atLimitMessage?: string;
}

export function CompetitorDomainInput({
  value,
  onChange,
  plan,
  aiSuggestions = [],
  atLimitMessage,
}: CompetitorDomainInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestedSet, setSuggestedSet] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const limit = PLAN_LIMITS[plan].competitorMonitors;
  const atLimit = limit !== -1 && value.length >= limit;

  const defaultLimitMessage = `You've reached the ${limit} competitor limit on the ${
    plan.charAt(0).toUpperCase() + plan.slice(1)
  } plan.`;

  function handleAdd() {
    const domain = normalizeDomain(inputValue);
    if (!domain || value.includes(domain) || atLimit) return;
    onChange([...value, domain]);
    setInputValue('');
    inputRef.current?.focus();
  }

  function handleRemove(domain: string) {
    onChange(value.filter((c) => c !== domain));
    setSuggestedSet((prev) => {
      const next = new Set(prev);
      next.delete(domain);
      return next;
    });
  }

  function handleAddSuggestion(domain: string) {
    const normalized = normalizeDomain(domain);
    if (!normalized || value.includes(normalized) || atLimit) return;
    onChange([...value, normalized]);
    setSuggestedSet((prev) => new Set([...prev, normalized]));
  }

  const visibleSuggestions = aiSuggestions
    .map(normalizeDomain)
    .filter((d) => d && !value.includes(d));

  return (
    <div className="space-y-4">
      <div className="flex h-14 items-stretch overflow-hidden rounded-lg border border-brand-line bg-brand-bg2 transition-colors focus-within:border-brand-green/60">
        <div className="flex items-center pl-4 pr-3">
          <Eye className="h-4 w-4 text-brand-muted" />
        </div>
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder="competitor-store.com"
          disabled={atLimit}
          className="min-w-0 flex-1 bg-transparent text-sm text-brand-text placeholder:text-brand-muted focus:outline-none disabled:cursor-not-allowed"
        />
        <div className="flex items-center p-1.5">
          <button
            onClick={handleAdd}
            disabled={!inputValue.trim() || atLimit}
            className="rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-brand-green-fg transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Add to watchlist
          </button>
        </div>
      </div>

      {atLimit && (
        <p className="text-xs text-amber-500">{atLimitMessage ?? defaultLimitMessage}</p>
      )}

      {value.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">
            Your watchlist <span className="text-brand-dim">&middot; {value.length}</span>
          </p>
          <div className="space-y-2">
            {value.map((domain) => {
              const isSuggested = suggestedSet.has(domain);
              return (
                <div
                  key={domain}
                  className="flex items-center gap-3 rounded-lg border border-brand-line bg-brand-bg2 px-4 py-3.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-bg3 text-sm font-bold text-brand-text">
                    {domain[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-brand-text">{domainToName(domain)}</p>
                      {isSuggested && (
                        <span className="rounded bg-brand-green/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-brand-green-ink">
                          Suggested
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-muted">{domain} &middot; homepage</p>
                  </div>
                  <button
                    onClick={() => handleRemove(domain)}
                    aria-label={`Remove ${domain}`}
                    className="rounded-md p-1 text-brand-muted transition-colors hover:text-brand-text"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {visibleSuggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">
              Suggestions based on your store
            </p>
            <p className="font-mono text-[10px] text-brand-muted">powered by Smart Setup</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {visibleSuggestions.map((domain) => (
              <div
                key={domain}
                className="flex flex-col gap-3 rounded-lg border border-brand-line bg-brand-bg2 p-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-bg3 text-xs font-bold text-brand-text">
                    {domain[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-sm font-semibold text-brand-text">
                      {domainToName(domain)}
                    </p>
                    <p className="truncate text-[11px] text-brand-muted">{domain}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddSuggestion(domain)}
                  disabled={atLimit}
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40',
                    'text-brand-green-ink hover:opacity-80'
                  )}
                >
                  <span className="text-base leading-none">+</span>
                  Add to watchlist
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
