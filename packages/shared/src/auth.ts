import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Escribí un email válido.').toLowerCase(),
  password: z.string().min(1, 'Escribí tu contraseña.'),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  roleId: number;
  organizationId: number;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
