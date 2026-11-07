import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  merchantFormSchema,
  type AuthUser,
  type Merchant,
  type MerchantForm,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { MerchantsService } from './merchants.service.js';

@Controller()
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get('organizations/:organizationId/merchants')
  findByOrganization(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ): Promise<Merchant[]> {
    return this.merchantsService.findByOrganization(user, organizationId);
  }

  @Post('organizations/:organizationId/merchants')
  create(
    @CurrentUser() user: AuthUser,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body(new ZodValidationPipe(merchantFormSchema)) form: MerchantForm,
  ): Promise<Merchant> {
    return this.merchantsService.create(user, organizationId, form);
  }

  @Get('merchants/:merchantId')
  findById(
    @CurrentUser() user: AuthUser,
    @Param('merchantId', ParseIntPipe) merchantId: number,
  ): Promise<Merchant> {
    return this.merchantsService.findById(user, merchantId);
  }

  @Patch('merchants/:merchantId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('merchantId', ParseIntPipe) merchantId: number,
    @Body(new ZodValidationPipe(merchantFormSchema)) form: MerchantForm,
  ): Promise<Merchant> {
    return this.merchantsService.update(user, merchantId, form);
  }
}
