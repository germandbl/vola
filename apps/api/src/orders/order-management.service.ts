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
  PreparationStatus,
  canManageOrders,
  findNextPreparationStatus,
  getPreparationStatus,
  type AuthUser,
  type OrderCancellationForm,
  type OrderDetail,
  type OrderPreparationForm,
} from '@vola/shared';
import { and, eq, isNull } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { orderStatusChanges, orders } from './orders.schema.js';
import { OrdersService } from './orders.service.js';

@Injectable()
export class OrderManagementService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly ordersService: OrdersService,
  ) {}

  async changePreparation(
    user: AuthUser,
    orderId: number,
    form: OrderPreparationForm,
  ): Promise<OrderDetail> {
    const order = await this.findManageableOrder(user, orderId);
    if (!ACTIVE_ORDER_STATUSES.includes(order.status)) {
      throw new ConflictException(`Order ${orderId} already finished`);
    }
    const current = getPreparationStatus(
      order.preparationStartedAt,
      order.readyAt,
    );
    if (findNextPreparationStatus(current) !== form.preparationStatus) {
      throw new ConflictException(
        `Order ${orderId} cannot go from ${current} to ${form.preparationStatus}`,
      );
    }

    // La condición IS NULL evita marcar dos veces el mismo paso si llegan dos clics a la vez.
    const isStarting = form.preparationStatus === PreparationStatus.Preparing;
    const updatedOrders = await this.database
      .update(orders)
      .set(
        isStarting
          ? { preparationStartedAt: new Date() }
          : { readyAt: new Date() },
      )
      .where(
        and(
          eq(orders.id, orderId),
          isStarting
            ? isNull(orders.preparationStartedAt)
            : isNull(orders.readyAt),
        ),
      )
      .returning({ id: orders.id });
    if (updatedOrders.length === 0) {
      throw new ConflictException(
        `Order ${orderId} preparation changed meanwhile`,
      );
    }
    return this.ordersService.findDetail(user, orderId);
  }

  async completeOrder(user: AuthUser, orderId: number): Promise<OrderDetail> {
    await this.finishOrder(user, orderId, {
      status: OrderStatus.Delivered,
      cancellationReason: null,
    });
    return this.ordersService.findDetail(user, orderId);
  }

  async cancelOrder(
    user: AuthUser,
    orderId: number,
    form: OrderCancellationForm,
  ): Promise<OrderDetail> {
    await this.finishOrder(user, orderId, {
      status: OrderStatus.Cancelled,
      cancellationReason: form.cancellationReason,
    });
    return this.ordersService.findDetail(user, orderId);
  }

  private async finishOrder(
    user: AuthUser,
    orderId: number,
    ending: {
      status: typeof OrderStatus.Delivered | typeof OrderStatus.Cancelled;
      cancellationReason: string | null;
    },
  ): Promise<void> {
    const order = await this.findManageableOrder(user, orderId);
    if (!ACTIVE_ORDER_STATUSES.includes(order.status)) {
      throw new ConflictException(`Order ${orderId} already finished`);
    }

    await this.database.transaction(async (transaction) => {
      const changedAt = new Date();
      // La condición sobre el estado actual evita pisar un cambio del motorista que llega al mismo tiempo.
      const updatedOrders = await transaction
        .update(orders)
        .set({ ...ending, statusChangedAt: changedAt })
        .where(and(eq(orders.id, orderId), eq(orders.status, order.status)))
        .returning({ id: orders.id });
      if (updatedOrders.length === 0) {
        throw new ConflictException(
          `Order ${orderId} changed status meanwhile`,
        );
      }
      await transaction.insert(orderStatusChanges).values({
        orderId,
        ...ending,
        changedByUserId: user.id,
        createdAt: changedAt,
      });
    });
  }

  private async findManageableOrder(user: AuthUser, orderId: number) {
    const [order] = await this.database
      .select({
        organizationId: orders.organizationId,
        status: orders.status,
        preparationStartedAt: orders.preparationStartedAt,
        readyAt: orders.readyAt,
      })
      .from(orders)
      .where(eq(orders.id, orderId));
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    if (!canManageOrders(user, order.organizationId)) {
      throw new ForbiddenException(`You cannot manage order ${orderId}`);
    }
    return order;
  }
}
