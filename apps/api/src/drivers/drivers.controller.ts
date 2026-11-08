import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  driverFormSchema,
  driverMerchantsFormSchema,
  type AuthUser,
  type DriverForm,
  type DriverMerchant,
  type DriverMerchantsForm,
  type DriverOwner,
  type DriverSummary,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { DriversService } from './drivers.service.js';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  findVisible(@CurrentUser() user: AuthUser): Promise<DriverSummary[]> {
    return this.driversService.findVisible(user);
  }

  @Get('owner-options')
  findOwnerOptions(@CurrentUser() user: AuthUser): Promise<DriverOwner[]> {
    return this.driversService.findOwnerOptions(user);
  }

  @Get('merchant-options')
  findMerchantOptions(
    @CurrentUser() user: AuthUser,
  ): Promise<DriverMerchant[]> {
    return this.driversService.findMerchantOptions(user);
  }

  @Get(':driverId')
  findById(
    @CurrentUser() user: AuthUser,
    @Param('driverId', ParseIntPipe) driverId: number,
  ): Promise<DriverSummary> {
    return this.driversService.findById(user, driverId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(driverFormSchema)) form: DriverForm,
  ): Promise<DriverSummary> {
    return this.driversService.create(user, form);
  }

  @Put(':driverId/merchants')
  updateMerchants(
    @CurrentUser() user: AuthUser,
    @Param('driverId', ParseIntPipe) driverId: number,
    @Body(new ZodValidationPipe(driverMerchantsFormSchema))
    form: DriverMerchantsForm,
  ): Promise<DriverSummary> {
    return this.driversService.updateMerchants(user, driverId, form);
  }
}
