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
    merchantId: number,
  ): Promise<OrderCountFeeRate> {
    await this.deliveryFeeAccessService.assertCanManageMerchantFees(
      user,
      merchantId,
    );
    return this.findRateByMerchantId(merchantId);
  }

  async saveRate(
    user: AuthUser,
    merchantId: number,
    form: OrderCountFeeRateForm,
  ): Promise<OrderCountFeeRate> {
    await this.deliveryFeeAccessService.assertCanManageMerchantFees(
      user,
      merchantId,
    );

    await this.database.transaction(async (transaction) => {
      await transaction
        .delete(orderCountFeeRanges)
        .where(eq(orderCountFeeRanges.merchantId, merchantId));
      await transaction
        .insert(orderCountFeeRanges)
        .values(form.ranges.map((range) => ({ merchantId, ...range })));
    });
    return this.findRateByMerchantId(merchantId);
  }

  async hasRate(merchantId: number): Promise<boolean> {
    const rangeCount = await this.database.$count(
      orderCountFeeRanges,
      eq(orderCountFeeRanges.merchantId, merchantId),
    );
    return rangeCount > 0;
  }

  async findRateByMerchantId(merchantId: number): Promise<OrderCountFeeRate> {
    // En Postgres, ASC deja los NULL al final: el rango sin límite queda último.
    const ranges = await this.database
      .select({
        upToOrderCount: orderCountFeeRanges.upToOrderCount,
        fee: orderCountFeeRanges.fee,
      })
      .from(orderCountFeeRanges)
      .where(eq(orderCountFeeRanges.merchantId, merchantId))
      .orderBy(asc(orderCountFeeRanges.upToOrderCount));
    return { ranges };
  }
}
