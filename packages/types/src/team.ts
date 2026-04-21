import type { PlanTier } from './plan.js';

export type TeamRole = 'owner' | 'admin' | 'viewer';

export interface Team {
  id: string;
  name: string;
  plan: PlanTier;
  trialEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  createdAt: Date;
  updatedAt: Date;
}
