import { bigint, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const countries = pgTable('countries', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name').notNull(),
  code: varchar('code').notNull(),
  currency: varchar('currency').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
