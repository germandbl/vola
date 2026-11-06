import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import {
  deliveryFeeRateFormSchema,
  type AuthUser,
  type DeliveryFeeRate,
  type DeliveryFeeRateForm,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { DeliveryFeesService } from './delivery-fees.service.js';

@Controller('organizations/:organizationId/delivery-fee-rate')
export class DeliveryFeesController {
  constructor(private readonly deliveryFeesService: DeliveryFeesService) {}

  @Get()
  findRate(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ): Promise<DeliveryFeeRate> {
    return this.deliveryFeesService.findRate(user, organizationId);
  }

  @Put()
  saveRate(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body(new ZodValidationPipe(deliveryFeeRateFormSchema))
    form: DeliveryFeeRateForm,
  ): Promise<DeliveryFeeRate> {
    return this.deliveryFeesService.saveRate(user, organizationId, form);
  }
}
