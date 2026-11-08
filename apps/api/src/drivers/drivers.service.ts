import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationType,
  RoleName,
  canAccessDrivers,
  canDriverServeMerchant,
  canManageAllDrivers,
  canManageDriversOf,
  type AuthUser,
  type DriverForm,
  type DriverMerchant,
  type DriverAvailabilityForm,
  type DriverMerchantsForm,
  type DriverOwner,
  type DriverProfile,
  type DriverSummary,
} from '@vola/shared';
import { asc, desc, eq, inArray, type SQL } from 'drizzle-orm';
import { hashPassword } from '../auth/passwords.js';
import { createFieldValidationException } from '../common/field-validation.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { merchants } from '../merchants/merchants.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';
import { UsersService } from '../users/users.service.js';
import { driverMerchantAssignments, drivers } from './drivers.schema.js';

const driverColumns = {
  id: drivers.id,
  name: users.name,
  email: users.email,
  phoneNumber: users.phoneNumber,
  ownerId: organizations.id,
  ownerName: organizations.name,
  ownerType: organizations.type,
  isAvailable: drivers.isAvailable,
  createdAt: drivers.createdAt,
};

// El enum organization_types se declaró merchant, platform: ordenar DESC deja a Volá! primero.
const PLATFORM_FIRST = desc(organizations.type);

const merchantOptionColumns = {
  id: merchants.id,
  name: merchants.name,
  organizationId: organizations.id,
  organizationName: organizations.name,
};

interface DriverRow {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  ownerId: number;
  ownerName: string;
  ownerType: OrganizationType;
  isAvailable: boolean;
  createdAt: Date;
}

function toOwner(
  id: number,
  name: string,
  type: OrganizationType,
): DriverOwner {
  return { id, name, isPlatform: type === OrganizationType.Platform };
}

function assertIsDriver(user: AuthUser): void {
  if (user.role !== RoleName.Driver) {
    throw new ForbiddenException('Only drivers have a driver profile');
  }
}

function assertCanAccessDrivers(user: AuthUser): void {
  if (!canAccessDrivers(user)) {
    throw new ForbiddenException('You cannot manage drivers');
  }
}

