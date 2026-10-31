import { bigint, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { countries } from '../countries/countries.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';

export const drivers = pgTable('drivers', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id),
  countryId: bigint('country_id', { mode: 'number' })
    .notNull()
    .references(() => countries.id),
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
      .references(() => drivers.id),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
);
