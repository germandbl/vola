import { z } from 'zod';

export const Permission = {
  ViewOrganizations: 'organizations.view',
  ManageDeliveryFees: 'delivery_fees.manage',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const permissionSchema = z.enum(Permission);
