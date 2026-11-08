import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RoleName,
  canManageOwnDrivers,
  type AuthUser,
  type DriverForm,
  type DriverMerchant,
  type DriverMerchantsForm,
  type DriverSummary,
} from '@vola/shared';
import { and, asc, eq, inArray } from 'drizzle-orm';
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
  createdAt: drivers.createdAt,
};

type DriverRow = Omit<DriverSummary, 'merchants' | 'createdAt'> & {
  createdAt: Date;
};

function assertCanManageOwnDrivers(user: AuthUser): void {
  if (!canManageOwnDrivers(user)) {
    throw new ForbiddenException('You cannot manage drivers');
  }
}

@Injectable()
export class DriversService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly usersService: UsersService,
  ) {}

  // Un motorista propio es un usuario de la organización: otra organización no lo ve.
  async findOwn(user: AuthUser): Promise<DriverSummary[]> {
    assertCanManageOwnDrivers(user);
    const rows = await this.selectDrivers()
      .where(eq(users.organizationId, user.organizationId))
      .orderBy(asc(users.name));
    return this.withMerchants(rows);
  }

  async findOwnById(user: AuthUser, driverId: number): Promise<DriverSummary> {
    assertCanManageOwnDrivers(user);
    const [row] = await this.selectDrivers().where(
      and(
        eq(drivers.id, driverId),
        eq(users.organizationId, user.organizationId),
      ),
    );
    if (!row) {
      throw new NotFoundException(`Driver ${driverId} not found`);
    }
    const [driver] = await this.withMerchants([row]);
    return driver;
  }

  async findMerchantOptions(user: AuthUser): Promise<DriverMerchant[]> {
    assertCanManageOwnDrivers(user);
    return this.database
      .select({ id: merchants.id, name: merchants.name })
      .from(merchants)
      .where(eq(merchants.organizationId, user.organizationId))
      .orderBy(asc(merchants.name));
  }

  async create(user: AuthUser, form: DriverForm): Promise<DriverSummary> {
    assertCanManageOwnDrivers(user);
    const existingUser = await this.usersService.findByEmail(form.email);
    if (existingUser) {
      throw new ConflictException(
        `A user with email ${form.email} already exists`,
      );
    }
    const merchantIds = await this.findOwnMerchantIds(user, form.merchantIds);
    const countryId = await this.findOrganizationCountryId(user.organizationId);
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
          organizationId: user.organizationId,
        })
        .returning({ id: users.id });
      const [driver] = await transaction
        .insert(drivers)
        .values({ userId: driverUser.id, countryId })
        .returning({ id: drivers.id });
      await transaction
        .insert(driverMerchantAssignments)
        .values(
          merchantIds.map((merchantId) => ({
            driverId: driver.id,
            merchantId,
          })),
        );
      return driver.id;
    });
    return this.findOwnById(user, driverId);
  }

  async updateMerchants(
    user: AuthUser,
    driverId: number,
    form: DriverMerchantsForm,
  ): Promise<DriverSummary> {
    await this.findOwnById(user, driverId);
    const merchantIds = await this.findOwnMerchantIds(user, form.merchantIds);

    await this.database.transaction(async (transaction) => {
      await transaction
        .delete(driverMerchantAssignments)
        .where(eq(driverMerchantAssignments.driverId, driverId));
      await transaction
        .insert(driverMerchantAssignments)
        .values(merchantIds.map((merchantId) => ({ driverId, merchantId })));
    });
    return this.findOwnById(user, driverId);
  }

  private async findOwnMerchantIds(
    user: AuthUser,
    requestedMerchantIds: number[],
  ): Promise<number[]> {
    const merchantIds = [...new Set(requestedMerchantIds)];
    const ownMerchantCount = await this.database.$count(
      merchants,
      and(
        inArray(merchants.id, merchantIds),
        eq(merchants.organizationId, user.organizationId),
      ),
    );
    if (ownMerchantCount !== merchantIds.length) {
      throw createFieldValidationException(
        'merchantIds',
        'Elegí solo comercios de tu organización.',
      );
    }
    return merchantIds;
  }

  private async withMerchants(rows: DriverRow[]): Promise<DriverSummary[]> {
    if (rows.length === 0) return [];
    const assignments = await this.database
      .select({
        driverId: driverMerchantAssignments.driverId,
        id: merchants.id,
        name: merchants.name,
      })
      .from(driverMerchantAssignments)
      .innerJoin(
        merchants,
        eq(driverMerchantAssignments.merchantId, merchants.id),
      )
      .where(
        inArray(
          driverMerchantAssignments.driverId,
          rows.map((row) => row.id),
        ),
      )
      .orderBy(asc(merchants.name));

    return rows.map((row) => ({
      ...row,
      merchants: assignments
        .filter((assignment) => assignment.driverId === row.id)
        .map(({ id, name }) => ({ id, name })),
      createdAt: row.createdAt.toISOString(),
    }));
  }

  private async findOrganizationCountryId(
    organizationId: number,
  ): Promise<number> {
    const [organization] = await this.database
      .select({ countryId: organizations.countryId })
      .from(organizations)
      .where(eq(organizations.id, organizationId));
    if (!organization?.countryId) {
      throw new BadRequestException(
        `Organization ${organizationId} has no country; set it before creating drivers`,
      );
    }
    return organization.countryId;
  }

  private selectDrivers() {
    return this.database
      .select(driverColumns)
      .from(drivers)
      .innerJoin(users, eq(drivers.userId, users.id))
      .$dynamic();
  }
}
