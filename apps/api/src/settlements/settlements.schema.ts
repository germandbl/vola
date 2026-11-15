import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
} from 'drizzle-orm/pg-core';
import { drivers } from '../drivers/drivers.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';

export const settlementType = pgEnum('settlement_types', [
  'driver_to_platform',
  'driver_to_merchant',
  'platform_to_merchant',
]);

export const cashSettlements = pgTable(
  'cash_settlements',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    type: settlementType('type').notNull(),
    // Quién entregó el efectivo: un motorista, o Volá! cuando liquida a un comercio.
    driverId: bigint('driver_id', { mode: 'number' }).references(
      () => drivers.id,
      { onDelete: 'restrict' },
    ),
    // Quién lo recibió cuando es un comercio; null cuando lo recibe Volá!.
    organizationId: bigint('organization_id', { mode: 'number' }).references(
      () => organizations.id,
      { onDelete: 'restrict' },
    ),
    amount: numeric('amount', {
      precision: 12,
      scale: 2,
      mode: 'number',
    }).notNull(),
    settledByUserId: bigint('settled_by_user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check('cash_settlements_amount_positive', sql`${table.amount} > 0`),
    check(
      'cash_settlements_parties_match_type',
      sql`CASE ${table.type}
        WHEN 'driver_to_platform' THEN ${table.driverId} IS NOT NULL AND ${table.organizationId} IS NULL
        WHEN 'driver_to_merchant' THEN ${table.driverId} IS NOT NULL AND ${table.organizationId} IS NOT NULL
        WHEN 'platform_to_merchant' THEN ${table.driverId} IS NULL AND ${table.organizationId} IS NOT NULL
      END`,
    ),
  ],
);
