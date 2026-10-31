import { bigint, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { organizations } from '../organizations/organizations.schema.js';
import { roles } from '../roles/roles.schema.js';

export const users = pgTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull(),
  phoneNumber: varchar('phone_number').notNull(),
  roleId: bigint('role_id', { mode: 'number' })
    .notNull()
    .references(() => roles.id),
  organizationId: bigint('organization_id', { mode: 'number' })
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userOrganizations = pgTable('user_organizations', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name').notNull(),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id),
  organizationId: bigint('organization_id', { mode: 'number' })
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userPermissions = pgTable('user_permissions', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id),
  permissionKey: varchar('permission_key').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
