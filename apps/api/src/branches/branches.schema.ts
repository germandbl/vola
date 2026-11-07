import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  numeric,
  pgEnum,
  pgTable,
  time,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { merchants } from '../merchants/merchants.schema.js';

export const dayOfWeek = pgEnum('days_of_week', [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

export const branches = pgTable(
  'branches',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    merchantId: bigint('merchant_id', { mode: 'number' })
      .notNull()
      .references(() => merchants.id, { onDelete: 'cascade' }),
    name: varchar('name').notNull(),
    address: varchar('address').notNull(),
    latitude: numeric('latitude', {
      precision: 9,
      scale: 6,
      mode: 'number',
    }).notNull(),
    longitude: numeric('longitude', {
      precision: 9,
      scale: 6,
      mode: 'number',
    }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.merchantId, table.name),
    check('branches_name_not_blank', sql`btrim(${table.name}) <> ''`),
    check('branches_address_not_blank', sql`btrim(${table.address}) <> ''`),
    check(
      'branches_latitude_in_range',
      sql`${table.latitude} BETWEEN -90 AND 90`,
    ),
    check(
      'branches_longitude_in_range',
      sql`${table.longitude} BETWEEN -180 AND 180`,
    ),
  ],
);

export const branchOpeningHours = pgTable(
  'branch_opening_hours',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    branchId: bigint('branch_id', { mode: 'number' })
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade' }),
    day: dayOfWeek('day').notNull(),
    isOpen: boolean('is_open').notNull(),
    opensAt: time('opens_at'),
    closesAt: time('closes_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.branchId, table.day),
    // Un día abierto lleva apertura antes del cierre; un día cerrado no lleva horas.
    check(
      'branch_opening_hours_consistent',
      sql`(${table.isOpen} AND ${table.opensAt} IS NOT NULL AND ${table.closesAt} IS NOT NULL AND ${table.closesAt} > ${table.opensAt})
        OR (NOT ${table.isOpen} AND ${table.opensAt} IS NULL AND ${table.closesAt} IS NULL)`,
    ),
  ],
);
