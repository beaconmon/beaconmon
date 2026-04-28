export type ResolutionType = 'automatic' | 'manual';

export interface Incident {
  id: string;
  teamId: string;
  monitorId: string;
  startedAt: Date;
  resolvedAt: Date | null;
  resolutionType: ResolutionType | null;
  acknowledgedAt: Date | null;
  acknowledgedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
