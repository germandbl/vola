import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  orderFormSchema,
  paginationQuerySchema,
  type AuthUser,
  type OrderBranchOption,
  type OrderForm,
  type OrderSummary,
  type Paginated,
  type PaginationQuery,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findPage(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ): Promise<Paginated<OrderSummary>> {
    return this.ordersService.findPage(user, query.page);
  }

  @Get('branch-options')
  findBranchOptions(
    @CurrentUser() user: AuthUser,
  ): Promise<OrderBranchOption[]> {
    return this.ordersService.findBranchOptions(user);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(orderFormSchema)) form: OrderForm,
  ): Promise<OrderSummary> {
    return this.ordersService.create(user, form);
  }
}
