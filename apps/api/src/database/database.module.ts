import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const DATABASE = Symbol('DATABASE');

export type Database = NodePgDatabase & { $client: Pool };

function createDatabase(): Database {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined. Add it to apps/api/.env');
  }
  return drizzle(databaseUrl);
}

@Global()
@Module({
  providers: [{ provide: DATABASE, useFactory: createDatabase }],
  exports: [DATABASE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  // Sin esto, el pool de conexiones mantiene vivo el proceso después de app.close() (por ejemplo, en los tests e2e).
  async onApplicationShutdown() {
    await this.database.$client.end();
  }
}
