'use client';

import { useState } from 'react';
import { Globe, Plus, ExternalLink } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
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
              Your page URL: /status/{slug || '…'}
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
        <h1 className="text-xl font-semibold">Status pages</h1>
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="hidden md:table-cell">Custom domain</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages?.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <Link
                        href={`/status-pages/${page.id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {page.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {page.slug}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {page.customDomain ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.isPublic ? 'outline' : 'secondary'} className="text-xs">
                        {page.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`/status/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
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
