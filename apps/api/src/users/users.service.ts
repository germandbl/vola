import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  PAGE_SIZE,
  canManageOrganization,
  organizationTypeSchema,
  roleNameSchema,
  type AuthUser,
  type Paginated,
  type UserForm,
  type UserSummary,
} from '@vola/shared';
import { desc, eq } from 'drizzle-orm';
import { hashPassword } from '../auth/passwords.js';
import { getPageOffset, toPaginated } from '../common/pagination.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { organizations } from '../organizations/organizations.schema.js';
import { OrganizationsService } from '../organizations/organizations.service.js';
import { roles } from '../roles/roles.schema.js';
import { users } from './users.schema.js';

export type User = typeof users.$inferSelect;

export const authUserColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  phoneNumber: users.phoneNumber,
  role: roles.name,
  organizationId: users.organizationId,
  organizationType: organizations.type,
};

export type AuthUserRow = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  organizationId: number;
  organizationType: string;
};

export function toAuthUser(row: AuthUserRow): AuthUser {
  return {
    ...row,
    role: roleNameSchema.parse(row.role),
    organizationType: organizationTypeSchema.parse(row.organizationType),
  };
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.database
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async findAuthUserById(userId: number): Promise<AuthUser> {
    const [row] = await this.database
      .select(authUserColumns)
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .innerJoin(organizations, eq(users.organizationId, organizations.id))
      .where(eq(users.id, userId));
    return toAuthUser(row);
  }

  async findPageByOrganization(
    currentUser: AuthUser,
    organizationId: number,
    page: number,
  ): Promise<Paginated<UserSummary>> {
    await this.organizationsService.findById(currentUser, organizationId);

    const rows = await this.database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        role: roles.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.organizationId, organizationId))
      .orderBy(desc(users.createdAt), desc(users.id))
      .limit(PAGE_SIZE)
      .offset(getPageOffset(page));
    const totalItems = await this.database.$count(
      users,
      eq(users.organizationId, organizationId),
    );

    const items = rows.map((row) => ({
      ...row,
      role: roleNameSchema.parse(row.role),
      createdAt: row.createdAt.toISOString(),
    }));
    return toPaginated(items, page, totalItems);
  }

  async create(
    currentUser: AuthUser,
    organizationId: number,
    form: UserForm,
  ): Promise<void> {
    if (!canManageOrganization(currentUser, organizationId)) {
      throw new ForbiddenException(
        `You cannot create users in organization ${organizationId}`,
      );
    }
    await this.organizationsService.findById(currentUser, organizationId);

    const existingUser = await this.findByEmail(form.email);
    if (existingUser) {
      throw new ConflictException(
        `A user with email ${form.email} already exists`,
      );
    }

    await this.database.insert(users).values({
      name: form.name,
      email: form.email,
      phoneNumber: form.phoneNumber,
      passwordHash: await hashPassword(form.password),
      roleId: await this.findRoleIdByName(form.role),
      organizationId,
    });
  }

  private async findRoleIdByName(roleName: string): Promise<number> {
    const [role] = await this.database
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, roleName));
    if (!role) {
      throw new Error(
        `Role ${roleName} is missing; run the database migrations`,
      );
    }
    return role.id;
  }
}
