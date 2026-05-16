'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  GripVertical,
  Hash,
  Plus,
  Pencil,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useTeamMembers } from '@/lib/hooks/use-team';
import {
  useEscalationPolicies,
  useCreateEscalationPolicy,
  useUpdateEscalationPolicy,
  useDeleteEscalationPolicy,
  type EscalationPolicyRow,
} from '@/lib/hooks/use-escalation-policies';
import type { EscalationStepInput } from '@/lib/repositories/escalation-policies';

// ─── Step editor row ──────────────────────────────────────────────────────────

type RecipientChip =
  | { kind: 'channel'; id: string; channelId: string; label: string }
  | { kind: 'user'; id: string; userId: string; label: string }
  | { kind: 'removed_user'; id: string; label: string };

interface StepDraft {
  key: string;
  delayMinutes: number;
  recipients: RecipientChip[];
}

interface ChannelOption {
  id: string;
  name: string;
}

interface UserOption {
  userId: string;
  name: string;
  email: string;
  role: string;
}

function RecipientPicker({
  step,
  channelOptions,
  userOptions,
  onAddChannel,
  onAddUser,
  onRemove,
}: {
  step: StepDraft;
  channelOptions: ChannelOption[];
  userOptions: UserOption[];
  onAddChannel: (channelId: string) => void;
  onAddUser: (userId: string) => void;
  onRemove: (chipId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'channels' | 'users'>('channels');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const usedChannelIds = new Set(
    step.recipients.filter((r) => r.kind === 'channel').map((r) => r.channelId)
  );
  const usedUserIds = new Set(
    step.recipients.filter((r) => r.kind === 'user').map((r) => r.userId)
  );

  const availableChannels = channelOptions.filter((c) => !usedChannelIds.has(c.id));

  return (
    <div className="flex flex-1 flex-wrap items-center gap-1.5 min-w-0">
      {step.recipients.map((r) => (
        <span
          key={r.id}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs',
            r.kind === 'channel' && 'border border-brand-line bg-brand-bg text-brand-text',
            r.kind === 'user' && 'border border-brand-green/30 bg-brand-green/10 text-brand-text',
            r.kind === 'removed_user' && 'border border-brand-red/40 bg-brand-red/10 text-brand-red'
          )}
          title={r.kind === 'removed_user' ? 'This user was removed from the team' : undefined}
        >
          {r.kind === 'channel' && <Hash className="h-3 w-3 text-brand-muted" />}
          {r.kind === 'user' && <UserIcon className="h-3 w-3 text-brand-green" />}
          {r.kind === 'removed_user' && <AlertTriangle className="h-3 w-3" />}
          <span className="max-w-[140px] truncate">{r.label}</span>
          <button
            type="button"
            onClick={() => onRemove(r.id)}
            className="rounded p-0.5 text-brand-muted transition-colors hover:text-brand-red"
            aria-label="Remove recipient"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 rounded-md border border-dashed border-brand-line px-2 py-1 text-xs text-brand-dim transition-colors hover:border-brand-outline hover:text-brand-text"
        >
          <Plus className="h-3 w-3" />
          Add recipient
        </button>

        {open && (
          <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-md border border-brand-line bg-brand-surface shadow-lg">
            <div className="flex border-b border-brand-line">
              <button
                type="button"
                onClick={() => setTab('channels')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors',
                  tab === 'channels'
                    ? 'border-b-2 border-brand-green text-brand-text'
                    : 'text-brand-dim hover:text-brand-text'
                )}
              >
                <Hash className="h-3 w-3" /> Channels
              </button>
              <button
                type="button"
                onClick={() => setTab('users')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors',
                  tab === 'users'
                    ? 'border-b-2 border-brand-green text-brand-text'
                    : 'text-brand-dim hover:text-brand-text'
                )}
              >
                <UserIcon className="h-3 w-3" /> Users
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto p-1">
              {tab === 'channels' &&
                (availableChannels.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-brand-muted">
                    No channels left to add.
                  </p>
                ) : (
                  availableChannels.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onAddChannel(c.id);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs text-brand-text hover:bg-brand-bg3"
                    >
                      <Hash className="h-3 w-3 shrink-0 text-brand-muted" />
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))
                ))}
              {tab === 'users' &&
                (userOptions.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-brand-muted">
                    No team members yet.
                  </p>
                ) : (
                  userOptions.map((u) => {
                    const taken = usedUserIds.has(u.userId);
                    const isViewer = u.role === 'viewer';
                    const disabled = taken || isViewer;
                    return (
                      <button
                        key={u.userId}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) return;
                          onAddUser(u.userId);
                          setOpen(false);
                        }}
                        title={
                          isViewer
                            ? 'Viewers cannot be assigned to escalation steps'
                            : taken
                              ? 'Already added to this step'
                              : undefined
                        }
                        className={cn(
                          'flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs',
                          disabled
                            ? 'cursor-not-allowed text-brand-muted opacity-60'
                            : 'text-brand-text hover:bg-brand-bg3'
                        )}
                      >
                        <UserIcon className="h-3 w-3 shrink-0 text-brand-muted" />
                        <span className="flex-1 truncate">{u.name}</span>
                        {isViewer && (
                          <span className="text-[10px] uppercase text-brand-muted">viewer</span>
                        )}
                      </button>
                    );
                  })
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepRow({
  step,
  index,
  total,
  channelOptions,
  userOptions,
  onUpdate,
  onRemoveStep,
  onAddChannel,
  onAddUser,
  onRemoveRecipient,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  step: StepDraft;
  index: number;
  total: number;
  channelOptions: ChannelOption[];
  userOptions: UserOption[];
  onUpdate: (key: string, patch: Partial<StepDraft>) => void;
  onRemoveStep: (key: string) => void;
  onAddChannel: (stepKey: string, channelId: string) => void;
  onAddUser: (stepKey: string, userId: string) => void;
  onRemoveRecipient: (stepKey: string, chipId: string) => void;
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
      className="flex items-start gap-2 rounded-md border border-brand-line bg-brand-bg2 px-3 py-2"
    >
      <GripVertical className="mt-1.5 h-4 w-4 shrink-0 cursor-grab text-brand-muted" />
      <span className="mt-1.5 w-5 shrink-0 text-center text-xs font-semibold text-brand-muted">
        {index + 1}
      </span>

      <div className="flex flex-1 flex-col gap-2 min-w-0">
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

        <RecipientPicker
          step={step}
          channelOptions={channelOptions}
          userOptions={userOptions}
          onAddChannel={(id) => onAddChannel(step.key, id)}
          onAddUser={(id) => onAddUser(step.key, id)}
          onRemove={(chipId) => onRemoveRecipient(step.key, chipId)}
        />
      </div>

      <button
        type="button"
        onClick={() => onRemoveStep(step.key)}
        disabled={total === 1}
        className="mt-1.5 shrink-0 rounded p-1 text-brand-muted transition-colors hover:text-brand-red disabled:opacity-30"
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
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: EscalationPolicyRow | null;
  onCreated?: (info: { name: string; wasSetAsDefault: boolean }) => void;
}) {
  const channelsQ = useAlertChannels();
  const membersQ = useTeamMembers();
  const createPolicy = useCreateEscalationPolicy();
  const updatePolicy = useUpdateEscalationPolicy(editing?.id ?? '');

  const [name, setName] = useState(editing?.name ?? '');
  const [steps, setSteps] = useState<StepDraft[]>(() => {
    if (editing && editing.steps.length > 0) {
      return editing.steps.map((s) => ({
        key: s.id,
        delayMinutes: s.delayMinutes,
        recipients: s.recipients.map((r) => {
          if (r.kind === 'channel') {
            return { kind: 'channel' as const, id: r.id, channelId: r.channelId!, label: r.channelName ?? 'Channel' };
          }
          if (r.kind === 'user') {
            return { kind: 'user' as const, id: r.id, userId: r.userId!, label: r.userName ?? r.userEmail ?? 'Member' };
          }
          return { kind: 'removed_user' as const, id: r.id, label: 'Removed user' };
        }),
      }));
    }
    return [{ key: crypto.randomUUID(), delayMinutes: 0, recipients: [] }];
  });
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const channelOptions = useMemo<ChannelOption[]>(
    () => channelsQ.data?.map((ch) => ({ id: ch.id, name: ch.name })) ?? [],
    [channelsQ.data]
  );
  const userOptions = useMemo<UserOption[]>(
    () =>
      membersQ.data?.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
      })) ?? [],
    [membersQ.data]
  );

  function patchStep(key: string, patch: Partial<StepDraft>) {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  function addChannel(stepKey: string, channelId: string) {
    const ch = channelOptions.find((c) => c.id === channelId);
    if (!ch) return;
    setSteps((prev) =>
      prev.map((s) =>
        s.key === stepKey
          ? {
              ...s,
              recipients: [
                ...s.recipients,
                {
                  kind: 'channel',
                  id: crypto.randomUUID(),
                  channelId: ch.id,
                  label: ch.name,
                },
              ],
            }
          : s
      )
    );
  }

  function addUser(stepKey: string, userId: string) {
    const u = userOptions.find((m) => m.userId === userId);
    if (!u) return;
    setSteps((prev) =>
      prev.map((s) =>
        s.key === stepKey
          ? {
              ...s,
              recipients: [
                ...s.recipients,
                { kind: 'user', id: crypto.randomUUID(), userId: u.userId, label: u.name },
              ],
            }
          : s
      )
    );
  }

  function removeRecipient(stepKey: string, chipId: string) {
    setSteps((prev) =>
      prev.map((s) =>
        s.key === stepKey
          ? { ...s, recipients: s.recipients.filter((r) => r.id !== chipId) }
          : s
      )
    );
  }

  function removeStep(key: string) {
    setSteps((prev) => prev.filter((s) => s.key !== key));
  }

  function addStep() {
    if (steps.length >= 10) return;
    setSteps((prev) => [
      ...prev,
      { key: crypto.randomUUID(), delayMinutes: 5, recipients: [] },
    ]);
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
      channelIds: s.recipients
        .filter((r): r is Extract<RecipientChip, { kind: 'channel' }> => r.kind === 'channel')
        .map((r) => r.channelId),
      userIds: s.recipients
        .filter((r): r is Extract<RecipientChip, { kind: 'user' }> => r.kind === 'user')
        .map((r) => r.userId),
    }));

    try {
      if (editing) {
        await updatePolicy.mutateAsync({ name, steps: stepsInput });
      } else {
        const created = await createPolicy.mutateAsync({ name, steps: stepsInput });
        onCreated?.({ name: created.name, wasSetAsDefault: created.wasSetAsDefault });
      }
      onOpenChange(false);
    } catch {
      // surfaced via mutation state
    }
  }

  const isSaving = createPolicy.isPending || updatePolicy.isPending;
  const saveError = createPolicy.error ?? updatePolicy.error;
  const hasRemovedUsers = steps.some((s) => s.recipients.some((r) => r.kind === 'removed_user'));
  const canSave =
    name.trim().length > 0 &&
    steps.length > 0 &&
    steps.every((s) =>
      s.recipients.some((r) => r.kind === 'channel' || r.kind === 'user')
    );

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
        className="flex w-full flex-col gap-0 border-brand-line bg-brand-bg sm:max-w-lg"
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-brand-text">Steps</span>
              <span className="text-xs text-brand-muted">{steps.length}/10</span>
            </div>

            {channelOptions.length === 0 && userOptions.length === 0 && !channelsQ.isLoading && !membersQ.isLoading && (
              <div className="rounded-md border border-brand-line bg-brand-bg2 px-4 py-3 text-xs text-brand-muted">
                No alert channels or team members configured yet.{' '}
                <Link href="/alert-channels" className="text-brand-dim underline hover:text-brand-text">
                  Set one up →
                </Link>
              </div>
            )}

            {hasRemovedUsers && (
              <div className="flex items-start gap-2 rounded-md border border-brand-red/40 bg-brand-red/10 px-3 py-2 text-xs text-brand-red">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  Some recipients refer to users who were removed from the team. The worker
                  silently skips them — clear the chips to clean up.
                </p>
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
                  userOptions={userOptions}
                  onUpdate={patchStep}
                  onRemoveStep={removeStep}
                  onAddChannel={addChannel}
                  onAddUser={addUser}
                  onRemoveRecipient={removeRecipient}
                  onDragStart={setDragFrom}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={addStep}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={isSaving || !canSave}>
            {isSaving ? 'Saving…' : 'Save policy'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function recipientSummary(policy: EscalationPolicyRow): string {
  let channels = 0;
  let users = 0;
  let removed = 0;
  for (const s of policy.steps) {
    for (const r of s.recipients) {
      if (r.kind === 'channel') channels++;
      else if (r.kind === 'user') users++;
      else removed++;
    }
  }
  const parts: string[] = [];
  if (channels) parts.push(`${channels} ch`);
  if (users) parts.push(`${users} user${users === 1 ? '' : 's'}`);
  if (removed) parts.push(`${removed} removed`);
  return parts.join(' · ') || '—';
}

export default function EscalationPoliciesPage() {
  const policiesQ = useEscalationPolicies();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<EscalationPolicyRow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deletePolicy = useDeleteEscalationPolicy(deletingId ?? '');
  const [defaultBanner, setDefaultBanner] = useState<string | null>(null);

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
      // keep dialog open; error rendered below
    }
  }

  const policies = policiesQ.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-text">Escalation Policies</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-fg transition-colors hover:bg-brand-green/90"
        >
          <Plus className="h-3.5 w-3.5" />
          New policy
        </button>
      </div>

      {defaultBanner && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-md border border-brand-green/30 bg-brand-green/10 px-3.5 py-2.5"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
          <p className="flex-1 text-sm text-brand-text">{defaultBanner}</p>
          <button
            type="button"
            onClick={() => setDefaultBanner(null)}
            className="shrink-0 rounded p-0.5 text-brand-muted transition-colors hover:text-brand-text"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

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
            description="Create a policy to automatically escalate incidents to channels or specific team members."
            action={{ label: 'New policy', onClick: openCreate }}
          />
        ) : (
          <div className="rounded-lg border border-brand-line bg-brand-surface overflow-hidden">
            <div className="grid grid-cols-[1fr,80px,140px,160px] border-b border-brand-line px-4 py-2.5">
              {['Policy name', 'Steps', 'Recipients', 'Actions'].map((h) => (
                <span
                  key={h}
                  className="text-[10px] font-medium uppercase tracking-wider text-brand-muted"
                >
                  {h}
                </span>
              ))}
            </div>

            {policies.map((policy) => (
              <div
                key={policy.id}
                className="grid grid-cols-[1fr,80px,140px,160px] border-b border-brand-line px-4 py-3 last:border-b-0 hover:bg-brand-bg3/30 items-center"
              >
                <span className="text-sm font-medium text-brand-text truncate pr-2">
                  {policy.name}
                </span>
                <span className="text-xs text-brand-muted">
                  {policy.steps.length}
                </span>
                <span className="text-xs text-brand-muted">
                  {recipientSummary(policy)}
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

      <PolicySheet
        key={sheetOpen ? (editingPolicy?.id ?? 'new') : 'closed'}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editingPolicy}
        onCreated={({ name, wasSetAsDefault }) => {
          if (wasSetAsDefault) {
            setDefaultBanner(
              `"${name}" is now your team's default policy — incidents on monitors without an assigned policy will use it.`
            );
          }
        }}
      />

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
