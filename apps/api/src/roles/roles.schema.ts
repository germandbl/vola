import { bigint, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const rolePermissions = pgTable('role_permissions', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  roleId: bigint('role_id', { mode: 'number' })
    .notNull()
    .references(() => roles.id),
  permissionKey: varchar('permission_key').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
