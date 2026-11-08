import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  RoleName,
  canManageOwnDrivers,
  type AuthUser,
  type DriverForm,
  type DriverSummary,
} from '@vola/shared';
import { asc, eq } from 'drizzle-orm';
import { hashPassword } from '../auth/passwords.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';
import { UsersService } from '../users/users.service.js';
import { driverMerchantAssignments, drivers } from './drivers.schema.js';

const driverSummaryColumns = {
  id: drivers.id,
  name: users.name,
  email: users.email,
  phoneNumber: users.phoneNumber,
  createdAt: drivers.createdAt,
};

type DriverSummaryRow = Omit<DriverSummary, 'createdAt'> & { createdAt: Date };

function toDriverSummary(row: DriverSummaryRow): DriverSummary {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

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

  // Solo los motoristas asignados a la organización de quien consulta: los de otra organización no se ven.
  async findOwn(user: AuthUser): Promise<DriverSummary[]> {
    assertCanManageOwnDrivers(user);
    const rows = await this.selectDriverSummaries()
      .where(eq(driverMerchantAssignments.organizationId, user.organizationId))
      .orderBy(asc(users.name));
    return rows.map(toDriverSummary);
  }

  async create(user: AuthUser, form: DriverForm): Promise<DriverSummary> {
    assertCanManageOwnDrivers(user);
    const existingUser = await this.usersService.findByEmail(form.email);
    if (existingUser) {
      throw new ConflictException(
        `A user with email ${form.email} already exists`,
      );
    }
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
        .values({ driverId: driver.id, organizationId: user.organizationId });
      return driver.id;
    });

    const [row] = await this.selectDriverSummaries().where(
      eq(drivers.id, driverId),
    );
    return toDriverSummary(row);
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

  private selectDriverSummaries() {
    return this.database
      .select(driverSummaryColumns)
      .from(drivers)
      .innerJoin(users, eq(drivers.userId, users.id))
      .innerJoin(
        driverMerchantAssignments,
        eq(driverMerchantAssignments.driverId, drivers.id),
      )
      .$dynamic();
  }
}
