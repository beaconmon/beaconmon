import { prisma } from '../index.js';
import type { Incident, ResolutionType } from '@beaconmon/types';

export interface CreateIncidentData {
  monitorId: string;
  teamId: string;
  startedAt: Date;
}

export interface ResolveIncidentData {
  resolvedAt: Date;
  resolutionType: ResolutionType;
}

export const incidentRepository = {
  async create(data: CreateIncidentData): Promise<Incident> {
    const incident = await prisma.incident.create({
      data: {
        monitorId: data.monitorId,
        teamId: data.teamId,
        startedAt: data.startedAt,
      },
    });

    return {
      ...incident,
      resolutionType: incident.resolutionType as ResolutionType | null,
    };
  },

  async findOpenByMonitorId(monitorId: string): Promise<Incident | null> {
    const incident = await prisma.incident.findFirst({
      where: {
        monitorId,
        resolvedAt: null,
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!incident) return null;

    return {
      ...incident,
      resolutionType: incident.resolutionType as ResolutionType | null,
    };
  },

  async resolve(
    incidentId: string,
    data: ResolveIncidentData
  ): Promise<Incident> {
    const incident = await prisma.incident.update({
      where: { id: incidentId },
      data: {
        resolvedAt: data.resolvedAt,
        resolutionType: data.resolutionType,
      },
    });

    return {
      ...incident,
      resolutionType: incident.resolutionType as ResolutionType | null,
    };
  },
};
