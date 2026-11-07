import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  pgTable,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { organizations } from '../organizations/organizations.schema.js';

export const customers = pgTable(
  'customers',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: varchar('name').notNull(),
    phoneNumber: varchar('phone_number').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.organizationId, table.phoneNumber),
    check('customers_name_not_blank', sql`btrim(${table.name}) <> ''`),
    check(
      'customers_phone_number_not_blank',
      sql`btrim(${table.phoneNumber}) <> ''`,
    ),
  ],
);
