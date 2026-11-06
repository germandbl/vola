import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  DeliveryFeeBasis,
  type AuthUser,
  type DeliveryFeeBasisForm,
  type DeliveryFeeBasisSetting,
} from '@vola/shared';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { organizations } from '../organizations/organizations.schema.js';
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
    organizationId: number,
  ): Promise<DeliveryFeeBasisSetting> {
    await this.deliveryFeeAccessService.assertCanManageMerchantFees(
      user,
      organizationId,
    );
    const [organization] = await this.database
      .select({ basis: organizations.deliveryFeeBasis })
      .from(organizations)
      .where(eq(organizations.id, organizationId));
    return { basis: organization.basis };
  }

  async saveBasis(
    user: AuthUser,
    organizationId: number,
    form: DeliveryFeeBasisForm,
  ): Promise<DeliveryFeeBasisSetting> {
    await this.deliveryFeeAccessService.assertCanManageMerchantFees(
      user,
      organizationId,
    );
    const hasRate = await this.hasRate(organizationId, form.basis);
    if (!hasRate) {
      throw new BadRequestException(
        `Organization ${organizationId} has no ${form.basis} delivery fee rate; configure it before activating it`,
      );
    }

    await this.database
      .update(organizations)
      .set({ deliveryFeeBasis: form.basis })
      .where(eq(organizations.id, organizationId));
    return { basis: form.basis };
  }

  private hasRate(
    organizationId: number,
    basis: DeliveryFeeBasis,
  ): Promise<boolean> {
    if (basis === DeliveryFeeBasis.Distance) {
      return this.deliveryFeesService.hasRate(organizationId);
    }
    return this.orderCountFeesService.hasRate(organizationId);
  }
}
