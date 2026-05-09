'use client';

import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QueryState } from '@/components/dashboard/query-state';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CreateChannelDialog } from '@/components/alert-channels/create-channel-dialog';
import { useAlertChannels, useDeleteAlertChannel } from '@/lib/hooks/use-alert-channels';
import type { AlertChannelRow } from '@/lib/repositories/alert-channels';

const TYPE_LABELS: Record<string, string> = {
  email: 'Email',
  slack: 'Slack',
  discord: 'Discord',
  webhook: 'Webhook',
};

const SLACK_MESSAGES: Record<string, string> = {
  slack_connected: 'Slack channel connected successfully.',
  slack_cancelled: 'Slack connection was cancelled.',
  slack_failed: 'Slack connection failed. Please try again.',
  slack_limit: 'Alert channel limit reached on your current plan.',
};

function configSummary(type: string, config: Record<string, unknown>): string {
  if (type === 'email') {
    const recipients = config['recipients'];
    return Array.isArray(recipients) ? recipients.join(', ') : String(config['address'] ?? '');
  }
  if (type === 'slack' || type === 'discord') {
    const url = String(config['webhookUrl'] ?? '');
    return url.length > 40 ? url.slice(0, 40) + '…' : url;
  }
  if (type === 'webhook') {
    const url = String(config['url'] ?? '');
    return url.length > 40 ? url.slice(0, 40) + '…' : url;
  }
  return '';
}

function SlackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  );
}

function DeleteButton({ channel }: { channel: AlertChannelRow }) {
  const [confirm, setConfirm] = useState(false);
  const del = useDeleteAlertChannel(channel.id);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-brand-muted hover:text-brand-red transition-colors duration-150 active:scale-95"
        onClick={() => setConfirm(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete alert channel</DialogTitle>
            <DialogDescription>
              Remove &quot;{channel.name}&quot;? Existing alert rules using this channel will stop delivering alerts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={del.isPending}
              onClick={() => del.mutate(undefined, { onSuccess: () => setConfirm(false) })}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AlertChannelsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ success: boolean; message: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const err = params.get('error');
    const key = success ?? err ?? null;
    return key && SLACK_MESSAGES[key] ? { success: !!success, message: SLACK_MESSAGES[key]! } : null;
  });
  const { data: channels, isLoading, isError, error, refetch } = useAlertChannels();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const err = params.get('error');
    const key = success ?? err ?? null;
    if (key && SLACK_MESSAGES[key]) {
      window.history.replaceState({}, '', window.location.pathname);
      if (success) refetch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-text">Alert channels</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            asChild
          >
            <a href="/api/integrations/slack/connect">
              <SlackIcon className="mr-1.5 h-4 w-4" />
              Connect Slack
            </a>
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add channel
          </Button>
        </div>
      </div>

      {notification && (
        <Alert
          variant={notification.success ? 'default' : 'destructive'}
          className={notification.success ? 'border-green-500/50 text-green-700 bg-green-50 dark:bg-green-950/20 dark:text-green-400' : undefined}
        >
          {notification.success
            ? <CheckCircle className="h-4 w-4" />
            : <XCircle className="h-4 w-4" />
          }
          <AlertDescription className="flex items-center justify-between">
            {notification.message}
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-xs underline opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        skeletonRows={3}
      >
        {channels && channels.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No alert channels"
            description="Connect Slack or add a channel to receive downtime alerts via email or webhook."
            action={{ label: 'Add channel', onClick: () => setDialogOpen(true) }}
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-brand-line bg-brand-surface">
            <Table>
              <TableHeader>
                <TableRow className="border-brand-line hover:bg-brand-bg3/40">
                  <TableHead className="text-brand-muted">Name</TableHead>
                  <TableHead className="text-brand-muted">Type</TableHead>
                  <TableHead className="hidden md:table-cell text-brand-muted">Config</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels?.map((channel) => (
                  <TableRow key={channel.id} className="border-brand-line hover:bg-brand-bg3/40 transition-colors duration-150">
                    <TableCell className="font-medium text-sm text-brand-text">{channel.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded border border-brand-line bg-brand-bg3 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-brand-dim">
                        {TYPE_LABELS[channel.type] ?? channel.type}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm font-mono text-brand-muted">
                      {configSummary(channel.type, channel.config)}
                    </TableCell>
                    <TableCell>
                      <DeleteButton channel={channel} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </QueryState>

      <CreateChannelDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
