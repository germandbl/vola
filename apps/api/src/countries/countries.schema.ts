import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const countries = pgTable(
  'countries',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: varchar('name').notNull().unique(),
    code: varchar('code').notNull().unique(),
    currency: varchar('currency').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check('countries_code_iso', sql`${table.code} ~ '^[A-Z]{2}$'`),
    check('countries_currency_iso', sql`${table.currency} ~ '^[A-Z]{3}$'`),
  ],
);
