import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationType,
  RoleName,
  SettlementReceiver,
  SettlementType,
  canSettleOwnCash,
  canSettlePlatformCash,
  type AuthUser,
  type DriverPendingCash,
  type PendingDriverCash,
  type SettlementOrder,
} from '@vola/shared';
import { and, asc, eq, inArray, type SQL } from 'drizzle-orm';
import { countries } from '../countries/countries.schema.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { drivers } from '../drivers/drivers.schema.js';
import { orders } from '../orders/orders.schema.js';
import {
  cashAmount,
  cashOrderCount,
  driverOwners,
  driverUsers,
  isCashWithDriver,
  selectSettlementOrders,
  sumOrderTotals,
} from './settlement-queries.js';
import { cashSettlements } from './settlements.schema.js';

interface DriverOwner {
  driverId: number;
  ownerId: number;
  isPlatformDriver: boolean;
}

@Injectable()
export class DriverSettlementsService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findPending(user: AuthUser): Promise<PendingDriverCash[]> {
    return this.database
      .select({
        driverId: drivers.id,
        driverName: driverUsers.name,
        currency: countries.currency,
        orderCount: cashOrderCount,
        amount: cashAmount,
      })
      .from(orders)
      .innerJoin(drivers, eq(orders.driverId, drivers.id))
      .innerJoin(driverUsers, eq(drivers.userId, driverUsers.id))
      .innerJoin(driverOwners, eq(driverUsers.organizationId, driverOwners.id))
      .leftJoin(countries, eq(drivers.countryId, countries.id))
      .where(and(isCashWithDriver, this.findSettleableOwners(user)))
      .groupBy(drivers.id, driverUsers.name, countries.currency)
      .orderBy(asc(driverUsers.name));
  }

  async findPendingOrders(
    user: AuthUser,
    driverId: number,
  ): Promise<SettlementOrder[]> {
    await this.findSettleableOwner(user, driverId);
    const rows = await selectSettlementOrders(this.database)
      .where(and(eq(orders.driverId, driverId), isCashWithDriver))
      .orderBy(asc(orders.statusChangedAt));
    return rows.map((row) => ({
      ...row,
      deliveredAt: row.deliveredAt.toISOString(),
    }));
  }

  // Se liquida todo lo pendiente del motorista de una vez: así lo entrega al final del turno.
  async settle(user: AuthUser, driverId: number): Promise<void> {
    const owner = await this.findSettleableOwner(user, driverId);
    await this.database.transaction(async (transaction) => {
      // FOR UPDATE: si dos personas confirman a la vez, la segunda ya no encuentra órdenes pendientes.
      const pendingOrders = await transaction
        .select({ id: orders.id, total: orders.total })
        .from(orders)
        .where(and(eq(orders.driverId, driverId), isCashWithDriver))
        .for('update');
      if (pendingOrders.length === 0) {
        throw new ConflictException(
          `Driver ${driverId} has no cash pending to settle`,
        );
      }

      const [settlement] = await transaction
        .insert(cashSettlements)
        .values({
          type: owner.isPlatformDriver
            ? SettlementType.DriverToPlatform
            : SettlementType.DriverToMerchant,
          driverId,
          organizationId: owner.isPlatformDriver ? null : owner.ownerId,
          amount: sumOrderTotals(pendingOrders),
          settledByUserId: user.id,
        })
        .returning({ id: cashSettlements.id });
      await transaction
        .update(orders)
        .set({ driverSettlementId: settlement.id })
        .where(
          inArray(
            orders.id,
            pendingOrders.map((order) => order.id),
          ),
        );
    });
  }

  async findOwnPending(user: AuthUser): Promise<DriverPendingCash> {
    if (user.role !== RoleName.Driver) {
      throw new ForbiddenException('Only drivers have cash to settle');
    }
    const [driver] = await this.database
      .select({
        id: drivers.id,
        ownerType: driverOwners.type,
        currency: countries.currency,
      })
      .from(drivers)
      .innerJoin(driverUsers, eq(drivers.userId, driverUsers.id))
      .innerJoin(driverOwners, eq(driverUsers.organizationId, driverOwners.id))
      .leftJoin(countries, eq(drivers.countryId, countries.id))
      .where(eq(drivers.userId, user.id));
    if (!driver) {
      throw new NotFoundException(`User ${user.id} has no driver profile`);
    }

    const [pending] = await this.database
      .select({ orderCount: cashOrderCount, amount: cashAmount })
      .from(orders)
      .where(and(eq(orders.driverId, driver.id), isCashWithDriver));
    return {
      ...pending,
      currency: driver.currency,
      receiver:
        driver.ownerType === OrganizationType.Platform
          ? SettlementReceiver.Platform
          : SettlementReceiver.Merchant,
    };
  }

  // Volá! liquida a sus motoristas; un comercio, a su flota propia.
  private findSettleableOwners(user: AuthUser): SQL {
    if (canSettlePlatformCash(user)) {
      return eq(driverOwners.type, OrganizationType.Platform);
    }
    if (canSettleOwnCash(user)) {
      return eq(driverOwners.id, user.organizationId);
    }
    throw new ForbiddenException('You cannot settle cash');
  }

  private async findSettleableOwner(
    user: AuthUser,
    driverId: number,
  ): Promise<DriverOwner> {
    const [owner] = await this.database
      .select({
        driverId: drivers.id,
        ownerId: driverOwners.id,
        ownerType: driverOwners.type,
      })
      .from(drivers)
      .innerJoin(driverUsers, eq(drivers.userId, driverUsers.id))
      .innerJoin(driverOwners, eq(driverUsers.organizationId, driverOwners.id))
      .where(and(eq(drivers.id, driverId), this.findSettleableOwners(user)));
    // No revelamos si existe un motorista que no le toca liquidar a este usuario.
    if (!owner) {
      throw new NotFoundException(`Driver ${driverId} not found`);
    }
    return {
      driverId: owner.driverId,
      ownerId: owner.ownerId,
      isPlatformDriver: owner.ownerType === OrganizationType.Platform,
    };
  }
}
