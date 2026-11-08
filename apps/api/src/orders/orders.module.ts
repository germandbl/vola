import { Module } from '@nestjs/common';
import { DeliveryFeesModule } from '../delivery-fees/delivery-fees.module.js';
import { RouteDistanceService } from '../google-maps/route-distance.service.js';
import { DriverOrdersService } from './driver-orders.service.js';
import { OrderAssignmentsService } from './order-assignments.service.js';
import { OrderManagementService } from './order-management.service.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { VolaDeliveryFeeService } from './vola-delivery-fee.service.js';

@Module({
  imports: [DeliveryFeesModule],
  controllers: [OrdersController],
  providers: [
    DriverOrdersService,
    OrderAssignmentsService,
    OrderManagementService,
    OrdersService,
    RouteDistanceService,
    VolaDeliveryFeeService,
  ],
})
export class OrdersModule {}
