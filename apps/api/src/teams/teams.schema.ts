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
import { users } from '../users/users.schema.js';

export const teams = pgTable(
  'teams',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: varchar('name').notNull(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.organizationId, table.name),
    check('teams_name_not_blank', sql`btrim(${table.name}) <> ''`),
  ],
);

export const teamMembers = pgTable(
  'team_members',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    teamId: bigint('team_id', { mode: 'number' })
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.teamId, table.userId)],
);
