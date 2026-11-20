import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  numeric,
  pgTable,
  timestamp,
} from 'drizzle-orm/pg-core';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';

export const invoices = pgTable(
  'invoices',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    amount: numeric('amount', {
      precision: 12,
      scale: 2,
      mode: 'number',
    }).notNull(),
    createdByUserId: bigint('created_by_user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    // Una tarifa de envío puede valer 0, así que una factura también.
    check('invoices_amount_not_negative', sql`${table.amount} >= 0`),
  ],
);
