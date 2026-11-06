import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationType,
  canManageDeliveryFees,
  type AuthUser,
  type DeliveryFeeRate,
  type DeliveryFeeRateForm,
} from '@vola/shared';
import { asc, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { organizations } from '../organizations/organizations.schema.js';
import {
  deliveryFeeRateRanges,
  deliveryFeeRates,
} from './delivery-fees.schema.js';

const UNCONFIGURED_RATE: DeliveryFeeRate = { ranges: [], extraFeePerKm: null };

function assertCanManageDeliveryFees(user: AuthUser): void {
  if (!canManageDeliveryFees(user)) {
    throw new ForbiddenException('You cannot manage delivery fee rates');
  }
}

@Injectable()
export class DeliveryFeesService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findRate(
    user: AuthUser,
    organizationId: number,
  ): Promise<DeliveryFeeRate> {
    assertCanManageDeliveryFees(user);
    await this.assertIsMerchant(organizationId);
    return this.findRateByOrganizationId(organizationId);
  }

  async saveRate(
    user: AuthUser,
    organizationId: number,
    form: DeliveryFeeRateForm,
  ): Promise<DeliveryFeeRate> {
    assertCanManageDeliveryFees(user);
    await this.assertIsMerchant(organizationId);

    await this.database.transaction(async (transaction) => {
      const [rate] = await transaction
        .insert(deliveryFeeRates)
        .values({ organizationId, extraFeePerKm: form.extraFeePerKm })
        .onConflictDoUpdate({
          target: deliveryFeeRates.organizationId,
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
    return this.findRateByOrganizationId(organizationId);
  }

  private async findRateByOrganizationId(
    organizationId: number,
  ): Promise<DeliveryFeeRate> {
    const [rate] = await this.database
      .select({
        id: deliveryFeeRates.id,
        extraFeePerKm: deliveryFeeRates.extraFeePerKm,
      })
      .from(deliveryFeeRates)
      .where(eq(deliveryFeeRates.organizationId, organizationId));
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

  private async assertIsMerchant(organizationId: number): Promise<void> {
    const [organization] = await this.database
      .select({ type: organizations.type })
      .from(organizations)
      .where(eq(organizations.id, organizationId));
    if (!organization) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }
    if (organization.type !== OrganizationType.Merchant) {
      throw new BadRequestException(
        `Organization ${organizationId} is not a merchant; only merchants have delivery fee rates`,
      );
    }
  }
}
