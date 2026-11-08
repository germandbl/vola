import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { DriversController } from './drivers.controller.js';
import { DriversService } from './drivers.service.js';

@Module({
  imports: [UsersModule],
  controllers: [DriversController],
  providers: [DriversService],
})
export class DriversModule {}
