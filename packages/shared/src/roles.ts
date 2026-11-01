import { z } from 'zod';

export const RoleName = {
  Superadmin: 'superadmin',
  Administrator: 'administrator',
  Agent: 'agent',
  Driver: 'driver',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export const roleNameSchema = z.enum(RoleName);
