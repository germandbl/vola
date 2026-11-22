import {
  Body,
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
  softwareInvoiceFormSchema,
  type AuthUser,
  type InvoiceDetail,
  type InvoiceOrder,
  type InvoiceSummary,
  type Paginated,
  type PaginationQuery,
  type PendingInvoice,
  type PendingSoftwareInvoice,
  type SoftwareInvoiceForm,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { InvoicesService } from './invoices.service.js';
import { PendingInvoicesService } from './pending-invoices.service.js';
import { SoftwareInvoicesService } from './software-invoices.service.js';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pendingInvoicesService: PendingInvoicesService,
    private readonly softwareInvoicesService: SoftwareInvoicesService,
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

  @Get('software/pending')
  findPendingSoftware(
    @CurrentUser() user: AuthUser,
  ): Promise<PendingSoftwareInvoice[]> {
    return this.softwareInvoicesService.findPending(user);
  }

  @Post('software/pending/:organizationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  createSoftware(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body(new ZodValidationPipe(softwareInvoiceFormSchema))
    form: SoftwareInvoiceForm,
  ): Promise<void> {
    return this.softwareInvoicesService.create(user, organizationId, form);
  }

  @Get(':invoiceId')
  findById(
    @CurrentUser() user: AuthUser,
    @Param('invoiceId', ParseIntPipe) invoiceId: number,
  ): Promise<InvoiceDetail> {
    return this.invoicesService.findById(user, invoiceId);
  }

  @Post(':invoiceId/payment')
  @HttpCode(HttpStatus.NO_CONTENT)
  markPaid(
    @CurrentUser() user: AuthUser,
    @Param('invoiceId', ParseIntPipe) invoiceId: number,
  ): Promise<void> {
    return this.invoicesService.markPaid(user, invoiceId);
  }
}
