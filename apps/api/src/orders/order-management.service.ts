import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ACTIVE_ORDER_STATUSES,
  PreparationStatus,
  canManageOrders,
  findNextPreparationStatus,
  getPreparationStatus,
  type AuthUser,
  type OrderDetail,
  type OrderPreparationForm,
} from '@vola/shared';
import { and, eq, isNull } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { orders } from './orders.schema.js';
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
