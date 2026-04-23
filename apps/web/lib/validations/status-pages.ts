import { z } from 'zod';

export const createStatusPageSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export type CreateStatusPageInput = z.infer<typeof createStatusPageSchema>;
