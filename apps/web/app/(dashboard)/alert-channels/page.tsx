'use client';

import { useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { QueryState } from '@/components/dashboard/query-state';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CreateChannelDialog } from '@/components/alert-channels/create-channel-dialog';
import { useAlertChannels, useDeleteAlertChannel } from '@/lib/hooks/use-alert-channels';
import type { AlertChannelRow } from '@/lib/repositories/alert-channels';

const TYPE_LABELS: Record<string, string> = {
  email: 'Email',
  slack: 'Slack',
  webhook: 'Webhook',
};

function configSummary(type: string, config: Record<string, unknown>): string {
  if (type === 'email') return String(config['address'] ?? '');
  if (type === 'slack') {
    const url = String(config['webhookUrl'] ?? '');
    return url.length > 40 ? url.slice(0, 40) + '…' : url;
  }
  if (type === 'webhook') {
    const url = String(config['url'] ?? '');
    return url.length > 40 ? url.slice(0, 40) + '…' : url;
  }
  return '';
}

function DeleteButton({ channel }: { channel: AlertChannelRow }) {
  const [confirm, setConfirm] = useState(false);
  const del = useDeleteAlertChannel(channel.id);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
  const { data: channels, isLoading, isError, error, refetch } = useAlertChannels();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Alert channels</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add channel
        </Button>
      </div>

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
            description="Add a channel to receive downtime alerts via email, Slack, or webhook."
            action={{ label: 'Add channel', onClick: () => setDialogOpen(true) }}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Config</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels?.map((channel) => (
                  <TableRow key={channel.id}>
                    <TableCell className="font-medium text-sm">{channel.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {TYPE_LABELS[channel.type] ?? channel.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
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
