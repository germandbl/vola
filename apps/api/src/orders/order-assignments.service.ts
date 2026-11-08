import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  canAssignOrders,
  canOrderBeAssigned,
  type AuthUser,
  type OrderAssignmentForm,
  type OrderDriver,
  type OrderSummary,
} from '@vola/shared';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { branches } from '../branches/branches.schema.js';
import { createFieldValidationException } from '../common/field-validation.js';
import { DATABASE, type Database } from '../database/database.module.js';
import {
  driverMerchantAssignments,
  drivers,
} from '../drivers/drivers.schema.js';
import { users } from '../users/users.schema.js';
import { orders } from './orders.schema.js';
import { OrdersService } from './orders.service.js';

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
    const merchantId = await this.findAssignableOrderMerchantId(user, orderId);
    return this.database
      .select({ id: drivers.id, name: users.name })
      .from(driverMerchantAssignments)
      .innerJoin(drivers, eq(driverMerchantAssignments.driverId, drivers.id))
      .innerJoin(users, eq(drivers.userId, users.id))
      .where(
        and(
          eq(driverMerchantAssignments.merchantId, merchantId),
          eq(drivers.isAvailable, true),
        ),
      )
      .orderBy(asc(users.name));
  }

  async assignDriver(
    user: AuthUser,
    orderId: number,
    form: OrderAssignmentForm,
  ): Promise<OrderSummary> {
    const driverOptions = await this.findDriverOptions(user, orderId);
    const isDriverAvailable = driverOptions.some(
      (driver) => driver.id === form.driverId,
    );
    if (!isDriverAvailable) {
      throw createFieldValidationException(
        'driverId',
        'Ese motorista ya no está disponible para esta orden. Elegí otro.',
      );
    }

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

  private async findAssignableOrderMerchantId(
    user: AuthUser,
    orderId: number,
  ): Promise<number> {
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
    if (!canOrderBeAssigned(order.status, order.driverId !== null)) {
      throw new ConflictException(
        `Order ${orderId} is not new or already has a driver`,
      );
    }
    return order.merchantId;
  }
}
