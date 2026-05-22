import { z } from 'zod';

const freemiusClientSchema = z.object({
  productId: z.string().min(1).optional(),
  starterPlanId: z.string().min(1).optional(),
  sandbox: z.boolean(),
});

export const freemiusConfig = freemiusClientSchema.parse({
  productId: process.env['NEXT_PUBLIC_FREEMIUS_PRODUCT_ID'] || undefined,
  starterPlanId: process.env['NEXT_PUBLIC_FREEMIUS_STARTER_PLAN_ID'] || undefined,
  sandbox: process.env['NEXT_PUBLIC_FREEMIUS_SANDBOX'] === 'true',
});
