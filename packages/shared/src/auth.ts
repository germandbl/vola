import { z } from 'zod';
import { organizationTypeSchema } from './organizations.js';
import { roleNameSchema } from './roles.js';

export const loginSchema = z.object({
  email: z.email('Escribí un email válido.').toLowerCase(),
  password: z.string().min(1, 'Escribí tu contraseña.'),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export const authUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  role: roleNameSchema,
  organizationId: z.number(),
  organizationType: organizationTypeSchema,
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const loginResponseSchema = z.object({
  token: z.string(),
  user: authUserSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
