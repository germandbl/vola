import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  ACTIVE_ORDER_STATUSES,
  OrganizationType,
  canAccessDrivers,
  canManageAllDrivers,
  type AuthUser,
  type DriverMapLocation,
} from '@vola/shared';
import {
  and,
  desc,
  eq,
  exists,
  inArray,
  isNotNull,
  or,
  type SQL,
} from 'drizzle-orm';
import { branches } from '../branches/branches.schema.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { merchants } from '../merchants/merchants.schema.js';
import { orders } from '../orders/orders.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';
import { drivers } from './drivers.schema.js';

type CurrentOrder = DriverMapLocation['currentOrder'];

@Injectable()
export class DriverLocationsService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  // Los que están trabajando: disponibles o con una orden en curso, y con una ubicación conocida.
  async findVisible(user: AuthUser): Promise<DriverMapLocation[]> {
    if (!canAccessDrivers(user)) {
      throw new ForbiddenException('You cannot see drivers on the map');
    }
    const rows = await this.database
      .select({
        driverId: drivers.id,
        name: users.name,
        ownerName: organizations.name,
        ownerType: organizations.type,
        isAvailable: drivers.isAvailable,
        latitude: drivers.latitude,
        longitude: drivers.longitude,
        recordedAt: drivers.locationRecordedAt,
      })
      .from(drivers)
      .innerJoin(users, eq(drivers.userId, users.id))
      .innerJoin(organizations, eq(users.organizationId, organizations.id))
      .where(
        and(
          isNotNull(drivers.locationRecordedAt),
          or(eq(drivers.isAvailable, true), this.hasActiveOrder()),
          this.findVisibleDrivers(user),
        ),
      );

    const currentOrders = await this.findCurrentOrders(
      user,
      rows.map((row) => row.driverId),
    );
    return rows.flatMap((row) => {
      if (row.latitude === null || row.longitude === null) return [];
      if (row.recordedAt === null) return [];
      return [
        {
          driverId: row.driverId,
          name: row.name,
          ownerName: row.ownerName,
          isPlatformDriver: row.ownerType === OrganizationType.Platform,
          isAvailable: row.isAvailable,
          latitude: row.latitude,
          longitude: row.longitude,
          recordedAt: row.recordedAt.toISOString(),
          currentOrder: currentOrders.get(row.driverId) ?? null,
        },
      ];
    });
  }

  // Volá! ve a todos. Un comercio ve su flota y a los motoristas de Volá! que llevan una orden suya.
  private findVisibleDrivers(user: AuthUser): SQL | undefined {
    if (canManageAllDrivers(user)) return undefined;
    return or(
      eq(organizations.id, user.organizationId),
      this.hasActiveOrder(eq(orders.organizationId, user.organizationId)),
    );
  }

  private hasActiveOrder(extraCondition?: SQL): SQL {
    return exists(
      this.database
        .select({ id: orders.id })
        .from(orders)
        .where(
          and(
            eq(orders.driverId, drivers.id),
            inArray(orders.status, ACTIVE_ORDER_STATUSES),
            extraCondition,
          ),
        ),
    );
  }

  // La orden más reciente de cada motorista; un comercio solo ve las suyas.
  private async findCurrentOrders(
    user: AuthUser,
    driverIds: number[],
  ): Promise<Map<number, NonNullable<CurrentOrder>>> {
    const currentOrders = new Map<number, NonNullable<CurrentOrder>>();
    if (driverIds.length === 0) return currentOrders;
    const rows = await this.database
      .select({
        id: orders.id,
        driverId: orders.driverId,
        status: orders.status,
        merchantName: merchants.name,
      })
      .from(orders)
      .innerJoin(branches, eq(orders.branchId, branches.id))
      .innerJoin(merchants, eq(branches.merchantId, merchants.id))
      .where(
        and(
          inArray(orders.driverId, driverIds),
          inArray(orders.status, ACTIVE_ORDER_STATUSES),
          canManageAllDrivers(user)
            ? undefined
            : eq(orders.organizationId, user.organizationId),
        ),
      )
      .orderBy(desc(orders.assignedAt), desc(orders.id));
    for (const row of rows) {
      if (row.driverId === null || currentOrders.has(row.driverId)) continue;
      currentOrders.set(row.driverId, {
        id: row.id,
        status: row.status,
        merchantName: row.merchantName,
      });
    }
    return currentOrders;
  }
}
