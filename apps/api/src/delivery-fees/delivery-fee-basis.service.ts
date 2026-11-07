import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  DeliveryFeeBasis,
  type AuthUser,
  type DeliveryFeeBasisForm,
  type DeliveryFeeBasisSetting,
} from '@vola/shared';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { merchants } from '../merchants/merchants.schema.js';
import { DeliveryFeeAccessService } from './delivery-fee-access.service.js';
import { DeliveryFeesService } from './delivery-fees.service.js';
import { OrderCountFeesService } from './order-count-fees.service.js';

@Injectable()
export class DeliveryFeeBasisService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly deliveryFeeAccessService: DeliveryFeeAccessService,
    private readonly deliveryFeesService: DeliveryFeesService,
    private readonly orderCountFeesService: OrderCountFeesService,
  ) {}

  async findBasis(
    user: AuthUser,
    merchantId: number,
  ): Promise<DeliveryFeeBasisSetting> {
    await this.deliveryFeeAccessService.assertCanManageMerchantFees(
      user,
      merchantId,
    );
    const [merchant] = await this.database
      .select({ basis: merchants.deliveryFeeBasis })
      .from(merchants)
      .where(eq(merchants.id, merchantId));
    return { basis: merchant.basis };
  }

  async saveBasis(
    user: AuthUser,
    merchantId: number,
    form: DeliveryFeeBasisForm,
  ): Promise<DeliveryFeeBasisSetting> {
    await this.deliveryFeeAccessService.assertCanManageMerchantFees(
      user,
      merchantId,
    );
    const hasRate = await this.hasRate(merchantId, form.basis);
    if (!hasRate) {
      throw new BadRequestException(
        `Merchant ${merchantId} has no ${form.basis} delivery fee rate; configure it before activating it`,
      );
    }

    await this.database
      .update(merchants)
      .set({ deliveryFeeBasis: form.basis })
      .where(eq(merchants.id, merchantId));
    return { basis: form.basis };
  }

  private hasRate(
    merchantId: number,
    basis: DeliveryFeeBasis,
  ): Promise<boolean> {
    if (basis === DeliveryFeeBasis.Distance) {
      return this.deliveryFeesService.hasRate(merchantId);
    }
    return this.orderCountFeesService.hasRate(merchantId);
  }
}
