'use client';

import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';
import { PLAN_LIMITS } from '@beaconmon/types';
import type { PlanTier } from '@beaconmon/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, X } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';

const MONITOR_TYPES = ['http', 'ssl', 'domain', 'tcp', 'keyword', 'content'] as const;

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  isCompetitor: z.boolean().optional(),
  type: z.enum(MONITOR_TYPES),
  url: z.string().optional(),
  host: z.string().optional(),
  port: z.coerce.number().int().positive().optional(),
  domain: z.string().optional(),
  intervalSeconds: z.coerce.number().int().positive(),
  timeoutMs: z.coerce.number().int().positive().optional(),
  responseTimeThresholdMs: z.coerce.number().int().positive().optional(),
  keyword: z.string().optional(),
  keywordCondition: z.enum(['present', 'absent']).optional(),
  cssSelector: z.string().optional(),
  tags: z.array(z.string()).optional(),
  anomalyDetectionEnabled: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'http' || data.type === 'keyword' || data.type === 'content') {
    if (!data.url) {
      ctx.addIssue({ code: 'custom', path: ['url'], message: 'URL is required' });
    }
  }
  if (data.type === 'tcp') {
    if (!data.host) ctx.addIssue({ code: 'custom', path: ['host'], message: 'Host is required' });
    if (!data.port) ctx.addIssue({ code: 'custom', path: ['port'], message: 'Port is required' });
  }
  if (data.type === 'ssl' || data.type === 'domain') {
    if (!data.domain) ctx.addIssue({ code: 'custom', path: ['domain'], message: 'Domain is required' });
  }
  if (data.type === 'keyword') {
    if (!data.keyword) ctx.addIssue({ code: 'custom', path: ['keyword'], message: 'Keyword is required' });
    if (!data.keywordCondition) ctx.addIssue({ code: 'custom', path: ['keywordCondition'], message: 'Condition is required' });
  }
});

export type MonitorFormValues = z.infer<typeof formSchema>;

interface MonitorFormProps {
  defaultValues?: Partial<MonitorFormValues>;
  plan: PlanTier;
  onSubmit: (data: MonitorFormValues) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

export function MonitorForm({ defaultValues, plan, onSubmit, isSubmitting, error }: MonitorFormProps) {
  const minInterval = PLAN_LIMITS[plan].checkIntervalSeconds;

  const form = useForm<MonitorFormValues>({
    resolver: standardSchemaResolver(formSchema) as unknown as Resolver<MonitorFormValues>,
    defaultValues: {
      name: '',
      isCompetitor: false,
      type: 'http',
      intervalSeconds: minInterval,
      timeoutMs: 30000,
      anomalyDetectionEnabled: false,
      ...defaultValues,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedType = form.watch('type');
  const intervalValue = form.watch('intervalSeconds');
  const intervalTooLow = Number(intervalValue) < minInterval;

  const needsUrl = selectedType === 'http' || selectedType === 'keyword' || selectedType === 'content';
  const needsDomain = selectedType === 'ssl' || selectedType === 'domain';
  const needsTcp = selectedType === 'tcp';
  const needsKeyword = selectedType === 'keyword';
  const needsTimeout = selectedType === 'http' || selectedType === 'tcp' || selectedType === 'keyword' || selectedType === 'content';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My website" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isCompetitor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What are you monitoring?</FormLabel>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => field.onChange(false)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                    !field.value
                      ? 'border-brand-green bg-brand-green/10 text-brand-green-ink font-medium'
                      : 'border-brand-line bg-brand-surface text-brand-muted hover:text-brand-dim'
                  }`}
                >
                  My store
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange(true)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                    field.value
                      ? 'border-teal-600/40 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium'
                      : 'border-brand-line bg-brand-surface text-brand-muted hover:text-brand-dim'
                  }`}
                >
                  A competitor
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monitor type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="http">HTTP — status code &amp; response time</SelectItem>
                  <SelectItem value="ssl">SSL — certificate expiry</SelectItem>
                  <SelectItem value="domain">Domain — WHOIS expiry</SelectItem>
                  <SelectItem value="tcp">TCP — port availability</SelectItem>
                  <SelectItem value="keyword">Keyword — text present/absent</SelectItem>
                  <SelectItem value="content">Content — HTML change detection</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {needsUrl && (
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {needsDomain && (
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain</FormLabel>
                <FormControl>
                  <Input placeholder="example.com" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {needsTcp && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <FormControl>
                    <Input placeholder="db.example.com" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5432" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {needsKeyword && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="keyword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keyword</FormLabel>
                  <FormControl>
                    <Input placeholder="In stock" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keywordCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {selectedType === 'content' && (
          <FormField
            control={form.control}
            name="cssSelector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CSS selector <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder=".price" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>Leave blank to monitor the entire page body.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
              <FormControl>
                <TagInput value={field.value ?? []} onChange={field.onChange} />
              </FormControl>
              <FormDescription>Group monitors with tags like &quot;production&quot; or &quot;customer-facing&quot;. Press Enter or comma to add.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedType === 'http' && (
          <FormField
            control={form.control}
            name="responseTimeThresholdMs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Response time threshold <span className="text-muted-foreground font-normal">(ms, optional)</span></FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2000" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>Alert if response time exceeds this value.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(selectedType === 'http' || selectedType === 'keyword') && (
          <FormField
            control={form.control}
            name="anomalyDetectionEnabled"
            render={({ field }) => (
              <FormItem className="flex items-start justify-between gap-3 rounded-lg border border-brand-line p-3">
                <div>
                  <FormLabel>Smart Alerts</FormLabel>
                  <FormDescription>
                    Alert when response time is a statistical outlier (z-score &gt; 3).
                    {plan === 'free' && ' Upgrade to Growth to enable.'}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    disabled={plan === 'free'}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="intervalSeconds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check interval (seconds)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              {intervalTooLow && (
                <p className="text-sm text-amber-600">
                  Your plan minimum is {minInterval}s. Upgrade to reduce the interval.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {needsTimeout && (
          <FormField
            control={form.control}
            name="timeoutMs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timeout (ms)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30000" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isSubmitting || intervalTooLow}>
          {isSubmitting ? 'Saving…' : 'Save monitor'}
        </Button>
      </form>
    </Form>
  );
}

function TagInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState('');

  function commit(raw: string) {
    const next = raw.trim().replace(/^,+|,+$/g, '').trim();
    if (!next) return;
    if (value.includes(next)) {
      setDraft('');
      return;
    }
    if (value.length >= 20) return;
    onChange([...value, next]);
    setDraft('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded bg-brand-bg3 px-2 py-0.5 text-xs text-brand-text"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            className="text-brand-muted transition-colors hover:text-brand-red"
            aria-label={`Remove tag ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft)}
        placeholder={value.length === 0 ? 'production, api, customer-facing' : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-brand-muted"
      />
    </div>
  );
}
