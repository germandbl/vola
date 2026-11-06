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
} from '@vola/shared';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { organizations } from '../organizations/organizations.schema.js';

@Injectable()
export class DeliveryFeeAccessService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async assertCanManageMerchantFees(
    user: AuthUser,
    organizationId: number,
  ): Promise<void> {
    if (!canManageDeliveryFees(user)) {
      throw new ForbiddenException('You cannot manage delivery fee rates');
    }

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
