import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { organizations } from '../organizations/organizations.schema.js';

export const deliveryFeeBasis = pgEnum('delivery_fee_bases', [
  'distance',
  'completed_orders',
]);

export const merchants = pgTable(
  'merchants',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: varchar('name').notNull(),
    contactName: varchar('contact_name').notNull(),
    contactEmail: varchar('contact_email').notNull(),
    contactPhone: varchar('contact_phone').notNull(),
    deliveryFeeBasis: deliveryFeeBasis('delivery_fee_basis'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.organizationId, table.name),
    check('merchants_name_not_blank', sql`btrim(${table.name}) <> ''`),
    check(
      'merchants_contact_name_not_blank',
      sql`btrim(${table.contactName}) <> ''`,
    ),
    check(
      'merchants_contact_email_lowercase',
      sql`${table.contactEmail} = lower(${table.contactEmail})`,
    ),
    check(
      'merchants_contact_phone_not_blank',
      sql`btrim(${table.contactPhone}) <> ''`,
    ),
  ],
);
