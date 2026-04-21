export type MonitorType =
  | 'http'
  | 'ssl'
  | 'domain'
  | 'tcp'
  | 'keyword'
  | 'content';

export type MonitorStatus = 'up' | 'down' | 'paused';

export type KeywordCondition = 'present' | 'absent';

export interface Monitor {
  id: string;
  teamId: string;
  name: string;
  url: string;
  type: MonitorType;
  isActive: boolean;
  currentStatus: MonitorStatus;
  intervalSeconds: number;
  timeoutMs: number;
  nextCheckAt: Date | null;
  lastCheckedAt: Date | null;
  consecutiveFailures: number;

  // HTTP / keyword extras
  responseTimeThresholdMs: number | null;
  keyword: string | null;
  keywordCondition: KeywordCondition | null;

  // Content monitor
  contentSnapshot: string | null;
  contentLastChangedAt: Date | null;
  requiresJs: boolean;

  // Type-specific config (port number for TCP, selector for content, etc.)
  config: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}
