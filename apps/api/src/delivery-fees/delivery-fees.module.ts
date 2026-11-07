import { Module } from '@nestjs/common';
import { DeliveryFeeAccessService } from './delivery-fee-access.service.js';
import { DeliveryFeeBasisService } from './delivery-fee-basis.service.js';
import { DeliveryFeesController } from './delivery-fees.controller.js';
import { DeliveryFeesService } from './delivery-fees.service.js';
import { OrderCountFeesService } from './order-count-fees.service.js';

@Module({
  controllers: [DeliveryFeesController],
  providers: [
    DeliveryFeeAccessService,
    DeliveryFeeBasisService,
    DeliveryFeesService,
    OrderCountFeesService,
  ],
  exports: [DeliveryFeesService, OrderCountFeesService],
})
export class DeliveryFeesModule {}
