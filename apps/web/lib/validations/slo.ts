import { z } from 'zod';

export const updateSloSchema = z.object({
  sloTarget: z
    .number()
    .min(0.9, 'SLO target must be at least 90%')
    .max(0.9999, 'SLO target cannot exceed 99.99%')
    .nullable(),
  sloWindowDays: z
    .number()
    .int()
    .min(1)
    .max(90)
    .nullable()
    .optional()
    .default(30),
  sloBurnRateFastThreshold: z
    .number()
    .positive()
    .max(100)
    .optional(),
  sloBurnRateSlowThreshold: z
    .number()
    .positive()
    .max(100)
    .optional(),
});

export type UpdateSloInput = z.infer<typeof updateSloSchema>;
