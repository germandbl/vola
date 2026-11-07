import { Module } from '@nestjs/common';
import { MerchantsModule } from '../merchants/merchants.module.js';
import { BranchesController } from './branches.controller.js';
import { BranchesService } from './branches.service.js';

@Module({
  imports: [MerchantsModule],
  controllers: [BranchesController],
  providers: [BranchesService],
})
export class BranchesModule {}
