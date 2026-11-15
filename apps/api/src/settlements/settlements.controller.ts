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
  type CashSettlement,
  type CashWithPlatform,
  type DriverPendingCash,
  type Paginated,
  type PaginationQuery,
  type PendingDriverCash,
  type PendingMerchantCash,
  type SettlementOrder,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { DriverSettlementsService } from './driver-settlements.service.js';
import { MerchantSettlementsService } from './merchant-settlements.service.js';
import { SettlementHistoryService } from './settlement-history.service.js';

@Controller('settlements')
export class SettlementsController {
  constructor(
    private readonly driverSettlementsService: DriverSettlementsService,
    private readonly merchantSettlementsService: MerchantSettlementsService,
    private readonly settlementHistoryService: SettlementHistoryService,
  ) {}

  @Get('drivers')
  findPendingDrivers(
    @CurrentUser() user: AuthUser,
  ): Promise<PendingDriverCash[]> {
    return this.driverSettlementsService.findPending(user);
  }

  @Get('drivers/:driverId/orders')
  findDriverPendingOrders(
    @CurrentUser() user: AuthUser,
    @Param('driverId', ParseIntPipe) driverId: number,
  ): Promise<SettlementOrder[]> {
    return this.driverSettlementsService.findPendingOrders(user, driverId);
  }

  @Post('drivers/:driverId')
  @HttpCode(HttpStatus.NO_CONTENT)
  settleDriver(
    @CurrentUser() user: AuthUser,
    @Param('driverId', ParseIntPipe) driverId: number,
  ): Promise<void> {
    return this.driverSettlementsService.settle(user, driverId);
  }

  @Get('merchants')
  findPendingMerchants(
    @CurrentUser() user: AuthUser,
  ): Promise<PendingMerchantCash[]> {
    return this.merchantSettlementsService.findPending(user);
  }

  @Get('merchants/:organizationId/orders')
  findMerchantPendingOrders(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ): Promise<SettlementOrder[]> {
    return this.merchantSettlementsService.findPendingOrders(
      user,
      organizationId,
    );
  }

  @Post('merchants/:organizationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  settleMerchant(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ): Promise<void> {
    return this.merchantSettlementsService.settle(user, organizationId);
  }

  @Get('cash-with-platform')
  findCashWithPlatform(
    @CurrentUser() user: AuthUser,
  ): Promise<CashWithPlatform> {
    return this.merchantSettlementsService.findCashWithPlatform(user);
  }

  @Get('history')
  findHistory(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ): Promise<Paginated<CashSettlement>> {
    return this.settlementHistoryService.findPage(user, query.page);
  }

  @Get('me')
  findOwnPending(@CurrentUser() user: AuthUser): Promise<DriverPendingCash> {
    return this.driverSettlementsService.findOwnPending(user);
  }
}
