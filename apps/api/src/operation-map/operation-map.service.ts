import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  ACTIVE_ORDER_STATUSES,
  canAccessDrivers,
  canViewAllOrders,
  canViewOrders,
  type AuthUser,
  type OperationMap,
  type OperationMapBranch,
  type OperationMapOrder,
} from '@vola/shared';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { branches } from '../branches/branches.schema.js';
import { customers } from '../customers/customers.schema.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { DriverLocationsService } from '../drivers/driver-locations.service.js';
import { drivers } from '../drivers/drivers.schema.js';
import { merchants } from '../merchants/merchants.schema.js';
import { orders } from '../orders/orders.schema.js';
import { users } from '../users/users.schema.js';

@Injectable()
export class OperationMapService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly driverLocationsService: DriverLocationsService,
  ) {}

  async find(user: AuthUser): Promise<OperationMap> {
    const canSeeOrders = canViewOrders(user);
    const canSeeDrivers = canAccessDrivers(user);
    if (!canSeeOrders && !canSeeDrivers) {
      throw new ForbiddenException('You cannot see the operation map');
    }
    const [driverLocations, activeOrders, visibleBranches] = await Promise.all([
      canSeeDrivers ? this.driverLocationsService.findVisible(user) : [],
      canSeeOrders ? this.findActiveOrders(user) : [],
      canSeeOrders ? this.findBranches(user) : [],
    ]);
    return {
      drivers: driverLocations,
      orders: activeOrders,
      branches: visibleBranches,
    };
  }

  // Volá! ve las de todos los comercios; un comercio, solo las suyas.
  private findActiveOrders(user: AuthUser): Promise<OperationMapOrder[]> {
    return this.database
      .select({
        id: orders.id,
        status: orders.status,
        customerName: customers.name,
        merchantName: merchants.name,
        branchName: branches.name,
        driverName: users.name,
        latitude: orders.deliveryLatitude,
        longitude: orders.deliveryLongitude,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .innerJoin(branches, eq(orders.branchId, branches.id))
      .innerJoin(merchants, eq(branches.merchantId, merchants.id))
      .leftJoin(drivers, eq(orders.driverId, drivers.id))
      .leftJoin(users, eq(drivers.userId, users.id))
      .where(
        and(
          inArray(orders.status, ACTIVE_ORDER_STATUSES),
          canViewAllOrders(user)
            ? undefined
            : eq(orders.organizationId, user.organizationId),
        ),
      )
      .orderBy(desc(orders.createdAt));
  }

  private findBranches(user: AuthUser): Promise<OperationMapBranch[]> {
    return this.database
      .select({
        id: branches.id,
        name: branches.name,
        merchantName: merchants.name,
        address: branches.address,
        latitude: branches.latitude,
        longitude: branches.longitude,
      })
      .from(branches)
      .innerJoin(merchants, eq(branches.merchantId, merchants.id))
      .where(
        canViewAllOrders(user)
          ? undefined
          : eq(merchants.organizationId, user.organizationId),
      )
      .orderBy(asc(merchants.name), asc(branches.name));
  }
}
