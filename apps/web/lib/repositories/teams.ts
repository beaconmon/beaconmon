import { prisma } from '@beaconmon/db';

export interface TeamRow {
  id: string;
  name: string;
  plan: string;
  createdAt: Date;
  trialEndsAt: Date | null;
}

export interface TeamMemberRow {
  id: string;
  userId: string;
  role: string;
  joinedAt: Date;
  user: {
    name: string;
    email: string;
  };
}

export interface MembershipRow {
  teamId: string;
  teamName: string;
  plan: string;
  role: string;
}

export const teamRepository: {
  findById(teamId: string): Promise<TeamRow | null>;
  findCreatedAt(teamId: string): Promise<Date | null>;
  findMembers(teamId: string): Promise<TeamMemberRow[]>;
  findUserMemberships(userId: string): Promise<MembershipRow[]>;
  isMember(teamId: string, userId: string): Promise<boolean>;
  countMembers(teamId: string): Promise<number>;
  removeMember(teamId: string, userId: string): Promise<void>;
  updateMemberRole(teamId: string, userId: string, role: string): Promise<void>;
} = {
  async findById(teamId) {
    const row = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        plan: true,
        createdAt: true,
        trialEndsAt: true,
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

  async findMembers(teamId) {
    const rows = await prisma.teamMember.findMany({
      where: { teamId },
      select: {
        id: true,
        userId: true,
        role: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      role: r.role as string,
      joinedAt: r.createdAt,
      user: r.user,
    }));
  },

  async findUserMemberships(userId) {
    const rows = await prisma.teamMember.findMany({
      where: { userId },
      select: {
        role: true,
        team: { select: { id: true, name: true, plan: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({
      teamId: r.team.id,
      teamName: r.team.name,
      plan: r.team.plan as string,
      role: r.role as string,
    }));
  },

  async isMember(teamId, userId) {
    const m = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
      select: { teamId: true },
    });
    return m !== null;
  },

  async countMembers(teamId) {
    return prisma.teamMember.count({ where: { teamId } });
  },

  async removeMember(teamId, userId) {
    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId } },
    });
  },

  async updateMemberRole(teamId, userId, role) {
    await prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId } },
      data: { role: role as 'owner' | 'admin' | 'viewer' },
    });
  },
};