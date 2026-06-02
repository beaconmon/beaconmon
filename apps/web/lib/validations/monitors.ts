import { z } from 'zod';

export const tagSchema = z
  .string()
  .min(1)
  .max(32)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/, 'Tag must be alphanumeric with -, _, or spaces');

const monitorBaseSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  type: z.enum(['http', 'ssl', 'domain', 'tcp', 'keyword', 'content', 'heartbeat']),
  intervalSeconds: z.number().int().positive(),
  timeoutMs: z.number().int().positive().optional(),
  responseTimeThresholdMs: z.number().int().positive().optional(),
  keyword: z.string().optional(),
  keywordCondition: z.enum(['present', 'absent']).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  anomalyDetectionEnabled: z.boolean().optional(),
  tags: z.array(tagSchema).max(20).optional(),
});

export const createMonitorSchema = monitorBaseSchema;

export type CreateMonitorInput = z.infer<typeof createMonitorSchema>;

export const updateMonitorSchema = monitorBaseSchema.partial();

export type UpdateMonitorInput = z.infer<typeof updateMonitorSchema>;

export const checkResultsQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  limit: z.coerce.number().int().positive().max(2000).default(50),
});

export type CheckResultsQuery = z.infer<typeof checkResultsQuerySchema>;
