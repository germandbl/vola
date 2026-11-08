import { Module } from '@nestjs/common';
import { DeliveryFeesModule } from '../delivery-fees/delivery-fees.module.js';
import { RouteDistanceService } from '../google-maps/route-distance.service.js';
import { OrderAssignmentsService } from './order-assignments.service.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { VolaDeliveryFeeService } from './vola-delivery-fee.service.js';

@Module({
  imports: [DeliveryFeesModule],
  controllers: [OrdersController],
  providers: [
    OrderAssignmentsService,
    OrdersService,
    RouteDistanceService,
    VolaDeliveryFeeService,
  ],
})
export class OrdersModule {}
