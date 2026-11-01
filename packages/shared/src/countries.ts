import { z } from 'zod';

export const countrySchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  currency: z.string(),
});

export type Country = z.infer<typeof countrySchema>;
