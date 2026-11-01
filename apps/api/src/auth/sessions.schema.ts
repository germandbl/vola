import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../users/users.schema.js';

export const sessions = pgTable(
  'sessions',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    check(
      'sessions_expires_after_created',
      sql`${table.expiresAt} > ${table.createdAt}`,
    ),
  ],
);
