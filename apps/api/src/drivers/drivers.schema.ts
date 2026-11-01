import { bigint, pgTable, timestamp, unique } from 'drizzle-orm/pg-core';
import { countries } from '../countries/countries.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';

export const drivers = pgTable('drivers', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  countryId: bigint('country_id', { mode: 'number' })
    .notNull()
    .references(() => countries.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const driverMerchantAssignments = pgTable(
  'driver_merchant_assignments',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    driverId: bigint('driver_id', { mode: 'number' })
      .notNull()
      .references(() => drivers.id, { onDelete: 'cascade' }),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.driverId, table.organizationId)],
);
