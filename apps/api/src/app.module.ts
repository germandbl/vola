import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { BranchesModule } from './branches/branches.module.js';
import { CountriesModule } from './countries/countries.module.js';
import { DeliveryFeesModule } from './delivery-fees/delivery-fees.module.js';
import { DatabaseModule } from './database/database.module.js';
import { DriversModule } from './drivers/drivers.module.js';
import { InvoicesModule } from './invoices/invoices.module.js';
import { MerchantsModule } from './merchants/merchants.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { OperationMapModule } from './operation-map/operation-map.module.js';
import { OrganizationsModule } from './organizations/organizations.module.js';
import { SettlementsModule } from './settlements/settlements.module.js';
import { TrackingModule } from './tracking/tracking.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    BranchesModule,
    CountriesModule,
    DeliveryFeesModule,
    DriversModule,
    InvoicesModule,
    MerchantsModule,
    OrdersModule,
    OperationMapModule,
    OrganizationsModule,
    SettlementsModule,
    TrackingModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
