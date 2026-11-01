import { z } from 'zod';

export const OrganizationType = {
  Merchant: 'merchant',
  Platform: 'platform',
} as const;

export type OrganizationType =
  (typeof OrganizationType)[keyof typeof OrganizationType];

export const organizationTypeSchema = z.enum(OrganizationType);

export const organizationFormSchema = z.object({
  name: z.string().trim().min(1, 'Escribí el nombre de la organización.'),
  countryId: z.coerce
    .number({ error: 'Elegí un país.' })
    .int('Elegí un país.')
    .positive('Elegí un país.'),
  type: z.enum(OrganizationType, { error: 'Elegí el tipo de organización.' }),
});

export type OrganizationForm = z.infer<typeof organizationFormSchema>;

export const organizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: organizationTypeSchema,
  countryId: z.number().nullable(),
  countryName: z.string().nullable(),
  createdAt: z.string(),
});

export type Organization = z.infer<typeof organizationSchema>;
