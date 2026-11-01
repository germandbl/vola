import { z } from 'zod';
import { RoleName, roleNameSchema } from './roles.js';

const MIN_PASSWORD_LENGTH = 8;

export const ASSIGNABLE_ROLES = [RoleName.Administrator, RoleName.Agent] as const;

export const userFormSchema = z.object({
  name: z.string().trim().min(1, 'Escribí el nombre.'),
  email: z.email('Escribí un email válido.').toLowerCase(),
  // Aceptamos espacios y guiones al escribir, pero guardamos el número limpio.
  phoneNumber: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, ''))
    .pipe(
      z
        .string()
        .regex(
          /^\+[0-9]{8,15}$/,
          'Escribí el teléfono con código de país. Ej. +504 9999 8888',
        ),
    ),
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `La contraseña necesita al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    ),
  role: z.enum(ASSIGNABLE_ROLES, { error: 'Elegí un rol.' }),
});

export type UserForm = z.infer<typeof userFormSchema>;

export const userSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  role: roleNameSchema,
  createdAt: z.string(),
});

export type UserSummary = z.infer<typeof userSummarySchema>;
