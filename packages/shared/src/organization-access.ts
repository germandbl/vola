import type { AuthUser } from "./auth.js";
import { OrganizationType } from "./organizations.js";
import { Permission } from "./permissions.js";
import { RoleName } from "./roles.js";

// Estos permisos dan acceso a todos los comercios, así que solo cuentan para usuarios de Volá!, no de un comercio.
function hasPlatformPermission(
  user: AuthUser,
  permission: Permission,
): boolean {
  if (user.organizationType !== OrganizationType.Platform) return false;
  return user.permissions.includes(permission);
}

// Un usuario del cliente actúa en su propia organización: el administrador siempre, un agent solo con el permiso.
function canActInOwnOrganization(
  user: AuthUser,
  organizationId: number,
  permission: Permission,
): boolean {
  if (user.organizationId !== organizationId) return false;
  if (user.role === RoleName.Administrator) return true;
  if (user.role !== RoleName.Agent) return false;
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

function isClientOfficeUser(user: AuthUser): boolean {
  if (user.organizationType !== OrganizationType.Merchant) return false;
  return user.role !== RoleName.Driver;
}

export function canViewOrganization(
  user: AuthUser,
  organizationId: number,
): boolean {
  if (canViewAllOrganizations(user)) return true;
  if (canManageOrganization(user, organizationId)) return true;
  return canActInOwnOrganization(
    user,
    organizationId,
    Permission.ManageMerchants,
  );
}

export function canManageAllMerchants(user: AuthUser): boolean {
  if (user.role === RoleName.Superadmin) return true;
  return hasPlatformPermission(user, Permission.ManageMerchants);
}

export function canManageMerchants(
  user: AuthUser,
  organizationId: number,
): boolean {
  if (canManageAllMerchants(user)) return true;
  return canActInOwnOrganization(
    user,
    organizationId,
    Permission.ManageMerchants,
  );
}

export function canCreateOrders(
  user: AuthUser,
  organizationId: number,
): boolean {
  if (user.role === RoleName.Superadmin) return true;
  if (hasPlatformPermission(user, Permission.CreateOrders)) return true;
  return canActInOwnOrganization(user, organizationId, Permission.CreateOrders);
}

export function canCreateOrdersForAnyOrganization(user: AuthUser): boolean {
  if (user.role === RoleName.Superadmin) return true;
  return hasPlatformPermission(user, Permission.CreateOrders);
}

export function canViewAllOrders(user: AuthUser): boolean {
  if (canViewAllOrganizations(user)) return true;
  return canCreateOrdersForAnyOrganization(user);
}

export function canViewOrders(user: AuthUser): boolean {
  if (canViewAllOrders(user)) return true;
  return isClientOfficeUser(user);
}

export function canManageDeliveryFees(user: AuthUser): boolean {
  if (user.role === RoleName.Superadmin) return true;
  return hasPlatformPermission(user, Permission.ManageDeliveryFees);
}

// Un cliente gestiona solo los motoristas de su organización.
export function canManageOwnDrivers(user: AuthUser): boolean {
  if (user.organizationType !== OrganizationType.Merchant) return false;
  return canActInOwnOrganization(
    user,
    user.organizationId,
    Permission.ManageDrivers,
  );
}

// Volá! gestiona los motoristas de la plataforma y los de cualquier cliente.
export function canManageAllDrivers(user: AuthUser): boolean {
  if (canManageAllOrganizations(user)) return true;
  return hasPlatformPermission(user, Permission.ManageDrivers);
}

export function canAccessDrivers(user: AuthUser): boolean {
  if (canManageAllDrivers(user)) return true;
  return canManageOwnDrivers(user);
}

export function canManageDriversOf(
  user: AuthUser,
  organizationId: number,
): boolean {
  if (canManageAllDrivers(user)) return true;
  if (!canManageOwnDrivers(user)) return false;
  return user.organizationId === organizationId;
}

export function canAssignOrders(
  user: AuthUser,
  organizationId: number,
): boolean {
  if (user.role === RoleName.Superadmin) return true;
  if (hasPlatformPermission(user, Permission.AssignOrders)) return true;
  return canActInOwnOrganization(user, organizationId, Permission.AssignOrders);
}

// Preparar, completar y cancelar órdenes: el comercio en las suyas y Volá! en todas.
export function canManageOrders(
  user: AuthUser,
  organizationId: number,
): boolean {
  if (user.role === RoleName.Superadmin) return true;
  if (hasPlatformPermission(user, Permission.ManageOrders)) return true;
  return canActInOwnOrganization(user, organizationId, Permission.ManageOrders);
}
