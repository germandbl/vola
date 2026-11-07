import type { AuthUser } from './auth.js';
import { OrganizationType } from './organizations.js';
import { Permission } from './permissions.js';
import { RoleName } from './roles.js';

// Estos permisos dan acceso a todos los comercios, así que solo cuentan para usuarios de Volá!, no de un comercio.
function hasPlatformPermission(user: AuthUser, permission: Permission): boolean {
  if (user.organizationType !== OrganizationType.Platform) return false;
  return user.permissions.includes(permission);
}

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

export function canViewAllOrganizations(user: AuthUser): boolean {
  if (canManageAllOrganizations(user)) return true;
  return hasPlatformPermission(user, Permission.ViewOrganizations);
}

export function canViewOrganization(
  user: AuthUser,
  organizationId: number,
): boolean {
  if (canViewAllOrganizations(user)) return true;
  return canManageOrganization(user, organizationId);
}

export function canManageMerchants(user: AuthUser): boolean {
  if (user.role === RoleName.Superadmin) return true;
  return hasPlatformPermission(user, Permission.ManageMerchants);
}

export function canManageDeliveryFees(user: AuthUser): boolean {
  if (user.role === RoleName.Superadmin) return true;
  return hasPlatformPermission(user, Permission.ManageDeliveryFees);
}
