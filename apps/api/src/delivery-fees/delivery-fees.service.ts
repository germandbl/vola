import { Inject, Injectable } from '@nestjs/common';
import {
  type AuthUser,
  type DeliveryFeeRate,
  type DeliveryFeeRateForm,
} from '@vola/shared';
import { asc, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { DeliveryFeeAccessService } from './delivery-fee-access.service.js';
import {
  deliveryFeeRateRanges,
  deliveryFeeRates,
} from './delivery-fees.schema.js';

const UNCONFIGURED_RATE: DeliveryFeeRate = { ranges: [], extraFeePerKm: null };

@Injectable()
export class DeliveryFeesService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly deliveryFeeAccessService: DeliveryFeeAccessService,
  ) {}

  async findRate(user: AuthUser, merchantId: number): Promise<DeliveryFeeRate> {
    await this.deliveryFeeAccessService.assertCanManageMerchantFees(
      user,
      merchantId,
    );
    return this.findRateByMerchantId(merchantId);
  }

  async saveRate(
    user: AuthUser,
    merchantId: number,
    form: DeliveryFeeRateForm,
  ): Promise<DeliveryFeeRate> {
    await this.deliveryFeeAccessService.assertCanManageMerchantFees(
      user,
      merchantId,
    );

    await this.database.transaction(async (transaction) => {
      const [rate] = await transaction
        .insert(deliveryFeeRates)
        .values({ merchantId, extraFeePerKm: form.extraFeePerKm })
        .onConflictDoUpdate({
          target: deliveryFeeRates.merchantId,
          set: { extraFeePerKm: form.extraFeePerKm },
        })
        .returning({ id: deliveryFeeRates.id });
      await transaction
        .delete(deliveryFeeRateRanges)
        .where(eq(deliveryFeeRateRanges.rateId, rate.id));
      await transaction
        .insert(deliveryFeeRateRanges)
        .values(form.ranges.map((range) => ({ rateId: rate.id, ...range })));
    });
    return this.findRateByMerchantId(merchantId);
  }

  async hasRate(merchantId: number): Promise<boolean> {
    const rateCount = await this.database.$count(
      deliveryFeeRates,
      eq(deliveryFeeRates.merchantId, merchantId),
    );
    return rateCount > 0;
  }

  async findRateByMerchantId(merchantId: number): Promise<DeliveryFeeRate> {
    const [rate] = await this.database
      .select({
        id: deliveryFeeRates.id,
        extraFeePerKm: deliveryFeeRates.extraFeePerKm,
      })
      .from(deliveryFeeRates)
      .where(eq(deliveryFeeRates.merchantId, merchantId));
    if (!rate) return UNCONFIGURED_RATE;

    // En Postgres, ASC deja los NULL al final: el rango sin límite queda último.
    const ranges = await this.database
      .select({
        upToKm: deliveryFeeRateRanges.upToKm,
        fee: deliveryFeeRateRanges.fee,
      })
      .from(deliveryFeeRateRanges)
      .where(eq(deliveryFeeRateRanges.rateId, rate.id))
      .orderBy(asc(deliveryFeeRateRanges.upToKm));
    return { ranges, extraFeePerKm: rate.extraFeePerKm };
  }
}
