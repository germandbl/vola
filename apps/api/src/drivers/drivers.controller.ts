import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  driverFormSchema,
  type AuthUser,
  type DriverForm,
  type DriverSummary,
} from '@vola/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { DriversService } from './drivers.service.js';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  findOwn(@CurrentUser() user: AuthUser): Promise<DriverSummary[]> {
    return this.driversService.findOwn(user);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(driverFormSchema)) form: DriverForm,
  ): Promise<DriverSummary> {
    return this.driversService.create(user, form);
  }
}
