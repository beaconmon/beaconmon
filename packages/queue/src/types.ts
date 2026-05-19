// ─── Job payload types ────────────────────────────────────────────────────────
// All job definitions — every queue payload must be typed here.

import type { ProbeRegion } from '@beaconmon/types';

/** Enqueued by scheduler per active non-content monitor */
export interface CheckJob {
  monitorId: string;
  url: string;
  type: 'http' | 'ssl' | 'domain' | 'tcp' | 'keyword';
  intervalSeconds: number;
  timeoutMs: number;
  regions?: ProbeRegion[]; // only for http/keyword; absent = existing behavior
  keyword?: string;             // keyword monitors only
  keywordCondition?: 'present' | 'absent'; // keyword monitors only
  inMaintenance?: boolean; // true when a maintenance window is active for this monitor
}

/** Enqueued by scheduler for content monitors */
export interface ContentCheckJob {
  monitorId: string;
  url: string;
  intervalSeconds: number;
  selector?: string; // CSS selector from monitor.config, if set
  inMaintenance?: boolean; // true when a maintenance window is active for this monitor
  isCompetitor?: boolean; // true for competitor-intelligence monitors
  instantAlerts?: boolean; // when true, competitor monitors fire per-change alerts like regular content monitors
}

/** Enqueued by check-worker on monitor status transition (down or recovery) */
export interface AlertJob {
  incidentId: string;
  monitorId: string;
  teamId: string;
  type: 'down' | 'up';
  durationMs?: number; // only present for 'up' (recovery)
}

/** Enqueued weekly for paid teams (tier 2) */
export interface ReportJob {
  teamId: string;
  periodStart: string; // ISO date string
  periodEnd: string;   // ISO date string
  clientName: string;
  clientNotes?: string;
}

/** Enqueued by scheduler when SLO burn rate exceeds threshold */
export interface SloBurnAlertJob {
  monitorId: string;
  teamId: string;
  burnRate: number;
  severity: 'fast' | 'slow'; // fast = budget exhausted in ~1h, slow = ~10d
  uptimePercent: number;
  errorBudgetRemainingMinutes: number;
  windowDays: number;
}

/** Enqueued when an incident is created and the monitor has an escalation policy */
export interface EscalationStepJob {
  incidentId: string;
  monitorId: string;
  policyId: string;
  teamId: string;
  stepIndex: number; // 0-based index into the policy's steps array
}

/** Enqueued daily by the scheduler for each team with active competitor monitors */
export interface CompetitorDigestJob {
  teamId: string;
  windowStart: string; // ISO date string
  windowEnd: string;   // ISO date string
}

/** Enqueued by content-check worker when a content change is confirmed */
export interface ContentNotifyJob {
  teamId: string;
  monitorName: string;
  monitorUrl: string;
  monitorId: string;
  changedAt: string; // ISO date string
  summary?: string;
  classification?: string;
  appUrl?: string;
}

// ─── Queue name constants ─────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  CHECK_SCHEDULED: 'check-scheduled',
  CONTENT_CHECK: 'content-check',
  CONTENT_NOTIFY: 'content-notify',
  ALERT_SEND: 'alert-send',
  REPORT_GENERATE: 'report-generate',
  ESCALATION_STEP: 'escalation-step',
  SLO_BURN: 'slo-burn',
  COMPETITOR_DIGEST: 'competitor-digest',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
