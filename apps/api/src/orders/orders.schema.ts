import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { branches } from '../branches/branches.schema.js';
import { customers } from '../customers/customers.schema.js';
import { drivers } from '../drivers/drivers.schema.js';
import { deliveryFeeBasis } from '../merchants/merchants.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';

export const orderStatus = pgEnum('order_statuses', [
  'new',
  'preparing',
  'heading_to_branch',
  'at_branch',
  'on_the_way',
  'delivered',
  'cancelled',
]);

const money = (name: string) =>
  numeric(name, { precision: 10, scale: 2, mode: 'number' });

export const orders = pgTable(
  'orders',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    branchId: bigint('branch_id', { mode: 'number' })
      .notNull()
      .references(() => branches.id, { onDelete: 'restrict' }),
    customerId: bigint('customer_id', { mode: 'number' })
      .notNull()
      .references(() => customers.id, { onDelete: 'restrict' }),
    createdByUserId: bigint('created_by_user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    status: orderStatus('status').notNull().default('new'),
    deliveryAddress: varchar('delivery_address').notNull(),
    deliveryLatitude: numeric('delivery_latitude', {
      precision: 9,
      scale: 6,
      mode: 'number',
    }).notNull(),
    deliveryLongitude: numeric('delivery_longitude', {
      precision: 9,
      scale: 6,
      mode: 'number',
    }).notNull(),
    subtotal: money('subtotal').notNull(),
    customerDeliveryFee: money('customer_delivery_fee').notNull(),
    total: money('total').notNull(),
    volaDeliveryFee: money('vola_delivery_fee').notNull(),
    deliveryFeeBasis: deliveryFeeBasis('delivery_fee_basis').notNull(),
    distanceKm: numeric('distance_km', {
      precision: 7,
      scale: 2,
      mode: 'number',
    }),
    driverId: bigint('driver_id', { mode: 'number' }).references(
      () => drivers.id,
      { onDelete: 'restrict' },
    ),
    assignedAt: timestamp('assigned_at'),
    statusChangedAt: timestamp('status_changed_at').notNull().defaultNow(),
    cancellationReason: varchar('cancellation_reason'),
    preparationStartedAt: timestamp('preparation_started_at'),
    readyAt: timestamp('ready_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check(
      'orders_ready_after_preparation_started',
      sql`${table.readyAt} IS NULL OR ${table.preparationStartedAt} IS NOT NULL`,
    ),
    check(
      'orders_delivery_address_not_blank',
      sql`btrim(${table.deliveryAddress}) <> ''`,
    ),
    check(
      'orders_amounts_not_negative',
      sql`${table.subtotal} >= 0 AND ${table.customerDeliveryFee} >= 0 AND ${table.volaDeliveryFee} >= 0`,
    ),
    check(
      'orders_driver_assigned_together',
      sql`(${table.driverId} IS NULL) = (${table.assignedAt} IS NULL)`,
    ),
    check(
      'orders_cancellation_reason_only_when_cancelled',
      sql`(${table.status} = 'cancelled') = (${table.cancellationReason} IS NOT NULL)`,
    ),
    check(
      'orders_total_matches',
      sql`${table.total} = ${table.subtotal} + ${table.customerDeliveryFee}`,
    ),
  ],
);

export const orderItems = pgTable(
  'order_items',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    orderId: bigint('order_id', { mode: 'number' })
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    name: varchar('name').notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: money('unit_price').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check('order_items_name_not_blank', sql`btrim(${table.name}) <> ''`),
    check('order_items_quantity_positive', sql`${table.quantity} > 0`),
    check('order_items_unit_price_not_negative', sql`${table.unitPrice} >= 0`),
  ],
);

// Historial de estados: cuándo cambió cada orden y quién la cambió.
export const orderStatusChanges = pgTable(
  'order_status_changes',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    orderId: bigint('order_id', { mode: 'number' })
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    status: orderStatus('status').notNull(),
    cancellationReason: varchar('cancellation_reason'),
    changedByUserId: bigint('changed_by_user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check(
      'order_status_changes_cancellation_reason_only_when_cancelled',
      sql`(${table.status} = 'cancelled') = (${table.cancellationReason} IS NOT NULL)`,
    ),
    check(
      'order_status_changes_cancellation_reason_not_blank',
      sql`btrim(${table.cancellationReason}) <> ''`,
    ),
  ],
);
