import { prisma } from '@beaconmon/db';

export interface InvitationRow {
  id: string;
  teamId: string;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export const invitationRepository: {
  findPending(teamId: string): Promise<InvitationRow[]>;
  findByToken(token: string): Promise<(InvitationRow & { team: { name: string } }) | null>;
  findByEmail(teamId: string, email: string): Promise<InvitationRow | null>;
  create(
    teamId: string,
    email: string,
    role: string,
    token: string,
    expiresAt: Date
  ): Promise<InvitationRow>;
  accept(token: string, userId: string): Promise<void>;
  revoke(teamId: string, invitationId: string): Promise<void>;
  resend(
    teamId: string,
    invitationId: string,
    newToken: string,
    newExpiresAt: Date
  ): Promise<InvitationRow>;
} = {
  async findPending(teamId) {
    const rows = await prisma.teamInvitation.findMany({
      where: { teamId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    return rows as InvitationRow[];
  },

  async findByToken(token) {
    const row = await prisma.teamInvitation.findUnique({
      where: { token },
      include: { team: { select: { name: true } } },
    });
    if (!row) return null;
    return row as InvitationRow & { team: { name: string } };
  },

  async findByEmail(teamId, email) {
    const row = await prisma.teamInvitation.findFirst({
      where: { teamId, email, acceptedAt: null, expiresAt: { gt: new Date() } },
    });
    return row as InvitationRow | null;
  },

  async create(teamId, email, role, token, expiresAt) {
    const row = await prisma.teamInvitation.create({
      data: {
        teamId,
        email,
        role: role as 'owner' | 'admin' | 'viewer',
        token,
        expiresAt,
      },
    });
    return row as InvitationRow;
  },

  async accept(token, userId) {
    await prisma.$transaction(async (tx) => {
      const invitation = await tx.teamInvitation.findUnique({ where: { token } });
      if (!invitation) throw new Error('Invitation not found');
      if (invitation.acceptedAt) throw new Error('Invitation already accepted');
      if (invitation.expiresAt < new Date()) throw new Error('Invitation expired');

      await tx.teamInvitation.update({
        where: { token },
        data: { acceptedAt: new Date() },
      });

      await tx.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId,
          role: invitation.role,
        },
      });
    });
  },

  async revoke(teamId, invitationId) {
    await prisma.teamInvitation.delete({
      where: { id: invitationId, teamId },
    });
  },

  async resend(teamId, invitationId, newToken, newExpiresAt) {
    const row = await prisma.teamInvitation.update({
      where: { id: invitationId, teamId },
      data: { token: newToken, expiresAt: newExpiresAt },
    });
    return row as InvitationRow;
  },
};
