export type ResolutionType = 'automatic' | 'manual';

export interface Incident {
  id: string;
  teamId: string;
  monitorId: string;
  startedAt: Date;
  resolvedAt: Date | null;
  resolutionType: ResolutionType | null;
  createdAt: Date;
  updatedAt: Date;
}
