'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAlertChannel } from '@/lib/hooks/use-alert-channels';

type ChannelType = 'email' | 'slack' | 'webhook';

interface CreateChannelDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CreateChannelDialog({ open, onOpenChange }: CreateChannelDialogProps) {
  const [type, setType] = useState<ChannelType>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const create = useCreateAlertChannel();

  function reset() {
    setType('email');
    setName('');
    setEmail('');
    setWebhookUrl('');
    setUrl('');
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let payload: Parameters<typeof create.mutate>[0];
    if (type === 'email') {
      payload = { type: 'email', name, config: { address: email } };
    } else if (type === 'slack') {
      payload = { type: 'slack', name, config: { webhookUrl } };
    } else {
      payload = { type: 'webhook', name, config: { url } };
    }

    create.mutate(payload, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
      onError: (err) => setError(err.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add alert channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ChannelType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ch-name">Name</Label>
            <Input
              id="ch-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My alert channel"
              required
            />
          </div>

          {type === 'email' && (
            <div className="space-y-1.5">
              <Label htmlFor="ch-email">Email address</Label>
              <Input
                id="ch-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alerts@example.com"
                required
              />
            </div>
          )}

          {type === 'slack' && (
            <div className="space-y-1.5">
              <Label htmlFor="ch-slack">Slack webhook URL</Label>
              <Input
                id="ch-slack"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/…"
                required
              />
            </div>
          )}

          {type === 'webhook' && (
            <div className="space-y-1.5">
              <Label htmlFor="ch-webhook">Webhook URL</Label>
              <Input
                id="ch-webhook"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                required
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Adding…' : 'Add channel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
