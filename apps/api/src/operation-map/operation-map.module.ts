import { Module } from '@nestjs/common';
import { DriversModule } from '../drivers/drivers.module.js';
import { OperationMapController } from './operation-map.controller.js';
import { OperationMapService } from './operation-map.service.js';

@Module({
  imports: [DriversModule],
  controllers: [OperationMapController],
  providers: [OperationMapService],
})
export class OperationMapModule {}
