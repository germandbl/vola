import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PAGE_SIZE,
  RoleName,
  canManageOrganization,
  findAssignablePermissions,
  organizationTypeSchema,
  permissionSchema,
  roleNameSchema,
  type AgentPermissionsForm,
  type AuthUser,
  type Paginated,
  type Permission,
  type UserForm,
  type UserSummary,
} from '@vola/shared';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { hashPassword } from '../auth/passwords.js';
import { getPageOffset, toPaginated } from '../common/pagination.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { organizations } from '../organizations/organizations.schema.js';
import { OrganizationsService } from '../organizations/organizations.service.js';
import { rolePermissions, roles } from '../roles/roles.schema.js';
import { userPermissions, users } from './users.schema.js';

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

export function toAuthUser(
  row: AuthUserRow,
  permissions: Permission[],
): AuthUser {
  return {
    ...row,
    role: roleNameSchema.parse(row.role),
    organizationType: organizationTypeSchema.parse(row.organizationType),
    permissions,
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
    return toAuthUser(row, await this.findPermissions(userId));
  }

  async findPermissions(userId: number): Promise<Permission[]> {
    const rolePermissionRows = await this.database
      .select({ permissionKey: rolePermissions.permissionKey })
      .from(users)
      .innerJoin(rolePermissions, eq(users.roleId, rolePermissions.roleId))
      .where(eq(users.id, userId));
    const userPermissionRows = await this.database
      .select({ permissionKey: userPermissions.permissionKey })
      .from(userPermissions)
      .where(eq(userPermissions.userId, userId));

    const permissionKeys = new Set(
      [...rolePermissionRows, ...userPermissionRows].map(
        (row) => row.permissionKey,
      ),
    );
    return [...permissionKeys].map((key) => permissionSchema.parse(key));
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

    const permissionsByUser = await this.findOwnPermissionsByUser(
      rows.map((row) => row.id),
    );
    const items = rows.map((row) => ({
      ...row,
      role: roleNameSchema.parse(row.role),
      permissions: permissionsByUser.get(row.id) ?? [],
      createdAt: row.createdAt.toISOString(),
    }));
    return toPaginated(items, page, totalItems);
  }

  // Reemplaza la lista completa: lo que no viene en el formulario se le quita al agent.
  async updateAgentPermissions(
    currentUser: AuthUser,
    organizationId: number,
    userId: number,
    form: AgentPermissionsForm,
  ): Promise<void> {
    if (!canManageOrganization(currentUser, organizationId)) {
      throw new ForbiddenException(
        `You cannot change permissions in organization ${organizationId}`,
      );
    }
    const target = await this.findPermissionTarget(organizationId, userId);
    if (target.role !== RoleName.Agent) {
      throw new BadRequestException(
        `User ${userId} is not an agent; administrators and drivers have fixed permissions`,
      );
    }
    const assignablePermissions = findAssignablePermissions(
      organizationTypeSchema.parse(target.organizationType),
    );
    const unassignable = form.permissions.filter(
      (permission) => !assignablePermissions.includes(permission),
    );
    if (unassignable.length > 0) {
      throw new BadRequestException(
        `Permissions ${unassignable.join(', ')} have no effect in organization ${organizationId}`,
      );
    }

    const permissions = [...new Set(form.permissions)];
    await this.database.transaction(async (transaction) => {
      await transaction
        .delete(userPermissions)
        .where(eq(userPermissions.userId, userId));
      if (permissions.length === 0) return;
      await transaction
        .insert(userPermissions)
        .values(
          permissions.map((permissionKey) => ({ userId, permissionKey })),
        );
    });
  }

  private async findPermissionTarget(organizationId: number, userId: number) {
    const [target] = await this.database
      .select({ role: roles.name, organizationType: organizations.type })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .innerJoin(organizations, eq(users.organizationId, organizations.id))
      .where(
        and(eq(users.id, userId), eq(users.organizationId, organizationId)),
      );
    if (!target) {
      throw new NotFoundException(
        `User ${userId} not found in organization ${organizationId}`,
      );
    }
    return target;
  }

  private async findOwnPermissionsByUser(
    userIds: number[],
  ): Promise<Map<number, Permission[]>> {
    const permissionsByUser = new Map<number, Permission[]>();
    if (userIds.length === 0) return permissionsByUser;
    const rows = await this.database
      .select({
        userId: userPermissions.userId,
        permissionKey: userPermissions.permissionKey,
      })
      .from(userPermissions)
      .where(inArray(userPermissions.userId, userIds));
    for (const row of rows) {
      const permissions = permissionsByUser.get(row.userId) ?? [];
      permissions.push(permissionSchema.parse(row.permissionKey));
      permissionsByUser.set(row.userId, permissions);
    }
    return permissionsByUser;
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

  async findRoleIdByName(roleName: string): Promise<number> {
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
