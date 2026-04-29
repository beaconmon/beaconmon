'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitBranch, GripVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/dashboard/empty-state';
import { QueryState } from '@/components/dashboard/query-state';
import { useAlertChannels } from '@/lib/hooks/use-alert-channels';
import {
  useEscalationPolicies,
  useCreateEscalationPolicy,
  useUpdateEscalationPolicy,
  useDeleteEscalationPolicy,
  type EscalationPolicyRow,
} from '@/lib/hooks/use-escalation-policies';
import type { EscalationStepInput } from '@/lib/repositories/escalation-policies';

// ─── Step editor row ──────────────────────────────────────────────────────────

interface StepDraft {
  key: string;
  delayMinutes: number;
  channelId: string;
}

function StepRow({
  step,
  index,
  total,
  channelOptions,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  step: StepDraft;
  index: number;
  total: number;
  channelOptions: { value: string; label: string }[];
  onUpdate: (key: string, patch: Partial<StepDraft>) => void;
  onRemove: (key: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (index: number) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e); }}
      onDrop={() => onDrop(index)}
      className="flex items-center gap-2 rounded-md border border-brand-line bg-brand-bg2 px-3 py-2"
    >
      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-brand-muted" />
      <span className="w-5 shrink-0 text-center text-xs font-semibold text-brand-muted">
        {index + 1}
      </span>

      <div className="flex flex-1 items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <Input
            type="number"
            min={0}
            value={step.delayMinutes}
            onChange={(e) => onUpdate(step.key, { delayMinutes: Number(e.target.value) })}
            className="h-7 w-20 text-xs font-mono"
          />
          <span className="text-xs text-brand-muted whitespace-nowrap">min delay</span>
        </div>

        <Select
          value={step.channelId}
          onValueChange={(v) => onUpdate(step.key, { channelId: v })}
        >
          <SelectTrigger className="h-7 flex-1 text-xs min-w-0">
            <SelectValue placeholder="Select channel…" />
          </SelectTrigger>
          <SelectContent>
            {channelOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <button
        type="button"
        onClick={() => onRemove(step.key)}
        disabled={total === 1}
        className="shrink-0 rounded p-1 text-brand-muted transition-colors hover:text-brand-red disabled:opacity-30"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Policy sheet ─────────────────────────────────────────────────────────────

function PolicySheet({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: EscalationPolicyRow | null;
}) {
  const channelsQ = useAlertChannels();
  const createPolicy = useCreateEscalationPolicy();
  const updatePolicy = useUpdateEscalationPolicy(editing?.id ?? '');

  const [name, setName] = useState('');
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  // Sync form state whenever the sheet opens or the policy being edited changes
  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '');
      if (editing && editing.steps.length > 0) {
        setSteps(
          editing.steps.map((s) => ({
            key: s.id,
            delayMinutes: s.delayMinutes,
            channelId: s.channelId,
          }))
        );
      } else {
        setSteps([{ key: crypto.randomUUID(), delayMinutes: 0, channelId: '' }]);
      }
    }
  }, [open, editing]);

  const channelOptions =
    channelsQ.data?.map((ch) => ({ value: ch.id, label: ch.name })) ?? [];

  function handleUpdate(key: string, patch: Partial<StepDraft>) {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  function handleRemove(key: string) {
    setSteps((prev) => prev.filter((s) => s.key !== key));
  }

  function handleAddStep() {
    if (steps.length >= 10) return;
    setSteps((prev) => [...prev, { key: crypto.randomUUID(), delayMinutes: 5, channelId: '' }]);
  }

  function handleDrop(toIndex: number) {
    if (dragFrom == null || dragFrom === toIndex) return;
    const next = [...steps];
    const [moved] = next.splice(dragFrom, 1);
    if (moved) next.splice(toIndex, 0, moved);
    setSteps(next);
    setDragFrom(null);
  }

  async function handleSave() {
    const stepsInput: EscalationStepInput[] = steps.map((s, i) => ({
      stepOrder: i,
      delayMinutes: s.delayMinutes,
      channelId: s.channelId,
    }));

    try {
      if (editing) {
        await updatePolicy.mutateAsync({ name, steps: stepsInput });
      } else {
        await createPolicy.mutateAsync({ name, steps: stepsInput });
      }
      onOpenChange(false);
    } catch {
      // error shown via mutation state
    }
  }

  const isSaving = createPolicy.isPending || updatePolicy.isPending;
  const saveError = createPolicy.error ?? updatePolicy.error;
  const canSave = name.trim().length > 0 && steps.length > 0 && steps.every((s) => s.channelId);

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          createPolicy.reset();
          updatePolicy.reset();
        }
        onOpenChange(v);
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-brand-line bg-brand-bg sm:max-w-md"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <SheetHeader className="border-b border-brand-line px-6 py-4">
          <SheetTitle className="text-brand-text">
            {editing ? 'Edit policy' : 'New escalation policy'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-text" htmlFor="policy-name">
              Policy name
            </label>
            <Input
              id="policy-name"
              type="text"
              placeholder="On-call rotation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-brand-text">Steps</span>
              <span className="text-xs text-brand-muted">{steps.length}/10</span>
            </div>

            {channelOptions.length === 0 && !channelsQ.isLoading && (
              <div className="rounded-md border border-brand-line bg-brand-bg2 px-4 py-3 text-xs text-brand-muted">
                No alert channels configured yet.{' '}
                <Link href="/alert-channels" className="text-brand-dim underline hover:text-brand-text">
                  Set one up →
                </Link>
              </div>
            )}

            <div className="space-y-2">
              {steps.map((step, index) => (
                <StepRow
                  key={step.key}
                  step={step}
                  index={index}
                  total={steps.length}
                  channelOptions={channelOptions}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                  onDragStart={setDragFrom}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddStep}
              disabled={steps.length >= 10}
              className={cn(
                'flex items-center gap-1.5 text-xs text-brand-dim transition-colors hover:text-brand-text',
                steps.length >= 10 && 'cursor-not-allowed opacity-40'
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              {steps.length >= 10 ? 'Maximum 10 steps' : 'Add step'}
            </button>
          </div>

          {saveError && (
            <p className="text-sm text-red-400">{saveError.message}</p>
          )}
        </div>

        <SheetFooter className="border-t border-brand-line px-6 py-4 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={isSaving || !canSave}>
            {isSaving ? 'Saving…' : 'Save policy'}
          </Button>
          {!canSave && steps.length === 0 && (
            <p className="w-full text-xs text-brand-muted">Add at least one step.</p>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EscalationPoliciesPage() {
  const policiesQ = useEscalationPolicies();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<EscalationPolicyRow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deletePolicy = useDeleteEscalationPolicy(deletingId ?? '');

  function openCreate() {
    setEditingPolicy(null);
    setSheetOpen(true);
  }

  function openEdit(policy: EscalationPolicyRow) {
    setEditingPolicy(policy);
    setSheetOpen(true);
  }

  function openDelete(id: string) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await deletePolicy.mutateAsync();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch {
      // Keep dialog open on error; deletePolicy.error surfaces message below
    }
  }

  const policies = policiesQ.data ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-text">Escalation Policies</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-bg transition-colors hover:bg-brand-green/90"
        >
          <Plus className="h-3.5 w-3.5" />
          New policy
        </button>
      </div>

      <QueryState
        isLoading={policiesQ.isLoading}
        isError={policiesQ.isError}
        error={policiesQ.error}
        onRetry={() => policiesQ.refetch()}
        skeletonRows={3}
      >
        {policies.length === 0 ? (
          <EmptyState
            icon={GitBranch}
            title="No escalation policies"
            description="Create a policy to automatically escalate incidents through alert channels."
            action={{ label: 'New policy', onClick: openCreate }}
          />
        ) : (
          <div className="rounded-lg border border-brand-line bg-brand-surface overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 border-b border-brand-line px-4 py-2.5">
              {['Policy name', 'Steps', 'Actions'].map((h) => (
                <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="grid grid-cols-3 border-b border-brand-line px-4 py-3 last:border-b-0 hover:bg-brand-bg3/30 items-center"
              >
                <span className="text-sm font-medium text-brand-text truncate pr-2">
                  {policy.name}
                </span>
                <span className="text-xs text-brand-muted">
                  {policy.steps.length} {policy.steps.length === 1 ? 'step' : 'steps'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(policy)}
                    className="flex items-center gap-1 rounded-md border border-brand-line px-2.5 py-1 text-xs text-brand-dim transition-colors hover:border-brand-outline hover:text-brand-text"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => openDelete(policy.id)}
                    className="flex items-center gap-1 rounded-md border border-brand-line px-2.5 py-1 text-xs text-brand-dim transition-colors hover:border-brand-red/50 hover:text-brand-red"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </QueryState>

      {/* Sheet */}
      <PolicySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editingPolicy}
      />

      {/* Delete confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete policy</DialogTitle>
            <DialogDescription>
              This will permanently delete the escalation policy. Active incidents using this
              policy will not be affected. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletePolicy.isError && (
            <p className="text-sm text-red-400">{deletePolicy.error?.message}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deletePolicy.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
