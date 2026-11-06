import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import {
  deliveryFeeBasisFormSchema,
  deliveryFeeRateFormSchema,
  orderCountFeeRateFormSchema,
  type AuthUser,
  type DeliveryFeeBasisForm,
  type DeliveryFeeBasisSetting,
  type DeliveryFeeRate,
  type DeliveryFeeRateForm,
  type OrderCountFeeRate,
  type OrderCountFeeRateForm,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { DeliveryFeeBasisService } from './delivery-fee-basis.service.js';
import { DeliveryFeesService } from './delivery-fees.service.js';
import { OrderCountFeesService } from './order-count-fees.service.js';

@Controller('organizations/:organizationId')
export class DeliveryFeesController {
  constructor(
    private readonly deliveryFeesService: DeliveryFeesService,
    private readonly orderCountFeesService: OrderCountFeesService,
    private readonly deliveryFeeBasisService: DeliveryFeeBasisService,
  ) {}

  @Get('delivery-fee-rate')
  findRate(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ): Promise<DeliveryFeeRate> {
    return this.deliveryFeesService.findRate(user, organizationId);
  }

  @Put('delivery-fee-rate')
  saveRate(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body(new ZodValidationPipe(deliveryFeeRateFormSchema))
    form: DeliveryFeeRateForm,
  ): Promise<DeliveryFeeRate> {
    return this.deliveryFeesService.saveRate(user, organizationId, form);
  }

  @Get('order-count-fee-rate')
  findOrderCountRate(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ): Promise<OrderCountFeeRate> {
    return this.orderCountFeesService.findRate(user, organizationId);
  }

  @Put('order-count-fee-rate')
  saveOrderCountRate(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body(new ZodValidationPipe(orderCountFeeRateFormSchema))
    form: OrderCountFeeRateForm,
  ): Promise<OrderCountFeeRate> {
    return this.orderCountFeesService.saveRate(user, organizationId, form);
  }

  @Get('delivery-fee-basis')
  findBasis(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ): Promise<DeliveryFeeBasisSetting> {
    return this.deliveryFeeBasisService.findBasis(user, organizationId);
  }

  @Put('delivery-fee-basis')
  saveBasis(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body(new ZodValidationPipe(deliveryFeeBasisFormSchema))
    form: DeliveryFeeBasisForm,
  ): Promise<DeliveryFeeBasisSetting> {
    return this.deliveryFeeBasisService.saveBasis(user, organizationId, form);
  }
}
