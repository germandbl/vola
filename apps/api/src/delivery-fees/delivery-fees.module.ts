import { Module } from '@nestjs/common';
import { DeliveryFeesController } from './delivery-fees.controller.js';
import { DeliveryFeesService } from './delivery-fees.service.js';

@Module({
  controllers: [DeliveryFeesController],
  providers: [DeliveryFeesService],
})
export class DeliveryFeesModule {}
