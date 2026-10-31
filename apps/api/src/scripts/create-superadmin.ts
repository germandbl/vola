import { eq } from 'drizzle-orm';
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { z } from 'zod';
import { hashPassword } from '../auth/passwords.js';
import { createDatabase, type Database } from '../database/database.module.js';
import { organizations } from '../organizations/organizations.schema.js';
import { roles } from '../roles/roles.schema.js';
import { users } from '../users/users.schema.js';

const PLATFORM_ORGANIZATION_NAME = 'Volá!';
const SUPERADMIN_ROLE_NAME = 'superadmin';
const MIN_PASSWORD_LENGTH = 8;

const superadminSchema = z.object({
  name: z.string().min(1),
  email: z.email().toLowerCase(),
  phone: z.string().min(1),
  password: z.string().min(MIN_PASSWORD_LENGTH),
});

type Superadmin = z.infer<typeof superadminSchema>;

async function findOrCreatePlatformOrganizationId(
  database: Database,
): Promise<number> {
  const [existingOrganization] = await database
    .select()
    .from(organizations)
    .where(eq(organizations.type, 'platform'));
  if (existingOrganization) return existingOrganization.id;

  const [organization] = await database
    .insert(organizations)
    .values({ name: PLATFORM_ORGANIZATION_NAME, type: 'platform' })
    .returning();
  return organization.id;
}

async function findOrCreateSuperadminRoleId(
  database: Database,
): Promise<number> {
  const [existingRole] = await database
    .select()
    .from(roles)
    .where(eq(roles.name, SUPERADMIN_ROLE_NAME));
  if (existingRole) return existingRole.id;

  const [role] = await database
    .insert(roles)
    .values({ name: SUPERADMIN_ROLE_NAME })
    .returning();
  return role.id;
}

async function createSuperadmin(
  database: Database,
  superadmin: Superadmin,
): Promise<void> {
  const [existingUser] = await database
    .select()
    .from(users)
    .where(eq(users.email, superadmin.email));
  if (existingUser) {
    throw new Error(`A user with email ${superadmin.email} already exists`);
  }

  await database.insert(users).values({
    name: superadmin.name,
    email: superadmin.email,
    phoneNumber: superadmin.phone,
    passwordHash: await hashPassword(superadmin.password),
    roleId: await findOrCreateSuperadminRoleId(database),
    organizationId: await findOrCreatePlatformOrganizationId(database),
  });
}

if (existsSync('.env')) {
  process.loadEnvFile();
}

const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    password: { type: 'string' },
  },
});
const superadmin = superadminSchema.parse(values);
const database = createDatabase();

try {
  await createSuperadmin(database, superadmin);
  process.stdout.write(`Superadmin ${superadmin.email} created\n`);
} finally {
  await database.$client.end();
}
