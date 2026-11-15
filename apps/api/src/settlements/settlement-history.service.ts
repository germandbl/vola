import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  PAGE_SIZE,
  canSettleOwnCash,
  canSettlePlatformCash,
  type AuthUser,
  type CashSettlement,
  type Paginated,
} from '@vola/shared';
import { desc, eq, sql, type SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { getPageOffset, toPaginated } from '../common/pagination.js';
import { countries } from '../countries/countries.schema.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { drivers } from '../drivers/drivers.schema.js';
import { orders } from '../orders/orders.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';
import { driverUsers } from './settlement-queries.js';
import { cashSettlements } from './settlements.schema.js';

const settledByUsers = alias(users, 'settled_by_users');
const organizationCountries = alias(countries, 'organization_countries');
const driverCountries = alias(countries, 'driver_countries');

const settledOrderCount = sql<number>`(
  select count(*) from ${orders}
  where ${orders.driverSettlementId} = ${cashSettlements.id}
    or ${orders.merchantSettlementId} = ${cashSettlements.id}
)`.mapWith(Number);

@Injectable()
export class SettlementHistoryService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findPage(
    user: AuthUser,
    page: number,
  ): Promise<Paginated<CashSettlement>> {
    const visibleSettlements = this.findVisibleSettlements(user);
    const rows = await this.database
      .select({
        id: cashSettlements.id,
        type: cashSettlements.type,
        driverName: driverUsers.name,
        organizationName: organizations.name,
        settledByName: settledByUsers.name,
        orderCount: settledOrderCount,
        amount: cashSettlements.amount,
        // La liquidación a Volá! no tiene comercio: la moneda sale del país del motorista.
        currency: sql<
          string | null
        >`coalesce(${organizationCountries.currency}, ${driverCountries.currency})`,
        createdAt: cashSettlements.createdAt,
      })
      .from(cashSettlements)
      .innerJoin(
        settledByUsers,
        eq(cashSettlements.settledByUserId, settledByUsers.id),
      )
      .leftJoin(drivers, eq(cashSettlements.driverId, drivers.id))
      .leftJoin(driverUsers, eq(drivers.userId, driverUsers.id))
      .leftJoin(driverCountries, eq(drivers.countryId, driverCountries.id))
      .leftJoin(
        organizations,
        eq(cashSettlements.organizationId, organizations.id),
      )
      .leftJoin(
        organizationCountries,
        eq(organizations.countryId, organizationCountries.id),
      )
      .where(visibleSettlements)
      .orderBy(desc(cashSettlements.createdAt), desc(cashSettlements.id))
      .limit(PAGE_SIZE)
      .offset(getPageOffset(page));
    const totalItems = await this.database.$count(
      cashSettlements,
      visibleSettlements,
    );

    const items = rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    }));
    return toPaginated(items, page, totalItems);
  }

  // Volá! ve todas; un comercio, las que recibió de su flota y de Volá!.
  private findVisibleSettlements(user: AuthUser): SQL | undefined {
    if (canSettlePlatformCash(user)) return undefined;
    if (canSettleOwnCash(user)) {
      return eq(cashSettlements.organizationId, user.organizationId);
    }
    throw new ForbiddenException('You cannot see cash settlements');
  }
}
