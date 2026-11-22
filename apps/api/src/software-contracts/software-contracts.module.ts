import { Module } from '@nestjs/common';
import { SoftwareContractsController } from './software-contracts.controller.js';
import { SoftwareContractsService } from './software-contracts.service.js';

@Module({
  controllers: [SoftwareContractsController],
  providers: [SoftwareContractsService],
})
export class SoftwareContractsModule {}
