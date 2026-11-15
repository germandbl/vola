import { OrderStatus, PaymentMethod, SettlementType } from '@vola/shared';
import { and, count, eq, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { branches } from '../branches/branches.schema.js';
import { countries } from '../countries/countries.schema.js';
import { customers } from '../customers/customers.schema.js';
import type { Database } from '../database/database.module.js';
import { merchants } from '../merchants/merchants.schema.js';
import { orders } from '../orders/orders.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';
import { cashSettlements } from './settlements.schema.js';

const HUNDREDTHS_PER_UNIT = 100;

// La organización dueña del motorista dice a quién le liquida: Volá! o su comercio.
export const driverUsers = alias(users, 'driver_users');
export const driverOwners = alias(organizations, 'driver_owners');
export const driverSettlements = alias(cashSettlements, 'driver_settlements');

// Efectivo que el motorista cobró y todavía tiene en la mano.
export const isCashWithDriver = and(
  eq(orders.status, OrderStatus.Delivered),
  eq(orders.paymentMethod, PaymentMethod.Cash),
  isNull(orders.driverSettlementId),
);

// Efectivo que un motorista de Volá! ya le entregó a Volá! y Volá! todavía no le pasa al comercio.
export const isCashAtPlatform = and(
  eq(driverSettlements.type, SettlementType.DriverToPlatform),
  isNull(orders.merchantSettlementId),
);

export const cashOrderCount = count(orders.id);
export const cashAmount =
  sql<number>`coalesce(sum(${orders.total}), 0)`.mapWith(Number);

export function sumOrderTotals(pendingOrders: { total: number }[]): number {
  const amount = pendingOrders.reduce((sum, order) => sum + order.total, 0);
  return Math.round(amount * HUNDREDTHS_PER_UNIT) / HUNDREDTHS_PER_UNIT;
}

// Las órdenes que entran en una liquidación, para mostrarlas antes de confirmar.
export function selectSettlementOrders(database: Database) {
  return database
    .select({
      id: orders.id,
      merchantName: merchants.name,
      customerName: customers.name,
      total: orders.total,
      currency: countries.currency,
      deliveredAt: orders.statusChangedAt,
    })
    .from(orders)
    .innerJoin(branches, eq(orders.branchId, branches.id))
    .innerJoin(merchants, eq(branches.merchantId, merchants.id))
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .innerJoin(organizations, eq(orders.organizationId, organizations.id))
    .leftJoin(countries, eq(organizations.countryId, countries.id))
    .leftJoin(
      driverSettlements,
      eq(orders.driverSettlementId, driverSettlements.id),
    )
    .$dynamic();
}
