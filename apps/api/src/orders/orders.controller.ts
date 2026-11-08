import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  orderAssignmentFormSchema,
  orderFormSchema,
  paginationQuerySchema,
  type AuthUser,
  type OrderAssignmentForm,
  type OrderBranchOption,
  type OrderDriver,
  type OrderForm,
  type OrderSummary,
  type Paginated,
  type PaginationQuery,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { OrderAssignmentsService } from './order-assignments.service.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderAssignmentsService: OrderAssignmentsService,
  ) {}

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

  @Get(':orderId/driver-options')
  findDriverOptions(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderDriver[]> {
    return this.orderAssignmentsService.findDriverOptions(user, orderId);
  }

  @Put(':orderId/driver')
  assignDriver(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body(new ZodValidationPipe(orderAssignmentFormSchema))
    form: OrderAssignmentForm,
  ): Promise<OrderSummary> {
    return this.orderAssignmentsService.assignDriver(user, orderId, form);
  }
}
