import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ACTIVE_ORDER_STATUSES,
  OrderStatus,
  RoleName,
  canDriverMoveTo,
  getPreparationStatus,
  type AuthUser,
  type DriverOrder,
  type DriverOrderDetail,
  type OrderStatusChangeForm,
} from '@vola/shared';
import { and, asc, eq, inArray, type SQL } from 'drizzle-orm';
import { branches } from '../branches/branches.schema.js';
import { countries } from '../countries/countries.schema.js';
import { customers } from '../customers/customers.schema.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { drivers } from '../drivers/drivers.schema.js';
import { merchants } from '../merchants/merchants.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { orderItems, orderStatusChanges, orders } from './orders.schema.js';

const driverOrderColumns = {
  id: orders.id,
  status: orders.status,
  merchantName: merchants.name,
  branchName: branches.name,
  branchAddress: branches.address,
  customerName: customers.name,
  customerPhone: customers.phoneNumber,
  deliveryAddress: orders.deliveryAddress,
  deliveryLatitude: orders.deliveryLatitude,
  deliveryLongitude: orders.deliveryLongitude,
  total: orders.total,
  currency: countries.currency,
  cancellationReason: orders.cancellationReason,
  assignedAt: orders.assignedAt,
  statusChangedAt: orders.statusChangedAt,
  preparationStartedAt: orders.preparationStartedAt,
  readyAt: orders.readyAt,
};

interface DriverOrderRow {
  id: number;
  status: OrderStatus;
  merchantName: string;
  branchName: string;
  branchAddress: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  total: number;
  currency: string | null;
  cancellationReason: string | null;
  assignedAt: Date | null;
  statusChangedAt: Date;
  preparationStartedAt: Date | null;
  readyAt: Date | null;
}

function toDriverOrder(row: DriverOrderRow): DriverOrder {
  if (row.assignedAt === null) {
    throw new Error(`Order ${row.id} has a driver but no assignment date`);
  }
  return {
    id: row.id,
    status: row.status,
    merchantName: row.merchantName,
    branchName: row.branchName,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    deliveryAddress: row.deliveryAddress,
    deliveryLatitude: row.deliveryLatitude,
    deliveryLongitude: row.deliveryLongitude,
    total: row.total,
    currency: row.currency,
    assignedAt: row.assignedAt.toISOString(),
    statusChangedAt: row.statusChangedAt.toISOString(),
    preparationStatus: getPreparationStatus(
      row.preparationStartedAt,
      row.readyAt,
    ),
    preparationStartedAt: row.preparationStartedAt?.toISOString() ?? null,
    readyAt: row.readyAt?.toISOString() ?? null,
  };
}

function assertIsDriver(user: AuthUser): void {
  if (user.role !== RoleName.Driver) {
    throw new ForbiddenException('Only drivers have assigned orders');
  }
}

@Injectable()
export class DriverOrdersService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  // Solo las órdenes activas: las entregadas o canceladas ya no son trabajo pendiente del motorista.
  async findAssigned(user: AuthUser): Promise<DriverOrder[]> {
    assertIsDriver(user);
    const rows = await this.selectDriverOrders(
      user,
      inArray(orders.status, ACTIVE_ORDER_STATUSES),
    ).orderBy(asc(orders.assignedAt), asc(orders.id));
    return rows.map(toDriverOrder);
  }

  async findDetail(
    user: AuthUser,
    orderId: number,
  ): Promise<DriverOrderDetail> {
    assertIsDriver(user);
    const [row] = await this.selectDriverOrders(user, eq(orders.id, orderId));
    if (!row) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    const items = await this.database
      .select({ name: orderItems.name, quantity: orderItems.quantity })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .orderBy(asc(orderItems.id));
    return {
      ...toDriverOrder(row),
      branchAddress: row.branchAddress,
      cancellationReason: row.cancellationReason,
      items,
    };
  }

  async changeStatus(
    user: AuthUser,
    orderId: number,
    form: OrderStatusChangeForm,
  ): Promise<DriverOrderDetail> {
    const order = await this.findDetail(user, orderId);
    if (!canDriverMoveTo(order.status, form.status)) {
      throw new ConflictException(
        `Order ${orderId} cannot go from ${order.status} to ${form.status}`,
      );
    }
    const cancellationReason =
      form.status === OrderStatus.Cancelled ? form.cancellationReason : null;

    await this.database.transaction(async (transaction) => {
      const changedAt = new Date();
      // La condición sobre el estado actual evita aplicar dos cambios que llegan al mismo tiempo.
      const updatedOrders = await transaction
        .update(orders)
        .set({
          status: form.status,
          statusChangedAt: changedAt,
          cancellationReason,
        })
        .where(and(eq(orders.id, orderId), eq(orders.status, order.status)))
        .returning({ id: orders.id });
      if (updatedOrders.length === 0) {
        throw new ConflictException(
          `Order ${orderId} changed status meanwhile`,
        );
      }
      await transaction.insert(orderStatusChanges).values({
        orderId,
        status: form.status,
        cancellationReason,
        changedByUserId: user.id,
        createdAt: changedAt,
      });
    });
    return this.findDetail(user, orderId);
  }

  private selectDriverOrders(user: AuthUser, condition: SQL) {
    return this.database
      .select(driverOrderColumns)
      .from(orders)
      .innerJoin(drivers, eq(orders.driverId, drivers.id))
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .innerJoin(branches, eq(orders.branchId, branches.id))
      .innerJoin(merchants, eq(branches.merchantId, merchants.id))
      .innerJoin(organizations, eq(orders.organizationId, organizations.id))
      .leftJoin(countries, eq(organizations.countryId, countries.id))
      .where(and(eq(drivers.userId, user.id), condition))
      .$dynamic();
  }
}
