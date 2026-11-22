import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  OrganizationType,
  contractCurrencySchema,
  type AuthUser,
  type SoftwareContractForm,
  type SoftwareContractSetting,
} from '@vola/shared';
import { eq } from 'drizzle-orm';
import { toPeriod, toPeriodStartDate } from '../common/region-month.js';
import { DATABASE, type Database } from '../database/database.module.js';
import { assertCanInvoiceMerchants } from '../invoices/pending-invoices.service.js';
import { organizations } from '../organizations/organizations.schema.js';
import { softwareContracts } from './software-contracts.schema.js';

@Injectable()
export class SoftwareContractsService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async findByOrganization(
    user: AuthUser,
    organizationId: number,
  ): Promise<SoftwareContractSetting> {
    assertCanInvoiceMerchants(user);
    await this.assertIsMerchant(organizationId);
    const [contract] = await this.database
      .select()
      .from(softwareContracts)
      .where(eq(softwareContracts.organizationId, organizationId));
    if (!contract) return { contract: null };
    return {
      contract: {
        currency: contractCurrencySchema.parse(contract.currency),
        startPeriod: toPeriod(contract.startsOn),
        monthlyFee: contract.monthlyFee,
        includedOrders: contract.includedOrders,
        extraOrderFee: contract.extraOrderFee,
        updatedAt: contract.updatedAt.toISOString(),
      },
    };
  }

  async save(
    user: AuthUser,
    organizationId: number,
    form: SoftwareContractForm,
  ): Promise<SoftwareContractSetting> {
    assertCanInvoiceMerchants(user);
    await this.assertIsMerchant(organizationId);
    const terms = {
      currency: form.currency,
      startsOn: toPeriodStartDate(form.startPeriod),
      monthlyFee: form.monthlyFee,
      includedOrders: form.includedOrders,
      extraOrderFee: form.extraOrderFee,
      updatedAt: new Date(),
    };
    await this.database
      .insert(softwareContracts)
      .values({ organizationId, ...terms })
      .onConflictDoUpdate({
        target: softwareContracts.organizationId,
        set: terms,
      });
    return this.findByOrganization(user, organizationId);
  }

  // Solo los clientes tienen contrato: Volá! no se cobra a sí misma.
  private async assertIsMerchant(organizationId: number): Promise<void> {
    const [organization] = await this.database
      .select({ type: organizations.type })
      .from(organizations)
      .where(eq(organizations.id, organizationId));
    if (organization?.type !== OrganizationType.Merchant) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }
  }
}
