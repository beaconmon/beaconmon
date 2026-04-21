// Standalone input/output types for the checker package.
// The checker has NO queue or database dependencies — these types
// are a subset of what the queue job carries.

export type CheckMonitorType = 'http' | 'ssl' | 'domain' | 'tcp' | 'keyword';

export interface CheckInput {
  monitorId: string;
  url: string;
  type: CheckMonitorType;
  timeoutMs: number;
  intervalSeconds: number;
  /** TCP only: port number */
  port?: number;
  /** Keyword monitors: the keyword to check */
  keyword?: string;
  /** Keyword monitors: present | absent */
  keywordCondition?: 'present' | 'absent';
}
