import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  pgTable,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

export const roles = pgTable(
  'roles',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: varchar('name').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check(
      'roles_name_known',
      sql`${table.name} IN ('superadmin', 'administrator', 'agent', 'driver')`,
    ),
  ],
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    roleId: bigint('role_id', { mode: 'number' })
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionKey: varchar('permission_key').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.roleId, table.permissionKey),
    check(
      'role_permissions_permission_key_known',
      sql`${table.permissionKey} IN ('organizations.view', 'delivery_fees.manage', 'merchants.manage', 'orders.create')`,
    ),
  ],
);
