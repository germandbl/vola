import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  paginationQuerySchema,
  type AuthUser,
  type InvoiceOrder,
  type InvoiceSummary,
  type Paginated,
  type PaginationQuery,
  type PendingInvoice,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { InvoicesService } from './invoices.service.js';
import { PendingInvoicesService } from './pending-invoices.service.js';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pendingInvoicesService: PendingInvoicesService,
  ) {}

  @Get()
  findPage(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ): Promise<Paginated<InvoiceSummary>> {
    return this.invoicesService.findPage(user, query.page);
  }

  @Get('pending')
  findPending(@CurrentUser() user: AuthUser): Promise<PendingInvoice[]> {
    return this.pendingInvoicesService.findPending(user);
  }

  @Get('pending/:organizationId/orders')
  findPendingOrders(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ): Promise<InvoiceOrder[]> {
    return this.pendingInvoicesService.findPendingOrders(user, organizationId);
  }

  @Post('pending/:organizationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  create(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ): Promise<void> {
    return this.pendingInvoicesService.create(user, organizationId);
  }
}
