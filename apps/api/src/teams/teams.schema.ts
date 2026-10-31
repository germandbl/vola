import { bigint, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';

export const teams = pgTable('teams', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name').notNull(),
  organizationId: bigint('organization_id', { mode: 'number' })
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const teamMembers = pgTable('team_members', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id),
  teamId: bigint('team_id', { mode: 'number' })
    .notNull()
    .references(() => teams.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
