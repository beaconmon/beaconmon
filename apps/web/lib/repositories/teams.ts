import { prisma } from '@beaconmon/db';

export interface TeamRow {
  id: string;
  name: string;
  plan: string;
  createdAt: Date;
}

export const teamRepository: {
  findById(teamId: string): Promise<TeamRow | null>;
  findCreatedAt(teamId: string): Promise<Date | null>;
} = {
  async findById(teamId) {
    const row = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        plan: true,
        createdAt: true,
      },
    });
    return row as TeamRow | null;
  },

  async findCreatedAt(teamId) {
    const row = await prisma.team.findUnique({
      where: { id: teamId },
      select: { createdAt: true },
    });
    return row?.createdAt ?? null;
  },
};