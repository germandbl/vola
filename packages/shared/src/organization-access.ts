import type { AuthUser } from './auth.js';
import { OrganizationType } from './organizations.js';
import { RoleName } from './roles.js';

export function canManageAllOrganizations(user: AuthUser): boolean {
  if (user.role === RoleName.Superadmin) return true;
  if (user.role !== RoleName.Administrator) return false;
  return user.organizationType === OrganizationType.Platform;
}

export function canManageOrganization(
  user: AuthUser,
  organizationId: number,
): boolean {
  if (canManageAllOrganizations(user)) return true;
  if (user.role !== RoleName.Administrator) return false;
  return user.organizationId === organizationId;
}
