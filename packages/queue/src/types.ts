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
}

/** Enqueued by scheduler for content monitors */
export interface ContentCheckJob {
  monitorId: string;
  url: string;
  intervalSeconds: number;
  selector?: string; // CSS selector from monitor.config, if set
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
}

// ─── Queue name constants ─────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  CHECK_SCHEDULED: 'check:scheduled',
  CONTENT_CHECK: 'content:check',
  ALERT_SEND: 'alert:send',
  REPORT_GENERATE: 'report:generate',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
