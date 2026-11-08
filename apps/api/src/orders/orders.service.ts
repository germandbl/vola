import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PAGE_SIZE,
  calculateOrderSubtotal,
  calculateOrderTotal,
  canCreateOrders,
  canCreateOrdersForAnyOrganization,
  canViewAllOrders,
  canViewOrders,
  type AuthUser,
  type OrderBranchOption,
  type OrderForm,
  type OrderSummary,
  type Paginated,
} from '@vola/shared';
import { asc, desc, eq, type SQL } from 'drizzle-orm';
import { branches } from '../branches/branches.schema.js';
import { createFieldValidationException } from '../common/field-validation.js';
import { getPageOffset, toPaginated } from '../common/pagination.js';
import { countries } from '../countries/countries.schema.js';
import { customers } from '../customers/customers.schema.js';
import { drivers } from '../drivers/drivers.schema.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { merchants } from '../merchants/merchants.schema.js';
import { organizations } from '../organizations/organizations.schema.js';
import { users } from '../users/users.schema.js';
import { orderItems, orders } from './orders.schema.js';
import {
  VolaDeliveryFeeService,
  type VolaDeliveryFee,
} from './vola-delivery-fee.service.js';

const orderSummaryColumns = {
  id: orders.id,
  organizationId: orders.organizationId,
  organizationName: organizations.name,
  currency: countries.currency,
  status: orders.status,
  customerName: customers.name,
  customerPhone: customers.phoneNumber,
  merchantName: merchants.name,
  branchName: branches.name,
  deliveryAddress: orders.deliveryAddress,
  total: orders.total,
  volaDeliveryFee: orders.volaDeliveryFee,
  deliveryFeeBasis: orders.deliveryFeeBasis,
  distanceKm: orders.distanceKm,
  driverId: orders.driverId,
  driverName: users.name,
  statusChangedAt: orders.statusChangedAt,
  cancellationReason: orders.cancellationReason,
  createdAt: orders.createdAt,
};

type OrderSummaryRow = Omit<
  OrderSummary,
  'driver' | 'statusChangedAt' | 'createdAt'
> & {
  driverId: number | null;
  driverName: string | null;
  statusChangedAt: Date;
  createdAt: Date;
};

function toOrderSummary(row: OrderSummaryRow): OrderSummary {
  const { driverId, driverName, statusChangedAt, createdAt, ...order } = row;
  const driver =
    driverId !== null && driverName !== null
      ? { id: driverId, name: driverName }
      : null;
  return {
    ...order,
    driver,
    statusChangedAt: statusChangedAt.toISOString(),
    createdAt: createdAt.toISOString(),
  };
}

