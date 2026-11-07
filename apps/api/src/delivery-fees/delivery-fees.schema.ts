import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  integer,
  numeric,
  pgTable,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { merchants } from '../merchants/merchants.schema.js';

export const deliveryFeeRates = pgTable(
  'delivery_fee_rates',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    merchantId: bigint('merchant_id', { mode: 'number' })
      .notNull()
      .unique()
      .references(() => merchants.id, { onDelete: 'cascade' }),
    extraFeePerKm: numeric('extra_fee_per_km', {
      precision: 10,
      scale: 2,
      mode: 'number',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check(
      'delivery_fee_rates_extra_fee_per_km_not_negative',
      sql`${table.extraFeePerKm} >= 0`,
    ),
  ],
);

export const deliveryFeeRateRanges = pgTable(
  'delivery_fee_rate_ranges',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    rateId: bigint('rate_id', { mode: 'number' })
      .notNull()
      .references(() => deliveryFeeRates.id, { onDelete: 'cascade' }),
    upToKm: numeric('up_to_km', { precision: 6, scale: 2, mode: 'number' }),
    fee: numeric('fee', { precision: 10, scale: 2, mode: 'number' }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    // Con NULLS NOT DISTINCT, una tarifa solo puede tener un rango sin límite.
    unique().on(table.rateId, table.upToKm).nullsNotDistinct(),
    check(
      'delivery_fee_rate_ranges_up_to_km_positive',
      sql`${table.upToKm} > 0`,
    ),
    check('delivery_fee_rate_ranges_fee_not_negative', sql`${table.fee} >= 0`),
  ],
);

export const orderCountFeeRanges = pgTable(
  'order_count_fee_ranges',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    merchantId: bigint('merchant_id', { mode: 'number' })
      .notNull()
      .references(() => merchants.id, { onDelete: 'cascade' }),
    upToOrderCount: integer('up_to_order_count'),
    fee: numeric('fee', { precision: 10, scale: 2, mode: 'number' }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    // Con NULLS NOT DISTINCT, un comercio solo puede tener un rango sin límite.
    unique().on(table.merchantId, table.upToOrderCount).nullsNotDistinct(),
    check(
      'order_count_fee_ranges_up_to_order_count_positive',
      sql`${table.upToOrderCount} > 0`,
    ),
    check('order_count_fee_ranges_fee_not_negative', sql`${table.fee} >= 0`),
  ],
);
