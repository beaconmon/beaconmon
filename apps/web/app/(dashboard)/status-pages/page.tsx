'use client';

import { useState } from 'react';
import { Globe, Plus, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { QueryState } from '@/components/dashboard/query-state';
import { EmptyState } from '@/components/dashboard/empty-state';
import { useStatusPages, useCreateStatusPage } from '@/lib/hooks/use-status-pages';
import Link from 'next/link';

function CreateStatusPageDialog({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const create = useCreateStatusPage();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    create.mutate({ name, slug }, {
      onSuccess: () => {
        setName('');
        setSlug('');
        onOpenChange(false);
      },
      onError: (err) => setError(err.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New status page</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sp-name">Name</Label>
            <Input
              id="sp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="System Status"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-slug">Slug</Label>
            <Input
              id="sp-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="my-company"
              required
            />
            <p className="text-xs text-muted-foreground">
              Your page URL: /s/{slug || '…'}
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function StatusPagesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: pages, isLoading, isError, error, refetch } = useStatusPages();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-text">Status pages</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New status page
        </Button>
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        skeletonRows={3}
      >
        {pages && pages.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No status pages"
            description="Create a public status page to show your users the health of your services."
            action={{ label: 'New status page', onClick: () => setDialogOpen(true) }}
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-brand-line bg-brand-surface">
            <Table>
              <TableHeader>
                <TableRow className="border-brand-line hover:bg-brand-bg3/40">
                  <TableHead className="text-brand-muted">Name</TableHead>
                  <TableHead className="text-brand-muted">Slug</TableHead>
                  <TableHead className="hidden md:table-cell text-brand-muted">Custom domain</TableHead>
                  <TableHead className="text-brand-muted">Visibility</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages?.map((page) => (
                  <TableRow key={page.id} className="border-brand-line hover:bg-brand-bg3/40 transition-colors duration-150">
                    <TableCell>
                      <Link
                        href={`/status-pages/${page.id}`}
                        className="font-medium text-sm text-brand-text hover:text-brand-green transition-colors duration-150"
                      >
                        {page.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-brand-muted">
                      {page.slug}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm text-brand-muted">
                      {page.customDomain ?? '—'}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium tracking-wider',
                        page.isPublic
                          ? 'border-brand-green/30 bg-brand-green/10 text-brand-green'
                          : 'border-brand-line bg-brand-bg3 text-brand-muted'
                      )}>
                        {page.isPublic ? 'Public' : 'Private'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`/s/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-brand-muted hover:text-brand-dim transition-colors duration-150"
                      >
                        Preview
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </QueryState>

      <CreateStatusPageDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