@Injectable()
export class DriversService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly usersService: UsersService,
  ) {}

  // Volá! ve todos los motoristas; un cliente solo los suyos.
  async findVisible(user: AuthUser): Promise<DriverSummary[]> {
    assertCanAccessDrivers(user);
    const visibleDrivers = canManageAllDrivers(user)
      ? undefined
      : eq(users.organizationId, user.organizationId);
    const rows = await this.selectDrivers()
      .where(visibleDrivers)
      .orderBy(PLATFORM_FIRST, asc(users.name));
    return this.withMerchants(rows);
  }

  async findById(user: AuthUser, driverId: number): Promise<DriverSummary> {
    assertCanAccessDrivers(user);
    const [row] = await this.selectDrivers().where(eq(drivers.id, driverId));
    if (!row || !canManageDriversOf(user, row.ownerId)) {
      throw new NotFoundException(`Driver ${driverId} not found`);
    }
    const [driver] = await this.withMerchants([row]);
    return driver;
  }

  async findOwnProfile(user: AuthUser): Promise<DriverProfile> {
    assertIsDriver(user);
    const [profile] = await this.database
      .select({
        id: drivers.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        isAvailable: drivers.isAvailable,
      })
      .from(drivers)
      .innerJoin(users, eq(drivers.userId, users.id))
      .where(eq(drivers.userId, user.id));
    if (!profile) {
      throw new NotFoundException(`User ${user.id} has no driver profile`);
    }
    return profile;
  }

  // Marcarse no disponible no toca las órdenes ya asignadas: solo evita que le asignen nuevas.
  async updateOwnAvailability(
    user: AuthUser,
    form: DriverAvailabilityForm,
  ): Promise<DriverProfile> {
    assertIsDriver(user);
    await this.database
      .update(drivers)
      .set({ isAvailable: form.isAvailable })
      .where(eq(drivers.userId, user.id));
    return this.findOwnProfile(user);
  }

  async findOwnerOptions(user: AuthUser): Promise<DriverOwner[]> {
    assertCanAccessDrivers(user);
    const rows = await this.database
      .select({
        id: organizations.id,
        name: organizations.name,
        type: organizations.type,
      })
      .from(organizations)
      .where(this.findManageableOrganizations(user, organizations.id))
      .orderBy(PLATFORM_FIRST, asc(organizations.name));
    return rows.map((row) => toOwner(row.id, row.name, row.type));
  }

  async findMerchantOptions(user: AuthUser): Promise<DriverMerchant[]> {
    assertCanAccessDrivers(user);
    return this.selectMerchantOptions()
      .where(this.findManageableOrganizations(user, merchants.organizationId))
      .orderBy(asc(organizations.name), asc(merchants.name));
  }

  async create(user: AuthUser, form: DriverForm): Promise<DriverSummary> {
    if (!canManageDriversOf(user, form.organizationId)) {
      throw new ForbiddenException(
        `You cannot create drivers for organization ${form.organizationId}`,
      );
    }
    const existingUser = await this.usersService.findByEmail(form.email);
    if (existingUser) {
      throw new ConflictException(
        `A user with email ${form.email} already exists`,
      );
    }
    const { owner, countryId } = await this.findOwner(form.organizationId);
    const merchantIds = await this.findServableMerchantIds(
      owner,
      form.merchantIds,
    );
    const passwordHash = await hashPassword(form.password);
    const roleId = await this.usersService.findRoleIdByName(RoleName.Driver);

    const driverId = await this.database.transaction(async (transaction) => {
      const [driverUser] = await transaction
        .insert(users)
        .values({
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          passwordHash,
          roleId,
          organizationId: owner.id,
        })
        .returning({ id: users.id });
      const [driver] = await transaction
        .insert(drivers)
        .values({ userId: driverUser.id, countryId })
        .returning({ id: drivers.id });
      await transaction.insert(driverMerchantAssignments).values(
        merchantIds.map((merchantId) => ({
          driverId: driver.id,
          merchantId,
        })),
      );
      return driver.id;
    });
    return this.findById(user, driverId);
  }

  async updateMerchants(
    user: AuthUser,
    driverId: number,
    form: DriverMerchantsForm,
  ): Promise<DriverSummary> {
    const driver = await this.findById(user, driverId);
    const merchantIds = await this.findServableMerchantIds(
      driver.owner,
      form.merchantIds,
    );

    await this.database.transaction(async (transaction) => {
      await transaction
        .delete(driverMerchantAssignments)
        .where(eq(driverMerchantAssignments.driverId, driverId));
      await transaction
        .insert(driverMerchantAssignments)
        .values(merchantIds.map((merchantId) => ({ driverId, merchantId })));
    });
    return this.findById(user, driverId);
  }

  // undefined: todas las organizaciones (Volá!); si no, solo la del cliente.
  private findManageableOrganizations(
    user: AuthUser,
    organizationColumn:
      typeof organizations.id | typeof merchants.organizationId,
  ): SQL | undefined {
    if (canManageAllDrivers(user)) return undefined;
    return eq(organizationColumn, user.organizationId);
  }

  private async findOwner(
    organizationId: number,
  ): Promise<{ owner: DriverOwner; countryId: number }> {
    const [organization] = await this.database
      .select({
        name: organizations.name,
        type: organizations.type,
        countryId: organizations.countryId,
      })
      .from(organizations)
      .where(eq(organizations.id, organizationId));
    if (!organization) {
      throw createFieldValidationException(
        'organizationId',
        'Elegí a quién pertenece el motorista.',
      );
    }
    if (!organization.countryId) {
      throw new BadRequestException(
        `Organization ${organizationId} has no country; set it before creating drivers`,
      );
    }
    return {
      owner: toOwner(organizationId, organization.name, organization.type),
      countryId: organization.countryId,
    };
  }

  private async findServableMerchantIds(
    owner: DriverOwner,
    requestedMerchantIds: number[],
  ): Promise<number[]> {
    const merchantIds = [...new Set(requestedMerchantIds)];
    const requestedMerchants = await this.selectMerchantOptions().where(
      inArray(merchants.id, merchantIds),
    );
    const isEveryMerchantServable =
      requestedMerchants.length === merchantIds.length &&
      requestedMerchants.every((merchant) =>
        canDriverServeMerchant(owner, merchant),
      );
    if (!isEveryMerchantServable) {
      throw createFieldValidationException(
        'merchantIds',
        'Un motorista de un cliente solo atiende comercios de ese cliente.',
      );
    }
    return merchantIds;
  }

  private async withMerchants(rows: DriverRow[]): Promise<DriverSummary[]> {
    if (rows.length === 0) return [];
    const assignments = await this.database
      .select({
        driverId: driverMerchantAssignments.driverId,
        ...merchantOptionColumns,
      })
      .from(driverMerchantAssignments)
      .innerJoin(
        merchants,
        eq(driverMerchantAssignments.merchantId, merchants.id),
      )
      .innerJoin(organizations, eq(merchants.organizationId, organizations.id))
      .where(
        inArray(
          driverMerchantAssignments.driverId,
          rows.map((row) => row.id),
        ),
      )
      .orderBy(asc(organizations.name), asc(merchants.name));

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phoneNumber: row.phoneNumber,
      owner: toOwner(row.ownerId, row.ownerName, row.ownerType),
      isAvailable: row.isAvailable,
      merchants: assignments
        .filter((assignment) => assignment.driverId === row.id)
        .map(({ driverId: _driverId, ...merchant }) => merchant),
      createdAt: row.createdAt.toISOString(),
    }));
  }

  private selectMerchantOptions() {
    return this.database
      .select(merchantOptionColumns)
      .from(merchants)
      .innerJoin(organizations, eq(merchants.organizationId, organizations.id))
      .$dynamic();
  }

  private selectDrivers() {
    return this.database
      .select(driverColumns)
      .from(drivers)
      .innerJoin(users, eq(drivers.userId, users.id))
      .innerJoin(organizations, eq(users.organizationId, organizations.id))
      .$dynamic();
  }
}
