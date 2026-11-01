import { existsSync } from 'node:fs';
import { OrganizationType, RoleName } from '@vola/shared';
import { hashPassword } from '../auth/passwords.js';
import { countries } from '../countries/countries.schema.js';
import { createDatabase, type Database } from '../database/database.module.js';
import {
  driverMerchantAssignments,
  drivers,
} from '../drivers/drivers.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { roles } from '../roles/roles.schema.js';
import { teamMembers, teams } from '../teams/teams.schema.js';
import { users } from '../users/users.schema.js';
import {
  PLATFORM_DRIVERS_MERCHANT_NAMES,
  SEED_ORGANIZATIONS,
  type SeedOrganization,
  type SeedUser,
} from './seed-data.js';

// Contraseña compartida solo para desarrollo, para poder entrar con cualquier usuario sembrado.
const DEVELOPMENT_PASSWORD = 'Volando2026';

interface SeedContext {
  database: Database;
  passwordHash: string;
  roleIds: Map<string, number>;
  countryIds: Map<string, number>;
}

async function assertDatabaseIsEmpty(database: Database): Promise<void> {
  const organizationCount = await database.$count(organizations);
  if (organizationCount > 0) {
    throw new Error(
      'The database already has organizations. The seed only runs on an empty development database.',
    );
  }
}

function mapIdsByKey<T extends { id: number }>(
  rows: T[],
  getKey: (row: T) => string,
): Map<string, number> {
  return new Map(rows.map((row) => [getKey(row), row.id]));
}

function requireId(ids: Map<string, number>, key: string): number {
  const id = ids.get(key);
  if (id === undefined) {
    throw new Error(`${key} is missing; run the database migrations first`);
  }
  return id;
}

async function insertTeams(
  context: SeedContext,
  organizationId: number,
  teamNames: string[],
): Promise<Map<string, number>> {
  const insertedTeams = await context.database
    .insert(teams)
    .values(teamNames.map((name) => ({ name, organizationId })))
    .returning({ id: teams.id, name: teams.name });
  return mapIdsByKey(insertedTeams, (team) => team.name);
}

async function insertUser(
  context: SeedContext,
  organizationId: number,
  seedUser: SeedUser,
): Promise<number> {
  const [user] = await context.database
    .insert(users)
    .values({
      name: seedUser.name,
      email: seedUser.email,
      phoneNumber: seedUser.phoneNumber,
      passwordHash: context.passwordHash,
      roleId: requireId(context.roleIds, seedUser.role),
      organizationId,
    })
    .returning({ id: users.id });
  return user.id;
}

async function insertDriver(
  context: SeedContext,
  userId: number,
  countryId: number,
): Promise<number> {
  const [driver] = await context.database
    .insert(drivers)
    .values({ userId, countryId })
    .returning({ id: drivers.id });
  return driver.id;
}

async function seedOrganization(
  context: SeedContext,
  seedOrganization: SeedOrganization,
): Promise<{ organizationId: number; driverIds: number[] }> {
  const countryId = requireId(context.countryIds, seedOrganization.countryCode);
  const [organization] = await context.database
    .insert(organizations)
    .values({
      name: seedOrganization.name,
      type: seedOrganization.type,
      countryId,
    })
    .returning({ id: organizations.id });
  const teamIds = await insertTeams(
    context,
    organization.id,
    seedOrganization.teamNames,
  );

  const driverIds: number[] = [];
  for (const seedUser of seedOrganization.users) {
    const userId = await insertUser(context, organization.id, seedUser);
    if (seedUser.teamName) {
      const teamId = requireId(teamIds, seedUser.teamName);
      await context.database.insert(teamMembers).values({ teamId, userId });
    }
    if (seedUser.role === RoleName.Driver) {
      driverIds.push(await insertDriver(context, userId, countryId));
    }
  }
  return { organizationId: organization.id, driverIds };
}

async function assignDrivers(
  database: Database,
  driverIds: number[],
  organizationIds: number[],
): Promise<void> {
  const assignments = driverIds.flatMap((driverId) =>
    organizationIds.map((organizationId) => ({ driverId, organizationId })),
  );
  if (assignments.length === 0) return;
  await database.insert(driverMerchantAssignments).values(assignments);
}

async function createSeedContext(database: Database): Promise<SeedContext> {
  const roleRows = await database.select().from(roles);
  const countryRows = await database.select().from(countries);
  return {
    database,
    passwordHash: await hashPassword(DEVELOPMENT_PASSWORD),
    roleIds: mapIdsByKey(roleRows, (role) => role.name),
    countryIds: mapIdsByKey(countryRows, (country) => country.code),
  };
}

async function seed(database: Database): Promise<void> {
  await assertDatabaseIsEmpty(database);
  const context = await createSeedContext(database);
  const organizationIds = new Map<string, number>();
  let platformDriverIds: number[] = [];

  for (const seedOrganizationData of SEED_ORGANIZATIONS) {
    const { organizationId, driverIds } = await seedOrganization(
      context,
      seedOrganizationData,
    );
    organizationIds.set(seedOrganizationData.name, organizationId);
    if (seedOrganizationData.type === OrganizationType.Platform) {
      platformDriverIds = driverIds;
      continue;
    }
    // Los motoristas propios de un comercio solo trabajan para ese comercio.
    await assignDrivers(database, driverIds, [organizationId]);
  }

  const merchantIds = PLATFORM_DRIVERS_MERCHANT_NAMES.map((name) =>
    requireId(organizationIds, name),
  );
  await assignDrivers(database, platformDriverIds, merchantIds);
}

if (process.env.NODE_ENV === 'production') {
  throw new Error(
    'The seed is for development only and does not run in production.',
  );
}
if (existsSync('.env')) {
  process.loadEnvFile();
}

const database = createDatabase();
try {
  await seed(database);
  process.stdout.write(
    `Seed completed. Every user's password is ${DEVELOPMENT_PASSWORD}\n`,
  );
} finally {
  await database.$client.end();
}
