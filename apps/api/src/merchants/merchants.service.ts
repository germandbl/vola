import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationType,
  canManageMerchants,
  canViewOrganization,
  type AuthUser,
  type Merchant,
  type MerchantForm,
} from '@vola/shared';
import { and, asc, eq, ne } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';
import { OrganizationsService } from '../organizations/organizations.service.js';
import { merchants } from './merchants.schema.js';

const merchantColumns = {
  id: merchants.id,
  organizationId: merchants.organizationId,
  name: merchants.name,
  contactName: merchants.contactName,
  contactEmail: merchants.contactEmail,
  contactPhone: merchants.contactPhone,
  createdAt: merchants.createdAt,
};

type MerchantRow = Omit<Merchant, 'createdAt'> & { createdAt: Date };

function toMerchant(row: MerchantRow): Merchant {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

function assertCanManageMerchants(
  user: AuthUser,
  organizationId: number,
): void {
  if (!canManageMerchants(user, organizationId)) {
    throw new ForbiddenException(
      `You cannot manage the merchants of organization ${organizationId}`,
    );
  }
}

@Injectable()
export class MerchantsService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async findByOrganization(
    user: AuthUser,
    organizationId: number,
  ): Promise<Merchant[]> {
    await this.organizationsService.findById(user, organizationId);
    const rows = await this.database
      .select(merchantColumns)
      .from(merchants)
      .where(eq(merchants.organizationId, organizationId))
      .orderBy(asc(merchants.name));
    return rows.map(toMerchant);
  }

  async findById(user: AuthUser, merchantId: number): Promise<Merchant> {
    const merchant = await this.findExistingById(merchantId);
    if (!canViewOrganization(user, merchant.organizationId)) {
      throw new ForbiddenException(`You cannot access merchant ${merchantId}`);
    }
    return merchant;
  }

  async create(
    user: AuthUser,
    organizationId: number,
    form: MerchantForm,
  ): Promise<Merchant> {
    assertCanManageMerchants(user, organizationId);
    const organization = await this.organizationsService.findById(
      user,
      organizationId,
    );
    if (organization.type !== OrganizationType.Merchant) {
      throw new BadRequestException(
        `Organization ${organizationId} is the platform; only client organizations have merchants`,
      );
    }
    await this.assertNameIsFree(organizationId, form.name);

    const [created] = await this.database
      .insert(merchants)
      .values({ ...form, organizationId })
      .returning({ id: merchants.id });
    return this.findExistingById(created.id);
  }

  async update(
    user: AuthUser,
    merchantId: number,
    form: MerchantForm,
  ): Promise<Merchant> {
    const merchant = await this.findExistingById(merchantId);
    assertCanManageMerchants(user, merchant.organizationId);
    await this.assertNameIsFree(merchant.organizationId, form.name, merchantId);

    await this.database
      .update(merchants)
      .set(form)
      .where(eq(merchants.id, merchantId));
    return this.findExistingById(merchantId);
  }

  private async findExistingById(merchantId: number): Promise<Merchant> {
    const [row] = await this.database
      .select(merchantColumns)
      .from(merchants)
      .where(eq(merchants.id, merchantId));
    if (!row) {
      throw new NotFoundException(`Merchant ${merchantId} not found`);
    }
    return toMerchant(row);
  }

  private async assertNameIsFree(
    organizationId: number,
    name: string,
    excludedMerchantId?: number,
  ): Promise<void> {
    const conditions = [
      eq(merchants.organizationId, organizationId),
      eq(merchants.name, name),
    ];
    if (excludedMerchantId !== undefined) {
      conditions.push(ne(merchants.id, excludedMerchantId));
    }
    const sameNameCount = await this.database.$count(
      merchants,
      and(...conditions),
    );
    if (sameNameCount > 0) {
      throw new ConflictException(
        `Organization ${organizationId} already has a merchant named ${name}`,
      );
    }
  }
}
