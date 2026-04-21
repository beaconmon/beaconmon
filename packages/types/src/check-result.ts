import type { MonitorType } from './monitor.js';

export type CheckErrorType =
  | 'timeout'
  | 'connection_refused'
  | 'non_2xx'
  | 'ssl_error'
  | 'dns_error'
  | 'unknown';

export interface CheckResult {
  monitorId: string;
  checkedAt: Date;
  success: boolean;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorType: CheckErrorType | null;
  errorMessage: string | null;
  type: MonitorType;
}
