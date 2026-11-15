import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationType,
  SettlementType,
  canSettleOwnCash,
  canSettlePlatformCash,
  type AuthUser,
  type CashAmount,
  type CashWithPlatform,
  type PendingMerchantCash,
  type SettlementOrder,
} from '@vola/shared';
import { and, asc, eq, inArray, isNotNull, type SQL } from 'drizzle-orm';
import { countries } from '../countries/countries.schema.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { drivers } from '../drivers/drivers.schema.js';
import { orders } from '../orders/orders.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import {
  cashAmount,
  cashOrderCount,
  driverOwners,
  driverSettlements,
  driverUsers,
  isCashAtPlatform,
  isCashWithDriver,
  selectSettlementOrders,
  sumOrderTotals,
} from './settlement-queries.js';
import { cashSettlements } from './settlements.schema.js';

function assertCanSettlePlatformCash(user: AuthUser): void {
  if (!canSettlePlatformCash(user)) {
    throw new ForbiddenException('Only Volá! can settle cash to merchants');
  }
}

@Injectable()
export class MerchantSettlementsService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findPending(user: AuthUser): Promise<PendingMerchantCash[]> {
    assertCanSettlePlatformCash(user);
    return this.database
      .select({
        organizationId: organizations.id,
        organizationName: organizations.name,
        currency: countries.currency,
        orderCount: cashOrderCount,
        amount: cashAmount,
      })
      .from(orders)
      .innerJoin(
        driverSettlements,
        eq(orders.driverSettlementId, driverSettlements.id),
      )
      .innerJoin(organizations, eq(orders.organizationId, organizations.id))
      .leftJoin(countries, eq(organizations.countryId, countries.id))
      .where(isCashAtPlatform)
      .groupBy(organizations.id, organizations.name, countries.currency)
      .orderBy(asc(organizations.name));
  }

  async findPendingOrders(
    user: AuthUser,
    organizationId: number,
  ): Promise<SettlementOrder[]> {
    assertCanSettlePlatformCash(user);
    const rows = await selectSettlementOrders(this.database)
      .where(and(eq(orders.organizationId, organizationId), isCashAtPlatform))
      .orderBy(asc(orders.statusChangedAt));
    return rows.map((row) => ({
      ...row,
      deliveredAt: row.deliveredAt.toISOString(),
    }));
  }

  // Volá! entrega el monto completo cobrado: su envío se cobra aparte.
  async settle(user: AuthUser, organizationId: number): Promise<void> {
    assertCanSettlePlatformCash(user);
    await this.assertIsMerchant(organizationId);
    await this.database.transaction(async (transaction) => {
      // FOR UPDATE: si dos personas confirman a la vez, la segunda ya no encuentra órdenes pendientes.
      const pendingOrders = await transaction
        .select({ id: orders.id, total: orders.total })
        .from(orders)
        .innerJoin(
          driverSettlements,
          eq(orders.driverSettlementId, driverSettlements.id),
        )
        .where(and(eq(orders.organizationId, organizationId), isCashAtPlatform))
        .for('update', { of: orders });
      if (pendingOrders.length === 0) {
        throw new ConflictException(
          `Organization ${organizationId} has no cash pending to settle`,
        );
      }

      const [settlement] = await transaction
        .insert(cashSettlements)
        .values({
          type: SettlementType.PlatformToMerchant,
          organizationId,
          amount: sumOrderTotals(pendingOrders),
          settledByUserId: user.id,
        })
        .returning({ id: cashSettlements.id });
      await transaction
        .update(orders)
        .set({ merchantSettlementId: settlement.id })
        .where(
          inArray(
            orders.id,
            pendingOrders.map((order) => order.id),
          ),
        );
    });
  }

  async findCashWithPlatform(user: AuthUser): Promise<CashWithPlatform> {
    if (!canSettleOwnCash(user)) {
      throw new ForbiddenException('You cannot see your cash with Volá!');
    }
    const isOwnOrder = eq(orders.organizationId, user.organizationId);
    const [organization] = await this.database
      .select({ currency: countries.currency })
      .from(organizations)
      .leftJoin(countries, eq(organizations.countryId, countries.id))
      .where(eq(organizations.id, user.organizationId));

    return {
      withDrivers: await this.sumCashWithPlatformDrivers(isOwnOrder),
      atPlatform: await this.sumCash(and(isOwnOrder, isCashAtPlatform)),
      settled: await this.sumCash(
        and(isOwnOrder, isNotNull(orders.merchantSettlementId)),
      ),
      currency: organization?.currency ?? null,
    };
  }

  private async sumCashWithPlatformDrivers(
    condition: SQL,
  ): Promise<CashAmount> {
    const [amount] = await this.database
      .select({ orderCount: cashOrderCount, amount: cashAmount })
      .from(orders)
      .innerJoin(drivers, eq(orders.driverId, drivers.id))
      .innerJoin(driverUsers, eq(drivers.userId, driverUsers.id))
      .innerJoin(driverOwners, eq(driverUsers.organizationId, driverOwners.id))
      .where(
        and(
          condition,
          isCashWithDriver,
          eq(driverOwners.type, OrganizationType.Platform),
        ),
      );
    return amount;
  }

  private async sumCash(condition: SQL | undefined): Promise<CashAmount> {
    const [amount] = await this.database
      .select({ orderCount: cashOrderCount, amount: cashAmount })
      .from(orders)
      .leftJoin(
        driverSettlements,
        eq(orders.driverSettlementId, driverSettlements.id),
      )
      .where(condition);
    return amount;
  }

  private async assertIsMerchant(organizationId: number): Promise<void> {
    const [organization] = await this.database
      .select({ type: organizations.type })
      .from(organizations)
      .where(eq(organizations.id, organizationId));
    if (organization?.type !== OrganizationType.Merchant) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }
  }
}
