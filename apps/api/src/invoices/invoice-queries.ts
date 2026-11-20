import { OrderStatus, OrganizationType } from '@vola/shared';
import { and, count, eq, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { branches } from '../branches/branches.schema.js';
import { countries } from '../countries/countries.schema.js';
import { customers } from '../customers/customers.schema.js';
import type { Database } from '../database/database.module.js';
import { drivers } from '../drivers/drivers.schema.js';
import { merchants } from '../merchants/merchants.schema.js';
import { orders } from '../orders/orders.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';

const HUNDREDTHS_PER_UNIT = 100;

// La organización dueña del motorista dice si el envío lo hizo Volá! o la flota propia del comercio.
export const driverUsers = alias(users, 'driver_users');
export const driverOwners = alias(organizations, 'driver_owners');

// Envíos que hizo un motorista de Volá! y todavía no van en ninguna factura.
export const isPendingInvoice = and(
  eq(orders.status, OrderStatus.Delivered),
  eq(driverOwners.type, OrganizationType.Platform),
  isNull(orders.invoiceId),
);

export const invoiceOrderCount = count(orders.id);
export const invoiceAmount =
  sql<number>`coalesce(sum(${orders.volaDeliveryFee}), 0)`.mapWith(Number);

export function sumDeliveryFees(
  pendingOrders: { volaDeliveryFee: number }[],
): number {
  const amount = pendingOrders.reduce(
    (sum, order) => sum + order.volaDeliveryFee,
    0,
  );
  return Math.round(amount * HUNDREDTHS_PER_UNIT) / HUNDREDTHS_PER_UNIT;
}

export function selectInvoiceOrders(database: Database) {
  return database
    .select({
      id: orders.id,
      merchantName: merchants.name,
      customerName: customers.name,
      deliveryFee: orders.volaDeliveryFee,
      currency: countries.currency,
      deliveredAt: orders.statusChangedAt,
    })
    .from(orders)
    .innerJoin(branches, eq(orders.branchId, branches.id))
    .innerJoin(merchants, eq(branches.merchantId, merchants.id))
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .innerJoin(organizations, eq(orders.organizationId, organizations.id))
    .leftJoin(countries, eq(organizations.countryId, countries.id))
    .innerJoin(drivers, eq(orders.driverId, drivers.id))
    .innerJoin(driverUsers, eq(drivers.userId, driverUsers.id))
    .innerJoin(driverOwners, eq(driverUsers.organizationId, driverOwners.id))
    .$dynamic();
}
