import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PAGE_SIZE,
  canInvoiceMerchants,
  canViewOwnInvoices,
  type AuthUser,
  type InvoiceDetail,
  type InvoiceSummary,
  type Paginated,
} from '@vola/shared';
import { and, asc, desc, eq, isNull, sql, type SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { getPageOffset, toPaginated } from '../common/pagination.js';
import { countries } from '../countries/countries.schema.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { orders } from '../orders/orders.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';
import { selectInvoiceOrders } from './invoice-queries.js';
import { invoices } from './invoices.schema.js';
import { assertCanInvoiceMerchants } from './pending-invoices.service.js';

const createdByUsers = alias(users, 'created_by_users');
const paidByUsers = alias(users, 'paid_by_users');

const invoicedOrderCount = sql<number>`(
  select count(*) from ${orders} where ${orders.invoiceId} = ${invoices.id}
)`.mapWith(Number);

function toIsoDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString();
}

@Injectable()
export class InvoicesService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findPage(
    user: AuthUser,
    page: number,
  ): Promise<Paginated<InvoiceSummary>> {
    const visibleInvoices = this.findVisibleInvoices(user);
    const rows = await this.selectInvoices()
      .where(visibleInvoices)
      .orderBy(desc(invoices.createdAt), desc(invoices.id))
      .limit(PAGE_SIZE)
      .offset(getPageOffset(page));
    const totalItems = await this.database.$count(invoices, visibleInvoices);

    const items = rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      paidAt: toIsoDate(row.paidAt),
    }));
    return toPaginated(items, page, totalItems);
  }

  async findById(user: AuthUser, invoiceId: number): Promise<InvoiceDetail> {
    const [invoice] = await this.selectInvoices()
      .where(and(eq(invoices.id, invoiceId), this.findVisibleInvoices(user)))
      .limit(1);
    // No revelamos si existe una factura de otro comercio.
    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    const invoiceOrders = await selectInvoiceOrders(this.database)
      .where(eq(orders.invoiceId, invoiceId))
      .orderBy(asc(orders.statusChangedAt));
    return {
      ...invoice,
      createdAt: invoice.createdAt.toISOString(),
      paidAt: toIsoDate(invoice.paidAt),
      orders: invoiceOrders.map((order) => ({
        ...order,
        deliveredAt: order.deliveredAt.toISOString(),
      })),
    };
  }

  async markPaid(user: AuthUser, invoiceId: number): Promise<void> {
    assertCanInvoiceMerchants(user);
    // La condición paid_at IS NULL evita registrar dos veces el pago si dos personas confirman a la vez.
    const paidInvoices = await this.database
      .update(invoices)
      .set({ paidAt: new Date(), paidByUserId: user.id })
      .where(and(eq(invoices.id, invoiceId), isNull(invoices.paidAt)))
      .returning({ id: invoices.id });
    if (paidInvoices.length > 0) return;

    const invoiceExists = await this.database.$count(
      invoices,
      eq(invoices.id, invoiceId),
    );
    if (!invoiceExists) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }
    throw new ConflictException(`Invoice ${invoiceId} is already paid`);
  }

  private selectInvoices() {
    return this.database
      .select({
        id: invoices.id,
        organizationName: organizations.name,
        createdByName: createdByUsers.name,
        paidByName: paidByUsers.name,
        orderCount: invoicedOrderCount,
        amount: invoices.amount,
        currency: countries.currency,
        createdAt: invoices.createdAt,
        paidAt: invoices.paidAt,
      })
      .from(invoices)
      .innerJoin(organizations, eq(invoices.organizationId, organizations.id))
      .leftJoin(countries, eq(organizations.countryId, countries.id))
      .innerJoin(
        createdByUsers,
        eq(invoices.createdByUserId, createdByUsers.id),
      )
      .leftJoin(paidByUsers, eq(invoices.paidByUserId, paidByUsers.id))
      .$dynamic();
  }

  // Volá! ve todas; el administrador de un comercio, solo las suyas.
  private findVisibleInvoices(user: AuthUser): SQL | undefined {
    if (canInvoiceMerchants(user)) return undefined;
    if (canViewOwnInvoices(user)) {
      return eq(invoices.organizationId, user.organizationId);
    }
    throw new ForbiddenException('You cannot see invoices');
  }
}
