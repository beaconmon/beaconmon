import type { MonitorType } from './monitor.js';
import type { ProbeRegion } from './regions.js';

export type CheckErrorType =
  | 'timeout'
  | 'connection_refused'
  | 'non_2xx'
  | 'ssl_error'
  | 'dns_error'
  | 'keyword_not_found'
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
  region?: ProbeRegion | null; // undefined/null = Railway-only check (SSL/TCP/domain)
}
