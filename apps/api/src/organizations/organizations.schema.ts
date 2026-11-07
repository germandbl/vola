import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { countries } from '../countries/countries.schema.js';

export const organizationType = pgEnum('organization_types', [
  'merchant',
  'platform',
]);

export const organizations = pgTable(
  'organizations',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: varchar('name').notNull(),
    countryId: bigint('country_id', { mode: 'number' }).references(
      () => countries.id,
      { onDelete: 'restrict' },
    ),
    type: organizationType('type').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check('organizations_name_not_blank', sql`btrim(${table.name}) <> ''`),
  ],
);
