import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

if (existsSync('.env')) {
  process.loadEnvFile();
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined. Add it to apps/api/.env');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/**/*.schema.ts',
  out: './drizzle',
  dbCredentials: { url: databaseUrl },
});
