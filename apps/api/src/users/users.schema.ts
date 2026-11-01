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
import { roles } from '../roles/roles.schema.js';

export const users = pgTable(
  'users',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: varchar('name').notNull(),
    email: varchar('email').notNull().unique(),
    passwordHash: varchar('password_hash').notNull(),
    phoneNumber: varchar('phone_number').notNull(),
    roleId: bigint('role_id', { mode: 'number' })
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check('users_name_not_blank', sql`btrim(${table.name}) <> ''`),
    check('users_email_lowercase', sql`${table.email} = lower(${table.email})`),
    check(
      'users_phone_number_not_blank',
      sql`btrim(${table.phoneNumber}) <> ''`,
    ),
  ],
);

export const userPermissions = pgTable(
  'user_permissions',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    permissionKey: varchar('permission_key').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.userId, table.permissionKey)],
);
