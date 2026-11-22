import { Inject, Injectable } from '@nestjs/common';
import {
  DeliveryFeeBasis,
  OrderStatus,
  calculateDeliveryFee,
  calculateOrderCountFee,
} from '@vola/shared';
import { and, count, eq, gte } from 'drizzle-orm';
import { branches } from '../branches/branches.schema.js';
import { createFieldValidationException } from '../common/field-validation.js';
import { findStartOfRegionMonth } from '../common/region-month.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { DeliveryFeesService } from '../delivery-fees/delivery-fees.service.js';
import { OrderCountFeesService } from '../delivery-fees/order-count-fees.service.js';
import {
  RouteDistanceService,
  type Coordinates,
} from '../google-maps/route-distance.service.js';
import { orders } from './orders.schema.js';

export interface OrderOrigin extends Coordinates {
  merchantId: number;
  deliveryFeeBasis: DeliveryFeeBasis | null;
}

export interface VolaDeliveryFee {
  fee: number;
  basis: DeliveryFeeBasis;
  distanceKm: number | null;
}

@Injectable()
export class VolaDeliveryFeeService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly deliveryFeesService: DeliveryFeesService,
    private readonly orderCountFeesService: OrderCountFeesService,
    private readonly routeDistanceService: RouteDistanceService,
  ) {}

  async calculate(
    origin: OrderOrigin,
    destination: Coordinates,
  ): Promise<VolaDeliveryFee> {
    if (origin.deliveryFeeBasis === DeliveryFeeBasis.Distance) {
      return this.calculateByDistance(origin, destination);
    }
    if (origin.deliveryFeeBasis === DeliveryFeeBasis.CompletedOrders) {
      return this.calculateByOrderCount(origin.merchantId);
    }
    throw createFieldValidationException(
      'branchId',
      'El comercio de esta sucursal todavía no tiene tarifa de envío activa. Pedile a Volá! que la configure.',
    );
  }

  private async calculateByDistance(
    origin: OrderOrigin,
    destination: Coordinates,
  ): Promise<VolaDeliveryFee> {
    const distanceKm = await this.routeDistanceService.findDrivingDistanceKm(
      origin,
      destination,
    );
    if (distanceKm === null) {
      throw createFieldValidationException(
        'deliveryAddress',
        'No encontramos una ruta por calle desde la sucursal hasta esa dirección. Elegí otra.',
      );
    }
    const rate = await this.deliveryFeesService.findRateByMerchantId(
      origin.merchantId,
    );
    return {
      fee: calculateDeliveryFee(rate, distanceKm),
      basis: DeliveryFeeBasis.Distance,
      distanceKm,
    };
  }

  private async calculateByOrderCount(
    merchantId: number,
  ): Promise<VolaDeliveryFee> {
    const completedOrders =
      await this.countCompletedOrdersThisMonth(merchantId);
    const rate =
      await this.orderCountFeesService.findRateByMerchantId(merchantId);
    // El pedido recién creado todavía no está completado: estimamos su número como los completados del mes + 1.
    return {
      fee: calculateOrderCountFee(rate, completedOrders + 1),
      basis: DeliveryFeeBasis.CompletedOrders,
      distanceKm: null,
    };
  }

  private async countCompletedOrdersThisMonth(
    merchantId: number,
  ): Promise<number> {
    const [{ completedOrders }] = await this.database
      .select({ completedOrders: count() })
      .from(orders)
      .innerJoin(branches, eq(orders.branchId, branches.id))
      .where(
        and(
          eq(branches.merchantId, merchantId),
          eq(orders.status, OrderStatus.Delivered),
          gte(orders.createdAt, findStartOfRegionMonth(new Date())),
        ),
      );
    return completedOrders;
  }
}