interface NewOrder {
  organizationId: number;
  createdByUserId: number;
  form: OrderForm;
  volaDeliveryFee: VolaDeliveryFee;
}

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly volaDeliveryFeeService: VolaDeliveryFeeService,
  ) {}

  async findPage(
    user: AuthUser,
    page: number,
  ): Promise<Paginated<OrderSummary>> {
    if (!canViewOrders(user)) {
      throw new ForbiddenException('You cannot see orders');
    }
    // Volá! ve las órdenes de todos los clientes; un cliente solo ve las suyas.
    const visibleOrders = canViewAllOrders(user)
      ? undefined
      : eq(orders.organizationId, user.organizationId);
    const rows = await this.selectOrderSummaries()
      .where(visibleOrders)
      .orderBy(desc(orders.createdAt), desc(orders.id))
      .limit(PAGE_SIZE)
      .offset(getPageOffset(page));
    const totalItems = await this.database.$count(orders, visibleOrders);
    return toPaginated(rows.map(toOrderSummary), page, totalItems);
  }

  async findBranchOptions(user: AuthUser): Promise<OrderBranchOption[]> {
    const creatableBranches = this.findCreatableBranchesCondition(user);
    if (creatableBranches === null) return [];
    return this.database
      .select({
        branchId: branches.id,
        branchName: branches.name,
        merchantName: merchants.name,
        organizationName: organizations.name,
        currency: countries.currency,
        countryCode: countries.code,
      })
      .from(branches)
      .innerJoin(merchants, eq(branches.merchantId, merchants.id))
      .innerJoin(organizations, eq(merchants.organizationId, organizations.id))
      .leftJoin(countries, eq(organizations.countryId, countries.id))
      .where(creatableBranches)
      .orderBy(
        asc(organizations.name),
        asc(merchants.name),
        asc(branches.name),
      );
  }

  async create(user: AuthUser, form: OrderForm): Promise<OrderSummary> {
    const origin = await this.findBranchOrigin(form.branchId);
    if (!canCreateOrders(user, origin.organizationId)) {
      throw new ForbiddenException(
        `You cannot create orders for organization ${origin.organizationId}`,
      );
    }
    const volaDeliveryFee = await this.volaDeliveryFeeService.calculate(
      origin,
      { latitude: form.deliveryLatitude, longitude: form.deliveryLongitude },
    );
    const orderId = await this.insertOrder({
      organizationId: origin.organizationId,
      createdByUserId: user.id,
      form,
      volaDeliveryFee,
    });

    return this.findSummaryById(orderId);
  }

  async findSummaryById(orderId: number): Promise<OrderSummary> {
    const [row] = await this.selectOrderSummaries().where(
      eq(orders.id, orderId),
    );
    if (!row) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return toOrderSummary(row);
  }

  private async insertOrder(newOrder: NewOrder): Promise<number> {
    const { organizationId, createdByUserId, form, volaDeliveryFee } = newOrder;
    const subtotal = calculateOrderSubtotal(form.items);

    return this.database.transaction(async (transaction) => {
      const [customer] = await transaction
        .insert(customers)
        .values({
          organizationId,
          name: form.customerName,
          phoneNumber: form.customerPhone,
        })
        .onConflictDoUpdate({
          target: [customers.organizationId, customers.phoneNumber],
          set: { name: form.customerName },
        })
        .returning({ id: customers.id });
      const [order] = await transaction
        .insert(orders)
        .values({
          organizationId,
          branchId: form.branchId,
          customerId: customer.id,
          createdByUserId,
          deliveryAddress: form.deliveryAddress,
          deliveryLatitude: form.deliveryLatitude,
          deliveryLongitude: form.deliveryLongitude,
          subtotal,
          customerDeliveryFee: form.customerDeliveryFee,
          total: calculateOrderTotal(subtotal, form.customerDeliveryFee),
          volaDeliveryFee: volaDeliveryFee.fee,
          deliveryFeeBasis: volaDeliveryFee.basis,
          distanceKm: volaDeliveryFee.distanceKm,
        })
        .returning({ id: orders.id });
      await transaction
        .insert(orderItems)
        .values(form.items.map((item) => ({ ...item, orderId: order.id })));
      return order.id;
    });
  }

  // undefined: todas las sucursales; null: ninguna.
  private findCreatableBranchesCondition(
    user: AuthUser,
  ): SQL | undefined | null {
    if (canCreateOrdersForAnyOrganization(user)) return undefined;
    if (!canCreateOrders(user, user.organizationId)) return null;
    return eq(merchants.organizationId, user.organizationId);
  }

  private async findBranchOrigin(branchId: number) {
    const [branch] = await this.database
      .select({
        latitude: branches.latitude,
        longitude: branches.longitude,
        merchantId: merchants.id,
        deliveryFeeBasis: merchants.deliveryFeeBasis,
        organizationId: merchants.organizationId,
      })
      .from(branches)
      .innerJoin(merchants, eq(branches.merchantId, merchants.id))
      .where(eq(branches.id, branchId));
    if (!branch) {
      throw createFieldValidationException(
        'branchId',
        'Elegí una sucursal de la lista.',
      );
    }
    return branch;
  }

  private selectOrderSummaries() {
    return this.database
      .select(orderSummaryColumns)
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .innerJoin(branches, eq(orders.branchId, branches.id))
      .innerJoin(merchants, eq(branches.merchantId, merchants.id))
      .innerJoin(organizations, eq(orders.organizationId, organizations.id))
      .leftJoin(countries, eq(organizations.countryId, countries.id))
      .leftJoin(drivers, eq(orders.driverId, drivers.id))
      .leftJoin(users, eq(drivers.userId, users.id))
      .$dynamic();
  }
}
