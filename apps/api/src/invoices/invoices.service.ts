import { Inject, Injectable } from '@nestjs/common';
import {
  PAGE_SIZE,
  type AuthUser,
  type InvoiceSummary,
  type Paginated,
} from '@vola/shared';
import { desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { getPageOffset, toPaginated } from '../common/pagination.js';
import { countries } from '../countries/countries.schema.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { orders } from '../orders/orders.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';
import { invoices } from './invoices.schema.js';
import { assertCanInvoiceMerchants } from './pending-invoices.service.js';

const createdByUsers = alias(users, 'created_by_users');

const invoicedOrderCount = sql<number>`(
  select count(*) from ${orders} where ${orders.invoiceId} = ${invoices.id}
)`.mapWith(Number);

@Injectable()
export class InvoicesService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findPage(
    user: AuthUser,
    page: number,
  ): Promise<Paginated<InvoiceSummary>> {
    assertCanInvoiceMerchants(user);
    const rows = await this.database
      .select({
        id: invoices.id,
        organizationName: organizations.name,
        createdByName: createdByUsers.name,
        orderCount: invoicedOrderCount,
        amount: invoices.amount,
        currency: countries.currency,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .innerJoin(organizations, eq(invoices.organizationId, organizations.id))
      .leftJoin(countries, eq(organizations.countryId, countries.id))
      .innerJoin(
        createdByUsers,
        eq(invoices.createdByUserId, createdByUsers.id),
      )
      .orderBy(desc(invoices.createdAt), desc(invoices.id))
      .limit(PAGE_SIZE)
      .offset(getPageOffset(page));
    const totalItems = await this.database.$count(invoices);

    const items = rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    }));
    return toPaginated(items, page, totalItems);
  }
}
