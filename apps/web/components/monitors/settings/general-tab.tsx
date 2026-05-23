'use client';

import { MonitorForm, type MonitorFormValues } from '@/components/monitors/monitor-form';
import type { PlanTier } from '@beaconmon/types';

interface FormRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function FormRow({ label, hint, children }: FormRowProps) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-6">
      <div className="sm:w-48 sm:shrink-0">
        <p className="text-sm font-medium text-brand-text">{label}</p>
        {hint && <p className="text-xs text-brand-muted">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

interface GeneralTabProps {
  defaultValues: Partial<MonitorFormValues>;
  plan: PlanTier;
  onSubmit: (data: MonitorFormValues) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export function GeneralTab({ defaultValues, plan, onSubmit, isSubmitting, error }: GeneralTabProps) {
  return (
    <div className="space-y-6 py-2">
      <MonitorForm
        defaultValues={defaultValues}
        plan={plan}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
