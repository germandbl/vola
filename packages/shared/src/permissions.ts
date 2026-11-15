import { z } from 'zod';
import { OrganizationType } from './organizations.js';

export const Permission = {
  ViewOrganizations: 'organizations.view',
  ManageDeliveryFees: 'delivery_fees.manage',
  ManageMerchants: 'merchants.manage',
  CreateOrders: 'orders.create',
  ManageDrivers: 'drivers.manage',
  AssignOrders: 'orders.assign',
  ManageOrders: 'orders.manage',
  SettleCash: 'cash.settle',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const permissionSchema = z.enum(Permission);

export const PERMISSION_LABEL: Record<Permission, string> = {
  [Permission.ViewOrganizations]: 'Ver todas las organizaciones',
  [Permission.ManageDeliveryFees]: 'Gestionar tarifas de envío',
  [Permission.ManageMerchants]: 'Gestionar comercios y sucursales',
  [Permission.CreateOrders]: 'Crear órdenes',
  [Permission.ManageDrivers]: 'Gestionar motoristas',
  [Permission.AssignOrders]: 'Asignar motoristas a órdenes',
  [Permission.ManageOrders]: 'Gestionar órdenes',
  [Permission.SettleCash]: 'Liquidar efectivo',
};

export const PERMISSION_DESCRIPTION: Record<Permission, string> = {
  [Permission.ViewOrganizations]: 'Ve las organizaciones, sus usuarios, comercios y órdenes.',
  [Permission.ManageDeliveryFees]: 'Configura cuánto cobra Volá! por cada envío.',
  [Permission.ManageMerchants]: 'Crea y edita comercios y sus sucursales.',
  [Permission.CreateOrders]: 'Crea órdenes para mandarlas a entregar.',
  [Permission.ManageDrivers]: 'Crea motoristas, elige qué comercios atienden y los ve en el mapa.',
  [Permission.AssignOrders]: 'Asigna, reasigna y libera el motorista de una orden.',
  [Permission.ManageOrders]: 'Marca la preparación y completa o cancela órdenes.',
  [Permission.SettleCash]: 'Recibe el efectivo de los motoristas y ve las liquidaciones.',
};

// Ver todas las organizaciones y las tarifas de envío solo tienen efecto para usuarios de Volá!.
const PLATFORM_ONLY_PERMISSIONS: Permission[] = [
  Permission.ViewOrganizations,
  Permission.ManageDeliveryFees,
];

export function findAssignablePermissions(
  organizationType: OrganizationType,
): Permission[] {
  const permissions = Object.values(Permission);
  if (organizationType === OrganizationType.Platform) return permissions;
  return permissions.filter(
    (permission) => !PLATFORM_ONLY_PERMISSIONS.includes(permission),
  );
}

export const agentPermissionsFormSchema = z.object({
  permissions: z.array(permissionSchema),
});

export type AgentPermissionsForm = z.infer<typeof agentPermissionsFormSchema>;
