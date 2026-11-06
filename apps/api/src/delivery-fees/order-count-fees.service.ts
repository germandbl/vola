import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthUser,
  OrderCountFeeRate,
  OrderCountFeeRateForm,
} from '@vola/shared';
import { asc, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { DeliveryFeeAccessService } from './delivery-fee-access.service.js';
import { orderCountFeeRanges } from './delivery-fees.schema.js';

@Injectable()
export class OrderCountFeesService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly deliveryFeeAccessService: DeliveryFeeAccessService,
  ) {}

  async findRate(
    user: AuthUser,
    organizationId: number,
  ): Promise<OrderCountFeeRate> {
    await this.deliveryFeeAccessService.assertCanManageMerchantFees(
      user,
      organizationId,
    );
    return this.findRateByOrganizationId(organizationId);
  }

  async saveRate(
    user: AuthUser,
    organizationId: number,
    form: OrderCountFeeRateForm,
  ): Promise<OrderCountFeeRate> {
    await this.deliveryFeeAccessService.assertCanManageMerchantFees(
      user,
      organizationId,
    );

    await this.database.transaction(async (transaction) => {
      await transaction
        .delete(orderCountFeeRanges)
        .where(eq(orderCountFeeRanges.organizationId, organizationId));
      await transaction
        .insert(orderCountFeeRanges)
        .values(form.ranges.map((range) => ({ organizationId, ...range })));
    });
    return this.findRateByOrganizationId(organizationId);
  }

  async hasRate(organizationId: number): Promise<boolean> {
    const rangeCount = await this.database.$count(
      orderCountFeeRanges,
      eq(orderCountFeeRanges.organizationId, organizationId),
    );
    return rangeCount > 0;
  }

  private async findRateByOrganizationId(
    organizationId: number,
  ): Promise<OrderCountFeeRate> {
    // En Postgres, ASC deja los NULL al final: el rango sin límite queda último.
    const ranges = await this.database
      .select({
        upToOrderCount: orderCountFeeRanges.upToOrderCount,
        fee: orderCountFeeRanges.fee,
      })
      .from(orderCountFeeRanges)
      .where(eq(orderCountFeeRanges.organizationId, organizationId))
      .orderBy(asc(orderCountFeeRanges.upToOrderCount));
    return { ranges };
  }
}
