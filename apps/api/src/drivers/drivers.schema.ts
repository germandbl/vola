import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  doublePrecision,
  pgTable,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { countries } from '../countries/countries.schema.js';
import { merchants } from '../merchants/merchants.schema.js';
import { users } from '../users/users.schema.js';

export const drivers = pgTable(
  'drivers',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    countryId: bigint('country_id', { mode: 'number' })
      .notNull()
      .references(() => countries.id, { onDelete: 'restrict' }),
    // Un motorista nuevo arranca no disponible: recibe órdenes solo cuando él mismo se marca disponible.
    isAvailable: boolean('is_available').notNull().default(false),
    // Solo se guarda la última ubicación: el mapa de motoristas necesita dónde está ahora, no su recorrido.
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    locationAccuracyMeters: doublePrecision('location_accuracy_meters'),
    locationRecordedAt: timestamp('location_recorded_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check(
      'drivers_location_complete',
      sql`(${table.latitude} IS NULL) = (${table.longitude} IS NULL) AND (${table.latitude} IS NULL) = (${table.locationRecordedAt} IS NULL)`,
    ),
  ],
);

export const driverMerchantAssignments = pgTable(
  'driver_merchant_assignments',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    driverId: bigint('driver_id', { mode: 'number' })
      .notNull()
      .references(() => drivers.id, { onDelete: 'cascade' }),
    merchantId: bigint('merchant_id', { mode: 'number' })
      .notNull()
      .references(() => merchants.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.driverId, table.merchantId)],
);
