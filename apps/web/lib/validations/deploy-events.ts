import { z } from 'zod';

export const createDeployEventSchema = z.object({
  commitSha: z.string().max(40).optional(),
  description: z.string().max(500).optional(),
  suppressAlerts: z.boolean().optional().default(true),
  durationMinutes: z.number().int().positive().max(120).optional(),
});

export type CreateDeployEventInput = z.infer<typeof createDeployEventSchema>;

export const listDeployEventsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ListDeployEventsQuery = z.infer<typeof listDeployEventsQuerySchema>;
