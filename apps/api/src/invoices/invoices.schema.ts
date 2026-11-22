import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  date,
  integer,
  numeric,
  index,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';

export const invoiceType = pgEnum('invoice_types', ['delivery', 'software']);

export const invoices = pgTable(
  'invoices',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    type: invoiceType('type').notNull().default('delivery'),
    // Los días que cubre la factura, incluidos el primero y el último, en la hora de la región.
    periodStart: date('period_start', { mode: 'string' }).notNull(),
    periodEnd: date('period_end', { mode: 'string' }).notNull(),
    amount: numeric('amount', {
      precision: 12,
      scale: 2,
      mode: 'number',
    }).notNull(),
    createdByUserId: bigint('created_by_user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    paidAt: timestamp('paid_at'),
    paidByUserId: bigint('paid_by_user_id', { mode: 'number' }).references(
      () => users.id,
      { onDelete: 'restrict' },
    ),
  },
  (table) => [
    // Una tarifa de envío puede valer 0, así que una factura también.
    check('invoices_amount_not_negative', sql`${table.amount} >= 0`),
    // Para revisar rápido si un rango nuevo choca con una factura anterior del mismo tipo.
    index('invoices_organization_type_period_index').on(
      table.organizationId,
      table.type,
      table.periodStart,
    ),
    check(
      'invoices_period_in_order',
      sql`${table.periodStart} <= ${table.periodEnd}`,
    ),
    check(
      'invoices_paid_together',
      sql`(${table.paidAt} IS NULL) = (${table.paidByUserId} IS NULL)`,
    ),
  ],
);

const contractAmount = (name: string) =>
  numeric(name, { precision: 12, scale: 2, mode: 'number' });

// Las condiciones del contrato y la tasa con que se calculó la factura, por si el contrato cambia después.
export const softwareInvoiceDetails = pgTable(
  'software_invoice_details',
  {
    invoiceId: bigint('invoice_id', { mode: 'number' })
      .primaryKey()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    contractCurrency: varchar('contract_currency', { length: 3 }).notNull(),
    monthlyFee: contractAmount('monthly_fee').notNull(),
    includedOrders: integer('included_orders').notNull(),
    extraOrderFee: contractAmount('extra_order_fee').notNull(),
    // Cuántos meses cubre el rango; el costo y las órdenes incluidas se prorratean con esto.
    monthFraction: numeric('month_fraction', {
      precision: 10,
      scale: 6,
      mode: 'number',
    }).notNull(),
    proratedMonthlyFee: contractAmount('prorated_monthly_fee').notNull(),
    proratedIncludedOrders: integer('prorated_included_orders').notNull(),
    orderCount: integer('order_count').notNull(),
    extraOrderCount: integer('extra_order_count').notNull(),
    subtotal: contractAmount('subtotal').notNull(),
    // Cuántas unidades de la moneda del país vale una de la moneda del contrato.
    exchangeRate: numeric('exchange_rate', {
      precision: 14,
      scale: 6,
      mode: 'number',
    }).notNull(),
  },
  (table) => [
    check(
      'software_invoice_details_exchange_rate_positive',
      sql`${table.exchangeRate} > 0`,
    ),
    check(
      'software_invoice_details_counts_not_negative',
      sql`${table.orderCount} >= 0 AND ${table.extraOrderCount} >= 0 AND ${table.includedOrders} >= 0 AND ${table.proratedIncludedOrders} >= 0`,
    ),
    check(
      'software_invoice_details_month_fraction_positive',
      sql`${table.monthFraction} > 0`,
    ),
  ],
);
