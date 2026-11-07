import { z } from 'zod';

export const Permission = {
  ViewOrganizations: 'organizations.view',
  ManageDeliveryFees: 'delivery_fees.manage',
  ManageMerchants: 'merchants.manage',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const permissionSchema = z.enum(Permission);
