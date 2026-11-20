import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller.js';
import { InvoicesService } from './invoices.service.js';
import { PendingInvoicesService } from './pending-invoices.service.js';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, PendingInvoicesService],
})
export class InvoicesModule {}
