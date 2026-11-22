import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InvoiceType,
  OrganizationType,
  canInvoiceMerchants,
  type AuthUser,
  type InvoiceOrder,
  type InvoiceRange,
  type PendingInvoice,
} from '@vola/shared';
import { and, asc, eq, inArray, lt, min } from 'drizzle-orm';
import { findRegionDayRange } from '../common/region-calendar.js';
import { countries } from '../countries/countries.schema.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { drivers } from '../drivers/drivers.schema.js';
import { orders } from '../orders/orders.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import {
  driverOwners,
  driverUsers,
  invoiceAmount,
  invoiceOrderCount,
  isDeliveredInRange,
  isPendingInvoice,
  regionDeliveryDate,
  selectInvoiceOrders,
  sumDeliveryFees,
} from './invoice-queries.js';
import {
  assertRangeHasEnded,
  assertRangeNotInvoiced,
  findLastBillableDate,
  lockOrganization,
} from './invoice-ranges.js';
import { invoices } from './invoices.schema.js';

export function assertCanInvoiceMerchants(user: AuthUser): void {
  if (!canInvoiceMerchants(user)) {
    throw new ForbiddenException('Only Volá! can invoice merchants');
  }
}

@Injectable()
export class PendingInvoicesService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  // Solo cuentan los días que ya terminaron: hoy todavía se pueden entregar más órdenes.
  async findPending(user: AuthUser): Promise<PendingInvoice[]> {
    assertCanInvoiceMerchants(user);
    const lastBillableDate = findLastBillableDate();
    const { end } = findRegionDayRange(lastBillableDate, lastBillableDate);
    const rows = await this.database
      .select({
        organizationId: organizations.id,
        organizationName: organizations.name,
        currency: countries.currency,
        orderCount: invoiceOrderCount,
        amount: invoiceAmount,
        firstDeliveryDate: min(regionDeliveryDate),
      })
      .from(orders)
      .innerJoin(drivers, eq(orders.driverId, drivers.id))
      .innerJoin(driverUsers, eq(drivers.userId, driverUsers.id))
      .innerJoin(driverOwners, eq(driverUsers.organizationId, driverOwners.id))
      .innerJoin(organizations, eq(orders.organizationId, organizations.id))
      .leftJoin(countries, eq(organizations.countryId, countries.id))
      .where(and(isPendingInvoice, lt(orders.statusChangedAt, end)))
      .groupBy(organizations.id, organizations.name, countries.currency)
      .orderBy(asc(organizations.name));
    return rows.map((row) => ({
      ...row,
      // Cada fila tiene al menos una orden, así que siempre hay una primera fecha.
      firstDeliveryDate: row.firstDeliveryDate ?? lastBillableDate,
      lastBillableDate,
    }));
  }

  async findPendingOrders(
    user: AuthUser,
    organizationId: number,
    range: InvoiceRange,
  ): Promise<InvoiceOrder[]> {
    assertCanInvoiceMerchants(user);
    const rows = await selectInvoiceOrders(this.database)
      .where(
        and(
          eq(orders.organizationId, organizationId),
          isPendingInvoice,
          isDeliveredInRange(range),
        ),
      )
      .orderBy(asc(orders.statusChangedAt));
    return rows.map((row) => ({
      ...row,
      deliveredAt: row.deliveredAt.toISOString(),
    }));
  }

  async create(
    user: AuthUser,
    organizationId: number,
    range: InvoiceRange,
  ): Promise<void> {
    assertCanInvoiceMerchants(user);
    assertRangeHasEnded(range);
    await this.assertIsMerchant(organizationId);
    await this.database.transaction(async (transaction) => {
      await lockOrganization(transaction, organizationId);
      await assertRangeNotInvoiced(
        transaction,
        organizationId,
        InvoiceType.Delivery,
        range,
      );
      // FOR UPDATE: si dos personas facturan a la vez, la segunda ya no encuentra órdenes pendientes.
      const pendingOrders = await transaction
        .select({ id: orders.id, volaDeliveryFee: orders.volaDeliveryFee })
        .from(orders)
        .innerJoin(drivers, eq(orders.driverId, drivers.id))
        .innerJoin(driverUsers, eq(drivers.userId, driverUsers.id))
        .innerJoin(
          driverOwners,
          eq(driverUsers.organizationId, driverOwners.id),
        )
        .where(
          and(
            eq(orders.organizationId, organizationId),
            isPendingInvoice,
            isDeliveredInRange(range),
          ),
        )
        .for('update', { of: orders });
      if (pendingOrders.length === 0) {
        throw new ConflictException(
          `Organization ${organizationId} has no orders pending to invoice from ${range.from} to ${range.to}`,
        );
      }

      const [invoice] = await transaction
        .insert(invoices)
        .values({
          organizationId,
          type: InvoiceType.Delivery,
          periodStart: range.from,
          periodEnd: range.to,
          amount: sumDeliveryFees(pendingOrders),
          createdByUserId: user.id,
        })
        .returning({ id: invoices.id });
      await transaction
        .update(orders)
        .set({ invoiceId: invoice.id })
        .where(
          inArray(
            orders.id,
            pendingOrders.map((order) => order.id),
          ),
        );
    });
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
