import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  orderAssignmentFormSchema,
  orderCancellationFormSchema,
  orderFormSchema,
  orderPreparationFormSchema,
  orderStatusChangeFormSchema,
  paginationQuerySchema,
  type AuthUser,
  type OrderAssignmentForm,
  type OrderCancellationForm,
  type DriverOrder,
  type DriverOrderDetail,
  type OrderBranchOption,
  type OrderDetail,
  type OrderPreparationForm,
  type OrderDriver,
  type OrderForm,
  type OrderStatusChangeForm,
  type OrderSummary,
  type Paginated,
  type PaginationQuery,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { DriverOrdersService } from './driver-orders.service.js';
import { OrderAssignmentsService } from './order-assignments.service.js';
import { OrderManagementService } from './order-management.service.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderAssignmentsService: OrderAssignmentsService,
    private readonly driverOrdersService: DriverOrdersService,
    private readonly orderManagementService: OrderManagementService,
  ) {}

  @Get()
  findPage(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ): Promise<Paginated<OrderSummary>> {
    return this.ordersService.findPage(user, query.page);
  }

  @Get('assigned-to-me')
  findAssignedToMe(@CurrentUser() user: AuthUser): Promise<DriverOrder[]> {
    return this.driverOrdersService.findAssigned(user);
  }

  @Get('assigned-to-me/:orderId')
  findAssignedToMeDetail(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<DriverOrderDetail> {
    return this.driverOrdersService.findDetail(user, orderId);
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

  @Put(':orderId/reassign')
  reassignDriver(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body(new ZodValidationPipe(orderAssignmentFormSchema))
    form: OrderAssignmentForm,
  ): Promise<OrderDetail> {
    return this.orderAssignmentsService.reassignDriver(user, orderId, form);
  }

  @Delete(':orderId/driver')
  releaseDriver(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderDetail> {
    return this.orderAssignmentsService.releaseDriver(user, orderId);
  }

  @Put(':orderId/status')
  changeStatus(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body(new ZodValidationPipe(orderStatusChangeFormSchema))
    form: OrderStatusChangeForm,
  ): Promise<DriverOrderDetail> {
    return this.driverOrdersService.changeStatus(user, orderId, form);
  }

  @Put(':orderId/preparation')
  changePreparation(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body(new ZodValidationPipe(orderPreparationFormSchema))
    form: OrderPreparationForm,
  ): Promise<OrderDetail> {
    return this.orderManagementService.changePreparation(user, orderId, form);
  }

  @Put(':orderId/complete')
  completeOrder(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderDetail> {
    return this.orderManagementService.completeOrder(user, orderId);
  }

  @Put(':orderId/cancel')
  cancelOrder(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body(new ZodValidationPipe(orderCancellationFormSchema))
    form: OrderCancellationForm,
  ): Promise<OrderDetail> {
    return this.orderManagementService.cancelOrder(user, orderId, form);
  }

  // Al final: ':orderId' no debe tapar rutas fijas como 'assigned-to-me' o 'branch-options'.
  @Get(':orderId')
  findDetail(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderDetail> {
    return this.ordersService.findDetail(user, orderId);
  }
}
