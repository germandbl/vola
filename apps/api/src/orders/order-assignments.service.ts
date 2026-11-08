import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  canAssignOrders,
  canOrderBeAssigned,
  canOrderDriverBeChanged,
  type AuthUser,
  type OrderAssignmentForm,
  type OrderDetail,
  type OrderDriver,
  type OrderSummary,
} from '@vola/shared';
import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import { branches } from '../branches/branches.schema.js';
import { createFieldValidationException } from '../common/field-validation.js';
import { DATABASE, type Database } from '../database/database.module.js';
import {
  driverMerchantAssignments,
  drivers,
} from '../drivers/drivers.schema.js';
import { users } from '../users/users.schema.js';
import { orderStatusChanges, orders } from './orders.schema.js';
import { OrdersService } from './orders.service.js';

interface AssignableOrder {
  status: OrderStatus;
  driverId: number | null;
  merchantId: number;
}

type DriverChangeableOrder = AssignableOrder & { driverId: number };

@Injectable()
export class OrderAssignmentsService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly ordersService: OrdersService,
  ) {}

  // Solo motoristas disponibles que atienden el comercio de la sucursal: así un cliente ve los suyos y los de Volá! asignados a su comercio.
  async findDriverOptions(
    user: AuthUser,
    orderId: number,
  ): Promise<OrderDriver[]> {
    const order = await this.findAssignableOrder(user, orderId);
    const hasDriver = order.driverId !== null;
    const canPickDriver =
      canOrderBeAssigned(order.status, hasDriver) ||
      canOrderDriverBeChanged(order.status, hasDriver);
    if (!canPickDriver) {
      throw new ConflictException(`Order ${orderId} cannot get a driver`);
    }
    return this.findAvailableDrivers(order);
  }

  async assignDriver(
    user: AuthUser,
    orderId: number,
    form: OrderAssignmentForm,
  ): Promise<OrderSummary> {
    const order = await this.findAssignableOrder(user, orderId);
    if (!canOrderBeAssigned(order.status, order.driverId !== null)) {
      throw new ConflictException(
        `Order ${orderId} is not new or already has a driver`,
      );
    }
    await this.ensureDriverIsAvailable(order, form.driverId);

    // La condición driver_id IS NULL evita pisar una asignación hecha por otra persona al mismo tiempo.
    const assignedOrders = await this.database
      .update(orders)
      .set({ driverId: form.driverId, assignedAt: new Date() })
      .where(and(eq(orders.id, orderId), isNull(orders.driverId)))
      .returning({ id: orders.id });
    if (assignedOrders.length === 0) {
      throw new ConflictException(`Order ${orderId} already has a driver`);
    }
    return this.ordersService.findSummaryById(orderId);
  }

  async reassignDriver(
    user: AuthUser,
    orderId: number,
    form: OrderAssignmentForm,
  ): Promise<OrderDetail> {
    const order = await this.findDriverChangeableOrder(user, orderId);
    await this.ensureDriverIsAvailable(order, form.driverId);
    await this.replaceDriver(user, orderId, order, form.driverId);
    return this.ordersService.findDetail(user, orderId);
  }

  async releaseDriver(user: AuthUser, orderId: number): Promise<OrderDetail> {
    const order = await this.findDriverChangeableOrder(user, orderId);
    await this.replaceDriver(user, orderId, order, null);
    return this.ordersService.findDetail(user, orderId);
  }

  // La orden vuelve a Nueva: el motorista que la recibe (o el próximo) arranca el recorrido desde el principio.
  private async replaceDriver(
    user: AuthUser,
    orderId: number,
    order: DriverChangeableOrder,
    newDriverId: number | null,
  ): Promise<void> {
    await this.database.transaction(async (transaction) => {
      const changedAt = new Date();
      const assignedAt = newDriverId === null ? null : changedAt;
      // Las condiciones sobre motorista y estado evitan pisar un cambio que llega al mismo tiempo.
      const updatedOrders = await transaction
        .update(orders)
        .set({
          driverId: newDriverId,
          assignedAt,
          status: OrderStatus.New,
          statusChangedAt: changedAt,
        })
        .where(
          and(
            eq(orders.id, orderId),
            eq(orders.driverId, order.driverId),
            eq(orders.status, order.status),
          ),
        )
        .returning({ id: orders.id });
      if (updatedOrders.length === 0) {
        throw new ConflictException(`Order ${orderId} changed meanwhile`);
      }
      if (order.status === OrderStatus.New) return;
      await transaction.insert(orderStatusChanges).values({
        orderId,
        status: OrderStatus.New,
        cancellationReason: null,
        changedByUserId: user.id,
        createdAt: changedAt,
      });
    });
  }

  private async ensureDriverIsAvailable(
    order: AssignableOrder,
    driverId: number,
  ): Promise<void> {
    const driverOptions = await this.findAvailableDrivers(order);
    const isDriverAvailable = driverOptions.some(
      (driver) => driver.id === driverId,
    );
    if (!isDriverAvailable) {
      throw createFieldValidationException(
        'driverId',
        'Ese motorista ya no está disponible para esta orden. Elegí otro.',
      );
    }
  }

  // Al reasignar no se ofrece el motorista que ya la tiene.
  private findAvailableDrivers(order: AssignableOrder): Promise<OrderDriver[]> {
    const conditions = [
      eq(driverMerchantAssignments.merchantId, order.merchantId),
      eq(drivers.isAvailable, true),
    ];
    if (order.driverId !== null)
      conditions.push(ne(drivers.id, order.driverId));
    return this.database
      .select({ id: drivers.id, name: users.name })
      .from(driverMerchantAssignments)
      .innerJoin(drivers, eq(driverMerchantAssignments.driverId, drivers.id))
      .innerJoin(users, eq(drivers.userId, users.id))
      .where(and(...conditions))
      .orderBy(asc(users.name));
  }

  private async findDriverChangeableOrder(
    user: AuthUser,
    orderId: number,
  ): Promise<DriverChangeableOrder> {
    const order = await this.findAssignableOrder(user, orderId);
    const { driverId } = order;
    if (driverId === null || !canOrderDriverBeChanged(order.status, true)) {
      throw new ConflictException(
        `Order ${orderId} is finished or has no driver`,
      );
    }
    return { ...order, driverId };
  }

  private async findAssignableOrder(
    user: AuthUser,
    orderId: number,
  ): Promise<AssignableOrder> {
    const [order] = await this.database
      .select({
        organizationId: orders.organizationId,
        status: orders.status,
        driverId: orders.driverId,
        merchantId: branches.merchantId,
      })
      .from(orders)
      .innerJoin(branches, eq(orders.branchId, branches.id))
      .where(eq(orders.id, orderId));
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    if (!canAssignOrders(user, order.organizationId)) {
      throw new ForbiddenException(`You cannot assign order ${orderId}`);
    }
    return order;
  }
}
