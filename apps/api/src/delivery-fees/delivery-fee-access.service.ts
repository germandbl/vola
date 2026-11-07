import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { canManageDeliveryFees, type AuthUser } from '@vola/shared';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { merchants } from '../merchants/merchants.schema.js';

@Injectable()
export class DeliveryFeeAccessService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async assertCanManageMerchantFees(
    user: AuthUser,
    merchantId: number,
  ): Promise<void> {
    if (!canManageDeliveryFees(user)) {
      throw new ForbiddenException('You cannot manage delivery fee rates');
    }

    const merchantCount = await this.database.$count(
      merchants,
      eq(merchants.id, merchantId),
    );
    if (merchantCount === 0) {
      throw new NotFoundException(`Merchant ${merchantId} not found`);
    }
  }
}
