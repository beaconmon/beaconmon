import { z } from 'zod';

export const listSnapshotsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(30),
});

export type ListSnapshotsQuery = z.infer<typeof listSnapshotsQuerySchema>;

export const diffSnapshotsQuerySchema = z.object({
  from: z.string().min(1, 'from snapshot id is required'),
  to: z.string().min(1, 'to snapshot id is required'),
});

export type DiffSnapshotsQuery = z.infer<typeof diffSnapshotsQuerySchema>;
