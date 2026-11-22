import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  date,
  integer,
  numeric,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { organizations } from '../organizations/organizations.schema.js';

const contractAmount = (name: string) =>
  numeric(name, { precision: 12, scale: 2, mode: 'number' });

// Un contrato por cliente: cobra el uso del software por las órdenes entregadas en el mes.
export const softwareContracts = pgTable(
  'software_contracts',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .unique()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    currency: varchar('currency', { length: 3 }).notNull(),
    // Primer día del primer mes que se puede facturar.
    startsOn: date('starts_on', { mode: 'string' }).notNull(),
    monthlyFee: contractAmount('monthly_fee').notNull(),
    includedOrders: integer('included_orders').notNull(),
    extraOrderFee: contractAmount('extra_order_fee').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    check(
      'software_contracts_currency_iso',
      sql`${table.currency} ~ '^[A-Z]{3}$'`,
    ),
    check(
      'software_contracts_starts_on_first_day',
      sql`extract(day from ${table.startsOn}) = 1`,
    ),
    check(
      'software_contracts_amounts_not_negative',
      sql`${table.monthlyFee} >= 0 AND ${table.extraOrderFee} >= 0 AND ${table.includedOrders} >= 0`,
    ),
  ],
);
