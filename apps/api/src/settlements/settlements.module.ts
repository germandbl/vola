import { Module } from '@nestjs/common';
import { DriverSettlementsService } from './driver-settlements.service.js';
import { MerchantSettlementsService } from './merchant-settlements.service.js';
import { SettlementHistoryService } from './settlement-history.service.js';
import { SettlementsController } from './settlements.controller.js';

@Module({
  controllers: [SettlementsController],
  providers: [
    DriverSettlementsService,
    MerchantSettlementsService,
    SettlementHistoryService,
  ],
})
export class SettlementsModule {}
