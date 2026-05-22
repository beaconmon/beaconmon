import { z } from 'zod';

export const digestPrefsSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'both']).nullable().default(null),
  channelIds: z.array(z.string()).default([]),
  sections: z
    .object({
      incidents: z.boolean().default(true),
      ownContent: z.boolean().default(true),
      competitors: z.boolean().default(true),
      smartAlerts: z.boolean().default(true),
      expiry: z.boolean().default(true),
    })
    .default({ incidents: true, ownContent: true, competitors: true, smartAlerts: true, expiry: true }),
});

export const updateDigestPrefsSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'both']).nullable(),
  channelIds: z.array(z.string()),
  sections: z.object({
    incidents: z.boolean(),
    ownContent: z.boolean(),
    competitors: z.boolean(),
    smartAlerts: z.boolean(),
    expiry: z.boolean(),
  }),
});

export type DigestPrefs = z.infer<typeof digestPrefsSchema>;
export type UpdateDigestPrefs = z.infer<typeof updateDigestPrefsSchema>;

export const DEFAULT_DIGEST_PREFS: DigestPrefs = {
  frequency: null,
  channelIds: [],
  sections: {
    incidents: true,
    ownContent: true,
    competitors: true,
    smartAlerts: true,
    expiry: true,
  },
};
