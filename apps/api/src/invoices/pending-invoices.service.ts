import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationType,
  canInvoiceMerchants,
  type AuthUser,
  type InvoiceOrder,
  type PendingInvoice,
} from '@vola/shared';
import { and, asc, eq, inArray } from 'drizzle-orm';
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
  isPendingInvoice,
  selectInvoiceOrders,
  sumDeliveryFees,
} from './invoice-queries.js';
import { invoices } from './invoices.schema.js';

export function assertCanInvoiceMerchants(user: AuthUser): void {
  if (!canInvoiceMerchants(user)) {
    throw new ForbiddenException('Only Volá! can invoice merchants');
  }
}

@Injectable()
export class PendingInvoicesService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findPending(user: AuthUser): Promise<PendingInvoice[]> {
    assertCanInvoiceMerchants(user);
    return this.database
      .select({
        organizationId: organizations.id,
        organizationName: organizations.name,
        currency: countries.currency,
        orderCount: invoiceOrderCount,
        amount: invoiceAmount,
      })
      .from(orders)
      .innerJoin(drivers, eq(orders.driverId, drivers.id))
      .innerJoin(driverUsers, eq(drivers.userId, driverUsers.id))
      .innerJoin(driverOwners, eq(driverUsers.organizationId, driverOwners.id))
      .innerJoin(organizations, eq(orders.organizationId, organizations.id))
      .leftJoin(countries, eq(organizations.countryId, countries.id))
      .where(isPendingInvoice)
      .groupBy(organizations.id, organizations.name, countries.currency)
      .orderBy(asc(organizations.name));
  }

  async findPendingOrders(
    user: AuthUser,
    organizationId: number,
  ): Promise<InvoiceOrder[]> {
    assertCanInvoiceMerchants(user);
    const rows = await selectInvoiceOrders(this.database)
      .where(and(eq(orders.organizationId, organizationId), isPendingInvoice))
      .orderBy(asc(orders.statusChangedAt));
    return rows.map((row) => ({
      ...row,
      deliveredAt: row.deliveredAt.toISOString(),
    }));
  }

  // Se factura todo lo pendiente del comercio de una vez, como en un corte de mes.
  async create(user: AuthUser, organizationId: number): Promise<void> {
    assertCanInvoiceMerchants(user);
    await this.assertIsMerchant(organizationId);
    await this.database.transaction(async (transaction) => {
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
        .where(and(eq(orders.organizationId, organizationId), isPendingInvoice))
        .for('update', { of: orders });
      if (pendingOrders.length === 0) {
        throw new ConflictException(
          `Organization ${organizationId} has no orders pending to invoice`,
        );
      }

      const [invoice] = await transaction
        .insert(invoices)
        .values({
          organizationId,
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
