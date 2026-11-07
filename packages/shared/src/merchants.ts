import { z } from 'zod';
import { phoneNumberSchema } from './users.js';

export const merchantFormSchema = z.object({
  name: z.string().trim().min(1, 'Escribí el nombre del comercio.'),
  contactName: z.string().trim().min(1, 'Escribí el nombre del encargado.'),
  contactEmail: z.email('Escribí un correo válido.').toLowerCase(),
  contactPhone: phoneNumberSchema,
});

export type MerchantForm = z.infer<typeof merchantFormSchema>;

export const merchantSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  name: z.string(),
  contactName: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  createdAt: z.string(),
});

export type Merchant = z.infer<typeof merchantSchema>;
