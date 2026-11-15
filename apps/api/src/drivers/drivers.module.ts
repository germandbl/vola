import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { DriverLocationsService } from './driver-locations.service.js';
import { DriversController } from './drivers.controller.js';
import { DriversService } from './drivers.service.js';

@Module({
  imports: [UsersModule],
  controllers: [DriversController],
  providers: [DriversService, DriverLocationsService],
  exports: [DriverLocationsService],
})
export class DriversModule {}
